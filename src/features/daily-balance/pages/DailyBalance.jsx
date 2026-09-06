import { useEffect, useState } from "react";
import {
    Banknote,
    CalendarDays,
    CreditCard,
    DollarSign,
    RefreshCw,
    Smartphone,
    TrendingDown,
    TrendingUp,
    Wallet,
    Receipt,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

import { getDailyBalance } from "../api/dailyBalanceApi";

const DailyBalance = () => {
    const getToday = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const [date, setDate] = useState(getToday());
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadBalance = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getDailyBalance(date);

            setBalance(response?.data || null);
        } catch (err) {
            console.error("Daily balance error:", err);

            setError(
                err?.response?.data?.message ||
                    "Failed to load daily balance."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBalance();
    }, [date]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-NP", {
            style: "currency",
            currency: "NPR",
            minimumFractionDigits: 2,
        }).format(Number(amount || 0));
    };

    const paymentMethodInfo = {
        cash: {
            label: "Cash",
            icon: Banknote,
        },
        card: {
            label: "Card",
            icon: CreditCard,
        },
        esewa: {
            label: "eSewa",
            icon: Smartphone,
        },
        khalti: {
            label: "Khalti",
            icon: Smartphone,
        },
    };

    const salesByPayment =
        balance?.sales?.by_payment_method || {};

    const expensesByCategory =
        balance?.expenses?.by_category || {};

    const totalSales = Number(balance?.sales?.total || 0);
    const totalExpenses = Number(balance?.expenses?.total || 0);
    const netBalance = Number(balance?.balance?.net_balance || 0);

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Daily Balance
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            View your cafe's daily sales, expenses and net
                            balance.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        {/* Date */}
                        <div className="relative">
                            <CalendarDays
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={loadBalance}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw
                                size={17}
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && !balance ? (
                    <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="text-center">
                            <RefreshCw
                                size={30}
                                className="mx-auto mb-3 animate-spin text-blue-600"
                            />

                            <p className="text-sm font-medium text-slate-600">
                                Loading daily balance...
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                            {/* Sales */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            Total Sales
                                        </p>

                                        <h2 className="mt-2 text-2xl font-bold text-slate-900">
                                            {formatCurrency(totalSales)}
                                        </h2>
                                    </div>

                                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                                        <TrendingUp size={22} />
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                                    <Receipt size={14} />

                                    {balance?.sales?.bill_count || 0} bills
                                </div>
                            </div>

                            {/* Expenses */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            Total Expenses
                                        </p>

                                        <h2 className="mt-2 text-2xl font-bold text-slate-900">
                                            {formatCurrency(totalExpenses)}
                                        </h2>
                                    </div>

                                    <div className="rounded-xl bg-red-50 p-3 text-red-600">
                                        <TrendingDown size={22} />
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                                    <Receipt size={14} />

                                    {balance?.expenses?.expense_count || 0}{" "}
                                    expenses
                                </div>
                            </div>

                            {/* Net Balance */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            Net Balance
                                        </p>

                                        <h2
                                            className={`mt-2 text-2xl font-bold ${
                                                netBalance >= 0
                                                    ? "text-emerald-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {formatCurrency(netBalance)}
                                        </h2>
                                    </div>

                                    <div
                                        className={`rounded-xl p-3 ${
                                            netBalance >= 0
                                                ? "bg-emerald-50 text-emerald-600"
                                                : "bg-red-50 text-red-600"
                                        }`}
                                    >
                                        <Wallet size={22} />
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-xs">
                                    {netBalance >= 0 ? (
                                        <>
                                            <ArrowUpRight
                                                size={14}
                                                className="text-emerald-600"
                                            />

                                            <span className="text-emerald-600">
                                                Positive balance
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <ArrowDownRight
                                                size={14}
                                                className="text-red-600"
                                            />

                                            <span className="text-red-600">
                                                Negative balance
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Date */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            Balance Date
                                        </p>

                                        <h2 className="mt-2 text-xl font-bold text-slate-900">
                                            {balance?.date || date}
                                        </h2>
                                    </div>

                                    <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                                        <CalendarDays size={22} />
                                    </div>
                                </div>

                                <p className="mt-4 text-xs text-slate-500">
                                    Daily financial summary
                                </p>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

                            {/* Payment Methods */}
                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-5 py-4">
                                    <h3 className="font-semibold text-slate-900">
                                        Sales by Payment Method
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Breakdown of today's sales
                                    </p>
                                </div>

                                <div className="p-5">
                                    {Object.keys(salesByPayment).length ===
                                    0 ? (
                                        <div className="py-8 text-center text-sm text-slate-500">
                                            No sales recorded for this date.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {Object.entries(
                                                salesByPayment
                                            ).map(
                                                ([
                                                    method,
                                                    payment,
                                                ]) => {
                                                    const info =
                                                        paymentMethodInfo[
                                                            method
                                                        ];

                                                    const Icon =
                                                        info?.icon ||
                                                        DollarSign;

                                                    return (
                                                        <div
                                                            key={method}
                                                            className="flex items-center justify-between"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                                                                    <Icon
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <p className="text-sm font-semibold capitalize text-slate-800">
                                                                        {info?.label ||
                                                                            method}
                                                                    </p>

                                                                    <p className="text-xs text-slate-500">
                                                                        {
                                                                            payment.count
                                                                        }{" "}
                                                                        bills
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <p className="text-sm font-bold text-slate-900">
                                                                {formatCurrency(
                                                                    payment.amount
                                                                )}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Expense Categories */}
                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-5 py-4">
                                    <h3 className="font-semibold text-slate-900">
                                        Expenses by Category
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Breakdown of today's expenses
                                    </p>
                                </div>

                                <div className="p-5">
                                    {Object.keys(expensesByCategory)
                                        .length === 0 ? (
                                        <div className="py-8 text-center text-sm text-slate-500">
                                            No expenses recorded for this
                                            date.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {Object.entries(
                                                expensesByCategory
                                            ).map(
                                                ([
                                                    category,
                                                    expense,
                                                ]) => (
                                                    <div
                                                        key={category}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="rounded-xl bg-red-50 p-2.5 text-red-600">
                                                                <TrendingDown
                                                                    size={
                                                                        18
                                                                    }
                                                                />
                                                            </div>

                                                            <div>
                                                                <p className="text-sm font-semibold capitalize text-slate-800">
                                                                    {
                                                                        category
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-slate-500">
                                                                    {
                                                                        expense.count
                                                                    }{" "}
                                                                    expenses
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <p className="text-sm font-bold text-slate-900">
                                                            {formatCurrency(
                                                                expense.amount
                                                            )}
                                                        </p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Balance Calculation */}
                        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                                    <Wallet size={20} />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-900">
                                        Daily Balance Calculation
                                    </h3>

                                    <p className="text-xs text-slate-500">
                                        Your net balance for the selected date
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium text-slate-500">
                                        Total Sales
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-blue-600">
                                        {formatCurrency(totalSales)}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium text-slate-500">
                                        Total Expenses
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-red-600">
                                        - {formatCurrency(totalExpenses)}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-blue-50 p-4">
                                    <p className="text-xs font-medium text-blue-700">
                                        Net Balance
                                    </p>

                                    <p
                                        className={`mt-1 text-lg font-bold ${
                                            netBalance >= 0
                                                ? "text-emerald-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {formatCurrency(netBalance)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DailyBalance;