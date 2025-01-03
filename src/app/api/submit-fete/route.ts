import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { logger } from '@/lib/logger';

// Keep track of IP submissions (in-memory rate limiting)
const ipSubmissions: { [key: string]: { count: number; lastSubmission: number } } = {};

// Rate limit settings
const RATE_LIMIT = {
  MAX_SUBMISSIONS: 3,    // Maximum submissions per time window
  TIME_WINDOW: 3600000,  // Time window in milliseconds (1 hour)
};

// Keep API Key for read operations
const apiKeyAuth = process.env.GOOGLE_API_KEY;

// Add Service Account for write operations
const serviceAuth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
  ],
});

// Initialize sheets with Service Account for write access
const sheets = google.sheets({ 
  version: 'v4', 
  auth: serviceAuth
});

// Initialize drive with Service Account for file uploads
const drive = google.drive({ 
  version: 'v3', 
  auth: serviceAuth
});

const SHEET_ID = process.env.SHEET_ID;
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Get IP address from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'Unknown';
    
    // Check honeypot
    const honeypot = formData.get('website');
    if (honeypot) {
      return NextResponse.json(
        { message: 'Submission received successfully' }, // Fake success
        { status: 200 }
      );
    }

    // Check rate limit
    const now = Date.now();
    const userSubmissions = ipSubmissions[ip] || { count: 0, lastSubmission: 0 };

    // Reset count if outside time window
    if (now - userSubmissions.lastSubmission > RATE_LIMIT.TIME_WINDOW) {
      userSubmissions.count = 0;
    }

    if (userSubmissions.count >= RATE_LIMIT.MAX_SUBMISSIONS) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    // Update rate limit tracking
    ipSubmissions[ip] = {
      count: userSubmissions.count + 1,
      lastSubmission: now,
    };

    // Extract file and other data
    const posterFile = formData.get('poster') as File | null;
    const types = formData.getAll('type');
    const rawDate = formData.get('date') as string;
    
    // Format date to MM/DD/YYYY
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    const data = {
      email: formData.get('email') as string,
      instagram: formData.get('instagram') as string,
      title: formData.get('title') as string,
      date: formatDate(rawDate),
      time: formData.get('time') as string,
      venue: formData.get('venue') as string,
      type: Array.isArray(types) ? types.join(', ') : types as string,
      ticketPrice: formData.get('ticketPrice') as string,
      currency: formData.get('currency') as string || 'JMD',
      ticketLink: formData.get('ticketLink') as string,
      description: formData.get('description') as string,
    };
    
    // Validate required fields
    if (!data.email || !data.title || !data.date || !data.time || !data.venue || !data.type || !data.ticketPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format ticket price with currency
    const formattedPrice = data.ticketPrice.startsWith('$') ? data.ticketPrice : 
      data.currency === 'USD' ? `$${data.ticketPrice}` : `J$${data.ticketPrice}`;

    // Upload image to Google Drive if provided
    let posterUrl = 'TBA';
    if (posterFile) {
      const arrayBuffer = await posterFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = `${data.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}${getFileExtension(posterFile.name)}`;

      try {
        // Create a readable stream from the buffer
        const readable = new Readable();
        readable._read = () => {}; // Required but not used
        readable.push(buffer);
        readable.push(null);

        const uploadResponse = await drive.files.create({
          requestBody: {
            name: fileName,
            parents: [DRIVE_FOLDER_ID],
            mimeType: posterFile.type,
          },
          media: {
            mimeType: posterFile.type,
            body: readable
          },
          fields: 'id, webContentLink',
        });

        if (uploadResponse.data.id) {
          // Make the file publicly accessible
          await drive.permissions.create({
            fileId: uploadResponse.data.id,
            requestBody: {
              role: 'reader',
              type: 'anyone',
            },
          });

          posterUrl = uploadResponse.data.webContentLink || 'TBA';
        }
      } catch (uploadError) {
        logger.error('File upload error:', uploadError);
        return Response.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
      }
    }

    // Format data for Google Sheets
    const row = [
      data.venue,           // Column A
      data.title,          // Column B
      data.date,           // Column C
      data.type,           // Column D
      data.time,           // Column E (time)
      formattedPrice,      // Column F (now includes currency)
      data.ticketLink || 'TBA', // Column G
      data.description || 'TBA',  // Column H (description)
      'Pending Review',    // Column I (status)
      posterUrl,          // Column J (poster)
      data.email,         // Column K (new field)
      data.instagram || 'N/A',  // Column L (new field)
      ip                  // Column M (IP address)
    ];

    // Append to the second sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet2!A:M', // Updated to include IP address column
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    return NextResponse.json(
      { message: 'Submission received successfully' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}

function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop();
  return ext ? `.${ext}` : '';
} 