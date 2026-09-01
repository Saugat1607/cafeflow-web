import {
    Package,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Wallet,
} from "lucide-react";

const cards = [
    {
        key: "total_items",
        title: "Total Items",
        icon: Package,
    },
    {
        key: "in_stock",
        title: "In Stock",
        icon: CheckCircle2,
    },
    {
        key: "low_stock",
        title: "Low Stock",
        icon: AlertTriangle,
    },
    {
        key: "out_of_stock",
        title: "Out of Stock",
        icon: XCircle,
    },
    {
        key: "total_stock_value",
        title: "Stock Value",
        icon: Wallet,
        currency: true,
    },
];

export default function InventoryStats({ statistics = {}, loading = false }) {
    const formatNumber = (value) => {
        return new Intl.NumberFormat("en-US").format(
            Number(value || 0)
        );
    };

    const formatCurrency = (value) => {
        return `Rs. ${new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(Number(value || 0))}`;
    };

    const getValue = (card) => {
        if (loading) {
            return null;
        }

        const value = statistics?.[card.key] ?? 0;

        return card.currency
            ? formatCurrency(value)
            : formatNumber(value);
    };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <div
                        key={card.key}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    {card.title}
                                </p>

                                {loading ? (
                                    <div className="mt-3 h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
                                ) : (
                                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                        {getValue(card)}
                                    </p>
                                )}
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                                <Icon
                                    size={21}
                                    strokeWidth={2}
                                    className="text-slate-600"
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}