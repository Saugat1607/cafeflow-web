import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as menuApi from '../../menu/api/menuApi';
import * as tablesApi from '../../tables/api/tablesApi';
import * as orderApi from '../api/ordersApi';

export default function OrderPage() {
    const [menuItems, setMenuItems] = useState([]);
    const [tables, setTables] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTableId, setSelectedTableId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([
            menuApi.getMenuItems(),
            tablesApi.getTables(), // adjust this call if your tablesApi exports a different function name
        ])
            .then(([menuRes, tablesRes]) => {
                setMenuItems(menuRes.data.data);
                setTables(tablesRes.data.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError('Could not load the menu or tables. Check your connection and try again.');
                setLoading(false);
            });
    }, []);

    const addToCart = (item) => {
        setCart((prevCart) => {
            const existing = prevCart.find((cartItem) => cartItem.id === item.id);
            if (existing) {
                return prevCart.map((cartItem) =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
    };

    const updateQuantity = (id, delta) => {
        setCart((prevCart) => {
            return prevCart.map((item) => {
                if (item.id === id) {
                    const newQty = item.quantity + delta;
                    return newQty > 0 ? { ...item, quantity: newQty } : null;
                }
                return item;
            }).filter(Boolean);
        });
    };

    const totalPrice = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = () => {
        if (cart.length === 0) return alert('Cart is empty!');
        if (!selectedTableId) return alert('Please select a table.');

        setSubmitting(true);

        // Matches StoreOrderRequest exactly — no totalAmount, snake_case keys,
        // and restaurant_table_id is a real id, not a typed table name.
        const orderPayload = {
            restaurant_table_id: Number(selectedTableId),
            items: cart.map((i) => ({ menu_item_id: i.id, quantity: i.quantity })),
        };

        orderApi.createOrder(orderPayload)
            .then(() => {
                alert('Order placed successfully!');
                setCart([]);
                setSelectedTableId('');
                setIsMobileCartOpen(false);
                setSubmitting(false);
            })
            .catch((err) => {
                const message = err?.response?.data?.message || 'Failed to place order';
                alert(message);
                setSubmitting(false);
            });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-stone-500">Loading menu catalog...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row relative">

            {/* Left Side: Menu Grid (Expands to fill available width) */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link to="/" className="text-xs font-semibold text-stone-500 hover:text-amber-700 transition uppercase tracking-wider">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-800 mt-1">Order (POS)</h1>
                    </div>
                </div>

                {/* Responsive Grid for Menu items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {menuItems.map((item) => (
                        <div key={item.id} className="bg-white p-5 rounded-2xl border border-stone-200/60 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                            <div>
                                <h3 className="font-bold text-stone-800 text-base">{item.name}</h3>
                                <p className="text-xs text-stone-500 line-clamp-2 mt-1">{item.description}</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm font-extrabold text-amber-700">Rs {Number(item.price).toFixed(2)}</span>
                                <button
                                    onClick={() => addToCart(item)}
                                    className="bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-amber-800 transition shadow-xs"
                                >
                                    + Add
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side: Desktop Bill Summary */}
            <div className="hidden lg:flex w-96 bg-white border-l border-stone-200 p-6 flex-col justify-between sticky top-0 h-screen shadow-sm">
                <BillSummaryContent
                    tables={tables}
                    selectedTableId={selectedTableId}
                    setSelectedTableId={setSelectedTableId}
                    cart={cart}
                    updateQuantity={updateQuantity}
                    totalPrice={totalPrice}
                    handleCheckout={handleCheckout}
                    submitting={submitting}
                />
            </div>

            {/* Mobile Floating Bottom Bar */}
            {cart.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-stone-900 text-white p-4 flex items-center justify-between shadow-2xl z-40 border-t border-stone-800">
                    <div>
                        <p className="text-xs text-stone-400">{totalItemsCount} item{totalItemsCount > 1 ? 's' : ''} in bill</p>
                        <p className="text-lg font-bold text-emerald-400">Rs {totalPrice.toFixed(2)}</p>
                    </div>
                    <button
                        onClick={() => setIsMobileCartOpen(true)}
                        className="bg-amber-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md hover:bg-amber-500 transition"
                    >
                        View Bill & Checkout
                    </button>
                </div>
            )}

            {/* Mobile Fullscreen Slide-Up Cart Drawer */}
            {isMobileCartOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-stone-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center pb-4 border-b">
                            <h2 className="text-lg font-bold text-stone-800">Current Bill</h2>
                            <button
                                onClick={() => setIsMobileCartOpen(false)}
                                className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-4">
                            <BillSummaryContent
                                tables={tables}
                                selectedTableId={selectedTableId}
                                setSelectedTableId={setSelectedTableId}
                                cart={cart}
                                updateQuantity={updateQuantity}
                                totalPrice={totalPrice}
                                handleCheckout={handleCheckout}
                                submitting={submitting}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Reusable Bill Component used for both Desktop sidebar and Mobile drawer
function BillSummaryContent({ tables, selectedTableId, setSelectedTableId, cart, updateQuantity, totalPrice, handleCheckout, submitting }) {
    return (
        <div className="flex flex-col h-full justify-between space-y-4">
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-stone-800 hidden lg:block border-b pb-2">Current Bill</h2>

                <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1 uppercase tracking-wider">Table</label>
                    <select
                        value={selectedTableId}
                        onChange={(e) => setSelectedTableId(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white transition"
                    >
                        <option value="">Select a table…</option>
                        {tables.map((table) => (
                            <option key={table.id} value={table.id}>
                                {table.number ?? table.name ?? `Table ${table.id}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-3 max-h-[40vh] lg:max-h-[50vh] overflow-y-auto pr-1">
                    {cart.length === 0 ? (
                        <div className="text-center py-12 text-stone-400 border border-dashed border-stone-200 rounded-2xl text-sm">
                            No items added to bill yet.
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm bg-stone-50 p-3 rounded-xl border border-stone-100">
                                <div className="flex-1 pr-2">
                                    <p className="font-bold text-stone-800">{item.name}</p>
                                    <p className="text-xs text-amber-700 font-semibold">Rs {Number(item.price).toFixed(2)} each</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 bg-white border border-stone-200 rounded-lg font-bold text-stone-600 hover:bg-stone-100 transition">-</button>
                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 bg-white border border-stone-200 rounded-lg font-bold text-stone-600 hover:bg-stone-100 transition">+</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center text-base font-bold text-stone-800">
                    <span>Total Amount:</span>
                    <span className="text-emerald-600 text-lg">Rs {totalPrice.toFixed(2)}</span>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={submitting || cart.length === 0 || !selectedTableId}
                    className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Processing Order...' : 'Place Order & Print Bill'}
                </button>
            </div>
        </div>
    );
}