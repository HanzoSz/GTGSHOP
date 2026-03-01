import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, Cpu, Wrench, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'https://localhost:7033/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load chat history khi mở chat
  useEffect(() => {
    if (isOpen && isAuthenticated && user?.id && !historyLoaded) {
      loadChatHistory();
    }
  }, [isOpen, isAuthenticated, user?.id]);

  const loadChatHistory = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history/${user.id}`);
      if (response.ok) {
        const history = await response.json();
        if (history.length > 0) {
          const historyMessages: Message[] = [];
          // Thêm welcome message đầu tiên
          historyMessages.push({
            id: 'welcome',
            text: 'Xin chào! Tôi là AI Assistant của GTG Shop. Tôi có thể giúp bạn:\n\n🎮 Tư vấn build PC Gaming\n💼 Tư vấn PC Văn phòng\n🔧 Nâng cấp cấu hình\n🛠️ Sửa chữa máy tính\n\nBạn cần tư vấn gì ạ?',
            sender: 'bot',
            timestamp: new Date(history[0].sentAt)
          });

          // Thêm các tin nhắn từ history
          history.forEach((h: { id: number; userMessage: string; botResponse: string; sentAt: string }) => {
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
              timestamp: new Date(h.sentAt)
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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Gọi API thật
      const userId = isAuthenticated && user?.id ? user.id : 0;
      const response = await fetch(`${API_BASE_URL}/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: messageText }),
      });

      let botText: string;
      if (response.ok) {
        const data = await response.json();
        botText = data.message;
      } else {
        botText = 'Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau hoặc gọi hotline 0901 234 567! 📞';
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date()
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

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    // Dùng setTimeout để đảm bảo state đã cập nhật
    setTimeout(() => {
      const fakeEvent = { target: { value: question } };
      void fakeEvent;
      // Gọi trực tiếp với text
      handleSendWithText(question);
    }, 0);
  };

  const handleSendWithText = async (text: string) => {
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
        body: JSON.stringify({ userId, message: text }),
      });

      let botText: string;
      if (response.ok) {
        const data = await response.json();
        botText = data.message;
      } else {
        botText = 'Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau! 📞';
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Không thể kết nối đến server. Vui lòng thử lại! 🔌',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="w-8 h-8" />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h3 className="font-bold">AI Assistant GTG 🏮</h3>
                <p className="text-xs text-yellow-200">Tư vấn Build PC - Ưu đãi Tết</p>
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
                  <span className={`text-xs mt-1 block ${message.sender === 'user' ? 'text-yellow-200' : 'text-gray-400'
                    }`}>
                    {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
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
                    <span className="text-xs text-gray-500">AI đang soạn tin...</span>
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