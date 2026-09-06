import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

// One source of truth for every section in the app.
// `path: null` means the page isn't built yet — it renders disabled with a
// "Soon" badge instead of a link. Once you add the route in App.jsx, just
// fill in the path here and it becomes clickable automatically.
const NAV_SECTIONS = [
    {
        label: "Overview",
        items: [
            { name: "Dashboard", path: "/dashboard", icon: "📊" },
        ],
    },
    {
        label: "Operations",
        items: [
            { name: "Orders", path: "/orders", icon: "🧾" },
            { name: "Tables", path: "/tables", icon: "🍽️" },
            { name: "Invoices", path: "/invoices", icon: "🧮" },
            { name: "Daily Balance", path: "/daily-balance", icon: "💵" },
            {name: "Billing", path:"/billing", icon:"🧾" }
        ],
    },
    {
        label: "Catalog",
        items: [
            { name: "Menu", path: "/menu", icon: "🍔" },
            { name: "Categories", path: null, icon: "🗂️" },
            { name: "Inventory", path: "/inventory", icon: "📦" },
            { name: "Expenses", path: "/expenses", icon: "💸" },
        ],
    },
    {
        label: "Team",
        items: [
            { name: "Staff", path: "/admin/staff", icon: "🧑‍🍳" },
        ],
    },
    {
        label: "Insights",
        items: [
            { name: "Reports", path: "/reports", icon: "📈" },
        ],
    },
    {
        label: "System",
        items: [
            { name: "Settings", path: null, icon: "⚙️" },
        ],
    },
];

function NavItem({ item, currentPath, onClick }) {
    const isActive = currentPath === item.path;

    if (!item.path) {
        return (
            <div className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-blue-50/30 cursor-not-allowed">
                <span className="text-lg leading-none opacity-50">{item.icon}</span>
                <span>{item.name}</span>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide bg-white/10 px-1.5 py-0.5 rounded-md">
                    Soon
                </span>
            </div>
        );
    }

    return (
        <Link
            to={item.path}
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                    ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md"
                    : "text-blue-50/80 hover:bg-white/10 hover:text-white"
                }`}
        >
            <span className="text-lg leading-none">{item.icon}</span>
            <span>{item.name}</span>
        </Link>
    );
}

export default function Sidebar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { pathname } = useLocation();

    const closeMobile = () => setMobileOpen(false);

    const SidebarContent = (
        <div className="h-full w-64 bg-gradient-to-b from-blue-950 via-blue-900 to-slate-900 flex flex-col">
            {/* Brand */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-xl">
                    ☕
                </div>
                <div>
                    <h1 className="text-white font-extrabold text-lg tracking-tight leading-none">
                        CafeFlow
                    </h1>
                    <p className="text-blue-200/70 text-xs mt-1">Restaurant Manager</p>
                </div>
            </div>

            {/* Nav sections */}
            <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
                {NAV_SECTIONS.map((section) => (
                    <div key={section.label}>
                        <p className="px-4 mb-2 text-[11px] font-bold uppercase tracking-wider text-blue-300/60">
                            {section.label}
                        </p>
                        <div className="space-y-1">
                            {section.items.map((item) => (
                                <NavItem
                                    key={item.name}
                                    item={item}
                                    currentPath={pathname}
                                    onClick={closeMobile}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer / logout */}
            <div className="px-3 py-4 border-t border-white/10">
                <Link
                    to="/login"
                    onClick={closeMobile}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-blue-50/80 hover:bg-white/10 hover:text-white transition-all"
                >
                    <span className="text-lg leading-none">🚪</span>
                    <span>Log Out</span>
                </Link>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:block h-screen sticky top-0 shrink-0">
                {SidebarContent}
            </aside>

            {/* Mobile top bar + toggle */}
            <div className="lg:hidden flex items-center justify-between bg-blue-900 px-4 py-3 sticky top-0 z-40">
                <div className="flex items-center gap-2 text-white font-bold">
                    <span>☕</span> CafeFlow
                </div>
                <button
                    onClick={() => setMobileOpen(true)}
                    className="text-white text-2xl leading-none px-2"
                    aria-label="Open menu"
                >
                    ☰
                </button>
            </div>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeMobile}
                    />
                    <div className="relative z-10">
                        {SidebarContent}
                    </div>
                    <button
                        onClick={closeMobile}
                        className="absolute top-4 right-4 z-20 text-white text-2xl bg-black/20 w-9 h-9 rounded-full"
                        aria-label="Close menu"
                    >
                        ✕
                    </button>
                </div>
            )}
        </>
    );
}