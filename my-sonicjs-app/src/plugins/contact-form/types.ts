export interface ContactSettings {
  companyName: string;
  phoneNumber: string;
  description?: string; // Optional
  address: string;
  city?: string;
  state?: string;
  showMap: boolean | number | string; // Handles the DB storage quirks
  mapApiKey?: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  msg: string;
}
