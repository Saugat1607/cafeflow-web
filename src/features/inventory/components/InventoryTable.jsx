import {
    Edit3,
    Trash2,
    Plus,
    Minus,
    SlidersHorizontal,
    Package,
} from "lucide-react";

export default function InventoryTable({
    items = [],
    loading = false,
    onEdit,
    onDelete,
    onStockIn,
    onStockOut,
    onAdjust,
}) {
    const formatNumber = (value) => {
        return new Intl.NumberFormat("en-US", {
            maximumFractionDigits: 3,
        }).format(Number(value || 0));
    };

    const formatCurrency = (value) => {
        return `Rs. ${new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(Number(value || 0))}`;
    };

    const getStockStatus = (item) => {
        const stock = Number(item.current_stock || 0);
        const minimum = Number(item.minimum_stock || 0);

        if (stock <= 0) {
            return {
                label: "Out of Stock",
                className:
                    "bg-red-50 text-red-700 border-red-200",
            };
        }

        if (stock <= minimum) {
            return {
                label: "Low Stock",
                className:
                    "bg-amber-50 text-amber-700 border-amber-200",
            };
        }

        return {
            label: "In Stock",
            className:
                "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
    };

    const getStockValue = (item) => {
        if (item.stock_value !== undefined) {
            return Number(item.stock_value || 0);
        }

        return (
            Number(item.current_stock || 0) *
            Number(item.cost_per_unit || 0)
        );
    };

    if (loading) {
        return (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                {[
                                    "Item",
                                    "Category",
                                    "Stock",
                                    "Min. Stock",
                                    "Cost / Unit",
                                    "Stock Value",
                                    "Status",
                                    "Actions",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {Array.from({ length: 6 }).map(
                                (_, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-slate-100"
                                    >
                                        {Array.from({
                                            length: 8,
                                        }).map((_, cell) => (
                                            <td
                                                key={cell}
                                                className="px-5 py-5"
                                            >
                                                <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
                                            </td>
                                        ))}
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <Package
                        size={26}
                        className="text-slate-500"
                    />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900">
                    No inventory items found
                </h3>

                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                    Your inventory items will appear here once
                    you add them.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                    <h2 className="text-base font-semibold text-slate-900">
                        Inventory Items
                    </h2>

                    <p className="mt-0.5 text-sm text-slate-500">
                        Manage your cafe stock and inventory.
                    </p>
                </div>

                <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
                    <SlidersHorizontal size={16} />
                    {items.length} item
                    {items.length !== 1 ? "s" : ""}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Item
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Category
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Stock
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Min. Stock
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Cost / Unit
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Stock Value
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Status
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {items.map((item) => {
                            const status =
                                getStockStatus(item);

                            return (
                                <tr
                                    key={item.id}
                                    className="transition-colors hover:bg-slate-50"
                                >
                                    {/* Item */}
                                    <td className="px-5 py-4">
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                {item.name}
                                            </p>

                                            {item.supplier && (
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    {item.supplier}
                                                </p>
                                            )}
                                        </div>
                                    </td>

                                    {/* Category */}
                                    <td className="px-5 py-4">
                                        <span className="text-sm text-slate-600">
                                            {item.category ||
                                                "Other"}
                                        </span>
                                    </td>

                                    {/* Current stock */}
                                    <td className="px-5 py-4">
                                        <span className="font-semibold text-slate-900">
                                            {formatNumber(
                                                item.current_stock
                                            )}
                                        </span>

                                        <span className="ml-1 text-xs text-slate-500">
                                            {item.unit ||
                                                "pcs"}
                                        </span>
                                    </td>

                                    {/* Minimum stock */}
                                    <td className="px-5 py-4">
                                        <span className="text-sm text-slate-600">
                                            {formatNumber(
                                                item.minimum_stock
                                            )}{" "}
                                            {item.unit ||
                                                "pcs"}
                                        </span>
                                    </td>

                                    {/* Cost */}
                                    <td className="px-5 py-4">
                                        <span className="text-sm font-medium text-slate-700">
                                            {formatCurrency(
                                                item.cost_per_unit
                                            )}
                                        </span>
                                    </td>

                                    {/* Stock value */}
                                    <td className="px-5 py-4">
                                        <span className="text-sm font-semibold text-slate-900">
                                            {formatCurrency(
                                                getStockValue(
                                                    item
                                                )
                                            )}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-5 py-4">
                                        <span
                                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                                        >
                                            {status.label}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5">
                                            {/* Stock In */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onStockIn?.(
                                                        item
                                                    )
                                                }
                                                title="Stock In"
                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-emerald-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                                            >
                                                <Plus
                                                    size={16}
                                                />
                                            </button>

                                            {/* Stock Out */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onStockOut?.(
                                                        item
                                                    )
                                                }
                                                title="Stock Out"
                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-orange-600 transition-colors hover:border-orange-200 hover:bg-orange-50"
                                            >
                                                <Minus
                                                    size={16}
                                                />
                                            </button>

                                            {/* Adjustment */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onAdjust?.(
                                                        item
                                                    )
                                                }
                                                title="Adjust Stock"
                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-blue-600 transition-colors hover:border-blue-200 hover:bg-blue-50"
                                            >
                                                <SlidersHorizontal
                                                    size={15}
                                                />
                                            </button>

                                            {/* Edit */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onEdit?.(
                                                        item
                                                    )
                                                }
                                                title="Edit"
                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100"
                                            >
                                                <Edit3
                                                    size={15}
                                                />
                                            </button>

                                            {/* Delete */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onDelete?.(
                                                        item
                                                    )
                                                }
                                                title="Deactivate"
                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-red-600 transition-colors hover:border-red-200 hover:bg-red-50"
                                            >
                                                <Trash2
                                                    size={15}
                                                />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}