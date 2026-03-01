import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Wrench } from 'lucide-react';

export function BuildPCFloatingButton() {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);

    // Listen for chatbot open/close events
    useEffect(() => {
        const handleChatbotToggle = (e: CustomEvent) => {
            setIsChatbotOpen(e.detail?.isOpen ?? false);
        };

        window.addEventListener('chatbotToggled' as any, handleChatbotToggle);
        return () => {
            window.removeEventListener('chatbotToggled' as any, handleChatbotToggle);
        };
    }, []);

    // Hide when chatbot is open
    if (isChatbotOpen) return null;

    return (
        <Link
            to="/build-pc"
            className="fixed right-6 top-1/2 -translate-y-1/2 z-50 group"
        >
            <div className="relative">
                {/* Main Button */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 text-white rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>

                    {/* Content */}
                    <div className="relative px-4 py-6 flex flex-col items-center gap-2">
                        {/* Icon Container */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/20 rounded-full blur-md animate-pulse"></div>
                            <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-3 border-2 border-white/30">
                                <Cpu className="w-8 h-8 text-white" />
                            </div>
                            {/* Tool Icon Badge */}
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-1.5 border-2 border-white shadow-lg animate-bounce">
                                <Wrench className="w-3 h-3 text-white" />
                            </div>
                        </div>

                        {/* Text */}
                        <div className="text-center">
                            <div className="font-black text-sm whitespace-nowrap tracking-wide">
                                TỰ BUILD
                            </div>
                            <div className="font-black text-lg whitespace-nowrap -mt-1 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                                PC
                            </div>
                        </div>

                        {/* Pulse Effect */}
                        <div className="absolute -inset-2 bg-blue-500/30 rounded-2xl blur-xl group-hover:bg-blue-400/40 transition-all duration-300 -z-10"></div>
                    </div>
                </div>

                {/* Tooltip */}
                <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl whitespace-nowrap relative">
                        <div className="font-bold text-sm">🎮 Xây dựng cấu hình PC</div>
                        <div className="text-xs text-slate-300 mt-1">Click để tự build PC theo nhu cầu!</div>

                        {/* Arrow */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                            <div className="w-0 h-0 border-l-8 border-l-slate-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                        </div>
                    </div>
                </div>

                {/* New Badge */}
                <div className="absolute -top-2 -left-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-black px-2 py-1 rounded-full shadow-lg animate-pulse">
                    HOT
                </div>
            </div>

            {/* Ripple Effect */}
            <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
        </Link>
    );
}