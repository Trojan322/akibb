
export interface ImageHistoryItem {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface EditRequest {
  image: string; // base64
  prompt: string;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  EDITING = 'EDITING',
  ERROR = 'ERROR'
}
