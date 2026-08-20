import { useEffect, useState, useMemo } from "react";
// import { getDashboardStats } from "../api/dashboardApi";

/* ------------------------------------------------------------------
   MOCK DATA
   This block only runs if getDashboardStats() is unavailable or fails
   (e.g. previewing this file standalone). In your real project, keep
   the import above uncommented and delete this block + the fallback
   in fetchDashboard() — real data will flow through exactly the same
   render code.
------------------------------------------------------------------- */
const MOCK = {
    stats: {
        today_revenue: 18420,
        today_orders: 47,
        occupied_tables: 7,
        available_tables: 5,
        pending_orders: 3,
        preparing_orders: 4,
        paid_orders: 40,
        menu_items: 62,
        total_tables: 12,
    },
    recent_orders: [
        { id: 1042, table: { name: "Table 4" }, status: "preparing", items: [{ quantity: 2, unit_price: "450" }, { quantity: 1, unit_price: "220" }] },
        { id: 1041, table: { name: "Table 9" }, status: "pending", items: [{ quantity: 1, unit_price: "680" }] },
        { id: 1040, table: { name: "Table 2" }, status: "ready", items: [{ quantity: 3, unit_price: "180" }, { quantity: 2, unit_price: "150" }] },
        { id: 1039, table: { name: "Table 6" }, status: "paid", items: [{ quantity: 1, unit_price: "950" }] },
        { id: 1038, table: { name: "Table 1" }, status: "paid", items: [{ quantity: 2, unit_price: "320" }] },
    ],
    tables: [
        { id: 1, name: "Table 1", seats: 2, status: "available", orders: [] },
        { id: 2, name: "Table 2", seats: 4, status: "occupied", orders: [{ id: 1040, status: "ready", items: [{ quantity: 3, unit_price: "180" }, { quantity: 2, unit_price: "150" }] }] },
        { id: 3, name: "Table 3", seats: 4, status: "reserved", orders: [] },
        { id: 4, name: "Table 4", seats: 6, status: "occupied", orders: [{ id: 1042, status: "preparing", items: [{ quantity: 2, unit_price: "450" }, { quantity: 1, unit_price: "220" }] }] },
        { id: 5, name: "Table 5", seats: 2, status: "available", orders: [] },
        { id: 6, name: "Table 6", seats: 4, status: "occupied", orders: [{ id: 1039, status: "paid", items: [{ quantity: 1, unit_price: "950" }] }] },
        { id: 7, name: "Table 7", seats: 8, status: "available", orders: [] },
        { id: 8, name: "Table 8", seats: 2, status: "reserved", orders: [] },
    ],
    best_selling: [
        { menu_item_id: 1, sold: 128, menu_item: { name: "Cappuccino", category: "Beverages" } },
        { menu_item_id: 2, sold: 104, menu_item: { name: "Club Sandwich", category: "Mains" } },
        { menu_item_id: 3, sold: 91, menu_item: { name: "Cheesecake Slice", category: "Desserts" } },
        { menu_item_id: 4, sold: 77, menu_item: { name: "Cold Brew", category: "Beverages" } },
    ],
};

const FONT_LINK_ID = "cafeflow-fonts";

export default function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedTable, setSelectedTable] = useState(null);
    const [usingMock, setUsingMock] = useState(false);

    useEffect(() => {
        if (!document.getElementById(FONT_LINK_ID)) {
            const link = document.createElement("link");
            link.id = FONT_LINK_ID;
            link.rel = "stylesheet";
            link.href =
                "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap";
            document.head.appendChild(link);
        }

        fetchDashboard();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            // const response = await getDashboardStats();
            // if (response.data.success) {
            //     setDashboard(response.data.data);
            //     setUsingMock(false);
            // }
            // Standalone-preview fallback:
            await new Promise((r) => setTimeout(r, 500));
            setDashboard(MOCK);
            setUsingMock(true);
        } catch (err) {
            console.error(err);
            setError("Failed to load dashboard. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const getOrderTotal = (order) =>
        (order.items || []).reduce((sum, item) => sum + item.quantity * parseFloat(item.unit_price), 0);

    const getTableBillTotal = (table) =>
        (table.orders || []).reduce((sum, order) => sum + getOrderTotal(order), 0);

    const statusStyles = (status) => {
        switch (status) {
            case "pending": return { bg: "#FBF0DE", fg: "#9A6A16", dot: "#D9A441" };
            case "preparing": return { bg: "#FCE8DE", fg: "#B5501F", dot: "#C4703C" };
            case "ready": return { bg: "#E4EEF0", fg: "#2F6E78", dot: "#4C9AA6" };
            default: return { bg: "#E7F0E3", fg: "#3E6B33", dot: "#6B8F71" };
        }
    };

    const tableColors = (status) => {
        switch (status) {
            case "available": return { bg: "#EFF6EC", border: "#CFE4C7", fg: "#3E6B33", dot: "#6B8F71" };
            case "occupied": return { bg: "#FBEAE7", border: "#F0CAC4", fg: "#A14435", dot: "#C1554A" };
            default: return { bg: "#FBF3E3", border: "#F0DDAF", fg: "#9A6A16", dot: "#D9A441" };
        }
    };

    const stats = dashboard?.stats || {};

    const occupancyPct = useMemo(() => {
        const total = (stats.occupied_tables || 0) + (stats.available_tables || 0);
        if (!total) return 0;
        return Math.round(((stats.occupied_tables || 0) / total) * 100);
    }, [stats]);

    const cards = [
        { title: "Today's Revenue", value: `Rs ${Number(stats.today_revenue || 0).toLocaleString()}`, icon: CoinIcon },
        { title: "Today's Orders", value: stats.today_orders || 0, icon: TicketIcon },
        { title: "Occupied Tables", value: stats.occupied_tables || 0, icon: TableIcon },
        { title: "Pending Orders", value: stats.pending_orders || 0, icon: ClockIcon },
    ];

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", background: "#FBF7F1", minHeight: "100vh", color: "#2B1B14", padding: "32px 40px" }}>
                    {loading ? (
                        <LoadingState />
                    ) : error ? (
                        <div style={{ background: "#FBEAE7", border: "1px solid #F0CAC4", color: "#A14435", padding: "16px 20px", borderRadius: 14 }}>
                            {error}
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
                                <div>
                                    <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>
                                        Good day, here's the floor
                                    </h1>
                                    <p style={{ color: "#8A7A6D", marginTop: 6, fontSize: 14 }}>
                                        {stats.occupied_tables || 0} tables occupied · {stats.pending_orders || 0} orders waiting on the pass
                                        {usingMock && <span style={{ color: "#C4703C" }}> · showing sample data</span>}
                                    </p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700 }}>
                                            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                        <div style={{ fontSize: 11, color: "#9C897A" }}>
                                            {currentTime.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => (window.location.href = "/orders/new")}
                                        style={pillButtonStyle("#C4703C", "#FFFFFF")}
                                    >
                                        + New Order
                                    </button>
                                    <button onClick={fetchDashboard} style={pillButtonStyle("#FFFFFF", "#2B1B14", "#E7DCD0")}>
                                        ⟳ Refresh
                                    </button>
                                </div>
                            </div>

                            {/* Stat cards — receipt-notch signature */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 18, marginBottom: 28 }}>
                                {cards.map((card) => (
                                    <div key={card.title} style={receiptCardStyle}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <div>
                                                <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9C897A", margin: 0, fontWeight: 600 }}>
                                                    {card.title}
                                                </p>
                                                <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 700, margin: "10px 0 0", color: "#2B1B14" }}>
                                                    {card.value}
                                                </h2>
                                            </div>
                                            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#F7ECDF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <card.icon color="#C4703C" />
                                            </div>
                                        </div>
                                        <div style={perfEdgeStyle} />
                                    </div>
                                ))}
                            </div>

                            {/* Main grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(260px, 1fr)", gap: 24 }} className="cf-main-grid">
                                {/* Left column */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
                                    {/* Recent orders */}
                                    <div style={panelStyle}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                                            <h2 style={panelTitleStyle}>Recent Orders</h2>
                                            <span style={countPillStyle}>{dashboard?.recent_orders?.length || 0} orders</span>
                                        </div>

                                        {!dashboard?.recent_orders?.length ? (
                                            <EmptyState text="No active orders yet." />
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                                {dashboard.recent_orders.map((order) => {
                                                    const total = getOrderTotal(order);
                                                    const sty = statusStyles(order.status);
                                                    return (
                                                        <div
                                                            key={order.id}
                                                            style={{
                                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                                padding: "13px 4px", borderBottom: "1px solid #F1E9DF",
                                                            }}
                                                        >
                                                            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                                                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: sty.dot, flexShrink: 0 }} />
                                                                <div style={{ minWidth: 0 }}>
                                                                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                                                                        #{order.id} <span style={{ color: "#9C897A", fontWeight: 400 }}>· {order.table?.name || "N/A"}</span>
                                                                    </div>
                                                                    <div style={{ fontSize: 12, color: "#9C897A" }}>{order.items.length} items</div>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                                                <span style={{ ...statusPillStyle, background: sty.bg, color: sty.fg }}>{order.status}</span>
                                                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 14, width: 78, textAlign: "right" }}>
                                                                    Rs {total.toFixed(0)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Tables */}
                                    <div style={panelStyle}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                                            <h2 style={panelTitleStyle}>Floor Status</h2>
                                            <span style={{ fontSize: 12, color: "#9C897A" }}>Tap a table for its bill</span>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                                            {dashboard?.tables?.map((table) => {
                                                const c = tableColors(table.status);
                                                return (
                                                    <button
                                                        key={table.id}
                                                        onClick={() => setSelectedTable(table)}
                                                        style={{
                                                            textAlign: "left", borderRadius: 14, padding: 14, cursor: "pointer",
                                                            background: c.bg, border: `1px solid ${c.border}`, color: c.fg,
                                                            display: "flex", flexDirection: "column", gap: 6, transition: "transform 0.12s",
                                                        }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                                                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                                                    >
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <span style={{ fontWeight: 700, fontSize: 14 }}>{table.name}</span>
                                                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot }} />
                                                        </div>
                                                        <span style={{ fontSize: 11, textTransform: "capitalize", opacity: 0.85 }}>
                                                            {table.status} · {table.seats} seats
                                                        </span>
                                                        {table.orders?.length > 0 && (
                                                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, marginTop: 2 }}>
                                                                Rs {getTableBillTotal(table).toFixed(0)}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Right column */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
                                    {/* Occupancy donut */}
                                    <div style={panelStyle}>
                                        <h2 style={{ ...panelTitleStyle, marginBottom: 18 }}>Table Occupancy</h2>
                                        <Donut pct={occupancyPct} />
                                        <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 14, fontSize: 12 }}>
                                            <LegendDot color="#C1554A" label={`Occupied (${stats.occupied_tables || 0})`} />
                                            <LegendDot color="#EADFCF" label={`Free (${stats.available_tables || 0})`} />
                                        </div>
                                    </div>

                                    {/* Best sellers */}
                                    <div style={panelStyle}>
                                        <h2 style={{ ...panelTitleStyle, marginBottom: 16 }}>Best Sellers</h2>
                                        {!dashboard?.best_selling?.length ? (
                                            <EmptyState text="No sales recorded yet." />
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                                {dashboard.best_selling.map((item, i) => (
                                                    <div key={item.menu_item_id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                        <div
                                                            style={{
                                                                width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                                                                background: i === 0 ? "#C4703C" : "#F1E9DF",
                                                                color: i === 0 ? "#fff" : "#8A7A6D",
                                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                                fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                                                            }}
                                                        >
                                                            {i + 1}
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{item.menu_item?.name}</div>
                                                            <div style={{ fontSize: 11.5, color: "#9C897A" }}>{item.menu_item?.category}</div>
                                                        </div>
                                                        <span style={{ ...statusPillStyle, background: "#F7ECDF", color: "#9A6A16", flexShrink: 0 }}>
                                                            {item.sold} sold
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Summary */}
                                    <div style={panelStyle}>
                                        <h2 style={{ ...panelTitleStyle, marginBottom: 14 }}>Summary</h2>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                                            <SummaryRow label="Total tables" value={stats.total_tables || 0} />
                                            <SummaryRow label="Menu items" value={stats.menu_items || 0} />
                                            <SummaryRow label="Preparing" value={stats.preparing_orders || 0} />
                                            <SummaryRow label="Paid orders" value={stats.paid_orders || 0} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

            {/* Table detail modal */}
            {selectedTable && (
                <div
                    onClick={() => setSelectedTable(null)}
                    style={{ position: "fixed", inset: 0, background: "rgba(36,22,16,0.55)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: "#FFFFFF", borderRadius: 24, width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", fontFamily: "'Inter', sans-serif" }}
                    >
                        <div style={{ padding: 24, borderRadius: "24px 24px 0 0", background: "#241610", color: "#F3EAE1", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, margin: 0, fontWeight: 600 }}>{selectedTable.name}</h2>
                                <p style={{ margin: "6px 0 0", fontSize: 13, color: "#D8C7BA", textTransform: "capitalize" }}>
                                    {selectedTable.status} · {selectedTable.seats} seats
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedTable(null)}
                                style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.12)", color: "#F3EAE1", cursor: "pointer", fontSize: 15 }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ padding: 24 }}>
                            {!selectedTable.orders?.length ? (
                                <div style={{ textAlign: "center", padding: "30px 0" }}>
                                    <p style={{ color: "#9C897A", marginBottom: 16 }}>This table has no active orders.</p>
                                    <button
                                        onClick={() => (window.location.href = `/orders/new?table=${selectedTable.id}`)}
                                        style={pillButtonStyle("#C4703C", "#FFFFFF")}
                                    >
                                        + Take New Order
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {selectedTable.orders.map((order) => (
                                        <div key={order.id} style={{ border: "1px solid #F1E9DF", borderRadius: 16, padding: 18, marginBottom: 16 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                                <h3 style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Order #{order.id}</h3>
                                                <span style={{ ...statusPillStyle, ...(() => { const s = statusStyles(order.status); return { background: s.bg, color: s.fg }; })() }}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            {(order.items || []).map((item, idx) => (
                                                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: idx === 0 ? "none" : "1px solid #F7F1E9", fontSize: 13.5 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{item.menu_item?.name || item.name}</div>
                                                        <div style={{ fontSize: 12, color: "#9C897A" }}>{item.quantity} × Rs {parseFloat(item.unit_price).toFixed(2)}</div>
                                                    </div>
                                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                                                        Rs {(item.quantity * parseFloat(item.unit_price)).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid #F1E9DF", fontWeight: 700 }}>
                                                <span style={{ color: "#9C897A", fontWeight: 600, fontSize: 13 }}>Order total</span>
                                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16 }}>Rs {getOrderTotal(order).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}

                                    <div style={{ background: "#FBF7F1", borderRadius: 16, padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                        <span style={{ fontWeight: 700 }}>Table Bill</span>
                                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: "#C1554A" }}>
                                            Rs {getTableBillTotal(selectedTable).toFixed(2)}
                                        </span>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                        <button onClick={() => (window.location.href = `/orders/new?table=${selectedTable.id}`)} style={pillButtonStyle("#C4703C", "#FFFFFF")}>
                                            + Add Order
                                        </button>
                                        <button onClick={() => (window.location.href = `/orders/${selectedTable.orders[0].id}`)} style={pillButtonStyle("#FFFFFF", "#2B1B14", "#E7DCD0")}>
                                            Manage Order
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 880px) {
                    .cf-main-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}

/* ------------------------------ styles ------------------------------ */
const panelStyle = { background: "#FFFFFF", borderRadius: 20, padding: 22, border: "1px solid #F1E9DF" };
const panelTitleStyle = { fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, margin: 0 };
const countPillStyle = { fontSize: 11.5, fontWeight: 600, background: "#F7ECDF", color: "#9A6A16", padding: "4px 10px", borderRadius: 999 };
const statusPillStyle = { fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, textTransform: "capitalize" };
const receiptCardStyle = { background: "#FFFFFF", borderRadius: 18, padding: "18px 20px 22px", border: "1px solid #F1E9DF", position: "relative", overflow: "hidden" };
const perfEdgeStyle = {
    position: "absolute", left: 0, right: 0, bottom: 0, height: 6,
    backgroundImage: "radial-gradient(circle, #FBF7F1 3px, transparent 3.5px)",
    backgroundSize: "12px 12px", backgroundPosition: "0 3px",
};

function pillButtonStyle(bg, fg, border) {
    return {
        background: bg, color: fg, border: border ? `1px solid ${border}` : "none",
        padding: "10px 18px", borderRadius: 999, fontWeight: 600, fontSize: 13.5,
        cursor: "pointer", whiteSpace: "nowrap",
    };
}

/* ------------------------------ subcomponents ------------------------------ */
function SummaryRow({ label, value }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#8A7A6D" }}>{label}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{value}</span>
        </div>
    );
}

function LegendDot({ color, label }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#8A7A6D" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
            {label}
        </div>
    );
}

function EmptyState({ text }) {
    return <div style={{ textAlign: "center", padding: "36px 0", color: "#B3A597", fontSize: 13.5 }}>{text}</div>;
}

function LoadingState() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: 16 }}>
            <div style={{ display: "flex", gap: 8 }}>
                {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: "#C4703C", animation: `cfBounce 1s ${i * 0.15}s infinite ease-in-out` }} />
                ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9C897A" }}>
                Loading CafeFlow dashboard…
            </div>
            <style>{`@keyframes cfBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }`}</style>
        </div>
    );
}

function Donut({ pct }) {
    const r = 54, c = 2 * Math.PI * r;
    const offset = c - (pct / 100) * c;
    return (
        <div style={{ display: "flex", justifyContent: "center" }}>
            <svg width="150" height="150" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r={r} fill="none" stroke="#EADFCF" strokeWidth="16" />
                <circle
                    cx="75" cy="75" r={r} fill="none" stroke="#C1554A" strokeWidth="16"
                    strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
                    transform="rotate(-90 75 75)" style={{ transition: "stroke-dashoffset 0.6s ease" }}
                />
                <text x="75" y="70" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="26" fontWeight="700" fill="#2B1B14">
                    {pct}%
                </text>
                <text x="75" y="90" textAnchor="middle" fontFamily="'Inter', sans-serif" fontSize="11" fill="#9C897A">
                    occupied
                </text>
            </svg>
        </div>
    );
}

/* ------------------------------ icons (inline, no deps) ------------------------------ */
function TicketIcon({ color = "#C4703C" }) {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a1.5 1.5 0 0 0 0 3v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a1.5 1.5 0 0 0 0-3V8Z" stroke={color} strokeWidth="1.8" />
            <path d="M9 6v12" stroke={color} strokeWidth="1.6" strokeDasharray="2 2" />
        </svg>
    );
}
function TableIcon({ color = "#C4703C" }) {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="4" rx="1.5" stroke={color} strokeWidth="1.8" />
            <path d="M6 10v8M18 10v8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}
function ClockIcon({ color = "#C4703C" }) {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
            <path d="M12 7v5l3.5 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}
function CoinIcon({ color = "#C4703C" }) {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
            <path d="M9.5 15c0 1.1 1.1 2 2.5 2s2.5-.7 2.5-1.6c0-2.3-5-1-5-3.3 0-.9 1.1-1.6 2.5-1.6s2.5.7 2.5 1.6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
            <path d="M12 8v1M12 15v1" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}