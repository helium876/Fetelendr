export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  type: string[];
  description: string;
  poster: string;
  link: string;
  price: string;
  status: string;
  ticketPrice: string;
  ticketLinks: string;
}

export interface ApiResponse {
  success: boolean;
  data?: Event[];
  error?: string;
} 