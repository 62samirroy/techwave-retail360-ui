'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingState';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');
  const [search, setSearch] = useState('');
  const [filterAlertOnly, setFilterAlertOnly] = useState(false);

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>('RESTOCK');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [invRes, histRes] = await Promise.all([
        api.getInventory(),
        api.getInventoryHistory(),
      ]);

      if (invRes.success && invRes.data) {
        setItems(invRes.data);
      }
      if (histRes.success && histRes.data) {
        setHistoryLogs(histRes.data);
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
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
        productId: selectedProduct.id,
        change: changeAmount,
        reason,
        notes: notes || undefined,
      });

      if (res.success) {
        setIsAdjustModalOpen(false);
        await loadInventory();
      } else {
        setAdjustError(res.message || 'Failed to adjust stock');
      }
    } catch (err: any) {
      setAdjustError(err.message || 'Error occurred while adjusting inventory');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const isLow = (item.inventory?.currentStock ?? item.stock ?? 0) <= (item.lowStockThreshold || 5);
    const matchesAlert = filterAlertOnly ? isLow : true;
    return matchesSearch && matchesAlert;
  });

  const lowStockCount = items.filter(
    (item) => (item.inventory?.currentStock ?? item.stock ?? 0) <= (item.lowStockThreshold || 5)
  ).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-brand-200 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-brand-950 flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-primary-600" />
            <span>Inventory Health & Stock Ledger</span>
          </h1>
          <p className="text-xs text-brand-500">
            Real-time multi-channel stock levels, low-quantity alerts, and auditable ledger logs.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-brand-100 p-1 rounded-md text-xs font-medium">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'inventory' ? 'bg-white text-brand-950 shadow-xs font-semibold' : 'text-brand-600 hover:text-brand-900'
            }`}
          >
            Live Stock Table
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${
              activeTab === 'history' ? 'bg-white text-brand-950 shadow-xs font-semibold' : 'text-brand-600 hover:text-brand-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Ledger</span>
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-lg border border-brand-200 shadow-xs flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search inventory by title or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-3.5 h-3.5 text-brand-400" />}
              />
            </div>
            <button
              onClick={() => setFilterAlertOnly(!filterAlertOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                filterAlertOnly
                  ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                  : 'bg-white border-brand-300 text-brand-700 hover:bg-brand-50'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${filterAlertOnly ? 'text-rose-600' : 'text-amber-500'}`} />
              <span>Low Stock Only ({lowStockCount})</span>
            </button>
            <span className="text-xs font-mono text-brand-500 ml-auto">
              {filteredItems.length} saree listings
            </span>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex h-64 items-center justify-center bg-white rounded-lg border border-brand-200">
              <LoadingSpinner message="Calculating stock balance..." />
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-brand-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-50 border-b border-brand-200 text-brand-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Available Stock</th>
                      <th className="py-2.5 px-3">Reserved</th>
                      <th className="py-2.5 px-3">Threshold</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Adjustment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-100">
                    {filteredItems.map((item) => {
                      const currentStock = item.inventory?.currentStock ?? item.stock ?? 0;
                      const reserved = item.inventory?.reservedStock ?? 0;
                      const threshold = item.lowStockThreshold || 5;
                      const isLow = currentStock <= threshold;
                      const isOut = currentStock === 0;

                      return (
                        <tr key={item.id} className="hover:bg-brand-50/50 transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-brand-950 block truncate max-w-[240px]">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-brand-400">{item.category?.name}</span>
                          </td>

                          <td className="py-2.5 px-3 font-mono text-[11px] text-brand-700">
                            {item.sku}
                          </td>

                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-block font-mono font-bold text-sm ${
                                isOut
                                  ? 'text-rose-600'
                                  : isLow
                                  ? 'text-amber-600'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {currentStock} units
                            </span>
                          </td>

                          <td className="py-2.5 px-3 font-mono text-brand-500">
                            {reserved}
                          </td>

                          <td className="py-2.5 px-3 font-mono text-brand-500">
                            &le; {threshold}
                          </td>

                          <td className="py-2.5 px-3">
                            {isOut ? (
                              <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                                Low Warning
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                                Healthy
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenAdjust(item)}
                              leftIcon={<ArrowUpDown className="w-3 h-3 text-primary-600" />}
                            >
                              Adjust
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Inventory Audit Ledger View */
        <div className="bg-white rounded-lg border border-brand-200 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-brand-200 flex items-center justify-between">
            <h2 className="text-xs font-bold text-brand-900">Historical Inventory Audit Logs</h2>
            <span className="text-[11px] text-brand-500 font-mono">
              {historyLogs.length} audit entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-50 border-b border-brand-200 text-brand-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Change</th>
                  <th className="py-2.5 px-3">Before &rarr; After</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {historyLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-brand-400">
                      No stock adjustments have been recorded yet.
                    </td>
                  </tr>
                ) : (
                  historyLogs.map((log) => {
                    const isPositive = log.changeAmount > 0;
                    return (
                      <tr key={log.id} className="hover:bg-brand-50/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-brand-500">
                          {new Date(log.createdAt).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-brand-950">
                          {log.product?.name || 'Unknown item'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold">
                          <span
                            className={
                              isPositive
                                ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded'
                                : 'text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded'
                            }
                          >
                            {isPositive ? `+${log.changeAmount}` : log.changeAmount}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-brand-600">
                          {log.previousStock} &rarr; {log.newStock}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-brand-800 uppercase text-[10px]">
                            {log.reason}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-brand-500 italic max-w-[200px] truncate">
                          {log.notes || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Adjust Stock: ${selectedProduct?.name}`}
        size="md"
      >
        <form onSubmit={handleSaveAdjustment} className="space-y-4">
          {adjustError && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {adjustError}
            </div>
          )}

          <div className="bg-brand-50 p-3 rounded border border-brand-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-brand-500">Current Stock:</span>
              <span className="font-mono font-bold text-brand-950 ml-1.5">
                {selectedProduct?.inventory?.currentStock ?? selectedProduct?.stock ?? 0} units
              </span>
            </div>
            <div>
              <span className="text-brand-500">SKU:</span>
              <span className="font-mono font-medium text-brand-700 ml-1.5">
                {selectedProduct?.sku}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-brand-700">
              Stock Quantity Adjustment (+ or -)
            </label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setChangeAmount((prev) => prev - 1)}
              >
                <Minus className="w-3.5 h-3.5" />
              </Button>
              <input
                type="number"
                className="w-24 text-center font-mono font-bold text-base rounded border border-brand-300 py-1"
                value={changeAmount}
                onChange={(e) => setChangeAmount(parseInt(e.target.value, 10) || 0)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setChangeAmount((prev) => prev + 1)}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs text-brand-500 ml-2">
                New Result:{' '}
                <strong className="text-brand-950">
                  {Math.max(
                    0,
                    (selectedProduct?.inventory?.currentStock ?? selectedProduct?.stock ?? 0) +
                      changeAmount
                  )}
                </strong>{' '}
                units
              </span>
            </div>
          </div>

          <div>
            <Select
              label="Adjustment Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              options={[
                { label: 'Supplier Restock (New Batch)', value: 'RESTOCK' },
                { label: 'Physical Audit Discrepancy Correction', value: 'PHYSICAL_COUNT' },
                { label: 'Damaged / Weave Defect Write-off', value: 'DAMAGED' },
                { label: 'Customer Order Return to Shelf', value: 'RETURN' },
                { label: 'Sample / Exhibition Loan', value: 'OTHER' },
              ]}
            />
          </div>

          <div>
            <Input
              label="Audit Note / Batch Reference (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received shipment lot #VNS-884"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Apply Stock Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
