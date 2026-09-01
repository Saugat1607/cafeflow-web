import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Plus,
    RefreshCw,
    Search,
    Package,
    AlertCircle,
    X,
} from "lucide-react";

import {
    getInventory,
    getInventoryStatistics,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
} from "../api/inventoryApi";

import {
    stockIn,
    stockOut,
    adjustStock,
} from "../api/inventoryTransactionApi";

import InventoryStats from "../components/InventoryStats";
import InventoryTable from "../components/InventoryTable";
import InventoryForm from "../components/InventoryForm";
import StockInModal from "../components/StockInModal";
import StockOutModal from "../components/StockOutModal";
import StockAdjustmentModal from "../components/StockAdjustmentModal";

export default function Inventory() {
    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    const [items, setItems] = useState([]);
    const [statistics, setStatistics] = useState({});

    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("");

    const [showInactive, setShowInactive] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [stockInOpen, setStockInOpen] = useState(false);
    const [stockOutOpen, setStockOutOpen] = useState(false);
    const [adjustmentOpen, setAdjustmentOpen] =
        useState(false);

    const [transactionItem, setTransactionItem] =
        useState(null);

    /*
    |--------------------------------------------------------------------------
    | Load Inventory
    |--------------------------------------------------------------------------
    */

    const loadInventory = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getInventory({
                search: search || undefined,
                category: category || undefined,
                status: status || undefined,
                is_active: showInactive
                    ? undefined
                    : true,
            });

            /*
             * Laravel pagination may return:
             *
             * {
             *     data: [...]
             * }
             *
             * or directly:
             *
             * [...]
             */

            const inventoryData = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response?.data?.data)
                ? response.data.data
                : [];

            setItems(inventoryData);
        } catch (err) {
            console.error("Failed to load inventory:", err);

            setError(
                err?.response?.data?.message ||
                    "Unable to load inventory items."
            );

            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [search, category, status, showInactive]);

    /*
    |--------------------------------------------------------------------------
    | Load Statistics
    |--------------------------------------------------------------------------
    */

    const loadStatistics = useCallback(async () => {
        try {
            setStatsLoading(true);

            const response =
                await getInventoryStatistics();

            const stats =
                response?.data &&
                typeof response.data === "object" &&
                !Array.isArray(response.data)
                    ? response.data
                    : response;

            setStatistics(stats || {});
        } catch (err) {
            console.error(
                "Failed to load inventory statistics:",
                err
            );

            setStatistics({});
        } finally {
            setStatsLoading(false);
        }
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Load Everything
    |--------------------------------------------------------------------------
    */

    const loadAll = useCallback(async () => {
        await Promise.all([
            loadInventory(),
            loadStatistics(),
        ]);
    }, [loadInventory, loadStatistics]);

    useEffect(() => {
        loadInventory();
    }, [loadInventory]);

    useEffect(() => {
        loadStatistics();
    }, [loadStatistics]);

    /*
    |--------------------------------------------------------------------------
    | Categories
    |--------------------------------------------------------------------------
    */

    const categories = useMemo(() => {
        const values = items
            .map((item) => item.category)
            .filter(Boolean);

        return [...new Set(values)].sort();
    }, [items]);

    /*
    |--------------------------------------------------------------------------
    | Add Item
    |--------------------------------------------------------------------------
    */

    const handleAdd = () => {
        setSelectedItem(null);
        setFormOpen(true);
        setError("");
    };

    /*
    |--------------------------------------------------------------------------
    | Edit Item
    |--------------------------------------------------------------------------
    */

    const handleEdit = (item) => {
        setSelectedItem(item);
        setFormOpen(true);
        setError("");
    };

    /*
    |--------------------------------------------------------------------------
    | Create / Update
    |--------------------------------------------------------------------------
    */

    const handleFormSubmit = async (formData) => {
        try {
            setActionLoading(true);
            setError("");

            if (selectedItem) {
                await updateInventoryItem(
                    selectedItem.id,
                    formData
                );
            } else {
                await createInventoryItem(formData);
            }

            setFormOpen(false);
            setSelectedItem(null);

            await Promise.all([
                loadInventory(),
                loadStatistics(),
            ]);
        } catch (err) {
            console.error(
                "Failed to save inventory item:",
                err
            );

            throw err;
        } finally {
            setActionLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Delete / Deactivate
    |--------------------------------------------------------------------------
    */

    const handleDelete = async (item) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate "${item.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");

            await deleteInventoryItem(item.id);

            await Promise.all([
                loadInventory(),
                loadStatistics(),
            ]);
        } catch (err) {
            console.error(
                "Failed to deactivate inventory item:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Unable to deactivate inventory item."
            );
        } finally {
            setActionLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Stock In
    |--------------------------------------------------------------------------
    */

    const handleStockIn = (item) => {
        setTransactionItem(item);
        setStockInOpen(true);
        setError("");
    };

    const handleStockInSubmit = async (data) => {
        try {
            setActionLoading(true);
            setError("");

            await stockIn(data);

            setStockInOpen(false);
            setTransactionItem(null);

            await Promise.all([
                loadInventory(),
                loadStatistics(),
            ]);
        } catch (err) {
            console.error(
                "Failed to add stock:",
                err
            );

            throw err;
        } finally {
            setActionLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Stock Out
    |--------------------------------------------------------------------------
    */

    const handleStockOut = (item) => {
        setTransactionItem(item);
        setStockOutOpen(true);
        setError("");
    };

    const handleStockOutSubmit = async (data) => {
        try {
            setActionLoading(true);
            setError("");

            await stockOut(data);

            setStockOutOpen(false);
            setTransactionItem(null);

            await Promise.all([
                loadInventory(),
                loadStatistics(),
            ]);
        } catch (err) {
            console.error(
                "Failed to remove stock:",
                err
            );

            throw err;
        } finally {
            setActionLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Stock Adjustment
    |--------------------------------------------------------------------------
    */

    const handleAdjustment = (item) => {
        setTransactionItem(item);
        setAdjustmentOpen(true);
        setError("");
    };

    const handleAdjustmentSubmit = async (data) => {
        try {
            setActionLoading(true);
            setError("");

            await adjustStock(data);

            setAdjustmentOpen(false);
            setTransactionItem(null);

            await Promise.all([
                loadInventory(),
                loadStatistics(),
            ]);
        } catch (err) {
            console.error(
                "Failed to adjust stock:",
                err
            );

            throw err;
        } finally {
            setActionLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Refresh
    |--------------------------------------------------------------------------
    */

    const handleRefresh = async () => {
        setError("");

        await loadAll();
    };

    /*
    |--------------------------------------------------------------------------
    | Clear Filters
    |--------------------------------------------------------------------------
    */

    const clearFilters = () => {
        setSearch("");
        setCategory("");
        setStatus("");
        setShowInactive(false);
    };

    const hasFilters =
        search ||
        category ||
        status ||
        showInactive;

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1600px]">
                {/* Page Header */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900">
                                <Package
                                    size={22}
                                    className="text-white"
                                />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    Inventory
                                </h1>

                                <p className="mt-0.5 text-sm text-slate-500">
                                    Manage your cafe stock,
                                    supplies and inventory.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={
                                loading ||
                                statsLoading
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                size={17}
                                className={
                                    loading ||
                                    statsLoading
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            <span className="hidden sm:inline">
                                Refresh
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleAdd}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                        >
                            <Plus size={18} />

                            Add Item
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle
                            size={19}
                            className="mt-0.5 shrink-0"
                        />

                        <div className="flex-1">
                            <p className="font-semibold">
                                Something went wrong
                            </p>

                            <p className="mt-0.5">
                                {error}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="text-red-400 hover:text-red-600"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                {/* Statistics */}
                <div className="mb-6">
                    <InventoryStats
                        statistics={statistics}
                        loading={statsLoading}
                    />
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search inventory items..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                            />
                        </div>

                        {/* Category */}
                        <select
                            value={category}
                            onChange={(event) =>
                                setCategory(
                                    event.target.value
                                )
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        >
                            <option value="">
                                All Categories
                            </option>

                            {categories.map((value) => (
                                <option
                                    key={value}
                                    value={value}
                                >
                                    {value}
                                </option>
                            ))}
                        </select>

                        {/* Status */}
                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value
                                )
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        >
                            <option value="">
                                All Stock Status
                            </option>

                            <option value="in_stock">
                                In Stock
                            </option>

                            <option value="low_stock">
                                Low Stock
                            </option>

                            <option value="out_of_stock">
                                Out of Stock
                            </option>
                        </select>

                        {/* Inactive */}
                        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5">
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(event) =>
                                    setShowInactive(
                                        event.target.checked
                                    )
                                }
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />

                            <span className="whitespace-nowrap text-sm text-slate-600">
                                Include inactive
                            </span>
                        </label>

                        {/* Clear */}
                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                                <X size={16} />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Inventory Table */}
                <InventoryTable
                    items={items}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStockIn={handleStockIn}
                    onStockOut={handleStockOut}
                    onAdjust={handleAdjustment}
                />

                {/* Add / Edit Form */}
                <InventoryForm
                    isOpen={formOpen}
                    onClose={() => {
                        if (!actionLoading) {
                            setFormOpen(false);
                            setSelectedItem(null);
                        }
                    }}
                    onSubmit={handleFormSubmit}
                    item={selectedItem}
                    loading={actionLoading}
                />

                {/* Stock In */}
                <StockInModal
                    isOpen={stockInOpen}
                    onClose={() => {
                        if (!actionLoading) {
                            setStockInOpen(false);
                            setTransactionItem(null);
                        }
                    }}
                    onSubmit={handleStockInSubmit}
                    item={transactionItem}
                    loading={actionLoading}
                />

                {/* Stock Out */}
                <StockOutModal
                    isOpen={stockOutOpen}
                    onClose={() => {
                        if (!actionLoading) {
                            setStockOutOpen(false);
                            setTransactionItem(null);
                        }
                    }}
                    onSubmit={handleStockOutSubmit}
                    item={transactionItem}
                    loading={actionLoading}
                />

                {/* Adjustment */}
                <StockAdjustmentModal
                    isOpen={adjustmentOpen}
                    onClose={() => {
                        if (!actionLoading) {
                            setAdjustmentOpen(false);
                            setTransactionItem(null);
                        }
                    }}
                    onSubmit={handleAdjustmentSubmit}
                    item={transactionItem}
                    loading={actionLoading}
                />
            </div>
        </div>
    );
}