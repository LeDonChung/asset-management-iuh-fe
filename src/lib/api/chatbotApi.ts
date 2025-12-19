import { axiosInstance } from '../api';
import { ChatRequest, ChatResponse } from '@/types/chatbot';

const CHATBOT_API = '/chatbot';

export const chatbotApi = {
  /**
   * Send a chat message to the AI
   */
  chat: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await axiosInstance.post<ChatResponse>(`${CHATBOT_API}/chat`, data);
    return response.data;
  },
};

export default chatbotApi;

