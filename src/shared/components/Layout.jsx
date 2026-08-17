import Sidebar from "./Sidebar";

// Wrap any authenticated page with <Layout>...</Layout> so the sidebar
// (Dashboard, Orders, Invoices, Menu, Inventory, Expenses, Categories,
// Tables, Staff, Daily Balance, Reports, Settings) is always visible
// once the user is logged in.
export default function Layout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    );
}