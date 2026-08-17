import { useEffect, useState } from "react";
import { getDashboardStats } from "../api/dashboardApi";

export default function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedTable, setSelectedTable] = useState(null); // <-- NEW: table detail modal state

    useEffect(() => {
        fetchDashboard();

        // Live clock interval
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await getDashboardStats();

            if (response.data.success) {
                setDashboard(response.data.data);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load dashboard. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Helper: total for one order (sum of qty * unit_price across its items)
    const getOrderTotal = (order) =>
        (order.items || []).reduce(
            (sum, item) => sum + item.quantity * parseFloat(item.unit_price),
            0
        );

    // Helper: combined bill across all of a table's orders
    const getTableBillTotal = (table) =>
        (table.orders || []).reduce((sum, order) => sum + getOrderTotal(order), 0);

    const statusStyles = (status) => {
        switch (status) {
            case "pending":
                return "bg-amber-50 text-amber-700 border border-amber-200";
            case "preparing":
                return "bg-orange-50 text-orange-700 border border-orange-200";
            case "ready":
                return "bg-blue-50 text-blue-700 border border-blue-200";
            default:
                return "bg-emerald-50 text-emerald-700 border border-emerald-200";
        }
    };

    if (loading) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="flex flex-col items-center space-y-4">
                        {/* Professional restaurant-themed bouncing dots loader */}
                        <div className="flex space-x-2">
                            <div className="w-4 h-4 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce"></div>
                        </div>
                        <div className="text-sm font-semibold tracking-wide text-gray-500 uppercase animate-pulse">
                            Loading CafeFlow Dashboard...
                        </div>
                    </div>
                </div>
            );
        }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
                    {error}
                </div>
            </div>
        );
    }

    const stats = dashboard?.stats || {};

    const cards = [
        {
            title: "Today's Revenue",
            value: `Rs${Number(stats.today_revenue || 0).toFixed(2)}`,
            color: "bg-emerald-500",
            icon: "💰",
        },
        {
            title: "Today's Orders",
            value: stats.today_orders || 0,
            color: "bg-blue-500",
            icon: "🧾",
        },
        {
            title: "Occupied Tables",
            value: stats.occupied_tables || 0,
            color: "bg-rose-500",
            icon: "🍽️",
        },
        {
            title: "Available Tables",
            value: stats.available_tables || 0,
            color: "bg-teal-500",
            icon: "🪑",
        },
        {
            title: "Pending Orders",
            value: stats.pending_orders || 0,
            color: "bg-amber-500",
            icon: "⏳",
        },
        {
            title: "Preparing",
            value: stats.preparing_orders || 0,
            color: "bg-orange-500",
            icon: "👨‍🍳",
        },
        {
            title: "Paid Orders",
            value: stats.paid_orders || 0,
            color: "bg-purple-500",
            icon: "✅",
        },
        {
            title: "Menu Items",
            value: stats.menu_items || 0,
            color: "bg-indigo-500",
            icon: "🍔",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-orange-600 rounded-3xl p-8 shadow-xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
                        CafeFlow Dashboard
                    </h1>
                    <p className="mt-2 text-amber-100 text-sm lg:text-base">
                        Monitor your restaurant operations and live analytics in real time.
                    </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-sm">
                    <span className="font-medium">{currentTime.toLocaleDateString()}</span> • <span className="font-bold">{currentTime.toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100 flex items-center justify-between"
                    >
                        <div>
                            <p className="text-gray-500 text-sm font-medium">
                                {card.title}
                            </p>
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mt-1">
                                {card.value}
                            </h2>
                        </div>
                        <div
                            className={`${card.color} w-12 h-12 rounded-2xl flex items-center justify-center text-xl text-white shadow-md`}
                        >
                            {card.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
                {/* Left Side (Orders & Tables) */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Recent Orders */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                Recent Orders
                            </h2>
                            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                {dashboard?.recent_orders?.length || 0} Orders
                            </span>
                        </div>

                        {!dashboard?.recent_orders || dashboard.recent_orders.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                No active orders found.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            <th className="pb-3 px-3">Order</th>
                                            <th className="pb-3 px-3">Table</th>
                                            <th className="pb-3 px-3">Items</th>
                                            <th className="pb-3 px-3">Status</th>
                                            <th className="pb-3 px-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-sm">
                                        {dashboard.recent_orders.map((order) => {
                                            const total = getOrderTotal(order);

                                            return (
                                                <tr key={order.id} className="hover:bg-gray-50/50 transition">
                                                    <td className="py-4 px-3 font-semibold text-gray-800">
                                                        #{order.id}
                                                    </td>
                                                    <td className="py-4 px-3 text-gray-600">
                                                        {order.table?.name || "N/A"}
                                                    </td>
                                                    <td className="py-4 px-3 text-gray-600">
                                                        {order.items.length} items
                                                    </td>
                                                    <td className="py-4 px-3">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyles(order.status)}`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-3 text-right font-bold text-gray-800">
                                                        Rs{total.toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Restaurant Tables */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                Restaurant Tables Status
                            </h2>
                            <span className="text-xs text-gray-400 font-medium">
                                Tap a table to view its order &amp; bill
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {dashboard?.tables?.map((table) => (
                                <button
                                    key={table.id}
                                    onClick={() => setSelectedTable(table)}
                                    className={`text-left rounded-2xl p-5 text-white shadow-sm flex flex-col justify-between transition-transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 cursor-pointer ${
                                        table.status === "available"
                                            ? "bg-emerald-500"
                                            : table.status === "occupied"
                                            ? "bg-rose-500"
                                            : "bg-amber-500"
                                    }`}
                                >
                                    <div>
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-bold">{table.name}</h3>
                                            <span className="text-xs bg-black/10 px-2 py-0.5 rounded-md font-medium">
                                                {table.seats} seats
                                            </span>
                                        </div>
                                        <p className="capitalize text-xs text-white/80 mt-1">
                                            {table.status}
                                        </p>
                                    </div>

                                    {table.orders && table.orders.length > 0 && (
                                        <div className="mt-4 border-t border-white/20 pt-3 text-xs space-y-1">
                                            <p>Order: <strong className="font-semibold">#{table.orders[0].id}</strong></p>
                                            <p>Status: <strong className="capitalize font-semibold">{table.orders[0].status}</strong></p>
                                            <p>Bill: <strong className="font-semibold">Rs{getTableBillTotal(table).toFixed(2)}</strong></p>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side Column */}
                <div className="space-y-8">
                    {/* Best Selling Items */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-5">
                            Best Selling Items
                        </h2>

                        {!dashboard?.best_selling || dashboard.best_selling.length === 0 ? (
                            <p className="text-gray-400 text-sm">No sales data recorded yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {dashboard.best_selling.map((item) => (
                                    <div
                                        key={item.menu_item_id}
                                        className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                                    >
                                        <div>
                                            <h3 className="font-semibold text-sm text-gray-800">
                                                {item.menu_item?.name}
                                            </h3>
                                            <p className="text-xs text-gray-400">
                                                {item.menu_item?.category}
                                            </p>
                                        </div>
                                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-1 rounded-full font-bold">
                                            {item.sold} Sold
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-5">
                            Quick Actions
                        </h2>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => window.location.href = "/orders"}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-semibold text-sm transition shadow-sm"
                            >
                                🧾 View Orders
                            </button>
                            <button
                                onClick={() => window.location.href = "/tables"}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition shadow-sm"
                            >
                                🍽️ Manage Tables
                            </button>
                            <button
                                onClick={() => window.location.href = "/menu"}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold text-sm transition shadow-sm"
                            >
                                🍔 Manage Menu
                            </button>
                            <button
                                onClick={fetchDashboard}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold text-sm transition shadow-sm"
                            >
                                🔄 Refresh Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Restaurant Summary */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-5">
                            Restaurant Summary
                        </h2>

                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Total Tables</span>
                                <span className="font-bold text-gray-800">{stats.total_tables || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Occupied</span>
                                <span className="font-bold text-rose-600">{stats.occupied_tables || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Available</span>
                                <span className="font-bold text-emerald-600">{stats.available_tables || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Today's Revenue</span>
                                <span className="font-bold text-emerald-600">Rs{Number(stats.today_revenue || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total Menu Items</span>
                                <span className="font-bold text-gray-800">{stats.menu_items || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Pending Orders</span>
                                <span className="font-bold text-amber-600">{stats.pending_orders || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Preparing Orders</span>
                                <span className="font-bold text-orange-600">{stats.preparing_orders || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Paid Orders</span>
                                <span className="font-bold text-purple-600">{stats.paid_orders || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Detail Modal */}
            {selectedTable && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedTable(null)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div
                            className={`p-6 rounded-t-3xl text-white flex justify-between items-start ${
                                selectedTable.status === "available"
                                    ? "bg-emerald-500"
                                    : selectedTable.status === "occupied"
                                    ? "bg-rose-500"
                                    : "bg-amber-500"
                            }`}
                        >
                            <div>
                                <h2 className="text-2xl font-extrabold">{selectedTable.name}</h2>
                                <p className="capitalize text-sm text-white/90 mt-1">
                                    {selectedTable.status} • {selectedTable.seats} seats
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedTable(null)}
                                className="bg-white/20 hover:bg-white/30 rounded-full w-9 h-9 flex items-center justify-center text-lg font-bold transition"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="p-6 space-y-6">
                            {!selectedTable.orders || selectedTable.orders.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-400 mb-4">This table has no active orders.</p>
                                    <button
                                        onClick={() => window.location.href = `/orders/new?table=${selectedTable.id}`}
                                        className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm"
                                    >
                                        ➕ Take New Order
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {selectedTable.orders.map((order) => (
                                        <div key={order.id} className="border border-gray-100 rounded-2xl p-5">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-gray-800">
                                                    Order #{order.id}
                                                </h3>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyles(order.status)}`}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>

                                            <div className="divide-y divide-gray-50">
                                                {(order.items || []).map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex justify-between items-center py-2 text-sm"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-gray-700">
                                                                {item.menu_item?.name || item.name}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {item.quantity} x Rs{parseFloat(item.unit_price).toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <span className="font-semibold text-gray-800">
                                                            Rs{(item.quantity * parseFloat(item.unit_price)).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                                                <span className="text-sm font-semibold text-gray-500">
                                                    Order Total
                                                </span>
                                                <span className="text-lg font-bold text-gray-800">
                                                    Rs{getOrderTotal(order).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Combined bill across all orders on this table */}
                                    <div className="bg-gray-50 rounded-2xl p-5 flex justify-between items-center">
                                        <span className="font-bold text-gray-700">Table Bill</span>
                                        <span className="text-2xl font-extrabold text-emerald-600">
                                            Rs{getTableBillTotal(selectedTable).toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => window.location.href = `/orders/new?table=${selectedTable.id}`}
                                            className="bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-semibold text-sm transition shadow-sm"
                                        >
                                            ➕ Add Order
                                        </button>
                                        <button
                                            onClick={() => window.location.href = `/orders/${selectedTable.orders[0].id}`}
                                            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition shadow-sm"
                                        >
                                            🧾 View / Manage Order
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}