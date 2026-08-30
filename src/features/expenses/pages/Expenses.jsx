import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Receipt,
    Wallet,
    CalendarDays,
    X,
    RefreshCw,
    TrendingDown,
} from "lucide-react";

import {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
} from "../api/expenseApi";

const CATEGORIES = [
    "Rent",
    "Electricity",
    "Water",
    "Gas",
    "Raw Materials",
    "Salary",
    "Maintenance",
    "Marketing",
    "Transportation",
    "Other",
];

const PAYMENT_METHODS = [
    "Cash",
    "Card",
    "eSewa",
    "Khalti",
    "Bank Transfer",
    "Other",
];

const getToday = () => {
    return new Date().toISOString().split("T")[0];
};

const emptyForm = {
    title: "",
    description: "",
    amount: "",
    category: "Other",
    expense_date: getToday(),
    payment_method: "Cash",
};

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    /**
     * Load expenses
     */
    const loadExpenses = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getExpenses({
                search: search || undefined,
                category: category || undefined,
                date: date || undefined,
                page: currentPage,
                per_page: 15,
            });

            /*
             * Laravel Resource Collection response:
             *
             * {
             *   data: [],
             *   links: {},
             *   meta: {}
             * }
             */

            setExpenses(Array.isArray(response?.data) ? response.data : []);

            setLastPage(response?.meta?.last_page || 1);
        } catch (err) {
            console.error("Failed to load expenses:", err);

            setError(
                err?.response?.data?.message ||
                    "Unable to load expenses."
            );

            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExpenses();
    }, [currentPage, category, date]);

    /**
     * Search with current filters
     */
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadExpenses();
    };

    /**
     * Open create modal
     */
    const openCreateModal = () => {
        setEditingExpense(null);
        setForm({
            ...emptyForm,
            expense_date: getToday(),
        });
        setError("");
        setShowModal(true);
    };

    /**
     * Open edit modal
     */
    const openEditModal = (expense) => {
        setEditingExpense(expense);

        setForm({
            title: expense.title || "",
            description: expense.description || "",
            amount: expense.amount || "",
            category: expense.category || "Other",
            expense_date:
                expense.expense_date?.substring(0, 10) ||
                getToday(),
            payment_method:
                expense.payment_method || "Cash",
        });

        setError("");
        setShowModal(true);
    };

    /**
     * Close modal
     */
    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingExpense(null);
        setForm(emptyForm);
    };

    /**
     * Handle form changes
     */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /**
     * Submit expense
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            setError("Please enter an expense title.");
            return;
        }

        if (!form.amount || Number(form.amount) <= 0) {
            setError("Please enter a valid amount.");
            return;
        }

        if (!form.expense_date) {
            setError("Please select an expense date.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                title: form.title.trim(),
                description:
                    form.description.trim() || null,
                amount: Number(form.amount),
                category: form.category,
                expense_date: form.expense_date,
                payment_method: form.payment_method,
            };

            if (editingExpense) {
                await updateExpense(
                    editingExpense.id,
                    payload
                );
            } else {
                await createExpense(payload);
            }

            closeModal();

            await loadExpenses();
        } catch (err) {
            console.error("Failed to save expense:", err);

            const validationErrors =
                err?.response?.data?.errors;

            if (validationErrors) {
                const firstError = Object.values(
                    validationErrors
                )?.[0]?.[0];

                setError(
                    firstError ||
                        "Please check the form."
                );
            } else {
                setError(
                    err?.response?.data?.message ||
                        "Unable to save expense."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    /**
     * Delete expense
     */
    const handleDelete = async (expense) => {
        const confirmed = window.confirm(
            `Delete "${expense.title}" expense?`
        );

        if (!confirmed) return;

        try {
            setError("");

            await deleteExpense(expense.id);

            await loadExpenses();
        } catch (err) {
            console.error("Failed to delete expense:", err);

            setError(
                err?.response?.data?.message ||
                    "Unable to delete expense."
            );
        }
    };

    /**
     * Calculate visible total
     */
    const visibleTotal = useMemo(() => {
        return expenses.reduce(
            (sum, expense) =>
                sum + Number(expense.amount || 0),
            0
        );
    }, [expenses]);

    /**
     * Format currency
     */
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-NP", {
            style: "currency",
            currency: "NPR",
            maximumFractionDigits: 2,
        }).format(Number(value || 0));
    };

    /**
     * Format date
     */
    const formatDate = (value) => {
        if (!value) return "-";

        return new Date(value).toLocaleDateString(
            "en-NP",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                                <Wallet size={22} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    Expenses
                                </h1>

                                <p className="text-sm text-slate-500">
                                    Track and manage cafe expenses
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={loadExpenses}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <RefreshCw size={17} />
                            Refresh
                        </button>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <Plus size={18} />
                            Add Expense
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Total Expenses
                                </p>

                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                    {formatCurrency(
                                        visibleTotal
                                    )}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                <TrendingDown
                                    size={21}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Expenses Shown
                                </p>

                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                    {expenses.length}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Receipt size={21} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Selected Date
                                </p>

                                <p className="mt-2 text-lg font-bold text-slate-900">
                                    {date
                                        ? formatDate(date)
                                        : "All dates"}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <CalendarDays
                                    size={21}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && !showModal && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <form
                        onSubmit={handleSearch}
                        className="grid grid-cols-1 gap-3 md:grid-cols-4"
                    >
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search expenses..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(
                                    e.target.value
                                );
                                setCurrentPage(1);
                            }}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">
                                All Categories
                            </option>

                            {CATEGORIES.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />

                        <button
                            type="submit"
                            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Expense
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Category
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Date
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Payment
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Amount
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-5 py-12 text-center text-sm text-slate-500"
                                        >
                                            Loading expenses...
                                        </td>
                                    </tr>
                                ) : expenses.length ===
                                  0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-5 py-14 text-center"
                                        >
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                                <Receipt
                                                    size={22}
                                                />
                                            </div>

                                            <p className="mt-3 text-sm font-semibold text-slate-700">
                                                No expenses found
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                Add an expense to
                                                get started.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    expenses.map(
                                        (expense) => (
                                            <tr
                                                key={
                                                    expense.id
                                                }
                                                className="transition hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            {
                                                                expense.title
                                                            }
                                                        </p>

                                                        {expense.description && (
                                                            <p className="mt-1 max-w-xs truncate text-sm text-slate-500">
                                                                {
                                                                    expense.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                                        {
                                                            expense.category
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {formatDate(
                                                        expense.expense_date
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {expense.payment_method ||
                                                        "-"}
                                                </td>

                                                <td className="px-5 py-4 text-right font-bold text-slate-900">
                                                    {formatCurrency(
                                                        expense.amount
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    expense
                                                                )
                                                            }
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                            title="Edit"
                                                        >
                                                            <Pencil
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    expense
                                                                )
                                                            }
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                            title="Delete"
                                                        >
                                                            <Trash2
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading &&
                        expenses.length > 0 && (
                            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
                                <p className="text-sm text-slate-500">
                                    Page{" "}
                                    <span className="font-semibold text-slate-700">
                                        {currentPage}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-slate-700">
                                        {lastPage}
                                    </span>
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        disabled={
                                            currentPage ===
                                            1
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (page) =>
                                                    Math.max(
                                                        1,
                                                        page -
                                                            1
                                                    )
                                            )
                                        }
                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Previous
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            currentPage >=
                                            lastPage
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (page) =>
                                                    Math.min(
                                                        lastPage,
                                                        page +
                                                            1
                                                    )
                                            )
                                        }
                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                        {/* Modal header */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    {editingExpense
                                        ? "Edit Expense"
                                        : "Add Expense"}
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Record your cafe expense
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {/* Modal body */}
                        <form
                            onSubmit={handleSubmit}
                            className="p-6"
                        >
                            {error && (
                                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Expense Title
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Milk purchase"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Amount
                                    </label>

                                    <input
                                        type="number"
                                        name="amount"
                                        value={form.amount}
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0.00"
                                        min="0.01"
                                        step="0.01"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Category
                                    </label>

                                    <select
                                        name="category"
                                        value={
                                            form.category
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        {CATEGORIES.map(
                                            (item) => (
                                                <option
                                                    key={
                                                        item
                                                    }
                                                    value={
                                                        item
                                                    }
                                                >
                                                    {item}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Expense Date
                                    </label>

                                    <input
                                        type="date"
                                        name="expense_date"
                                        value={
                                            form.expense_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Payment Method
                                    </label>

                                    <select
                                        name="payment_method"
                                        value={
                                            form.payment_method
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        {PAYMENT_METHODS.map(
                                            (item) => (
                                                <option
                                                    key={
                                                        item
                                                    }
                                                    value={
                                                        item
                                                    }
                                                >
                                                    {item}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            form.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows="3"
                                        placeholder="Optional description..."
                                        className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            {/* Modal actions */}
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingExpense
                                        ? "Update Expense"
                                        : "Save Expense"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}