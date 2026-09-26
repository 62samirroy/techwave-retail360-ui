'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface RoyalArchCardProps {
  title: string;
  image: string;
  href: string;
  badge?: string;
  accentColor?: string;
}

export function RoyalArchCard({
  title,
  image,
  href,
  badge,
  accentColor = '#6e0720', // Royal Wine / Deep Maroon from reference
}: RoyalArchCardProps) {
  // Unique clip id based on title
  const clipId = `arch-clip-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center justify-start w-full max-w-[300px] mx-auto select-none cursor-pointer transition-transform duration-300 hover:-translate-y-1.5"
    >
      <div className="relative w-full aspect-[280/420] filter drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300">
        {/* SVG Arch Frame and Architecture */}
        <svg
          viewBox="0 0 280 420"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Inner Window Clip Path for the Saree Photo */}
            <clipPath id={clipId}>
              <path
                d="
                  M 32 328
                  L 32 152
                  C 32 128, 44 104, 62 88
                  C 74 76, 92 62, 108 52
                  C 120 44, 134 32, 140 28
                  C 146 32, 160 44, 172 52
                  C 188 62, 206 76, 218 88
                  C 236 104, 248 128, 248 152
                  L 248 328
                  Z
                "
              />
            </clipPath>

            {/* Pattern for the ornate maroon border filigree */}
            <pattern
              id={`filigree-${clipId}`}
              x="0"
              y="0"
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 7 0 L 14 7 L 7 14 L 0 7 Z"
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="0.8"
              />
              <circle cx="7" cy="7" r="1.2" fill="rgba(255,255,255,0.7)" />
            </pattern>

            {/* Subtle inner shadow for depth */}
            <linearGradient id={`frameGrad-${clipId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7a0a24" />
              <stop offset="50%" stopColor="#63061c" />
              <stop offset="100%" stopColor="#4f0416" />
            </linearGradient>
          </defs>

          {/* ========================================================= */}
          {/* 1. OUTER DECORATIVE LACE SCALLOPS (Beaded border along the arch) */}
          {/* ========================================================= */}
          <g fill="#7a0a24" stroke="#ffffff" strokeWidth="0.6">
            {/* Top Apex Crown / Finial */}
            <path
              d="M 140 8 C 136 14, 134 16, 130 18 C 136 20, 140 24, 140 26 C 140 24, 144 20, 150 18 C 146 16, 144 14, 140 8 Z"
              fill="#7a0a24"
            />
            <circle cx="140" cy="7" r="2.5" fill="#fde68a" stroke="#7a0a24" strokeWidth="1" />

            {/* Scallop pearls along the left arch curve */}
            <circle cx="130" cy="23" r="3.2" />
            <circle cx="118" cy="29" r="3.2" />
            <circle cx="106" cy="37" r="3.2" />
            <circle cx="95" cy="46" r="3.2" />
            <circle cx="84" cy="57" r="3.2" />
            <circle cx="74" cy="69" r="3.2" />
            <circle cx="64" cy="82" r="3.2" />
            <circle cx="55" cy="97" r="3.2" />
            <circle cx="47" cy="113" r="3.2" />
            <circle cx="41" cy="130" r="3.2" />
            <circle cx="37" cy="148" r="3.2" />

            {/* Scallop pearls along the right arch curve */}
            <circle cx="150" cy="23" r="3.2" />
            <circle cx="162" cy="29" r="3.2" />
            <circle cx="174" cy="37" r="3.2" />
            <circle cx="185" cy="46" r="3.2" />
            <circle cx="196" cy="57" r="3.2" />
            <circle cx="206" cy="69" r="3.2" />
            <circle cx="216" cy="82" r="3.2" />
            <circle cx="225" cy="97" r="3.2" />
            <circle cx="233" cy="113" r="3.2" />
            <circle cx="239" cy="130" r="3.2" />
            <circle cx="243" cy="148" r="3.2" />
          </g>

          {/* ========================================================= */}
          {/* 2. MAIN SOLID MAROON ARCH BODY */}
          {/* ========================================================= */}
          <path
            d="
              M 20 334
              L 20 152
              C 20 124, 34 98, 54 80
              C 68 66, 88 51, 106 39
              C 120 30, 134 18, 140 14
              C 146 18, 160 30, 174 39
              C 192 51, 212 66, 226 80
              C 246 98, 260 124, 260 152
              L 260 334
              Z
            "
            fill={`url(#frameGrad-${clipId})`}
            stroke="#ffffff"
            strokeWidth="1.2"
          />

          {/* ========================================================= */}
          {/* 3. LATTICE / JALI PATTERN OVERLAY ON MAROON BAND */}
          {/* ========================================================= */}
          <path
            d="
              M 20 334
              L 20 152
              C 20 124, 34 98, 54 80
              C 68 66, 88 51, 106 39
              C 120 30, 134 18, 140 14
              C 146 18, 160 30, 174 39
              C 192 51, 212 66, 226 80
              C 246 98, 260 124, 260 152
              L 260 334
              Z
            "
            fill={`url(#filigree-${clipId})`}
            opacity="0.75"
          />

          {/* ========================================================= */}
          {/* 4. INNER WHITE PEARL STRING (Lining the inner frame) */}
          {/* ========================================================= */}
          <path
            d="
              M 26 332
              L 26 152
              C 26 126, 39 101, 58 84
              C 71 71, 90 56, 107 45
              C 120 37, 134 25, 140 21
              C 146 25, 160 37, 173 45
              C 190 56, 209 71, 222 84
              C 241 101, 254 126, 254 152
              L 254 332
            "
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeDasharray="1.5 5"
            strokeLinecap="round"
          />

          {/* ========================================================= */}
          {/* 5. PHOTO WINDOW INNER CUTOUT (Clipped Image) */}
          {/* ========================================================= */}
          <g clipPath={`url(#${clipId})`}>
            {/* Background color behind photo */}
            <rect x="32" y="28" width="216" height="300" fill="#f8f4eb" />
            
            {/* Native SVG Image with Zoom on Card Hover */}
            <image
              href={image}
              x="32"
              y="28"
              width="216"
              height="300"
              preserveAspectRatio="xMidYMid slice"
              className="transition-transform duration-700 ease-out group-hover:scale-108 origin-center"
              style={{ transformOrigin: '140px 178px' }}
            />
          </g>

          {/* Inner crisp white border line around the photo */}
          <path
            d="
              M 32 328
              L 32 152
              C 32 128, 44 104, 62 88
              C 74 76, 92 62, 108 52
              C 120 44, 134 32, 140 28
              C 146 32, 160 44, 172 52
              C 188 62, 206 76, 218 88
              C 236 104, 248 128, 248 152
              L 248 328
              Z
            "
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.6"
          />

          {/* ========================================================= */}
          {/* 6. BASE PEDESTAL & ORNAMENTAL FLOURISH */}
          {/* ========================================================= */}
          {/* Horizontal base bar */}
          <rect x="20" y="328" width="240" height="12" fill={`url(#frameGrad-${clipId})`} stroke="#ffffff" strokeWidth="0.8" />
          
          {/* Delicate central flourish motif (heart/lotus curl from screenshot) */}
          <g fill="#ffffff">
            <circle cx="120" cy="334" r="1.5" />
            <circle cx="160" cy="334" r="1.5" />
            <path
              d="M 140 330 C 137 330, 135 332, 135 334 C 135 336.5, 140 338, 140 338 C 140 338, 145 336.5, 145 334 C 145 332, 143 330, 140 330 Z"
            />
            {/* Side curls */}
            <path
              d="M 134 334 Q 130 331 126 334 Q 130 337 134 334 Z"
            />
            <path
              d="M 146 334 Q 150 331 154 334 Q 150 337 146 334 Z"
            />
          </g>

          {/* Bottom baseline */}
          <line x1="20" y1="344" x2="260" y2="344" stroke="#ffffff" strokeWidth="1.2" />

          {/* ========================================================= */}
          {/* 7. CHAMFERED TITLE BANNER (Exact polygon shape from screenshot) */}
          {/* ========================================================= */}
          {/* Outer Plaque Frame */}
          <polygon
            points="12,352 268,352 254,388 26,388"
            fill="#ffffff"
            stroke="#7a0a24"
            strokeWidth="2.2"
          />
          
          {/* Inner subtle gold/wine border line */}
          <polygon
            points="16,355 264,355 251,385 29,385"
            fill="none"
            stroke="rgba(122,10,36,0.2)"
            strokeWidth="0.8"
          />

          {/* Centered Category Title */}
          <text
            x="140"
            y="373"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#210309"
            fontSize="12.5"
            fontWeight="700"
            fontFamily="var(--font-sans, system-ui, sans-serif)"
            letterSpacing="0.02em"
            className="group-hover:fill-[#7a0a24] transition-colors duration-200"
          >
            {title}
          </text>
        </svg>

        {/* Optional Badge */}
        {badge && (
          <div className="absolute top-8 right-2 z-10 rounded-full bg-[#d4af37] text-stone-950 font-bold px-2.5 py-0.5 text-[9px] shadow-md uppercase tracking-wider">
            {badge}
          </div>
        )}
      </div>
    </Link>
  );
}
