'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  MessageCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export default function AdminAIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content:
        'Namaste! I am your AI Business Copilot for Royal Saree & Fashion. I have real-time access to your SQLite database, live inventory counts, order revenues, and weaver lead times. How can I assist your business today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptSuggestions = [
    'Generate an executive sales and inventory summary',
    'Which saree weaves are running dangerously low on stock?',
    'Draft a WhatsApp promotional broadcast for the Diwali bridal collection',
    'Recommend pricing or discount strategy for slow-moving inventory',
    'Write a luxury product description for Pure Kanchipuram Gold Zari Silk',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.chatBusinessAI(text.trim());
      if (res.success && res.data) {
        const botMsg: Message = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          content: res.data.message,
          timestamp: new Date(),
          metadata: res.data.metadata,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const errorMsg: Message = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          content:
            res.message || 'Apologies, I encountered an issue analyzing your store database.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: 'Error communicating with AI engine. Ensure API backend is running.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-3">
      {/* Header */}
      <div className="bg-white p-3.5 rounded-lg border border-brand-200 shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-royal-500 text-brand-950 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-brand-950 flex items-center gap-1.5">
              <span>Retail360 AI Business Copilot</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase">
                Grounded to Live DB
              </span>
            </h1>
            <p className="text-[11px] text-brand-500">
              Query revenue insights, auto-generate marketing collateral, and monitor weaver stock reorders.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-white rounded-lg border border-brand-200 shadow-xs p-4 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="h-7 w-7 rounded-full bg-royal-100 text-royal-700 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-lg p-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-brand-50 text-brand-900 border border-brand-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>

              {m.sender === 'assistant' && (
                <div className="mt-2 pt-2 border-t border-brand-200/60 flex items-center justify-between text-[10px] text-brand-400">
                  <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <button
                    onClick={() => handleCopy(m.id, m.content)}
                    className="flex items-center gap-1 text-brand-500 hover:text-brand-900 font-medium transition-colors"
                  >
                    {copiedId === m.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Output</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="h-7 w-7 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                You
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-brand-500 bg-brand-50 p-2.5 rounded-lg w-fit border border-brand-200">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-royal-600" />
            <span>Analyzing store database and synthesizing report...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
        <span className="text-[10px] font-semibold text-brand-400 uppercase shrink-0">
          Suggested Queries:
        </span>
        {promptSuggestions.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] bg-white hover:bg-brand-50 border border-brand-200 text-brand-700 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shadow-2xs hover:border-brand-400 shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="bg-white p-2.5 rounded-lg border border-brand-200 shadow-xs flex items-center gap-2 shrink-0">
        <textarea
          rows={1}
          placeholder="Ask AI anything about sales, low inventory, customer trends, or marketing copy..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className="flex-1 text-xs text-brand-900 border-none focus:outline-none resize-none px-2 py-1 placeholder:text-brand-400"
        />
        <Button
          size="sm"
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || loading}
          leftIcon={<Send className="w-3.5 h-3.5" />}
        >
          Ask
        </Button>
      </div>
    </div>
  );
}
