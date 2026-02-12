import { useState } from 'react';
import { MessageCircle, Send, X, Bot, Cpu, Wrench, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là AI Assistant của GTG Shop. Tôi có thể giúp bạn:\n\n🎮 Tư vấn build PC Gaming\n💼 Tư vấn PC Văn phòng\n🔧 Nâng cấp cấu hình\n🛠️ Sửa chữa máy tính\n\nBạn cần tư vấn gì ạ?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const quickQuestions = [
    { text: 'Build PC Gaming 20 triệu', icon: Cpu },
    { text: 'Nâng cấp VGA', icon: Zap },
    { text: 'Sửa chữa máy tính', icon: Wrench },
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('gaming') || input.includes('game') || input.includes('chơi game')) {
      return '🎮 Tuyệt vời! Để tư vấn build PC Gaming phù hợp, cho tôi biết:\n\n1. Ngân sách của bạn? (VD: 20 triệu, 30 triệu...)\n2. Game chính bạn chơi? (VD: PUBG, Valorant, GTA V...)\n3. Độ phân giải màn hình? (1080p, 1440p, 4K?)\n\nVới thông tin này, tôi sẽ gợi ý cấu hình tối ưu nhất cho bạn!';
    }
    
    if (input.includes('20 triệu') || input.includes('20tr')) {
      return '💡 Gợi ý cấu hình PC Gaming 20 triệu:\n\n• CPU: AMD Ryzen 5 5600 - 3.2tr\n• VGA: RTX 3060 12GB - 7.5tr\n• RAM: 16GB DDR4 3200MHz - 1.2tr\n• Mainboard: B550M - 2.5tr\n• SSD: 500GB NVMe - 1tr\n• PSU: 650W 80+ Bronze - 1.5tr\n• Case: Mid Tower RGB - 1tr\n• Tản: AIO 240mm - 2.3tr\n\n✨ Tổng: ~20tr - Chơi mượt game 1080p/1440p\n\nBạn có muốn điều chỉnh gì không?';
    }
    
    if (input.includes('nâng cấp') || input.includes('upgrade')) {
      return '🔧 Để tư vấn nâng cấp chính xác, bạn cho tôi biết:\n\n1. Cấu hình hiện tại?\n2. Mục đích nâng cấp? (gaming, render, streaming...)\n3. Ngân sách nâng cấp?\n\nThông thường với 5-10 triệu, bạn có thể nâng cấp đáng kể VGA hoặc CPU!';
    }
    
    if (input.includes('sửa') || input.includes('hỏng')) {
      return '🛠️ GTG Shop nhận sửa chữa máy tính:\n\n• Vệ sinh tản nhiệt - 100k\n• Cài đặt Windows - 150k\n• Thay keo tản nhiệt - 50k\n• Kiểm tra lỗi phần cứng - Miễn phí\n\nBạn có thể mang máy đến cửa hàng hoặc gọi 0901 234 567 để được hỗ trợ nhé!';
    }
    
    if (input.includes('văn phòng') || input.includes('office')) {
      return '💼 Gợi ý PC Văn phòng giá rẻ:\n\n• CPU: Intel i3-12100 - 2.5tr\n• RAM: 8GB DDR4 - 600k\n• SSD: 256GB - 500k\n• Main: H610M - 1.8tr\n• Case + PSU: 1tr\n\n✨ Tổng: ~6.5tr - Đủ dùng Excel, Word, duyệt web\n\nCó cần mạnh hơn không bạn?';
    }
    
    return '🤖 Tôi hiểu bạn đang quan tâm đến vấn đề này. Để tư vấn chính xác hơn, bạn có thể:\n\n• Chat trực tiếp với nhân viên\n• Gọi hotline: 0901 234 567\n• Đến cửa hàng tại 123 Đường Láng, Hà Nội\n\nHoặc hãy cho tôi biết cụ thể hơn nhé!';
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    handleSendMessage();
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
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                      : 'bg-white border border-red-200 shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <span className={`text-xs mt-1 block ${
                    message.sender === 'user' ? 'text-yellow-200' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
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
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                size="icon"
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