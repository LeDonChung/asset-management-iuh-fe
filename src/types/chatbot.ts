export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface ChatRequest {
  message: string;
  unitId?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface ChatResponse {
  message: string;
  data?: any;
  timestamp: Date;
  retryCount?: number;
  keyUsed?: number;
}

