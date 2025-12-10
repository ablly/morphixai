export function MorphixLogo({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 600 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="100%" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Main Text */}
            <text
                x="50%"
                y="65%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill="url(#logo-gradient)"
                style={{
                    fontFamily: '"Orbitron", "Inter", sans-serif',
                    fontWeight: '900',
                    fontSize: '80px',
                    letterSpacing: '0.05em'
                }}
                filter="url(#glow)"
            >
                Morphix AI
            </text>

            {/* Subtitle / Decoration */}
            <path d="M50 100 H550" stroke="url(#logo-gradient)" strokeWidth="2" strokeOpacity="0.5" />
            <rect x="40" y="95" width="10" height="10" fill="#22d3ee" />
            <rect x="550" y="95" width="10" height="10" fill="#ec4899" />
        </svg>
    );
}
