'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/constants';

export function WhatsAppFloatingButton() {
  const whatsappUrl = buildWhatsAppLink(
    APP_CONFIG.supportPhone,
    'Namaste! I would like to inquire about your handloom saree collection and support.'
  );

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2.5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group"
      >
        <MessageCircle className="w-5 h-5 fill-white text-[#25D366] group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline text-xs font-semibold">WhatsApp Us</span>
      </a>
    </div>
  );
}
