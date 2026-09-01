import { useEffect, useState } from "react";
import { X, PackageMinus, Save } from "lucide-react";

const getToday = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    const localDate = new Date(
        date.getTime() - offset * 60 * 1000
    );

    return localDate.toISOString().split("T")[0];
};

const initialForm = {
    quantity: "",
    reason: "",
    reference: "",
    transaction_date: getToday(),
};

export default function StockOutModal({
    isOpen,
    onClose,
    onSubmit,
    item = null,
    loading = false,
}) {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setForm({
                ...initialForm,
                transaction_date: getToday(),
            });

            setErrors({});
        }
    }, [isOpen, item]);

    if (!isOpen || !item) {
        return null;
    }

    const currentStock = Number(item.current_stock || 0);

    const enteredQuantity = Number(form.quantity || 0);

    const remainingStock = Math.max(
        currentStock - enteredQuantity,
        0
    );

    const exceedsStock =
        enteredQuantity > currentStock;

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

        if (enteredQuantity <= 0) {
            setErrors({
                quantity: "Quantity must be greater than 0.",
            });

            return;
        }

        if (enteredQuantity > currentStock) {
            setErrors({
                quantity: `Only ${currentStock} ${item.unit || "pcs"} available.`,
            });

            return;
        }

        try {
            await onSubmit({
                inventory_item_id: item.id,
                quantity: enteredQuantity,
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
                    "Unable to remove stock.",
            });
        }
    };

    const inputClass = (field) =>
        `mt-1.5 block w-full rounded-xl border ${
            errors[field]
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-slate-200 focus:border-orange-500 focus:ring-orange-500"
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                            <PackageMinus
                                size={20}
                                className="text-orange-600"
                            />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Stock Out
                            </h2>

                            <p className="text-sm text-slate-500">
                                Remove stock from your inventory.
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
                                Available Stock
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                                {currentStock.toLocaleString()}{" "}
                                {item.unit || "pcs"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
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
                        {/* Quantity */}
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Quantity{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <div className="relative">
                                <input
                                    type="number"
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    min="0.001"
                                    max={currentStock}
                                    step="0.001"
                                    placeholder="Enter quantity"
                                    className={`${inputClass(
                                        "quantity"
                                    )} pr-16`}
                                    disabled={
                                        loading ||
                                        currentStock <= 0
                                    }
                                    autoFocus
                                />

                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                    {item.unit || "pcs"}
                                </span>
                            </div>

                            {fieldError("quantity")}

                            {currentStock <= 0 && (
                                <p className="mt-1.5 text-xs font-medium text-red-600">
                                    This item is currently out of
                                    stock.
                                </p>
                            )}
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Reason
                            </label>

                            <input
                                type="text"
                                name="reason"
                                value={form.reason}
                                onChange={handleChange}
                                placeholder="e.g. Used for customer orders"
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
                                placeholder="e.g. ORDER-1025"
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
                                Transaction Date{" "}
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

                    {/* Preview */}
                    {enteredQuantity > 0 && (
                        <div
                            className={`mt-5 rounded-xl border p-4 ${
                                exceedsStock
                                    ? "border-red-200 bg-red-50"
                                    : "border-orange-100 bg-orange-50"
                            }`}
                        >
                            <div className="flex items-center justify-between text-sm">
                                <span
                                    className={
                                        exceedsStock
                                            ? "text-red-700"
                                            : "text-orange-700"
                                    }
                                >
                                    Remaining stock
                                </span>

                                <span
                                    className={`font-bold ${
                                        exceedsStock
                                            ? "text-red-800"
                                            : "text-orange-800"
                                    }`}
                                >
                                    {exceedsStock
                                        ? "Insufficient stock"
                                        : `${remainingStock.toLocaleString()} ${
                                              item.unit ||
                                              "pcs"
                                          }`}
                                </span>
                            </div>

                            {exceedsStock && (
                                <p className="mt-2 text-xs text-red-600">
                                    You cannot remove{" "}
                                    {enteredQuantity.toLocaleString()}{" "}
                                    {item.unit || "pcs"}. Only{" "}
                                    {currentStock.toLocaleString()}{" "}
                                    {item.unit || "pcs"} is
                                    available.
                                </p>
                            )}
                        </div>
                    )}

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
                                currentStock <= 0 ||
                                !form.quantity ||
                                enteredQuantity <= 0 ||
                                exceedsStock
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Removing...
                                </>
                            ) : (
                                <>
                                    <Save size={17} />
                                    Remove Stock
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}