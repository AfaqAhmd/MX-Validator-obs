'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full border-b border-white/20 bg-transparent">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          {/* Logo */}
          <div className="relative">
            <svg
              width="240"
              height="160"
              viewBox="0 0 240 160"
              className="w-auto h-24 md:h-28"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Shield/badge shape with flat top and curved bottom */}
              <defs>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.5"/>
                </filter>
              </defs>
              
              {/* Main shield shape - black fill with white outline */}
              <path
                d="M20 20 L220 20 L220 80 Q220 100 200 100 L180 110 Q160 120 120 130 Q80 120 60 110 L40 100 Q20 100 20 80 Z"
                fill="#000000"
                stroke="white"
                strokeWidth="3"
                filter="url(#shadow)"
              />
              
              {/* Blue curved wing shapes on sides - medium dark blue with white outline */}
              <path
                d="M50 95 Q70 85 90 95 Q110 105 120 110 Q130 105 150 95 Q170 85 190 95"
                fill="#1e3a8a"
                stroke="white"
                strokeWidth="2"
              />
              <path
                d="M45 100 Q65 90 85 100 Q105 110 120 115 Q135 110 155 100 Q175 90 195 100"
                fill="#1e3a8a"
                stroke="white"
                strokeWidth="2"
              />
              
              {/* Rocket at bottom center */}
              <g transform="translate(120, 115)">
                {/* Rocket body */}
                <rect x="-4" y="-18" width="8" height="18" fill="white" rx="1"/>
                {/* Rocket nose cone - pointed */}
                <path
                  d="M0 -18 L-4 -26 L4 -26 Z"
                  fill="white"
                />
                {/* Rocket fins - left */}
                <path
                  d="M-4 0 L-8 6 L-4 6 Z"
                  fill="white"
                />
                {/* Rocket fins - right */}
                <path
                  d="M4 0 L8 6 L4 6 Z"
                  fill="white"
                />
                {/* Exhaust plume - white smoke */}
                <ellipse cx="-3" cy="4" rx="2" ry="6" fill="white" opacity="0.9" />
                <ellipse cx="0" cy="4" rx="2.5" ry="7" fill="white" opacity="0.9" />
                <ellipse cx="3" cy="4" rx="2" ry="6" fill="white" opacity="0.9" />
              </g>
              
              {/* Text: OUTREACH - white with thick black outline */}
              <text
                x="120"
                y="45"
                textAnchor="middle"
                fill="none"
                stroke="#000000"
                strokeWidth="5"
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{
                  fontFamily: 'Arial, "Helvetica Neue", sans-serif',
                  fontWeight: '900',
                  fontSize: '22px',
                  letterSpacing: '4px',
                }}
              >
                OUTREACH
              </text>
              <text
                x="120"
                y="45"
                textAnchor="middle"
                fill="white"
                style={{
                  fontFamily: 'Arial, "Helvetica Neue", sans-serif',
                  fontWeight: '900',
                  fontSize: '22px',
                  letterSpacing: '4px',
                }}
              >
                OUTREACH
              </text>
              
              {/* Text: BOOSTERS - white with thick black outline */}
              <text
                x="120"
                y="68"
                textAnchor="middle"
                fill="none"
                stroke="#000000"
                strokeWidth="5"
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{
                  fontFamily: 'Arial, "Helvetica Neue", sans-serif',
                  fontWeight: '900',
                  fontSize: '22px',
                  letterSpacing: '4px',
                }}
              >
                BOOSTERS
              </text>
              <text
                x="120"
                y="68"
                textAnchor="middle"
                fill="white"
                style={{
                  fontFamily: 'Arial, "Helvetica Neue", sans-serif',
                  fontWeight: '900',
                  fontSize: '22px',
                  letterSpacing: '4px',
                }}
              >
                BOOSTERS
              </text>
            </svg>
          </div>
          
          {/* Agency name */}
          <Link
            href="https://outreachboosters.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white transition-colors text-sm md:text-base font-medium"
          >
            outreachboosters.io
          </Link>
        </div>
      </div>
    </header>
  );
}
