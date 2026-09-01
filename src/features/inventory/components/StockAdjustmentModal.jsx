import { useEffect, useMemo, useState } from "react";
import { X, SlidersHorizontal, Save } from "lucide-react";

const getToday = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();

    const localDate = new Date(
        date.getTime() - offset * 60 * 1000
    );

    return localDate.toISOString().split("T")[0];
};

const initialForm = {
    new_stock: "",
    reason: "",
    reference: "",
    transaction_date: getToday(),
};

export default function StockAdjustmentModal({
    isOpen,
    onClose,
    onSubmit,
    item = null,
    loading = false,
}) {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen && item) {
            setForm({
                new_stock: item.current_stock ?? "",
                reason: "",
                reference: "",
                transaction_date: getToday(),
            });

            setErrors({});
        }
    }, [isOpen, item]);

    const currentStock = Number(item?.current_stock || 0);

    const newStock = Number(form.new_stock || 0);

    const difference = useMemo(() => {
        return newStock - currentStock;
    }, [newStock, currentStock]);

    const adjustmentType = useMemo(() => {
        if (difference > 0) {
            return {
                label: "Stock Increase",
                className:
                    "border-emerald-200 bg-emerald-50 text-emerald-700",
            };
        }

        if (difference < 0) {
            return {
                label: "Stock Decrease",
                className:
                    "border-red-200 bg-red-50 text-red-700",
            };
        }

        return {
            label: "No Change",
            className:
                "border-slate-200 bg-slate-50 text-slate-600",
        };
    }, [difference]);

    if (!isOpen || !item) {
        return null;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((previous) => ({
                ...previous,
                [name]: "",
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErrors({});

        if (
            form.new_stock === "" ||
            Number(form.new_stock) < 0
        ) {
            setErrors({
                new_stock:
                    "New stock must be 0 or greater.",
            });

            return;
        }

        if (difference === 0) {
            setErrors({
                new_stock:
                    "The new stock is the same as the current stock.",
            });

            return;
        }

        try {
            await onSubmit({
                inventory_item_id: item.id,
                new_stock: newStock,
                reason: form.reason || null,
                reference: form.reference || null,
                transaction_date: form.transaction_date,
            });
        } catch (error) {
            const validationErrors =
                error?.response?.data?.errors;

            if (validationErrors) {
                setErrors(validationErrors);
                return;
            }

            setErrors({
                general:
                    error?.response?.data?.message ||
                    "Unable to adjust stock.",
            });
        }
    };

    const inputClass = (field) =>
        `mt-1.5 block w-full rounded-xl border ${
            errors[field]
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
        } bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2`;

    const fieldError = (field) => {
        const error = errors[field];

        if (!error) {
            return null;
        }

        return (
            <p className="mt-1 text-xs text-red-600">
                {Array.isArray(error) ? error[0] : error}
            </p>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                            <SlidersHorizontal
                                size={20}
                                className="text-blue-600"
                            />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Adjust Stock
                            </h2>

                            <p className="text-sm text-slate-500">
                                Correct the actual inventory count.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Item Information */}
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Inventory Item
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                                {item.name}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-slate-500">
                                Current Stock
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                                {currentStock.toLocaleString()}{" "}
                                {item.unit || "pcs"}
                            </p>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="px-6 py-5"
                >
                    {errors.general && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {errors.general}
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* New Stock */}
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Actual Stock{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <div className="relative">
                                <input
                                    type="number"
                                    name="new_stock"
                                    value={form.new_stock}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.001"
                                    placeholder="Enter actual stock"
                                    className={`${inputClass(
                                        "new_stock"
                                    )} pr-16`}
                                    disabled={loading}
                                    autoFocus
                                />

                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                    {item.unit || "pcs"}
                                </span>
                            </div>

                            {fieldError("new_stock")}

                            <p className="mt-1.5 text-xs text-slate-400">
                                Enter the physical quantity you
                                counted.
                            </p>
                        </div>

                        {/* Adjustment Preview */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="grid grid-cols-3 items-center gap-3 text-center">
                                <div>
                                    <p className="text-xs text-slate-500">
                                        Current
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-slate-900">
                                        {currentStock.toLocaleString()}
                                    </p>
                                </div>

                                <div className="text-slate-300">
                                    →
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">
                                        New
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-slate-900">
                                        {newStock.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                                <span className="text-sm text-slate-500">
                                    Difference
                                </span>

                                <span
                                    className={`font-bold ${
                                        difference > 0
                                            ? "text-emerald-600"
                                            : difference < 0
                                            ? "text-red-600"
                                            : "text-slate-500"
                                    }`}
                                >
                                    {difference > 0
                                        ? "+"
                                        : ""}
                                    {difference.toLocaleString()}{" "}
                                    {item.unit || "pcs"}
                                </span>
                            </div>

                            <div className="mt-3 text-center">
                                <span
                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${adjustmentType.className}`}
                                >
                                    {adjustmentType.label}
                                </span>
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Reason{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                name="reason"
                                value={form.reason}
                                onChange={handleChange}
                                placeholder="e.g. Physical stock count"
                                className={inputClass("reason")}
                                disabled={loading}
                            />

                            {fieldError("reason")}
                        </div>

                        {/* Reference */}
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Reference
                            </label>

                            <input
                                type="text"
                                name="reference"
                                value={form.reference}
                                onChange={handleChange}
                                placeholder="e.g. STOCK-ADJ-001"
                                className={inputClass(
                                    "reference"
                                )}
                                disabled={loading}
                            />

                            {fieldError("reference")}
                        </div>

                        {/* Date */}
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Adjustment Date{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="date"
                                name="transaction_date"
                                value={form.transaction_date}
                                onChange={handleChange}
                                className={inputClass(
                                    "transaction_date"
                                )}
                                disabled={loading}
                            />

                            {fieldError("transaction_date")}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                form.new_stock === "" ||
                                Number(form.new_stock) < 0 ||
                                difference === 0
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Adjusting...
                                </>
                            ) : (
                                <>
                                    <Save size={17} />
                                    Adjust Stock
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}