import { useEffect, useState } from "react";
import { X, PackagePlus, Save } from "lucide-react";

const initialForm = {
    quantity: "",
    unit_cost: "",
    reason: "",
    reference: "",
    transaction_date: new Date().toISOString().split("T")[0],
};

export default function StockInModal({
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
                unit_cost:
                    item?.cost_per_unit !== undefined &&
                    item?.cost_per_unit !== null
                        ? item.cost_per_unit
                        : "",
            });

            setErrors({});
        }
    }, [isOpen, item]);

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

        try {
            await onSubmit({
                inventory_item_id: item.id,
                quantity: Number(form.quantity),
                unit_cost:
                    form.unit_cost === ""
                        ? null
                        : Number(form.unit_cost),
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
                    "Unable to add stock.",
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                            <PackagePlus
                                size={20}
                                className="text-emerald-600"
                            />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Stock In
                            </h2>

                            <p className="text-sm text-slate-500">
                                Add stock to your inventory.
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
                                {Number(
                                    item.current_stock || 0
                                ).toLocaleString()}{" "}
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
                                    step="0.001"
                                    placeholder="Enter quantity"
                                    className={`${inputClass(
                                        "quantity"
                                    )} pr-16`}
                                    disabled={loading}
                                    autoFocus
                                />

                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                    {item.unit || "pcs"}
                                </span>
                            </div>

                            {fieldError("quantity")}
                        </div>

                        {/* Unit Cost */}
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Unit Cost
                            </label>

                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                    Rs.
                                </span>

                                <input
                                    type="number"
                                    name="unit_cost"
                                    value={form.unit_cost}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={`${inputClass(
                                        "unit_cost"
                                    )} pl-11`}
                                    disabled={loading}
                                />
                            </div>

                            {fieldError("unit_cost")}

                            <p className="mt-1 text-xs text-slate-400">
                                Leave unchanged if the purchase
                                cost is the same as the current
                                cost.
                            </p>
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
                                placeholder="e.g. New supplier purchase"
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
                                placeholder="e.g. PUR-001"
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
                    {form.quantity &&
                        Number(form.quantity) > 0 && (
                            <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-emerald-700">
                                        Stock after addition
                                    </span>

                                    <span className="font-bold text-emerald-800">
                                        {(
                                            Number(
                                                item.current_stock ||
                                                    0
                                            ) +
                                            Number(
                                                form.quantity
                                            )
                                        ).toLocaleString()}{" "}
                                        {item.unit || "pcs"}
                                    </span>
                                </div>
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
                                !form.quantity ||
                                Number(form.quantity) <= 0
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Save size={17} />
                                    Add Stock
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}