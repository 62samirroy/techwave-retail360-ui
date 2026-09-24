'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Package,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  metadata?: {
    type?: 'products' | 'order' | 'analytics' | 'faq';
    items?: any[];
    link?: string;
  };
}

export function CustomerAIChatModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content:
        'Namaste! 🌸 I am your Royal Saree & Fashion AI Assistant. Ask me anything about our weaves, prices, order status, or recommendations!',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const starterPrompts = [
    'Red bridal sarees under ₹15,000',
    'Where is my order TW-ORD-10021?',
    'What is your return & exchange policy?',
    'Show me lightweight Organza sarees',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.chatCustomerAI(text, conversationId);

      if (res.success && res.data) {
        if (res.data.conversationId) setConversationId(res.data.conversationId);

        const assistantMsg: Message = {
          id: `ast_${Date.now()}`,
          sender: 'assistant',
          content: res.data.message,
          metadata: res.data.metadata,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'assistant',
            content: 'Sorry, I encountered an issue. Please try asking again.',
          },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          content: 'Network connection error. Please verify backend is running on port 5000.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-900 to-primary-800 text-white px-3.5 py-2.5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border border-brand-700/80 group"
          >
            <div className="relative">
              <Sparkles className="w-4 h-4 text-royal-400 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-royal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-royal-500"></span>
              </span>
            </div>
            <span className="text-xs font-semibold tracking-wide">AI Saree Assistant</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] sm:w-[380px] h-[520px] max-h-[85vh] rounded-xl border border-brand-200 bg-white shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-brand-950 via-brand-900 to-primary-950 text-white border-b border-brand-800">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-royal-500/20 text-royal-400 border border-royal-500/30">
                <Sparkles className="w-3.5 h-3.5 text-royal-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold leading-tight text-white">
                  Retail360 AI Assistant
                </h4>
                <p className="text-[10px] text-royal-300 font-medium">
                  Live Product & Order Grounded
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-brand-400 hover:text-white hover:bg-brand-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {messages.length <= 2 && (
            <div className="bg-brand-50/80 px-3 py-2 border-b border-brand-200/60 overflow-x-auto no-scrollbar flex gap-1.5 shrink-0">
              {starterPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="whitespace-nowrap text-[10px] font-medium bg-white hover:bg-brand-100 text-brand-700 px-2 py-1 rounded-full border border-brand-200 shadow-2xs transition-colors shrink-0"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn('flex flex-col', m.sender === 'user' ? 'items-end' : 'items-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed',
                    m.sender === 'user'
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-white text-brand-900 border border-brand-200 shadow-2xs rounded-bl-none'
                  )}
                >
                  <p className="whitespace-pre-line">{m.content}</p>

                  {m.metadata?.type === 'products' && m.metadata.items && (
                    <div className="mt-2.5 space-y-1.5 border-t border-brand-100 pt-2">
                      {m.metadata.items.map((prod: any) => (
                        <Link
                          key={prod.id}
                          href={`/product/${prod.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-md border border-brand-200/80 bg-brand-50/60 hover:bg-brand-100/70 transition-colors"
                        >
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-brand-200">
                            <Image
                              src={prod.image}
                              alt={prod.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-brand-900 truncate">
                              {prod.name}
                            </p>
                            <p className="text-[10px] text-royal-700 font-bold">
                              {formatPrice(prod.price)}
                            </p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-brand-400 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {m.metadata?.link && (
                    <div className="mt-2 pt-1 border-t border-brand-100">
                      <Link
                        href={m.metadata.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700"
                      >
                        <Package className="w-3 h-3" /> View Real-Time Tracking Details →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-brand-500 text-xs py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600" />
                <span>Searching catalog and orders...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2 border-t border-brand-200 bg-white flex items-center gap-1.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sarees, order ID, fabrics..."
              className="flex-1 rounded-md border border-brand-300 px-3 py-1.5 text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
            <Button
              type="submit"
              size="xs"
              variant="primary"
              disabled={isLoading || !input.trim()}
              className="h-8 px-2.5"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
