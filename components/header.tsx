'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full border-b border-white/20 bg-transparent">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          {/* Logo image (replace /logo.png with your own logo file) */}
          <div className="relative h-20 md:h-24 w-auto">
            <Image
              src="/Logo-3.png"
              alt="OutreachBoosters logo"
              width={240}
              height={160}
              className="h-full w-auto object-contain"
              priority
            />
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
