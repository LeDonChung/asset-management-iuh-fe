'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { chatbotApi } from '@/lib/api/chatbotApi';
import { ChatMessage } from '@/types/chatbot';
import toast from 'react-hot-toast';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

interface ChatbotWidgetProps {
  unitId?: string;
}

export default function ChatbotWidget({ unitId }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý AI của hệ thống quản lý tài sản. Tôi có thể giúp bạn tìm kiếm vị trí tài sản, thống kê số liệu, và trả lời các câu hỏi về tài sản. Bạn cần hỏi gì?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Prepare conversation history (last 5 messages)
      const conversationHistory = messages
        .slice(-5)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await chatbotApi.chat({
        message: inputMessage,
        unitId,
        conversationHistory,
      });

      // Remove loading message and add response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== loadingMessage.id);
        return [
          ...filtered,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: response.message,
            timestamp: new Date(response.timestamp),
          },
        ];
      });
    } catch (error: any) {
      // Remove loading message
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessage.id));
      
      const errorMessage = error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(errorMessage);

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Xin chào! Tôi là trợ lý AI của hệ thống quản lý tài sản. Tôi có thể giúp bạn tìm kiếm vị trí tài sản, thống kê số liệu, và trả lời các câu hỏi về tài sản. Bạn cần hỏi gì?',
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
        aria-label="Open chatbot"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col bg-white shadow-2xl transition-all ${
        isMinimized ? 'h-14 w-80' : 'h-[600px] w-96'
      } rounded-lg border border-gray-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-lg bg-blue-600 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-semibold">Trợ lý AI</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded p-1 hover:bg-blue-700"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded p-1 hover:bg-blue-700"
            aria-label="Close chatbot"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Đang suy nghĩ...</span>
                    </div>
                  ) : (
                    <div className="text-sm">
                      {message.role === 'assistant' ? (
                        <div className="chatbot-markdown">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, rehypeSanitize]}
                            components={{
                              table: ({node, ...props}) => (
                                <div className="overflow-x-auto mb-2">
                                  <table {...props} />
                                </div>
                              ),
                              a: ({node, ...props}) => (
                                <a target="_blank" rel="noopener noreferrer" {...props} />
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                  )}
                  <div
                    className={`mt-1 text-xs ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 px-4 py-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setInputMessage('Đơn vị có bao nhiêu tài sản?')}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200"
                disabled={isLoading}
              >
                Số lượng tài sản
              </button>
              <button
                onClick={() => setInputMessage('Thống kê tài sản theo danh mục')}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200"
                disabled={isLoading}
              >
                Thống kê
              </button>
              <button
                onClick={handleClearChat}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200"
                disabled={isLoading}
              >
                Xóa chat
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:bg-gray-300"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

