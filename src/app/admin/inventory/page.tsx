'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Warehouse,
  AlertTriangle,
  ArrowUpDown,
  History,
  CheckCircle2,
  Search,
  Filter,
  Package,
  Plus,
  Minus,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { Pagination } from '@/components/ui/Pagination';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');

  // API Search, Filter & Pagination State
  const [search, setSearch] = useState('');
  const [filterAlertOnly, setFilterAlertOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    healthyStockCount: 0,
  });

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>('RESTOCK');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInventory = useCallback(
    async (params: {
      searchQuery?: string;
      lowStockOnly?: boolean;
      page?: number;
      limit?: number;
    }) => {
      setLoading(true);
      try {
        const queryParams: Record<string, any> = {
          page: params.page ?? currentPage,
          limit: params.limit ?? pageSize,
        };

        const activeSearch = params.searchQuery !== undefined ? params.searchQuery : search;
        if (activeSearch.trim()) {
          queryParams.search = activeSearch.trim();
        }

        const activeLowStock =
          params.lowStockOnly !== undefined ? params.lowStockOnly : filterAlertOnly;
        if (activeLowStock) {
          queryParams.lowStockOnly = 'true';
        }

        const [invRes, histRes] = await Promise.all([
          api.getInventory(queryParams),
          api.getInventoryHistory(),
        ]);

        if (invRes.success && invRes.data) {
          const fetchedItems = invRes.data.items || (Array.isArray(invRes.data) ? invRes.data : []);
          setItems(fetchedItems);

          if (invRes.data.pagination) {
            setTotalItems(invRes.data.pagination.total);
            setTotalPages(invRes.data.pagination.totalPages || 1);
            setCurrentPage(invRes.data.pagination.page);
          } else {
            setTotalItems(fetchedItems.length);
            setTotalPages(Math.ceil(fetchedItems.length / pageSize) || 1);
          }

          if (invRes.data.summary) {
            setSummary(invRes.data.summary);
          }
        }

        if (histRes.success && histRes.data) {
          setHistoryLogs(histRes.data);
        }
      } catch (err) {
        console.error('Failed to load inventory data:', err);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, search, filterAlertOnly]
  );

  useEffect(() => {
    fetchInventory({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    setCurrentPage(1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchInventory({ searchQuery: val, page: 1 });
    }, 350);
  };

  const handleToggleAlertOnly = () => {
    const newVal = !filterAlertOnly;
    setFilterAlertOnly(newVal);
    setCurrentPage(1);
    fetchInventory({ lowStockOnly: newVal, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchInventory({ page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    setPageSize(newLimit);
    setCurrentPage(1);
    fetchInventory({ page: 1, limit: newLimit });
  };

  const handleOpenAdjust = (prod: any) => {
    setSelectedProduct(prod);
    setChangeAmount(5);
    setReason('RESTOCK');
    setNotes('');
    setAdjustError(null);
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || changeAmount === 0) return;

    setSubmitting(true);
    setAdjustError(null);

    try {
      const res = await api.adjustInventory({
        productId: selectedProduct.productId || selectedProduct.id,
        adjustment: changeAmount,
        reason,
        notes: notes || undefined,
      });

      if (res.success) {
        setIsAdjustModalOpen(false);
        await fetchInventory({});
      } else {
        setAdjustError(res.message || 'Failed to adjust stock level');
      }
    } catch (err: any) {
      setAdjustError(err.message || 'Error occurred while adjusting inventory');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Clean Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
              Inventory Health &amp; Stock Ledger
            </h1>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
              {totalItems} items
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time warehouse stock balance, automated low-quantity notifications, and immutable audit logs.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Live Stock Table
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Ledger ({historyLogs.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-xs">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                Total SKUs
              </span>
              <span className="text-lg font-bold font-mono text-stone-900 mt-0.5 block">
                {summary.totalProducts}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-xs">
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">
                Healthy Stock
              </span>
              <span className="text-lg font-bold font-mono text-emerald-700 mt-0.5 block">
                {summary.healthyStockCount}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-xs">
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block">
                Low Stock Alert
              </span>
              <span className="text-lg font-bold font-mono text-amber-700 mt-0.5 block">
                {summary.lowStockCount}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-xs">
              <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider block">
                Out of Stock
              </span>
              <span className="text-lg font-bold font-mono text-rose-700 mt-0.5 block">
                {summary.outOfStockCount}
              </span>
            </div>
          </div>

          {/* Unified Table Container with Integrated Toolbar in Same Div */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden flex flex-col">
            {/* Integrated Filter and Search Toolbar */}
            <div className="p-3 bg-stone-50/70 border-b border-stone-200 flex flex-wrap items-center gap-2.5">
              <div className="flex-1 min-w-[220px] relative">
                <input
                  type="text"
                  placeholder="Search inventory by saree name, SKU, or craft..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 font-medium transition-all"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                {loading && (
                  <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin absolute right-3 top-2" />
                )}
              </div>

              <button
                onClick={handleToggleAlertOnly}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  filterAlertOnly
                    ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <AlertTriangle
                  className={`w-3.5 h-3.5 ${filterAlertOnly ? 'text-rose-600' : 'text-amber-500'}`}
                />
                <span>Low Stock Filter ({summary.lowStockCount})</span>
              </button>
            </div>

            {/* Viewport-Fitted Responsive Table Body */}
            {loading && items.length === 0 ? (
              <div className="flex h-72 items-center justify-center">
                <LoadingSpinner message="Calculating stock balance from PostgreSQL..." />
              </div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center">
                <Warehouse className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-stone-700">No inventory entries found</p>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  No stock records matched your search query or low stock filter.
                </p>
              </div>
            ) : (
              <div className="overflow-auto max-h-[calc(100vh-270px)] min-h-[360px]">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 z-10 bg-stone-100/95 backdrop-blur-xs border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Saree Name</th>
                      <th className="py-2.5 px-4">SKU Code</th>
                      <th className="py-2.5 px-4">Craft / Category</th>
                      <th className="py-2.5 px-4">Available Units</th>
                      <th className="py-2.5 px-4">Threshold</th>
                      <th className="py-2.5 px-4">Health Status</th>
                      <th className="py-2.5 px-4 text-right">Adjustment Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {items.map((item) => {
                      const currentStock = item.currentStock ?? item.stock ?? 0;
                      const threshold = item.lowStockThreshold || 5;
                      const isLow = currentStock <= threshold && currentStock > 0;
                      const isOut = currentStock === 0;

                      return (
                        <tr key={item.productId || item.id} className="hover:bg-purple-50/20 transition-colors">
                          <td className="py-2.5 px-4">
                            <span className="font-semibold text-stone-900 block truncate max-w-[260px]">
                              {item.name}
                            </span>
                          </td>

                          <td className="py-2.5 px-4 font-mono text-[11px] text-stone-600 font-medium">
                            {item.sku}
                          </td>

                          <td className="py-2.5 px-4 text-stone-600 font-medium">
                            {item.category || 'Atelier'}
                          </td>

                          <td className="py-2.5 px-4">
                            <span className="font-mono font-bold text-xs text-stone-900">
                              {currentStock} units
                            </span>
                          </td>

                          <td className="py-2.5 px-4 font-mono text-[11px] text-stone-500">
                            {threshold} min
                          </td>

                          <td className="py-2.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isOut
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : isLow
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {isOut ? 'Depleted' : isLow ? 'Low Stock' : 'Optimal'}
                            </span>
                          </td>

                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={() => handleOpenAdjust(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all"
                            >
                              <ArrowUpDown className="w-3.5 h-3.5 text-purple-700" />
                              <span>Adjust Stock</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Connected API Pagination inside the same card */}
            <div className="border-t border-stone-200 bg-stone-50/40">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                limit={pageSize}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                itemLabel="inventory items"
              />
            </div>
          </div>
        </>
      ) : (
        /* History / Audit Log Tab */
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden flex flex-col">
          <div className="p-3 bg-stone-50/70 border-b border-stone-200 flex items-center justify-between">
            <h3 className="font-serif font-bold text-stone-900 text-sm">
              Immutable Stock Movement Ledger
            </h3>
            <span className="text-xs text-stone-500 font-mono">
              Recorded adjustments &amp; order deductions
            </span>
          </div>

          {historyLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500">
              No inventory transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-auto max-h-[calc(100vh-270px)] min-h-[360px]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 bg-stone-100/95 backdrop-blur-xs border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Saree Name / SKU</th>
                    <th className="py-2.5 px-4">Change</th>
                    <th className="py-2.5 px-4">Balance After</th>
                    <th className="py-2.5 px-4">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {historyLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-purple-50/20">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-stone-500">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-stone-900 block">
                          {log.product?.name || 'Saree item'}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {log.product?.sku}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`font-mono font-bold text-xs ${
                            log.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange} units
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-stone-800 text-xs">
                        {log.newQuantity}
                      </td>
                      <td className="py-2.5 px-4 text-stone-600">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Adjust Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Adjust Stock: ${selectedProduct?.name}`}
        size="md"
      >
        <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
          {adjustError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{adjustError}</span>
            </div>
          )}

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">
                Current Level
              </span>
              <span className="text-xl font-bold font-mono text-stone-900">
                {selectedProduct?.currentStock ?? selectedProduct?.stock ?? 0} units
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">
                Resulting Level
              </span>
              <span className="text-xl font-bold font-mono text-purple-700">
                {(selectedProduct?.currentStock ?? selectedProduct?.stock ?? 0) + changeAmount} units
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Quantity Adjustment (Positive to add, Negative to deduct)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setChangeAmount((prev) => prev - 1)}
                className="p-2.5 rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={changeAmount}
                onChange={(e) => setChangeAmount(Number(e.target.value))}
                className="w-full text-center py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
              />
              <button
                type="button"
                onClick={() => setChangeAmount((prev) => prev + 1)}
                className="p-2.5 rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Adjustment Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
            >
              <option value="RESTOCK">New Artisan Weave Batch Arrival (Restock)</option>
              <option value="CORRECTION">Manual Inventory Audit Reconciliation</option>
              <option value="DAMAGE">Damaged / Flawed Fabric Disposal</option>
              <option value="RETURN">Customer Return Restock</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Audit Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received shipment from Varanasi master weaver..."
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || changeAmount === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 text-purple-300" />
              <span>{submitting ? 'Applying Ledger Update...' : 'Commit Stock Change'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
