import { useEffect, useState } from "react";
import { X, Save, Package } from "lucide-react";

const initialForm = {
    name: "",
    category: "",
    unit: "pcs",
    current_stock: "",
    minimum_stock: "",
    cost_per_unit: "",
    supplier: "",
    description: "",
    is_active: true,
};

export default function InventoryForm({
    isOpen,
    onClose,
    onSubmit,
    item = null,
    loading = false,
}) {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});

    const isEdit = Boolean(item);

    useEffect(() => {
        if (item) {
            setForm({
                name: item.name ?? "",
                category: item.category ?? "",
                unit: item.unit ?? "pcs",
                current_stock: item.current_stock ?? "",
                minimum_stock: item.minimum_stock ?? "",
                cost_per_unit: item.cost_per_unit ?? "",
                supplier: item.supplier ?? "",
                description: item.description ?? "",
                is_active: item.is_active ?? true,
            });
        } else {
            setForm(initialForm);
        }

        setErrors({});
    }, [item, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
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
            await onSubmit(form);
        } catch (error) {
            const validationErrors =
                error?.response?.data?.errors;

            if (validationErrors) {
                setErrors(validationErrors);
            }
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
                {Array.isArray(error)
                    ? error[0]
                    : error}
            </p>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                            <Package
                                size={20}
                                className="text-slate-700"
                            />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {isEdit
                                    ? "Edit Inventory Item"
                                    : "Add Inventory Item"}
                            </h2>

                            <p className="text-sm text-slate-500">
                                {isEdit
                                    ? "Update inventory item details."
                                    : "Add a new item to your inventory."}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="overflow-y-auto px-6 py-5"
                >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {/* Name */}
                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-slate-700">
                                Item Name{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Coffee Beans"
                                className={inputClass("name")}
                                disabled={loading}
                            />

                            {fieldError("name")}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Category
                            </label>

                            <input
                                type="text"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                placeholder="e.g. Raw Material"
                                className={inputClass(
                                    "category"
                                )}
                                disabled={loading}
                            />

                            {fieldError("category")}
                        </div>

                        {/* Unit */}
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Unit{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <select
                                name="unit"
                                value={form.unit}
                                onChange={handleChange}
                                className={inputClass("unit")}
                                disabled={loading}
                            >
                                <option value="pcs">
                                    Pieces
                                </option>
                                <option value="kg">
                                    Kilogram (kg)
                                </option>
                                <option value="g">
                                    Gram (g)
                                </option>
                                <option value="liter">
                                    Liter
                                </option>
                                <option value="ml">
                                    Milliliter (ml)
                                </option>
                                <option value="pack">
                                    Pack
                                </option>
                                <option value="box">
                                    Box
                                </option>
                                <option value="bottle">
                                    Bottle
                                </option>
                                <option value="dozen">
                                    Dozen
                                </option>
                            </select>

                            {fieldError("unit")}
                        </div>

                        {/* Current Stock */}
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Current Stock{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="number"
                                name="current_stock"
                                value={form.current_stock}
                                onChange={handleChange}
                                min="0"
                                step="0.001"
                                placeholder="0"
                                className={inputClass(
                                    "current_stock"
                                )}
                                disabled={loading || isEdit}
                            />

                            {isEdit && (
                                <p className="mt-1 text-xs text-slate-400">
                                    Use Stock In/Out or Adjustment
                                    to change stock.
                                </p>
                            )}

                            {fieldError("current_stock")}
                        </div>

                        {/* Minimum Stock */}
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Minimum Stock{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="number"
                                name="minimum_stock"
                                value={form.minimum_stock}
                                onChange={handleChange}
                                min="0"
                                step="0.001"
                                placeholder="5"
                                className={inputClass(
                                    "minimum_stock"
                                )}
                                disabled={loading}
                            />

                            {fieldError("minimum_stock")}
                        </div>

                        {/* Cost */}
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Cost Per Unit{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                    Rs.
                                </span>

                                <input
                                    type="number"
                                    name="cost_per_unit"
                                    value={form.cost_per_unit}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={`${inputClass(
                                        "cost_per_unit"
                                    )} pl-11`}
                                    disabled={loading}
                                />
                            </div>

                            {fieldError("cost_per_unit")}
                        </div>

                        {/* Supplier */}
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Supplier
                            </label>

                            <input
                                type="text"
                                name="supplier"
                                value={form.supplier}
                                onChange={handleChange}
                                placeholder="e.g. Himalayan Coffee"
                                className={inputClass(
                                    "supplier"
                                )}
                                disabled={loading}
                            />

                            {fieldError("supplier")}
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-slate-700">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Add any additional information..."
                                className={`${inputClass(
                                    "description"
                                )} resize-none`}
                                disabled={loading}
                            />

                            {fieldError("description")}
                        </div>

                        {/* Active */}
                        <div className="sm:col-span-2">
                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={Boolean(
                                        form.is_active
                                    )}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />

                                <div>
                                    <p className="text-sm font-medium text-slate-800">
                                        Active Item
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Keep this item available
                                        in your inventory.
                                    </p>
                                </div>
                            </label>

                            {fieldError("is_active")}
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
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={17} />
                                    {isEdit
                                        ? "Update Item"
                                        : "Save Item"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}