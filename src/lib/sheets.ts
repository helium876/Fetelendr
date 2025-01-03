import { google } from 'googleapis';
import { Event } from '@/types/event';
import { parseISO, format } from 'date-fns';

const normalizeField = (value: any): string => {
  if (value === undefined || value === null || value === '') {
    return 'TBA';
  }
  return String(value).trim();
};

const getGoogleDriveImageUrl = async (filename: string): Promise<string> => {
  if (!filename || filename === 'TBA') {
    console.log('No filename provided or TBA');
    return 'TBA';
  }
  
  try {
    // Clean up filename
    filename = filename.replace(/^@/, '').trim();
    console.log('Processing filename:', filename);
    
    // If it's already a full URL, return the processed version
    if (filename.includes('drive.google.com')) {
      const urlMatch = filename.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/);
      if (urlMatch) {
        const fileId = urlMatch[1];
        // Use the direct file URL
        const url = `https://lh3.googleusercontent.com/d/${fileId}`;
        console.log('Converted Drive URL:', url);
        return url;
      }
    }
    
    // If it's already a googleusercontent URL, return it as is
    if (filename.includes('googleusercontent.com')) {
      console.log('Using existing googleusercontent URL:', filename);
      return filename;
    }

    // Validate environment variables
    if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
      console.error('GOOGLE_DRIVE_FOLDER_ID is not set');
      return 'TBA';
    }

    if (!process.env.GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY is not set');
      return 'TBA';
    }

    // Search for the file in the folder
    const drive = google.drive('v3');
    console.log('Searching for file:', {
      filename,
      folderId: process.env.GOOGLE_DRIVE_FOLDER_ID
    });

    const response = await drive.files.list({
      q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and name contains '${filename}'`,
      fields: 'files(id, name)',
      key: process.env.GOOGLE_API_KEY,
    });

    console.log('Drive API response:', {
      filesFound: response.data.files?.length || 0,
      files: response.data.files?.map(f => ({ id: f.id, name: f.name })) || []
    });

    const files = response.data.files;
    if (files && files.length > 0) {
      const fileId = files[0].id;
      // Use the direct file URL
      const url = `https://lh3.googleusercontent.com/d/${fileId}`;
      console.log('Generated image URL:', {
        fileId,
        url,
        originalFilename: filename
      });
      return url;
    }
    
    console.log('File not found in folder:', {
      searchedFor: filename,
      folderId: process.env.GOOGLE_DRIVE_FOLDER_ID
    });
    return 'TBA';
  } catch (error) {
    console.error('Error processing Google Drive file:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      filename,
      stack: error instanceof Error ? error.stack : undefined
    });
    return 'TBA';
  }
};

const parseDateString = (dateStr: string): string => {
  if (!dateStr || dateStr === 'TBA') return 'TBA';
  
  try {
    console.log('Parsing date string:', dateStr);
    
    // Handle the format from the sheet: "Sunday, January 5, 2025"
    const match = dateStr.match(/(?:[A-Za-z]+,\s*)?([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})/);
    if (match) {
      const [_, monthName, day, year] = match;
      const months: { [key: string]: number } = {
        january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
        july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
      };
      
      const monthIndex = months[monthName.toLowerCase()];
      if (monthIndex !== undefined) {
        const date = new Date(Number(year), monthIndex, Number(day));
        if (!isNaN(date.getTime())) {
          const result = format(date, 'yyyy-MM-dd');
          console.log('Successfully parsed date:', { original: dateStr, parsed: result });
          return result;
        }
      }
    }
    
    // Try parsing as a standard date format
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      const result = format(parsedDate, 'yyyy-MM-dd');
      console.log('Parsed using standard format:', { original: dateStr, parsed: result });
      return result;
    }
    
    console.error('Failed to parse date:', { dateStr, match });
    return 'TBA';
  } catch (error) {
    console.error('Error parsing date:', { dateStr, error });
    return 'TBA';
  }
};

export async function getEvents(): Promise<Event[]> {
  try {
    console.log('Fetching events from Google Sheets...');
    
    const sheets = google.sheets('v4');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: 'Sheet1!A2:L',
      key: process.env.GOOGLE_API_KEY,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in spreadsheet');
      return [];
    }

    console.log(`Processing ${rows.length} events from spreadsheet`);
    const events = await Promise.all(rows.map(async (row, index) => {
      // Log the raw row data for debugging
      console.log(`Raw row ${index + 1}:`, row);

      // Ensure we have all columns, even if empty
      const [
        venue = 'TBA',          // Column A
        title = 'TBA',          // Column B
        date = 'TBA',           // Column C
        type = '',              // Column D
        time = 'TBA',           // Column E
        ticketPrice = 'TBA',    // Column F
        ticketLinks = 'TBA',    // Column G
        description = 'TBA',    // Column H
        status = 'TBA',         // Column I
        poster = 'TBA',         // Column J
      ] = row;
      
      console.log(`Processing event ${index + 1}:`, { venue, title, date });
      
      // Only try to parse the date if it's in the date column
      const processedDate = parseDateString(normalizeField(date));
      console.log('Processed date:', processedDate);
      
      const processedPoster = await getGoogleDriveImageUrl(normalizeField(poster));
      console.log('Processed poster URL:', processedPoster);

      console.log('Processing ticket data:', {
        ticketPrice: normalizeField(ticketPrice),
        ticketLinks: normalizeField(ticketLinks),
        rawTicketLinks: ticketLinks
      });

      return {
        id: index.toString(),
        title: normalizeField(title),
        date: processedDate,
        time: normalizeField(time),
        venue: normalizeField(venue),
        type: type ? type.split(',').map((t: string) => t.trim()) : ['TBA'],
        description: normalizeField(description),
        poster: processedPoster,
        link: normalizeField(ticketLinks),
        price: normalizeField(ticketPrice),
        status: normalizeField(status),
        ticketPrice: normalizeField(ticketPrice),
        ticketLinks: normalizeField(ticketLinks)
      };
    }));

    // Sort events by date, excluding events with invalid dates
    const sortedEvents = events
      .filter(event => event.date !== 'TBA')
      .sort((a, b) => {
        try {
          const dateA = parseISO(a.date);
          const dateB = parseISO(b.date);
          return dateA.getTime() - dateB.getTime();
        } catch (error) {
          console.error('Error sorting dates:', error);
          return 0;
        }
      });

    console.log(`Returning ${sortedEvents.length} processed events`);
    return sortedEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
} 