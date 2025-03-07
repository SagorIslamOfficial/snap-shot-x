export interface Screenshot {
  id: string;
  dataUrl: string;
  format: 'png' | 'jpeg' | 'webp';
  timestamp: string;
  name: string;
  tags: string[];
}