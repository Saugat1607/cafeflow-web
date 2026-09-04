import { useEffect, useMemo, useState } from "react";
import {
    BarChart3,
    CalendarDays,
    RefreshCw,
    FileText,
    ShoppingCart,
    Wallet,
    TrendingUp,
    TrendingDown,
    Banknote,
    CreditCard,
    Smartphone,
    CircleDollarSign,
    Search,
} from "lucide-react";

import {
    getTodayReport,
    getReportByDate,
    getReportHistory,
    generateReport,
} from "../api/reportApi";

const formatCurrency = (value) => {
    const number = Number(value || 0);

    return new Intl.NumberFormat("en-NP", {
        style: "currency",
        currency: "NPR",
        maximumFractionDigits: 2,
    }).format(number);
};

const formatDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-NP", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getThirtyDaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export default function Reports() {
    const [selectedDate, setSelectedDate] = useState(getToday());

    const [fromDate, setFromDate] = useState(getThirtyDaysAgo());
    const [toDate, setToDate] = useState(getToday());

    const [report, setReport] = useState(null);
    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const [error, setError] = useState("");

    // ---------------------------------------------------------
    // Load selected daily report
    // ---------------------------------------------------------
    const loadReport = async (date = selectedDate) => {
        try {
            setLoading(true);
            setError("");

            const response = await getReportByDate(date);

            setReport(response?.data || null);
        } catch (err) {
            console.error("Failed to load report:", err);

            setError(
                err?.response?.data?.message ||
                    "Unable to load the report."
            );
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------------------------
    // Load report history
    // ---------------------------------------------------------
    const loadHistory = async () => {
        try {
            setHistoryLoading(true);

            const response = await getReportHistory(
                fromDate,
                toDate
            );

            setHistory(
                Array.isArray(response?.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error("Failed to load report history:", err);

            setHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    // ---------------------------------------------------------
    // Initial loading
    // ---------------------------------------------------------
    useEffect(() => {
        loadReport();
        loadHistory();
    }, []);

    // ---------------------------------------------------------
    // Generate / refresh report
    // ---------------------------------------------------------
    const handleGenerate = async () => {
        try {
            setGenerating(true);
            setError("");

            await generateReport(selectedDate);

            await Promise.all([
                loadReport(selectedDate),
                loadHistory(),
            ]);
        } catch (err) {
            console.error("Failed to generate report:", err);

            setError(
                err?.response?.data?.message ||
                    "Unable to generate the report."
            );
        } finally {
            setGenerating(false);
        }
    };

    // ---------------------------------------------------------
    // Select report from history
    // ---------------------------------------------------------
    const handleHistorySelect = async (date) => {
        setSelectedDate(date);

        await loadReport(date);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ---------------------------------------------------------
    // Calculations
    // ---------------------------------------------------------
    const profitMargin = useMemo(() => {
        const sales = Number(report?.total_sales || 0);
        const profit = Number(report?.net_profit || 0);

        if (!sales) return 0;

        return ((profit / sales) * 100).toFixed(1);
    }, [report]);

    const paymentTotal = useMemo(() => {
        return (
            Number(report?.cash_sales || 0) +
            Number(report?.card_sales || 0) +
            Number(report?.esewa_sales || 0) +
            Number(report?.other_sales || 0)
        );
    }, [report]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* ------------------------------------------------
                    HEADER
                ------------------------------------------------ */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                                <BarChart3 size={23} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    Reports
                                </h1>

                                <p className="text-sm text-slate-500">
                                    Track your cafe's daily performance
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={17}
                            className={
                                generating
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        {generating
                            ? "Generating..."
                            : "Generate Report"}
                    </button>
                </div>

                {/* ------------------------------------------------
                    ERROR
                ------------------------------------------------ */}
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* ------------------------------------------------
                    DATE SELECTOR
                ------------------------------------------------ */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                View Daily Report
                            </label>

                            <div className="relative">
                                <CalendarDays
                                    size={18}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) =>
                                        setSelectedDate(
                                            e.target.value
                                        )
                                    }
                                    className="rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() =>
                                loadReport(selectedDate)
                            }
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                        >
                            <Search size={17} />
                            View Report
                        </button>
                    </div>
                </div>

                {/* ------------------------------------------------
                    REPORT
                ------------------------------------------------ */}
                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                        <RefreshCw
                            className="mx-auto mb-3 animate-spin text-blue-600"
                            size={28}
                        />

                        <p className="text-sm text-slate-500">
                            Loading report...
                        </p>
                    </div>
                ) : report ? (
                    <>
                        {/* Report heading */}
                        <div className="flex items-center gap-2">
                            <CalendarDays
                                size={18}
                                className="text-blue-600"
                            />

                            <h2 className="font-semibold text-slate-900">
                                {formatDate(report.report_date)}
                            </h2>

                            {report.report_date === getToday() && (
                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                    Today
                                </span>
                            )}
                        </div>

                        {/* ------------------------------------------------
                            SUMMARY CARDS
                        ------------------------------------------------ */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                            {/* Sales */}
                            <SummaryCard
                                title="Total Sales"
                                value={formatCurrency(
                                    report.total_sales
                                )}
                                icon={TrendingUp}
                                iconClass="bg-blue-50 text-blue-600"
                            />

                            {/* Expenses */}
                            <SummaryCard
                                title="Total Expenses"
                                value={formatCurrency(
                                    report.total_expenses
                                )}
                                icon={TrendingDown}
                                iconClass="bg-orange-50 text-orange-600"
                            />

                            {/* Profit */}
                            <SummaryCard
                                title="Net Profit"
                                value={formatCurrency(
                                    report.net_profit
                                )}
                                icon={Wallet}
                                iconClass="bg-emerald-50 text-emerald-600"
                                extra={`${profitMargin}% margin`}
                            />

                            {/* Bills */}
                            <SummaryCard
                                title="Total Bills"
                                value={Number(
                                    report.total_bills || 0
                                ).toLocaleString()}
                                icon={FileText}
                                iconClass="bg-violet-50 text-violet-600"
                                extra={`${Number(
                                    report.total_orders || 0
                                )} orders`}
                            />
                        </div>

                        {/* ------------------------------------------------
                            PAYMENT + PERFORMANCE
                        ------------------------------------------------ */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                            {/* Payment breakdown */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                                <div className="mb-5">
                                    <h3 className="font-semibold text-slate-900">
                                        Payment Breakdown
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Sales collected by payment method
                                    </p>
                                </div>

                                <div className="space-y-4">

                                    <PaymentRow
                                        icon={Banknote}
                                        title="Cash"
                                        value={report.cash_sales}
                                    />

                                    <PaymentRow
                                        icon={CreditCard}
                                        title="Card"
                                        value={report.card_sales}
                                    />

                                    <PaymentRow
                                        icon={Smartphone}
                                        title="eSewa"
                                        value={report.esewa_sales}
                                    />

                                    <PaymentRow
                                        icon={CircleDollarSign}
                                        title="Other"
                                        value={report.other_sales}
                                    />

                                </div>

                                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                    <span className="text-sm font-semibold text-slate-700">
                                        Total
                                    </span>

                                    <span className="text-lg font-bold text-slate-900">
                                        {formatCurrency(
                                            paymentTotal
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Daily performance */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                                <div className="mb-5">
                                    <h3 className="font-semibold text-slate-900">
                                        Daily Performance
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Overview of the selected business day
                                    </p>
                                </div>

                                <div className="space-y-5">

                                    <PerformanceRow
                                        label="Sales"
                                        value={report.total_sales}
                                        max={Math.max(
                                            Number(
                                                report.total_sales
                                            ),
                                            Number(
                                                report.total_expenses
                                            ),
                                            1
                                        )}
                                    />

                                    <PerformanceRow
                                        label="Expenses"
                                        value={report.total_expenses}
                                        max={Math.max(
                                            Number(
                                                report.total_sales
                                            ),
                                            Number(
                                                report.total_expenses
                                            ),
                                            1
                                        )}
                                    />

                                    <PerformanceRow
                                        label="Profit"
                                        value={Math.max(
                                            Number(
                                                report.net_profit
                                            ),
                                            0
                                        )}
                                        max={Math.max(
                                            Number(
                                                report.total_sales
                                            ),
                                            1
                                        )}
                                    />

                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-3">

                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <FileText size={16} />
                                            <span className="text-xs font-medium">
                                                Bills
                                            </span>
                                        </div>

                                        <p className="mt-2 text-xl font-bold text-slate-900">
                                            {Number(
                                                report.total_bills || 0
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <ShoppingCart size={16} />
                                            <span className="text-xs font-medium">
                                                Orders
                                            </span>
                                        </div>

                                        <p className="mt-2 text-xl font-bold text-slate-900">
                                            {Number(
                                                report.total_orders || 0
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* ------------------------------------------------
                            PROFIT SUMMARY
                        ------------------------------------------------ */}
                        <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-sm">

                            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                                <div>
                                    <p className="text-sm font-medium text-blue-100">
                                        Net Profit
                                    </p>

                                    <h2 className="mt-1 text-3xl font-bold">
                                        {formatCurrency(
                                            report.net_profit
                                        )}
                                    </h2>

                                    <p className="mt-2 text-sm text-blue-100">
                                        Sales of{" "}
                                        {formatCurrency(
                                            report.total_sales
                                        )}{" "}
                                        minus expenses of{" "}
                                        {formatCurrency(
                                            report.total_expenses
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-white/10 px-6 py-4">
                                    <p className="text-xs text-blue-100">
                                        Profit Margin
                                    </p>

                                    <p className="mt-1 text-2xl font-bold">
                                        {profitMargin}%
                                    </p>
                                </div>

                            </div>
                        </div>
                    </>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                        <BarChart3
                            size={36}
                            className="mx-auto mb-3 text-slate-300"
                        />

                        <p className="font-semibold text-slate-700">
                            No report available
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Generate a report for this date.
                        </p>
                    </div>
                )}

                {/* ------------------------------------------------
                    REPORT HISTORY
                ------------------------------------------------ */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 p-5">

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                            <div>
                                <h3 className="font-semibold text-slate-900">
                                    Report History
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    View saved daily reports for any period
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">

                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) =>
                                        setFromDate(
                                            e.target.value
                                        )
                                    }
                                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                />

                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) =>
                                        setToDate(
                                            e.target.value
                                        )
                                    }
                                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                />

                                <button
                                    onClick={loadHistory}
                                    disabled={historyLoading}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                                >
                                    <Search size={16} />
                                    Search
                                </button>

                            </div>
                        </div>
                    </div>

                    {historyLoading ? (
                        <div className="p-10 text-center">
                            <RefreshCw
                                size={25}
                                className="mx-auto animate-spin text-blue-600"
                            />

                            <p className="mt-2 text-sm text-slate-500">
                                Loading history...
                            </p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="p-10 text-center text-sm text-slate-500">
                            No saved reports found for this period.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[700px]">

                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50 text-left">

                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Date
                                        </th>

                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Sales
                                        </th>

                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Expenses
                                        </th>

                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Profit
                                        </th>

                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Bills
                                        </th>

                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Action
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {history.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-slate-100 transition hover:bg-slate-50"
                                        >

                                            <td className="px-5 py-4 text-sm font-medium text-slate-800">
                                                {formatDate(
                                                    item.report_date
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-sm font-semibold text-blue-600">
                                                {formatCurrency(
                                                    item.total_sales
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-orange-600">
                                                {formatCurrency(
                                                    item.total_expenses
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-sm font-semibold text-emerald-600">
                                                {formatCurrency(
                                                    item.net_profit
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                {Number(
                                                    item.total_bills || 0
                                                ).toLocaleString()}
                                            </td>

                                            <td className="px-5 py-4">

                                                <button
                                                    onClick={() =>
                                                        handleHistorySelect(
                                                            item.report_date
                                                        )
                                                    }
                                                    className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                                                >
                                                    View
                                                </button>

                                            </td>

                                        </tr>
                                    ))}

                                </tbody>
                            </table>

                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

/* ================================================================
   SUMMARY CARD
================================================================ */

function SummaryCard({
    title,
    value,
    icon: Icon,
    iconClass,
    extra,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-slate-900">
                        {value}
                    </h3>

                    {extra && (
                        <p className="mt-1 text-xs font-medium text-slate-400">
                            {extra}
                        </p>
                    )}
                </div>

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
                >
                    <Icon size={21} />
                </div>

            </div>

        </div>
    );
}

/* ================================================================
   PAYMENT ROW
================================================================ */

function PaymentRow({
    icon: Icon,
    title,
    value,
}) {
    return (
        <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                    <Icon size={18} />
                </div>

                <span className="text-sm font-medium text-slate-700">
                    {title}
                </span>

            </div>

            <span className="text-sm font-bold text-slate-900">
                {formatCurrency(value)}
            </span>

        </div>
    );
}

/* ================================================================
   PERFORMANCE ROW
================================================================ */

function PerformanceRow({
    label,
    value,
    max,
}) {
    const percentage = Math.min(
        (Number(value || 0) / Number(max || 1)) * 100,
        100
    );

    return (
        <div>

            <div className="mb-2 flex items-center justify-between">

                <span className="text-sm font-medium text-slate-600">
                    {label}
                </span>

                <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(value)}
                </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{
                        width: `${percentage}%`,
                    }}
                />

            </div>

        </div>
    );
}
