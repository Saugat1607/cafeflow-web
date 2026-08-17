import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import * as menuApi from '../../menu/api/menuApi';
import * as tablesApi from '../../tables/api/tablesApi';
import * as orderApi from '../api/ordersApi';

export default function OrderPage() {
    const [menuItems, setMenuItems] = useState([]);
    const [tables, setTables] = useState([]);
    const [cart, setCart] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [selectedTableId, setSelectedTableId] = useState('');

    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');

    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

    const [error, setError] = useState('');

    // ============================================================
    // LOAD MENU + TABLES
    // ============================================================

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError('');

                const [menuRes, tablesRes] = await Promise.all([
                    menuApi.getMenuItems(),
                    tablesApi.getTables(),
                ]);

                setMenuItems(menuRes?.data?.data || []);
                setTables(tablesRes?.data?.data || []);
            } catch (err) {
                console.error(err);

                setError(
                    'Could not load the menu or tables. Check your connection and try again.'
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // ============================================================
    // CATEGORIES
    // ============================================================

    const categories = useMemo(() => {
        const uniqueCategories = [
            ...new Set(
                menuItems
                    .map((item) => item.category)
                    .filter(Boolean)
                    .map((category) => category.trim())
            ),
        ];

        return uniqueCategories.sort((a, b) =>
            a.localeCompare(b)
        );
    }, [menuItems]);

    // ============================================================
    // FILTER MENU
    // ============================================================

    const filteredMenuItems = useMemo(() => {
        const query = search.trim().toLowerCase();

        return menuItems.filter((item) => {
            const itemName =
                item.name?.toLowerCase() || '';

            const itemDescription =
                item.description?.toLowerCase() || '';

            const itemCategory =
                item.category?.toLowerCase() || '';

            const matchesSearch =
                !query ||
                itemName.includes(query) ||
                itemDescription.includes(query) ||
                itemCategory.includes(query);

            const matchesCategory =
                category === 'all' ||
                item.category === category;

            return matchesSearch && matchesCategory;
        });
    }, [menuItems, category, search]);

    // ============================================================
    // GROUP ITEMS BY CATEGORY
    // ============================================================

    const groupedMenu = useMemo(() => {
        const groups = {};

        filteredMenuItems.forEach((item) => {
            const itemCategory =
                item.category || 'Other';

            if (!groups[itemCategory]) {
                groups[itemCategory] = [];
            }

            groups[itemCategory].push(item);
        });

        return groups;
    }, [filteredMenuItems]);

    // ============================================================
    // ADD ITEM
    // ============================================================

    const addToCart = (item) => {
        setCart((currentCart) => {
            const existingItem = currentCart.find(
                (cartItem) =>
                    cartItem.id === item.id
            );

            if (existingItem) {
                return currentCart.map((cartItem) =>
                    cartItem.id === item.id
                        ? {
                              ...cartItem,
                              quantity:
                                  cartItem.quantity + 1,
                          }
                        : cartItem
                );
            }

            return [
                ...currentCart,
                {
                    ...item,
                    quantity: 1,
                },
            ];
        });

        setError('');
    };

    // ============================================================
    // INCREASE
    // ============================================================

    const increaseQuantity = (id) => {
        setCart((currentCart) =>
            currentCart.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          quantity:
                              item.quantity + 1,
                      }
                    : item
            )
        );
    };

    // ============================================================
    // DECREASE
    // ============================================================

    const decreaseQuantity = (id) => {
        setCart((currentCart) =>
            currentCart
                .map((item) => {
                    if (item.id !== id) {
                        return item;
                    }

                    const newQuantity =
                        item.quantity - 1;

                    return newQuantity > 0
                        ? {
                              ...item,
                              quantity:
                                  newQuantity,
                          }
                        : null;
                })
                .filter(Boolean)
        );
    };

    // ============================================================
    // REMOVE
    // ============================================================

    const removeFromCart = (id) => {
        setCart((currentCart) =>
            currentCart.filter(
                (item) => item.id !== id
            )
        );
    };

    // ============================================================
    // CLEAR CART
    // ============================================================

    const clearCart = () => {
        setCart([]);
    };

    // ============================================================
    // ITEM QUANTITY
    // ============================================================

    const getItemQuantity = (id) => {
        const item = cart.find(
            (cartItem) => cartItem.id === id
        );

        return item?.quantity || 0;
    };

    // ============================================================
    // TOTAL ITEMS
    // ============================================================

    const totalItems = useMemo(() => {
        return cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );
    }, [cart]);

    // ============================================================
    // TOTAL PRICE
    // ============================================================

    const totalPrice = useMemo(() => {
        return cart.reduce(
            (total, item) =>
                total +
                Number(item.price) *
                    item.quantity,
            0
        );
    }, [cart]);

    // ============================================================
    // SELECTED TABLE NAME
    // ============================================================

    const selectedTableName = useMemo(() => {
        const table = tables.find(
            (table) =>
                String(table.id) ===
                String(selectedTableId)
        );

        if (!table) {
            return 'No table selected';
        }

        return (
            table.number ??
            table.name ??
            `Table ${table.id}`
        );
    }, [tables, selectedTableId]);

    // ============================================================
    // CHECKOUT
    // ============================================================

    const handleCheckout = async () => {
        if (cart.length === 0) {
            setError(
                'Please add at least one item to the order.'
            );

            return;
        }

        if (!selectedTableId) {
            setError(
                'Please select a table before placing the order.'
            );

            return;
        }

        try {
            setSubmitting(true);
            setError('');

            const orderPayload = {
                restaurant_table_id:
                    Number(selectedTableId),

                items: cart.map((item) => ({
                    menu_item_id: item.id,
                    quantity: item.quantity,
                })),
            };

            await orderApi.createOrder(
                orderPayload
            );

            alert(
                'Order placed successfully!'
            );

            setCart([]);
            setSelectedTableId('');
            setIsMobileCartOpen(false);
        } catch (err) {
            console.error(err);

            const message =
                err?.response?.data?.message ||
                'Failed to place order. Please try again.';

            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return <LoadingScreen />;
    }

    // ============================================================
    // ERROR
    // ============================================================

    if (error && menuItems.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8F6F1] px-6">
                <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                        <AlertIcon />
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-stone-900">
                        Something went wrong
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-stone-500">
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            window.location.reload()
                        }
                        className="mt-6 rounded-xl bg-amber-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-800"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ============================================================
    // MAIN UI
    // ============================================================

    return (
        <div className="min-h-screen bg-[#F8F6F1]">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">

                <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        {/* TITLE */}

                        <div className="flex items-center gap-3">

                            <Link
                                to="/"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                                title="Back to Dashboard"
                            >
                                <ArrowLeftIcon />
                            </Link>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
                                    CafeFlow POS
                                </p>

                                <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">
                                    New Order
                                </h1>
                            </div>

                        </div>

                        {/* TABLE */}

                        <div className="flex items-center gap-3">

                            <div className="hidden text-right sm:block">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                                    Ordering for
                                </p>

                                <p className="text-sm font-semibold text-stone-800">
                                    Select Table
                                </p>
                            </div>

                            <div className="relative">

                                <TableIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-700" />

                                <select
                                    value={
                                        selectedTableId
                                    }
                                    onChange={(e) =>
                                        setSelectedTableId(
                                            e.target.value
                                        )
                                    }
                                    className="min-w-[190px] appearance-none rounded-xl border border-stone-200 bg-[#FAF9F6] py-3 pl-10 pr-10 text-sm font-semibold text-stone-800 outline-none transition focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-100"
                                >
                                    <option value="">
                                        Select table
                                    </option>

                                    {tables.map(
                                        (table) => (
                                            <option
                                                key={
                                                    table.id
                                                }
                                                value={
                                                    table.id
                                                }
                                            >
                                                {table.number ??
                                                    table.name ??
                                                    `Table ${table.id}`}
                                            </option>
                                        )
                                    )}
                                </select>

                                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

                            </div>

                        </div>

                    </div>

                </div>

            </header>

            {/* =====================================================
                MAIN
            ====================================================== */}

            <main className="mx-auto max-w-[1600px] px-4 py-5 pb-28 sm:px-6 lg:px-8 lg:pb-8">

                {/* ERROR */}

                {error && (
                    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                        <AlertIcon />

                        <span className="flex-1">
                            {error}
                        </span>

                        <button
                            onClick={() =>
                                setError('')
                            }
                            className="rounded-lg p-1 hover:bg-red-100"
                        >
                            <CloseIcon />
                        </button>

                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">

                    {/* =================================================
                        MENU
                    ================================================== */}

                    <section className="min-w-0">

                        {/* SEARCH */}

                        <div className="mb-4 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm sm:p-4">

                            <div className="relative">

                                <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search food or drink..."
                                    className="w-full rounded-xl border border-stone-200 bg-[#FAF9F6] py-3.5 pl-11 pr-11 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                                />

                                {search && (
                                    <button
                                        onClick={() =>
                                            setSearch(
                                                ''
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                                    >
                                        <CloseIcon />
                                    </button>
                                )}

                            </div>

                        </div>

                        {/* CATEGORY NAVIGATION */}

                        <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">

                            <div className="flex gap-2 overflow-x-auto">

                                <CategoryButton
                                    label="All"
                                    count={
                                        menuItems.length
                                    }
                                    active={
                                        category ===
                                        'all'
                                    }
                                    onClick={() =>
                                        setCategory(
                                            'all'
                                        )
                                    }
                                />

                                {categories.map(
                                    (cat) => {
                                        const count =
                                            menuItems.filter(
                                                (
                                                    item
                                                ) =>
                                                    item.category ===
                                                    cat
                                            ).length;

                                        return (
                                            <CategoryButton
                                                key={
                                                    cat
                                                }
                                                label={
                                                    cat
                                                }
                                                count={
                                                    count
                                                }
                                                active={
                                                    category ===
                                                    cat
                                                }
                                                onClick={() =>
                                                    setCategory(
                                                        cat
                                                    )
                                                }
                                            />
                                        );
                                    }
                                )}

                            </div>

                        </div>

                        {/* MENU ITEMS */}

                        {filteredMenuItems.length ===
                        0 ? (
                            <EmptyMenu
                                search={search}
                            />
                        ) : category === 'all' ? (
                            <div className="space-y-8">

                                {Object.entries(
                                    groupedMenu
                                ).map(
                                    ([
                                        groupName,
                                        items,
                                    ]) => (
                                        <MenuCategory
                                            key={
                                                groupName
                                            }
                                            category={
                                                groupName
                                            }
                                            items={
                                                items
                                            }
                                            getQuantity={
                                                getItemQuantity
                                            }
                                            onAdd={
                                                addToCart
                                            }
                                            onIncrease={
                                                increaseQuantity
                                            }
                                            onDecrease={
                                                decreaseQuantity
                                            }
                                        />
                                    )
                                )}

                            </div>
                        ) : (
                            <MenuCategory
                                category={category}
                                items={
                                    filteredMenuItems
                                }
                                getQuantity={
                                    getItemQuantity
                                }
                                onAdd={addToCart}
                                onIncrease={
                                    increaseQuantity
                                }
                                onDecrease={
                                    decreaseQuantity
                                }
                            />
                        )}

                    </section>

                    {/* =================================================
                        DESKTOP CART
                    ================================================== */}

                    <aside className="hidden lg:sticky lg:top-[92px] lg:block lg:h-[calc(100vh-112px)]">

                        <BillSummary
                            tables={tables}
                            selectedTableId={
                                selectedTableId
                            }
                            setSelectedTableId={
                                setSelectedTableId
                            }
                            selectedTableName={
                                selectedTableName
                            }
                            cart={cart}
                            totalItems={
                                totalItems
                            }
                            totalPrice={
                                totalPrice
                            }
                            increaseQuantity={
                                increaseQuantity
                            }
                            decreaseQuantity={
                                decreaseQuantity
                            }
                            removeFromCart={
                                removeFromCart
                            }
                            clearCart={clearCart}
                            handleCheckout={
                                handleCheckout
                            }
                            submitting={
                                submitting
                            }
                        />

                    </aside>

                </div>

            </main>

            {/* =====================================================
                MOBILE BOTTOM CART
            ====================================================== */}

            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-800 bg-stone-900 p-3 shadow-2xl lg:hidden sm:p-4">

                    <div className="flex items-center gap-3">

                        <div className="flex-1">

                            <p className="text-xs text-stone-400">
                                {totalItems}{' '}
                                {totalItems === 1
                                    ? 'item'
                                    : 'items'}
                            </p>

                            <p className="text-lg font-bold text-white">
                                Rs.{' '}
                                {totalPrice.toFixed(
                                    2
                                )}
                            </p>

                        </div>

                        <button
                            onClick={() =>
                                setIsMobileCartOpen(
                                    true
                                )
                            }
                            className="rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-500"
                        >
                            View Order
                        </button>

                    </div>

                </div>
            )}

            {/* =====================================================
                MOBILE CART DRAWER
            ====================================================== */}

            {isMobileCartOpen && (
                <div className="fixed inset-0 z-50 flex items-end bg-black/50 lg:hidden">

                    <div className="flex max-h-[90vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                                    CafeFlow
                                </p>

                                <h2 className="text-lg font-bold text-stone-900">
                                    Current Order
                                </h2>
                            </div>

                            <button
                                onClick={() =>
                                    setIsMobileCartOpen(
                                        false
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200"
                            >
                                <CloseIcon />
                            </button>

                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-5">

                            <BillSummary
                                tables={tables}
                                selectedTableId={
                                    selectedTableId
                                }
                                setSelectedTableId={
                                    setSelectedTableId
                                }
                                selectedTableName={
                                    selectedTableName
                                }
                                cart={cart}
                                totalItems={
                                    totalItems
                                }
                                totalPrice={
                                    totalPrice
                                }
                                increaseQuantity={
                                    increaseQuantity
                                }
                                decreaseQuantity={
                                    decreaseQuantity
                                }
                                removeFromCart={
                                    removeFromCart
                                }
                                clearCart={
                                    clearCart
                                }
                                handleCheckout={
                                    handleCheckout
                                }
                                submitting={
                                    submitting
                                }
                            />

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

/* ================================================================
   MENU CATEGORY
================================================================ */

function MenuCategory({
    category,
    items,
    getQuantity,
    onAdd,
    onIncrease,
    onDecrease,
}) {
    return (
        <section>

            <div className="mb-4 flex items-center gap-3">

                <div className="h-7 w-1 rounded-full bg-amber-700" />

                <h2 className="text-lg font-bold text-stone-900">
                    {category}
                </h2>

                <span className="rounded-full bg-stone-100 px-2 py-1 text-[10px] font-bold text-stone-500">
                    {items.length}
                </span>

                <div className="h-px flex-1 bg-stone-200" />

            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">

                {items.map((item) => (
                    <MenuItemCard
                        key={item.id}
                        item={item}
                        quantity={getQuantity(
                            item.id
                        )}
                        onAdd={() =>
                            onAdd(item)
                        }
                        onIncrease={() =>
                            onIncrease(
                                item.id
                            )
                        }
                        onDecrease={() =>
                            onDecrease(
                                item.id
                            )
                        }
                    />
                ))}

            </div>

        </section>
    );
}

/* ================================================================
   MENU ITEM CARD
================================================================ */

function MenuItemCard({
    item,
    quantity,
    onAdd,
    onIncrease,
    onDecrease,
}) {
    const selected = quantity > 0;

    return (
        <div
            className={`group relative flex min-h-[165px] flex-col rounded-2xl border bg-white p-4 shadow-sm transition ${
                selected
                    ? 'border-amber-400 ring-2 ring-amber-100'
                    : 'border-stone-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md'
            }`}
        >

            {/* QUANTITY BADGE */}

            {selected && (
                <div className="absolute right-3 top-3 flex h-7 min-w-7 items-center justify-center rounded-full bg-amber-700 px-2 text-xs font-bold text-white">
                    {quantity}
                </div>
            )}

            {/* ITEM */}

            <button
                type="button"
                onClick={onAdd}
                className="text-left"
            >
                <h3 className="pr-9 font-bold text-stone-900 group-hover:text-amber-800">
                    {item.name}
                </h3>

                {item.description && (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">
                        {item.description}
                    </p>
                )}
            </button>

            {/* BOTTOM */}

            <div className="mt-auto flex items-end justify-between gap-3 pt-5">

                <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                        Price
                    </p>

                    <p className="text-base font-bold text-emerald-700">
                        Rs.{' '}
                        {Number(
                            item.price
                        ).toFixed(2)}
                    </p>
                </div>

                {!selected ? (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-700 hover:text-white"
                    >
                        <PlusIcon />
                        Add
                    </button>
                ) : (
                    <div className="flex items-center overflow-hidden rounded-lg border border-stone-200 bg-[#FAF9F6]">

                        <button
                            type="button"
                            onClick={
                                onDecrease
                            }
                            className="flex h-9 w-9 items-center justify-center text-stone-600 hover:bg-stone-100 hover:text-red-600"
                        >
                            <MinusIcon />
                        </button>

                        <span className="flex h-9 min-w-8 items-center justify-center text-xs font-bold text-stone-900">
                            {quantity}
                        </span>

                        <button
                            type="button"
                            onClick={
                                onIncrease
                            }
                            className="flex h-9 w-9 items-center justify-center text-amber-700 hover:bg-amber-50"
                        >
                            <PlusIcon />
                        </button>

                    </div>
                )}

            </div>

        </div>
    );
}

/* ================================================================
   CATEGORY BUTTON
================================================================ */

function CategoryButton({
    label,
    count,
    active,
    onClick,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                active
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-amber-50 hover:text-amber-800'
            }`}
        >
            <span>{label}</span>

            <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                    active
                        ? 'bg-white/20 text-white'
                        : 'bg-stone-100 text-stone-500'
                }`}
            >
                {count}
            </span>
        </button>
    );
}

/* ================================================================
   BILL SUMMARY
================================================================ */

function BillSummary({
    tables,
    selectedTableId,
    setSelectedTableId,
    selectedTableName,
    cart,
    totalItems,
    totalPrice,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    handleCheckout,
    submitting,
}) {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">

            {/* HEADER */}

            <div className="border-b border-stone-200 p-5">

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                            <ReceiptIcon />
                        </div>

                        <div>

                            <h2 className="font-bold text-stone-900">
                                Current Order
                            </h2>

                            <p className="text-xs text-stone-500">
                                {totalItems}{' '}
                                {totalItems === 1
                                    ? 'item'
                                    : 'items'}
                            </p>

                        </div>

                    </div>

                    {cart.length > 0 && (
                        <button
                            type="button"
                            onClick={clearCart}
                            className="text-xs font-bold text-stone-400 hover:text-red-600"
                        >
                            Clear
                        </button>
                    )}

                </div>

            </div>

            {/* TABLE */}

            <div className="border-b border-stone-100 p-5">

                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Table
                </label>

                <div className="relative">

                    <TableIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-700" />

                    <select
                        value={
                            selectedTableId
                        }
                        onChange={(e) =>
                            setSelectedTableId(
                                e.target.value
                            )
                        }
                        className="w-full appearance-none rounded-xl border border-stone-200 bg-[#FAF9F6] py-3 pl-10 pr-10 text-sm font-semibold text-stone-800 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                    >
                        <option value="">
                            Select a table
                        </option>

                        {tables.map(
                            (table) => (
                                <option
                                    key={
                                        table.id
                                    }
                                    value={
                                        table.id
                                    }
                                >
                                    {table.number ??
                                        table.name ??
                                        `Table ${table.id}`}
                                </option>
                            )
                        )}
                    </select>

                    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

                </div>

                {selectedTableId && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                        <CheckCircleIcon />
                        Order for {selectedTableName}
                    </div>
                )}

            </div>

            {/* ITEMS */}

            <div className="min-h-0 flex-1 overflow-y-auto">

                {cart.length === 0 ? (
                    <div className="flex h-full min-h-[300px] flex-col items-center justify-center px-6 text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
                            <ReceiptIcon className="h-7 w-7" />
                        </div>

                        <h3 className="mt-4 font-bold text-stone-800">
                            No items yet
                        </h3>

                        <p className="mt-2 max-w-[220px] text-xs leading-5 text-stone-500">
                            Click an item from the menu to add it to the order.
                        </p>

                    </div>
                ) : (
                    <div className="divide-y divide-stone-100">

                        {cart.map(
                            (item) => (
                                <CartItem
                                    key={
                                        item.id
                                    }
                                    item={
                                        item
                                    }
                                    onIncrease={() =>
                                        increaseQuantity(
                                            item.id
                                        )
                                    }
                                    onDecrease={() =>
                                        decreaseQuantity(
                                            item.id
                                        )
                                    }
                                    onRemove={() =>
                                        removeFromCart(
                                            item.id
                                        )
                                    }
                                />
                            )
                        )}

                    </div>
                )}

            </div>

            {/* TOTAL */}

            <div className="border-t border-stone-200 bg-[#FAF9F6] p-5">

                <div className="mb-2 flex justify-between text-sm text-stone-500">
                    <span>Items</span>
                    <span className="font-semibold text-stone-700">
                        {totalItems}
                    </span>
                </div>

                <div className="mb-4 flex items-end justify-between">

                    <span className="font-bold text-stone-800">
                        Total
                    </span>

                    <span className="text-2xl font-bold text-emerald-700">
                        Rs.{' '}
                        {totalPrice.toFixed(
                            2
                        )}
                    </span>

                </div>

                <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={
                        submitting ||
                        cart.length === 0 ||
                        !selectedTableId
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
                >
                    {submitting ? (
                        <>
                            <SpinnerIcon />
                            Processing...
                        </>
                    ) : (
                        <>
                            <CheckIcon />
                            Place Order
                        </>
                    )}
                </button>

                {!selectedTableId &&
                    cart.length > 0 && (
                        <p className="mt-2 text-center text-xs text-red-500">
                            Select a table first.
                        </p>
                    )}

            </div>

        </div>
    );
}

/* ================================================================
   CART ITEM
================================================================ */

function CartItem({
    item,
    onIncrease,
    onDecrease,
    onRemove,
}) {
    const lineTotal =
        Number(item.price) *
        item.quantity;

    return (
        <div className="p-4">

            <div className="flex gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <FoodIcon />
                </div>

                <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-2">

                        <div className="min-w-0">

                            <h3 className="truncate text-sm font-bold text-stone-900">
                                {item.name}
                            </h3>

                            <p className="text-[11px] text-stone-400">
                                Rs.{' '}
                                {Number(
                                    item.price
                                ).toFixed(
                                    2
                                )}{' '}
                                each
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={
                                onRemove
                            }
                            className="text-stone-300 hover:text-red-500"
                        >
                            <CloseIcon />
                        </button>

                    </div>

                    <div className="mt-3 flex items-center justify-between">

                        <div className="flex items-center overflow-hidden rounded-lg border border-stone-200 bg-[#FAF9F6]">

                            <button
                                type="button"
                                onClick={
                                    onDecrease
                                }
                                className="flex h-8 w-8 items-center justify-center text-stone-600 hover:bg-stone-100 hover:text-red-600"
                            >
                                <MinusIcon />
                            </button>

                            <span className="flex h-8 min-w-8 items-center justify-center text-xs font-bold text-stone-900">
                                {
                                    item.quantity
                                }
                            </span>

                            <button
                                type="button"
                                onClick={
                                    onIncrease
                                }
                                className="flex h-8 w-8 items-center justify-center text-amber-700 hover:bg-amber-50"
                            >
                                <PlusIcon />
                            </button>

                        </div>

                        <span className="text-sm font-bold text-stone-900">
                            Rs.{' '}
                            {lineTotal.toFixed(
                                2
                            )}
                        </span>

                    </div>

                </div>

            </div>

        </div>
    );
}

/* ================================================================
   EMPTY MENU
================================================================ */

function EmptyMenu({ search }) {
    return (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <SearchIcon />
            </div>

            <h3 className="mt-5 text-lg font-bold text-stone-900">
                No menu items found
            </h3>

            <p className="mt-2 text-sm text-stone-500">
                {search
                    ? `No items match "${search}".`
                    : 'No menu items are available.'}
            </p>

        </div>
    );
}

/* ================================================================
   LOADING SCREEN
================================================================ */

function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[#F8F6F1]">

            <div className="border-b border-stone-200 bg-white">

                <div className="mx-auto max-w-[1600px] px-6 py-5">

                    <div className="h-8 w-48 animate-pulse rounded-lg bg-stone-200" />

                </div>

            </div>

            <div className="mx-auto max-w-[1600px] p-6">

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">

                    <div className="space-y-5">

                        <div className="h-14 animate-pulse rounded-2xl bg-white" />

                        <div className="h-12 animate-pulse rounded-2xl bg-white" />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

                            {Array.from({
                                length: 6,
                            }).map(
                                (_, index) => (
                                    <div
                                        key={
                                            index
                                        }
                                        className="h-40 animate-pulse rounded-2xl bg-white"
                                    />
                                )
                            )}

                        </div>

                    </div>

                    <div className="hidden h-[650px] animate-pulse rounded-3xl bg-white lg:block" />

                </div>

            </div>

        </div>
    );
}

/* ================================================================
   ICONS
================================================================ */

function ArrowLeftIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m15 18-6-6 6-6" />
        </svg>
    );
}

function SearchIcon({
    className = 'h-5 w-5',
}) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle
                cx="11"
                cy="11"
                r="7"
            />
            <path d="m20 20-4-4" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
        >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </svg>
    );
}

function MinusIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
        >
            <path d="M5 12h14" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <path d="M6 6l12 12" />
            <path d="M18 6 6 18" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m5 12 4 4L19 6" />
        </svg>
    );
}

function CheckCircleIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle
                cx="12"
                cy="12"
                r="9"
            />
            <path d="m8 12 2.5 2.5L16 9" />
        </svg>
    );
}

function AlertIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.3 3.8 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
        </svg>
    );
}

function SpinnerIcon() {
    return (
        <svg
            className="h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="3"
                opacity="0.25"
            />

            <path
                d="M21 12a9 9 0 0 1-9 9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}

function TableIcon({
    className = 'h-5 w-5',
}) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect
                x="3"
                y="7"
                width="18"
                height="4"
                rx="1"
            />

            <path d="M6 11v7" />
            <path d="M18 11v7" />
            <path d="M4 18h4" />
            <path d="M16 18h4" />
        </svg>
    );
}

function ReceiptIcon({
    className = 'h-5 w-5',
}) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z" />
            <path d="M8 7h8" />
            <path d="M8 11h8" />
            <path d="M8 15h5" />
        </svg>
    );
}

function FoodIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M7 3v8" />
            <path d="M10 3v8" />
            <path d="M8.5 3v18" />
            <path d="M7 11h3" />
            <path d="M16 3v18" />
            <path d="M16 3c3 1 4 3.5 4 6v2h-4" />
        </svg>
    );
}

function ChevronDownIcon({
    className = 'h-4 w-4',
}) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}