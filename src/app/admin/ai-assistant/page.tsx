'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Package,
  Users,
  ShieldCheck,
  BarChart3,
  PieChart as PieChartIcon,
  Table as TableIcon,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface KPICard {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple' | 'blue';
  icon?: string;
}

interface ChartData {
  type: 'bar' | 'line' | 'pie';
  title: string;
  subtitle?: string;
  data: Array<{
    label: string;
    value: number;
    secondaryValue?: number;
    formattedValue?: string;
  }>;
}

interface TableData {
  title?: string;
  headers: string[];
  rows: Array<Array<string | number>>;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: string;
    kpis?: KPICard[];
    chart?: ChartData;
    charts?: ChartData[];
    table?: TableData;
    items?: any[];
    engine?: 'gemini' | 'orchestrator';
    latencyMs?: number;
  };
}

export default function AdminAIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content:
        'Namaste! I am your **TechWave Retail360 AI Business Copilot**.\n\n' +
        'I am powered by the **Gemini API** and our grounded **Tool Orchestrator**, connecting live to your **Supabase PostgreSQL database**, **Razorpay Gateway**, and **Notification Services**.\n\n' +
        'Ask me anything about sales performance, revenue trajectory, weaver stock alerts, or category share. I will generate real-time KPI cards, charts, and actionable tables for your store.',
      timestamp: new Date(),
      metadata: {
        engine: 'orchestrator',
      },
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptSuggestions = [
    "Show different charts and graphs",
    "Give me the saree only red color",
    "Show collection revenue pie chart",
    "Today day name",
    "What is today's date?",
    "Show last 7 days sales in table format",
    "Today last one order",
    "What are today's sales?",
    "Show 7-day revenue trend",
    "Which products are low in stock?",
    "Show system and gateway health",
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
        content: 'Error communicating with AI engine. Ensure backend API is operational on port 5000.',
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

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        content:
          'Namaste! Chat history cleared. How can I assist your business analysis today?',
        timestamp: new Date(),
        metadata: { engine: 'orchestrator' },
      },
    ]);
  };

  // Helper icon selector for KPI cards
  const renderKPIIcon = (color?: string) => {
    switch (color) {
      case 'emerald':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'purple':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case 'amber':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'rose':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'blue':
        return <Users className="w-4 h-4 text-blue-600" />;
      default:
        return <Package className="w-4 h-4 text-brand-600" />;
    }
  };

  // 1. KPI Cards Widget Component
  const renderKPICards = (kpis: KPICard[]) => {
    if (!kpis || kpis.length === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 my-3">
        {kpis.map((kpi, idx) => {
          const colorStyles: Record<string, { bg: string; border: string; text: string }> = {
            emerald: { bg: 'bg-emerald-50/70', border: 'border-emerald-200', text: 'text-emerald-900' },
            purple: { bg: 'bg-purple-50/70', border: 'border-purple-200', text: 'text-purple-900' },
            amber: { bg: 'bg-amber-50/70', border: 'border-amber-200', text: 'text-amber-900' },
            rose: { bg: 'bg-rose-50/70', border: 'border-rose-200', text: 'text-rose-900' },
            blue: { bg: 'bg-blue-50/70', border: 'border-blue-200', text: 'text-blue-900' },
          };
          const currentStyle = colorStyles[kpi.color || 'emerald'] || colorStyles.emerald;

          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${currentStyle.border} ${currentStyle.bg} shadow-2xs flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[11px] font-semibold text-brand-700 truncate">{kpi.label}</span>
                <div className="p-1 rounded-md bg-white border border-brand-200/60 shadow-2xs">
                  {renderKPIIcon(kpi.color)}
                </div>
              </div>
              <div className="text-base font-extrabold text-brand-950 tracking-tight">{kpi.value}</div>
              {kpi.change && (
                <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-brand-600">
                  {kpi.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                  {kpi.trend === 'down' && <TrendingDown className="w-3 h-3 text-rose-600" />}
                  <span className="truncate">{kpi.change}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // 2. Charts Widget Component (Bar, Line & Donut/Pie charts)
  const renderChart = (chart: ChartData) => {
    if (!chart || !chart.data || chart.data.length === 0) return null;

    const values = chart.data.map((d) => d.value);
    const maxValue = Math.max(...values, 1);
    const isPie = chart.type === 'pie' || (chart.type as string) === 'donut';

    return (
      <div className="my-3 p-3.5 rounded-lg border border-brand-200 bg-white shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-xs font-bold text-brand-950 flex items-center gap-1.5">
              {isPie ? (
                <PieChartIcon className="w-3.5 h-3.5 text-royal-600" />
              ) : (
                <BarChart3 className="w-3.5 h-3.5 text-royal-600" />
              )}
              <span>{chart.title}</span>
            </h4>
            {chart.subtitle && <p className="text-[10px] text-brand-500 mt-0.5">{chart.subtitle}</p>}
          </div>
          <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 bg-brand-100 text-brand-700 rounded">
            {chart.type.toUpperCase()}
          </span>
        </div>

        {/* Line Chart */}
        {chart.type === 'line' ? (
          <div className="pt-2">
            <div className="h-36 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

                {/* Path line & gradient fill */}
                {(() => {
                  const points = chart.data.map((d, i) => {
                    const x = (i / (chart.data.length - 1 || 1)) * 480 + 10;
                    const y = 110 - (d.value / maxValue) * 90;
                    return { x, y, ...d };
                  });

                  const pathD = points.reduce(
                    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                    ''
                  );
                  const areaD = `${pathD} L ${points[points.length - 1].x} 115 L ${points[0].x} 115 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#areaGradient)" />
                      <path d={pathD} fill="none" stroke="#9333ea" strokeWidth="2.5" strokeLinecap="round" />
                      {points.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="3.5" fill="#ffffff" stroke="#9333ea" strokeWidth="2" />
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
            {/* Axis labels */}
            <div className="flex justify-between items-center text-[10px] text-brand-500 pt-2 border-t border-brand-100 px-1">
              {chart.data.map((d, i) => (
                <div key={i} className="text-center">
                  <div className="font-semibold text-brand-700">{d.label.split(' ')[0]}</div>
                  <div className="text-[9px] text-brand-500">{d.formattedValue}</div>
                </div>
              ))}
            </div>
          </div>
        ) : isPie ? (
          /* Donut / Pie Chart */
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-36 h-36 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  {(() => {
                    const total = chart.data.reduce((acc, d) => acc + d.value, 0) || 1;
                    const palette = [
                      '#9333ea', // purple
                      '#10b981', // emerald
                      '#f59e0b', // amber
                      '#3b82f6', // blue
                      '#ec4899', // pink
                      '#8b5cf6', // violet
                      '#14b8a6', // teal
                      '#6366f1', // indigo
                    ];
                    const radius = 55;
                    const circumference = 2 * Math.PI * radius; // ~345.575
                    let cumulativePct = 0;

                    return chart.data.map((d, i) => {
                      const pct = d.value / total;
                      const strokeDasharray = `${pct * circumference} ${circumference}`;
                      const strokeDashoffset = -cumulativePct * circumference;
                      cumulativePct += pct;
                      const color = palette[i % palette.length];

                      return (
                        <circle
                          key={i}
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="transparent"
                          stroke={color}
                          strokeWidth="22"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500 hover:opacity-80"
                        />
                      );
                    });
                  })()}
                </svg>
                {/* Center Hole Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-bold text-brand-400 uppercase tracking-wider">Share</span>
                  <span className="text-xs font-extrabold text-brand-950">100%</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 w-full space-y-1.5 min-w-0">
                {(() => {
                  const total = chart.data.reduce((acc, d) => acc + d.value, 0) || 1;
                  const palette = [
                    '#9333ea',
                    '#10b981',
                    '#f59e0b',
                    '#3b82f6',
                    '#ec4899',
                    '#8b5cf6',
                    '#14b8a6',
                    '#6366f1',
                  ];

                  return chart.data.map((d, i) => {
                    const pct = Math.round((d.value / total) * 100);
                    const color = palette[i % palette.length];
                    return (
                      <div key={i} className="flex items-center justify-between text-[11px] gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-semibold text-brand-800 truncate">{d.label}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-brand-950">{pct}%</span>
                          <span className="text-[10px] text-brand-500">{d.formattedValue || d.value}</span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        ) : (
          /* Bar Chart */
          <div className="space-y-2 pt-2">
            {chart.data.map((d, idx) => {
              const pct = Math.max(Math.round((d.value / maxValue) * 100), 5);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-brand-800 truncate max-w-[65%]">{d.label}</span>
                    <span className="font-bold text-brand-950">{d.formattedValue || d.value}</span>
                  </div>
                  <div className="h-2 w-full bg-brand-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-royal-500 to-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 3. Product Cards Widget Component (for Catalog Search results)
  const renderProductCards = (items: any[]) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {items.map((prod: any) => (
          <div
            key={prod.id || prod.sku}
            className="flex items-center gap-3 p-2.5 rounded-lg border border-brand-200 bg-white hover:border-royal-400 hover:shadow-xs transition-all"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-brand-100 border border-brand-200/60">
              <img
                src={
                  prod.image ||
                  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400'
                }
                alt={prod.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-semibold uppercase px-1 py-0.2 bg-brand-100 text-brand-700 rounded">
                  {prod.sku || prod.category}
                </span>
                <span
                  className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                    prod.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of stock'}
                </span>
              </div>
              <h5 className="text-[11px] font-bold text-brand-950 truncate mt-0.5" title={prod.name}>
                {prod.name}
              </h5>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-royal-700">
                    ₹{Number(prod.price).toLocaleString('en-IN')}
                  </span>
                  {prod.originalPrice && prod.originalPrice > prod.price && (
                    <span className="text-[10px] text-brand-400 line-through">
                      ₹{Number(prod.originalPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                {prod.id && (
                  <a
                    href={`/product/${prod.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-0.5"
                  >
                    <span>View</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 3. Tables Widget Component
  const renderTable = (table: TableData) => {
    if (!table || !table.headers || !table.rows) return null;

    return (
      <div className="my-3 overflow-hidden rounded-lg border border-brand-200 bg-white shadow-2xs">
        {table.title && (
          <div className="bg-brand-50/80 px-3 py-2 border-b border-brand-200/80 flex items-center justify-between">
            <h4 className="text-xs font-bold text-brand-950 flex items-center gap-1.5">
              <TableIcon className="w-3.5 h-3.5 text-brand-600" />
              <span>{table.title}</span>
            </h4>
            <span className="text-[10px] text-brand-500 font-medium">{table.rows.length} rows</span>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-brand-100/60 text-brand-700 font-semibold uppercase text-[10px] tracking-wider border-b border-brand-200">
              <tr>
                {table.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 text-brand-800">
              {table.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-brand-50/50 transition-colors">
                  {row.map((cell, cIdx) => {
                    const str = String(cell);
                    const isBadge =
                      str === 'PAID' ||
                      str === 'HEALTHY' ||
                      str === 'CONFIRMED' ||
                      str === 'PENDING' ||
                      str === 'LOW STOCK' ||
                      str === 'OUT OF STOCK' ||
                      str === 'CRITICAL' ||
                      str.startsWith('#');

                    return (
                      <td key={cIdx} className="px-3 py-2 whitespace-nowrap">
                        {isBadge ? (
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              str === 'PAID' || str === 'HEALTHY' || str === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : str === 'PENDING' || str === 'LOW STOCK'
                                ? 'bg-amber-100 text-amber-800'
                                : str === 'OUT OF STOCK' || str === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800 font-bold'
                                : 'bg-brand-100 text-brand-700 font-bold'
                            }`}
                          >
                            {str}
                          </span>
                        ) : (
                          <span>{str}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Markdown-like text formatter
  const formatText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Bold text replacement
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
                <code key={pIdx} className="px-1 py-0.2 bg-brand-100 text-brand-800 rounded text-[11px] font-mono">
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
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-3">
      {/* Header */}
      <div className="bg-white p-3.5 rounded-lg border border-brand-200 shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-royal-500 text-brand-950 flex items-center justify-center font-bold shadow-2xs">
            <Sparkles className="w-4 h-4 text-brand-950" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-brand-950 flex items-center gap-1.5">
              <span>Retail360 AI Business Copilot</span>
              <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Gemini API + Orchestrator
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" /> Live Supabase & Razorpay
              </span>
            </h1>
            <p className="text-[11px] text-brand-500">
              Executive business analytics: sales KPIs, daily revenue trends, weaver reorders, and system health.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="text-xs text-brand-500 hover:text-brand-800 flex items-center gap-1 px-2.5 py-1 rounded-md border border-brand-200 hover:bg-brand-50 transition-colors shadow-2xs"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-white rounded-lg border border-brand-200 shadow-xs p-4 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="h-7 w-7 rounded-full bg-royal-100 text-royal-700 flex items-center justify-center shrink-0 mt-0.5 border border-royal-200 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-brand-50/70 text-brand-900 border border-brand-200 shadow-2xs'
              }`}
            >
              {/* Text Body */}
              <div className="space-y-1">{formatText(m.content)}</div>

              {/* Structured Output: KPI Cards */}
              {m.metadata?.kpis && renderKPICards(m.metadata.kpis)}

              {/* Structured Output: Visual Charts (Single or Multi-Chart Suite) */}
              {m.metadata?.charts && m.metadata.charts.length > 0 ? (
                <div className="space-y-2 my-2">
                  {m.metadata.charts.map((c, i) => (
                    <React.Fragment key={i}>{renderChart(c)}</React.Fragment>
                  ))}
                </div>
              ) : (
                m.metadata?.chart && renderChart(m.metadata.chart)
              )}

              {/* Structured Output: Product Cards Grid (for catalog search results) */}
              {m.metadata?.items && m.metadata.items.length > 0 && renderProductCards(m.metadata.items)}

              {/* Structured Output: Data Tables */}
              {m.metadata?.table && renderTable(m.metadata.table)}

              {/* Footer with Metadata & Copy Action */}
              {m.sender === 'assistant' && (
                <div className="mt-2.5 pt-2 border-t border-brand-200/60 flex items-center justify-between text-[10px] text-brand-400">
                  <div className="flex items-center gap-2">
                    <span>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {m.metadata?.engine && (
                      <span className="px-1.5 py-0.2 rounded bg-brand-200/60 text-brand-700 font-medium uppercase text-[9px]">
                        {m.metadata.engine === 'gemini' ? 'Gemini 2.5 Flash' : 'Retail360 Orchestrator'}
                      </span>
                    )}
                    {m.metadata?.latencyMs && (
                      <span className="text-[9px] text-brand-400 font-mono">
                        {m.metadata.latencyMs}ms
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopy(m.id, m.content)}
                    className="flex items-center gap-1 text-brand-500 hover:text-brand-900 font-medium transition-colors"
                  >
                    {copiedId === m.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Copied</span>
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
          <div className="flex items-center gap-2 text-xs text-brand-600 bg-brand-50 p-3 rounded-lg w-fit border border-brand-200 shadow-2xs">
            <Sparkles className="w-4 h-4 animate-spin text-royal-600" />
            <span className="font-medium">
              Orchestrating tools across Supabase, Razorpay & generating structured intelligence...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 no-scrollbar">
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
          placeholder="Ask AI anything about sales, low inventory, 7-day revenue trend, category share, or gateway health..."
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
