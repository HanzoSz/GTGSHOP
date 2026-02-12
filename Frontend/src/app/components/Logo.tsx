export function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* Rabbit/Tiger Mascot */}
      <div className="relative">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main body - orange/red gradient */}
          <ellipse cx="20" cy="24" rx="10" ry="12" fill="url(#bodyGradient)" />
          
          {/* Head */}
          <circle cx="20" cy="15" r="8" fill="url(#headGradient)" />
          
          {/* Ears */}
          <ellipse cx="16" cy="9" rx="3" ry="6" fill="#E85D04" transform="rotate(-20 16 9)" />
          <ellipse cx="24" cy="9" rx="3" ry="6" fill="#E85D04" transform="rotate(20 24 9)" />
          
          {/* Inner ears */}
          <ellipse cx="16" cy="10" rx="1.5" ry="3" fill="#FFB703" transform="rotate(-20 16 10)" />
          <ellipse cx="24" cy="10" rx="1.5" ry="3" fill="#FFB703" transform="rotate(20 24 10)" />
          
          {/* Eyes */}
          <circle cx="17" cy="14" r="1.5" fill="#1A1A1A" />
          <circle cx="23" cy="14" r="1.5" fill="#1A1A1A" />
          <circle cx="17.5" cy="13.5" r="0.5" fill="white" />
          <circle cx="23.5" cy="13.5" r="0.5" fill="white" />
          
          {/* Nose */}
          <ellipse cx="20" cy="17" rx="1" ry="0.8" fill="#DC2F02" />
          
          {/* Mouth */}
          <path d="M20 17 Q18 18 17 17.5 M20 17 Q22 18 23 17.5" stroke="#DC2F02" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          
          {/* Arms */}
          <ellipse cx="13" cy="24" rx="2" ry="5" fill="#E85D04" />
          <ellipse cx="27" cy="24" rx="2" ry="5" fill="#E85D04" />
          
          {/* Legs */}
          <ellipse cx="17" cy="33" rx="2.5" ry="4" fill="#E85D04" />
          <ellipse cx="23" cy="33" rx="2.5" ry="4" fill="#E85D04" />
          
          {/* Belly */}
          <ellipse cx="20" cy="25" rx="5" ry="6" fill="#FFB703" opacity="0.3" />
          
          {/* Tail */}
          <circle cx="12" cy="28" r="2.5" fill="#E85D04" />
          
          {/* Gradients */}
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FB8500', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#E85D04', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FFB703', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#FB8500', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Tet decoration on mascot */}
        <div className="absolute -top-1 -right-1 text-xs">🧧</div>
      </div>
      
      {/* Logo Text */}
      <div className="flex items-baseline">
        <span className="font-black text-3xl tracking-tight" style={{
          background: 'linear-gradient(135deg, #E85D04 0%, #DC2F02 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          GTG
        </span>
        <span className="font-bold text-xl text-slate-700 ml-0.5">
          SHOP
        </span>
      </div>
    </div>
  );
}
