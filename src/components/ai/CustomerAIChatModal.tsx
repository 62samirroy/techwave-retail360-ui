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
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice, cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  metadata?: {
    type?: 'products' | 'order' | 'analytics' | 'faq';
    items?: any[];
    link?: string;
    engine?: 'gemini' | 'orchestrator';
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
        'Namaste! 🌸 I am your Royal Saree & Fashion AI Assistant. Ask me anything about our handloom weaves, prices, live order tracking, or styling recommendations!',
      metadata: { engine: 'orchestrator' },
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
    'Where is my order?',
    'Show me red sarees under ₹3000',
    'Is Kanjivaram in stock?',
    'What is your return & refund policy?',
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

  const formatText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={idx} className="block min-h-[1.2em]">
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-brand-950">
                  {p.slice(2, -2)}
                </strong>
              );
            }
            if (p.startsWith('`') && p.endsWith('`')) {
              return (
                <code key={pIdx} className="px-1 py-0.2 bg-brand-100 text-brand-800 rounded text-[10px] font-mono">
                  {p.slice(1, -1)}
                </code>
              );
            }
            return p;
          })}
        </span>
      );
    });
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 rounded-full bg-[#9333EA] hover:bg-[#8017d4] text-white px-5 py-2.5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group"
          >
            <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-medium">Ask our assistant</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] sm:w-[390px] h-[540px] max-h-[85vh] rounded-xl border border-brand-200 bg-white shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-brand-950 via-brand-900 to-primary-950 text-white border-b border-brand-800">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-royal-500/20 text-royal-400 border border-royal-500/30">
                <Sparkles className="w-3.5 h-3.5 text-royal-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold leading-tight text-white flex items-center gap-1.5">
                  <span>Retail360 Customer AI</span>
                </h4>
                <p className="text-[10px] text-royal-300 font-medium">
                  Live Supabase Catalog & Order Tracking
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

          {/* Starter prompt pills */}
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

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn('flex flex-col', m.sender === 'user' ? 'items-end' : 'items-start')}
              >
                <div
                  className={cn(
                    'max-w-[88%] rounded-lg px-3 py-2 text-xs leading-relaxed',
                    m.sender === 'user'
                      ? 'bg-primary-600 text-white rounded-br-none shadow-2xs'
                      : 'bg-white text-brand-900 border border-brand-200 shadow-2xs rounded-bl-none'
                  )}
                >
                  <div className="space-y-0.5">{formatText(m.content)}</div>

                  {/* Product Cards Grid */}
                  {m.metadata?.type === 'products' && m.metadata.items && m.metadata.items.length > 0 && (
                    <div className="mt-2.5 space-y-1.5 border-t border-brand-100 pt-2">
                      {m.metadata.items.map((prod: any) => (
                        <Link
                          key={prod.id}
                          href={`/product/${prod.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-md border border-brand-200/80 bg-brand-50/60 hover:bg-brand-100/70 transition-colors group"
                        >
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-brand-200">
                            <Image
                              src={
                                prod.image ||
                                'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400'
                              }
                              alt={prod.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
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
                          <ExternalLink className="w-3 h-3 text-brand-400 group-hover:text-primary-600 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Order Tracking Action Link */}
                  {m.metadata?.link && (
                    <div className="mt-2 pt-1 border-t border-brand-100">
                      <Link
                        href={m.metadata.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700"
                      >
                        <Package className="w-3.5 h-3.5" /> View Real-Time Tracking Details →
                      </Link>
                    </div>
                  )}

                  {/* Engine indicator */}
                  {m.sender === 'assistant' && m.metadata?.engine && (
                    <div className="mt-1.5 pt-1 border-t border-brand-100/60 flex items-center justify-between text-[9px] text-brand-400">
                      <span>
                        {m.metadata.engine === 'gemini' ? 'Gemini 2.5 Flash' : 'Retail360 Grounded'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-brand-500 text-xs py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600" />
                <span>Searching Supabase catalog and verifying orders...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
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
              placeholder="Ask about sarees, prices, order ID..."
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
