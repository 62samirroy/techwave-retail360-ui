'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  PieChart,
  ArrowUpRight,
  Package,
} from 'lucide-react';
import { api } from '@/lib/api';
import { AnalyticsSummary } from '@/types';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingState';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics(range);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner message="Calculating store business metrics..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-xs text-brand-500">
        Failed to load analytics data.
      </div>
    );
  }

  const totalCatRevenue = data.salesByCategory?.reduce((acc, c) => acc + c.revenue, 0) || 1;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-brand-200 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-brand-950 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary-600" />
            <span>Store Performance & Sales Analytics</span>
          </h1>
          <p className="text-xs text-brand-500">
            Granular revenue breakdowns, average order values, and inventory sales distribution.
          </p>
        </div>

        <div className="w-44">
          <Select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            options={[
              { label: 'Last 7 Days', value: '7d' },
              { label: 'Last 30 Days', value: '30d' },
              { label: 'Last 90 Days', value: '90d' },
              { label: 'All Time History', value: 'all' },
            ]}
          />
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-brand-200 shadow-xs">
          <span className="text-[10px] font-medium uppercase text-brand-500 block mb-1">
            Total Window Turnover
          </span>
          <div className="text-lg font-bold text-brand-950 font-mono">
            <PriceDisplay amount={data.totalRevenue} />
          </div>
          <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Verified Orders</span>
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-brand-200 shadow-xs">
          <span className="text-[10px] font-medium uppercase text-brand-500 block mb-1">
            Total Orders
          </span>
          <div className="text-lg font-bold text-brand-950 font-mono">
            {data.totalOrders}
          </div>
          <span className="text-[10px] text-brand-500 mt-1 block">
            {data.completedOrders} fulfilled & delivered
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-brand-200 shadow-xs">
          <span className="text-[10px] font-medium uppercase text-brand-500 block mb-1">
            Average Order Value (AOV)
          </span>
          <div className="text-lg font-bold text-brand-950 font-mono">
            ₹{Math.round(data.averageOrderValue || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-brand-400 mt-1 block">Per checkout transaction</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-brand-200 shadow-xs">
          <span className="text-[10px] font-medium uppercase text-brand-500 block mb-1">
            Customer Base
          </span>
          <div className="text-lg font-bold text-brand-950 font-mono">
            {data.totalCustomers}
          </div>
          <span className="text-[10px] text-brand-400 mt-1 block">Registered shoppers</span>
        </div>
      </div>

      {/* Main Grid: Revenue Daily Trend & Saree Weave Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-brand-200 p-4 shadow-xs">
          <h2 className="text-xs font-bold text-brand-900 mb-1">Daily Turnover Trend</h2>
          <p className="text-[11px] text-brand-500 mb-4">Daily gross receipts across active dates</p>

          <div className="h-56 flex items-end gap-2 pt-6 pb-2 border-b border-brand-100">
            {data.salesByDate && data.salesByDate.length > 0 ? (
              data.salesByDate.slice(-14).map((item, idx) => {
                const max = Math.max(...data.salesByDate.map((d) => d.revenue), 1000);
                const heightPct = Math.max(10, Math.round((item.revenue / max) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="text-[9px] font-mono text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{item.revenue}
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-primary-600 hover:bg-royal-500 rounded-t transition-all relative"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-brand-950 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 font-mono">
                        {item.orders} orders (₹{item.revenue})
                      </div>
                    </div>
                    <span className="text-[9px] text-brand-500 font-mono truncate max-w-full">
                      {item.date.slice(5)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-brand-400">
                No transaction data in this window.
              </div>
            )}
          </div>
        </div>

        {/* Weave Category Share */}
        <div className="bg-white rounded-lg border border-brand-200 p-4 shadow-xs">
          <h2 className="text-xs font-bold text-brand-900 mb-1">Sales by Category</h2>
          <p className="text-[11px] text-brand-500 mb-3">Gross revenue distribution by saree style</p>

          <div className="space-y-3">
            {data.salesByCategory && data.salesByCategory.length > 0 ? (
              data.salesByCategory.map((cat, idx) => {
                const pct = Math.round((cat.revenue / totalCatRevenue) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-brand-900">{cat.category}</span>
                      <span className="font-mono text-brand-700">
                        ₹{cat.revenue.toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] text-brand-400">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-brand-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-royal-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-brand-400 font-mono text-right">
                      {cat.count} units sold
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-brand-400 py-6 text-center">No category records yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-lg border border-brand-200 shadow-xs overflow-hidden">
        <div className="p-3 border-b border-brand-200">
          <h2 className="text-xs font-bold text-brand-900">Highest Grossing Saree Products</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-50 border-b border-brand-200 text-brand-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">Units Sold</th>
                <th className="py-2.5 px-3 text-right">Gross Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {data.topProducts && data.topProducts.length > 0 ? (
                data.topProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-brand-950">{p.name}</td>
                    <td className="py-2.5 px-3 font-mono text-brand-600">{p.sku}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-brand-800">
                      {p.soldCount} units
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right text-emerald-700">
                      ₹{p.revenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-brand-400">
                    No top product orders in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
