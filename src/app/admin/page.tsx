'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Users,
  Sparkles,
  Package,
  ArrowRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  DollarSign,
  Plus,
} from 'lucide-react';
import { api } from '@/lib/api';
import { AnalyticsSummary, OrderData } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingState';

export default function AdminOverviewPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAnalytics('30d');
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to load analytics');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner message="Loading live store metrics..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
        <p className="font-semibold">Unable to load dashboard data</p>
        <p className="mt-1 text-rose-600">{error || 'Server error occurred'}</p>
        <Button size="sm" variant="outline" className="mt-3" onClick={loadDashboard}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-brand-200 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-brand-950">Store Executive Dashboard</h1>
          <p className="text-xs text-brand-500">
            Real-time performance, active inventory health, and recent customer activities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/products?action=new">
            <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Product
            </Button>
          </Link>
          <Link href="/admin/ai-assistant">
            <Button size="sm" variant="outline" leftIcon={<Sparkles className="w-3.5 h-3.5 text-royal-600" />}>
              Ask AI Copilot
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Revenue */}
        <div className="bg-white p-3 rounded-lg border border-brand-200 shadow-xs">
          <div className="flex items-center justify-between text-brand-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-brand-500">Revenue (30d)</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-brand-950 truncate">
            <PriceDisplay amount={data.totalRevenue} />
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Live gross sales</p>
        </div>

        {/* Today's Sales */}
        <div className="bg-white p-3 rounded-lg border border-brand-200 shadow-xs">
          <div className="flex items-center justify-between text-brand-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-brand-500">Today Sales</span>
            <TrendingUp className="w-3.5 h-3.5 text-primary-600" />
          </div>
          <div className="text-sm font-bold text-brand-950 truncate">
            <PriceDisplay amount={data.todayRevenue} />
          </div>
          <p className="text-[10px] text-brand-400 mt-0.5">Current calendar day</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-3 rounded-lg border border-brand-200 shadow-xs">
          <div className="flex items-center justify-between text-brand-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-brand-500">Total Orders</span>
            <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
          </div>
          <div className="text-base font-bold text-brand-950">{data.totalOrders}</div>
          <p className="text-[10px] text-brand-400 mt-0.5">{data.completedOrders} delivered</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-3 rounded-lg border border-brand-200 shadow-xs">
          <div className="flex items-center justify-between text-brand-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-brand-500">Pending Actions</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-base font-bold text-amber-700">{data.pendingOrders}</div>
          <p className="text-[10px] text-amber-600 mt-0.5">Requires packing / dispatch</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-3 rounded-lg border border-brand-200 shadow-xs">
          <div className="flex items-center justify-between text-brand-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-brand-500">Stock Alerts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-base font-bold text-rose-700">{data.lowStockCount}</div>
          <Link href="/admin/inventory" className="text-[10px] text-rose-600 hover:underline mt-0.5 block">
            Inspect inventory &rarr;
          </Link>
        </div>

        {/* Registered Customers */}
        <div className="bg-white p-3 rounded-lg border border-brand-200 shadow-xs">
          <div className="flex items-center justify-between text-brand-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-brand-500">Customers</span>
            <Users className="w-3.5 h-3.5 text-brand-600" />
          </div>
          <div className="text-base font-bold text-brand-950">{data.totalCustomers}</div>
          <p className="text-[10px] text-brand-400 mt-0.5">AOV: ₹{Math.round(data.averageOrderValue)}</p>
        </div>
      </div>

      {/* Main Grid: Revenue Trend & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Trend Chart (Compact SVG Sparkline/Bar) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-brand-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs font-bold text-brand-900">Revenue & Order Trend (Last 7 Days)</h2>
              <p className="text-[11px] text-brand-500">Daily gross turnover from confirmed checkouts</p>
            </div>
            <span className="text-[10px] font-medium bg-brand-100 text-brand-700 px-2 py-0.5 rounded">
              30-Day Window
            </span>
          </div>

          {/* Simple Minimal SVG Bar Representation */}
          <div className="h-44 flex items-end gap-2 pt-6 pb-2 border-b border-brand-100">
            {data.salesByDate && data.salesByDate.length > 0 ? (
              data.salesByDate.slice(-7).map((item, idx) => {
                const maxRev = Math.max(...data.salesByDate.map((d) => d.revenue), 1000);
                const heightPct = Math.max(12, Math.round((item.revenue / maxRev) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="text-[9px] font-mono text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ₹{item.revenue}
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-primary-600 hover:bg-primary-700 rounded-t transition-all group-hover:shadow-xs relative"
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-brand-950 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                        {item.orders} orders
                      </div>
                    </div>
                    <span className="text-[10px] text-brand-500 font-mono">
                      {item.date.slice(5)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-brand-400">
                No transaction records in this window yet.
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-brand-400 mt-2">
            <span>Aggregated across Razorpay & Cash on Delivery</span>
            <span className="font-semibold text-brand-700">AOV: ₹{Math.round(data.averageOrderValue)}</span>
          </div>
        </div>

        {/* Category Share & Quick Status Distribution */}
        <div className="bg-white rounded-lg border border-brand-200 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-brand-900 mb-1">Sales by Saree Category</h2>
            <p className="text-[11px] text-brand-500 mb-3">Volume distribution across active weaves</p>

            <div className="space-y-2.5">
              {data.salesByCategory && data.salesByCategory.length > 0 ? (
                data.salesByCategory.slice(0, 5).map((cat, idx) => {
                  const totalCategoryRev = data.salesByCategory.reduce((a, b) => a + b.revenue, 0) || 1;
                  const pct = Math.round((cat.revenue / totalCategoryRev) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-brand-800">{cat.category}</span>
                        <span className="font-mono text-brand-600">
                          ₹{cat.revenue.toLocaleString('en-IN')} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-brand-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-royal-500 h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-brand-400 py-4 text-center">No category sales recorded yet</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-brand-100 flex items-center justify-between text-xs">
            <Link
              href="/admin/analytics"
              className="text-primary-600 hover:text-primary-800 font-medium inline-flex items-center gap-1"
            >
              <span>Full Analytics Report</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Grid: Recent Orders & Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-brand-200 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-brand-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary-600" />
              <h2 className="text-xs font-bold text-brand-900">Recent Customer Orders</h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-50 border-b border-brand-200 text-brand-600 font-semibold">
                <tr>
                  <th className="py-2 px-3">Order #</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Amount</th>
                  <th className="py-2 px-3">Payment</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {data.recentOrders && data.recentOrders.length > 0 ? (
                  data.recentOrders.slice(0, 6).map((order) => (
                    <tr key={order.id} className="hover:bg-brand-50/50 transition-colors">
                      <td className="py-2 px-3 font-mono font-medium text-brand-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-medium text-brand-800">{order.customerName}</div>
                        <div className="text-[10px] text-brand-400">{order.city}, {order.state}</div>
                      </td>
                      <td className="py-2 px-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-2 px-3 font-mono font-medium text-brand-900">
                        <PriceDisplay amount={order.total} />
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Link
                          href={`/admin/orders?search=${order.orderNumber}`}
                          className="text-primary-600 hover:text-primary-800 font-medium inline-flex items-center gap-0.5 text-[11px]"
                        >
                          <span>Manage</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-brand-400">
                      No customer orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products / Alerts Box */}
        <div className="bg-white rounded-lg border border-brand-200 shadow-xs p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-brand-100">
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-royal-600" />
                <h3 className="text-xs font-bold text-brand-900">Top Moving Saree Items</h3>
              </div>
              <Link href="/admin/products" className="text-[10px] text-brand-500 hover:underline">
                Catalog &rarr;
              </Link>
            </div>

            <div className="space-y-2">
              {data.topProducts && data.topProducts.length > 0 ? (
                data.topProducts.slice(0, 5).map((prod) => (
                  <div
                    key={prod.id}
                    className="p-2 rounded border border-brand-100 bg-brand-50/50 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-medium text-brand-900 truncate">{prod.name}</p>
                      <p className="text-[10px] font-mono text-brand-500">SKU: {prod.sku}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-brand-950">{prod.soldCount} sold</span>
                      <p className="text-[10px] text-emerald-700 font-mono">
                        ₹{prod.revenue.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-brand-400 text-center py-4">No top product sales recorded yet.</p>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-brand-100">
            <Link
              href="/admin/inventory"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded border border-amber-200 text-xs font-medium transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Review Low Stock Alerts ({data.lowStockCount})</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
