'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/20 bg-transparent mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-sm text-white/80">
              © {currentYear} OutreachBoosters. All rights reserved.
            </p>
            <p className="text-xs text-white/60">
              GTM & RevOps Partner
            </p>
          </div>
          
        </div>
      </div>
    </footer>
  );
}
