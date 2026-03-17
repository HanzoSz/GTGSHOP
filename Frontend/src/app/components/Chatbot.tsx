import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, Cpu, Wrench, Zap, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useAuth } from '../context/AuthContext';

import { API_URL as API_BASE_URL } from '@/config';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  model?: string;
}

const AI_MODELS = [
  { key: 'gemini', name: 'Gemini 2.5 Flash', icon: '✨', color: 'from-blue-500 to-cyan-500' },
  { key: 'nvidia', name: 'NVIDIA Nemotron', icon: '🟢', color: 'from-green-500 to-emerald-500' },
];

export function Chatbot() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Notify other components (e.g. BuildPCFloatingButton) when chatbot opens/closes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('chatbotToggled', { detail: { isOpen } }));
  }, [isOpen]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là AI Assistant của GTG Shop. Tôi có thể giúp bạn:\n\n🎮 Tư vấn build PC Gaming\n💼 Tư vấn PC Văn phòng\n🔧 Nâng cấp cấu hình\n🛠️ Sửa chữa máy tính\n\nBạn cần tư vấn gì ạ?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const loadedUserId = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = AI_MODELS.find(m => m.key === selectedModel) || AI_MODELS[0];

  const welcomeMessage: Message = {
    id: 'welcome',
    text: 'Xin chào! Tôi là AI Assistant của GTG Shop. Tôi có thể giúp bạn:\n\n🎮 Tư vấn build PC Gaming\n💼 Tư vấn PC Văn phòng\n🔧 Nâng cấp cấu hình\n🛠️ Sửa chữa máy tính\n\nBạn cần tư vấn gì ạ?',
    sender: 'bot',
    timestamp: new Date()
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset khi user thay đổi
  useEffect(() => {
    const currentId = user?.id ?? null;
    if (loadedUserId.current !== currentId) {
      loadedUserId.current = currentId;
      setHistoryLoaded(false);
      setMessages([welcomeMessage]);
    }
  }, [user?.id]);

  // Load chat history khi mở chat
  useEffect(() => {
    if (isOpen && isAuthenticated && user?.id && !historyLoaded) {
      loadChatHistory();
    }
  }, [isOpen, isAuthenticated, user?.id, historyLoaded]);

  const loadChatHistory = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history/${user.id}`);
      if (response.ok) {
        const history = await response.json();
        if (history.length > 0) {
          const historyMessages: Message[] = [];
          historyMessages.push({
            id: 'welcome',
            text: 'Xin chào! Tôi là AI Assistant của GTG Shop. Tôi có thể giúp bạn:\n\n🎮 Tư vấn build PC Gaming\n💼 Tư vấn PC Văn phòng\n🔧 Nâng cấp cấu hình\n🛠️ Sửa chữa máy tính\n\nBạn cần tư vấn gì ạ?',
            sender: 'bot',
            timestamp: new Date(history[0].sentAt)
          });

          history.forEach((h: { id: number; userMessage: string; botResponse: string; modelUsed?: string; sentAt: string }) => {
            historyMessages.push({
              id: `user-${h.id}`,
              text: h.userMessage,
              sender: 'user',
              timestamp: new Date(h.sentAt)
            });
            historyMessages.push({
              id: `bot-${h.id}`,
              text: h.botResponse,
              sender: 'bot',
              timestamp: new Date(h.sentAt),
              model: h.modelUsed
            });
          });

          setMessages(historyMessages);
        }
        setHistoryLoaded(true);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const quickQuestions = [
    { text: 'Build PC Gaming 20 triệu', icon: Cpu },
    { text: 'Nâng cấp VGA', icon: Zap },
    { text: 'Sửa chữa máy tính', icon: Wrench },
  ];

  const sendMessageWithText = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const userId = isAuthenticated && user?.id ? user.id : 0;
      const response = await fetch(`${API_BASE_URL}/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: text, model: selectedModel }),
      });

      let botText: string;
      let modelUsed = selectedModel;
      if (response.ok) {
        const data = await response.json();
        botText = data.message;
        modelUsed = data.model || selectedModel;
      } else {
        botText = 'Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau hoặc gọi hotline 087.997.9997! 📞';
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date(),
        model: modelUsed
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat API error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối và thử lại! 🔌',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => sendMessageWithText(inputMessage);

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    setTimeout(() => sendMessageWithText(question), 0);
  };

  const getModelBadge = (modelKey?: string) => {
    if (!modelKey) return null;
    const model = AI_MODELS.find(m => m.key === modelKey);
    if (!model) return null;
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r ${model.color} text-white font-medium mt-1`}>
        {model.icon} {model.name}
      </span>
    );
  };

  return (
    <>
      {/* Chatbot Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-2xl z-50 flex items-center justify-center group border-2 border-yellow-400"
          size="icon"
        >
          <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
          <span className="absolute -top-2 -left-2 text-2xl animate-bounce">🏮</span>
        </Button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col border-2 border-red-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bot className="w-8 h-8" />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                </div>
                <div>
                  <h3 className="font-bold">AI Assistant GTG 🏮</h3>
                  <p className="text-xs text-yellow-200">Tư vấn Build PC & Sửa lỗi</p>
                </div>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Model Selector */}
            <div className="mt-3 relative" ref={dropdownRef}>
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-sm transition-colors w-full"
              >
                <span>{currentModel.icon}</span>
                <span className="font-medium flex-1 text-left">{currentModel.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showModelDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border overflow-hidden z-10">
                  {AI_MODELS.map((model) => (
                    <button
                      key={model.key}
                      onClick={() => {
                        setSelectedModel(model.key);
                        setShowModelDropdown(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors ${
                        selectedModel === model.key
                          ? 'bg-red-50 text-red-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{model.icon}</span>
                      <span className="flex-1 text-left">{model.name}</span>
                      {selectedModel === model.key && (
                        <span className="text-red-500 text-xs font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-red-50 to-orange-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'user'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                    : 'bg-white border border-red-200 shadow-sm'
                    }`}
                >
                  {message.sender === 'bot' ? (
                    <div className="text-sm chatbot-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className={`text-xs ${message.sender === 'user' ? 'text-yellow-200' : 'text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.sender === 'bot' && message.model && getModelBadge(message.model)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-red-200 shadow-sm rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-xs text-gray-500">{currentModel.icon} {currentModel.name} đang soạn tin...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 border-t bg-white">
              <p className="text-xs text-gray-500 mb-2">Câu hỏi gợi ý:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleQuickQuestion(q.text)}
                    variant="outline"
                    size="sm"
                    className="text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                    disabled={isTyping}
                  >
                    <q.icon className="w-3 h-3 mr-1" />
                    {q.text}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                size="icon"
                disabled={isTyping || !inputMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}