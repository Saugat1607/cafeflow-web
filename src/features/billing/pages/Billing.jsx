import { useEffect, useMemo, useState } from "react";
import {
    Receipt,
    Search,
    Plus,
    Eye,
    Printer,
    CreditCard,
    Banknote,
    Smartphone,
    Trash2,
    X,
    CheckCircle2,
    Clock3,
    AlertCircle,
    RefreshCw,
} from "lucide-react";

import {
    getBills,
    createBill as createBillApi,
    deleteBill as deleteBillApi,
    payBill as payBillApi,
    getOrders,
} from "../api/billsApi";

/* ======================================================
   HELPERS
====================================================== */

const money = (value) =>
    `Rs. ${Number(value || 0).toLocaleString("en-NP", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const getBillItems = (bill) => {
    return Array.isArray(bill?.items) ? bill.items : [];
};

const getOrderItems = (order) => {
    return Array.isArray(order?.items) ? order.items : [];
};

const getItemName = (item) => {
    return (
        item?.item_name ||
        item?.menu_item?.name ||
        item?.menuItem?.name ||
        item?.menu?.name ||
        "Menu Item"
    );
};

const getTableNumber = (data) => {
    return (
        data?.table?.table_number ||
        data?.restaurant_table?.table_number ||
        data?.restaurantTable?.table_number ||
        data?.restaurant_table_id ||
        data?.table_id ||
        "N/A"
    );
};

const getOrderSubtotal = (order) => {
    if (!order) return 0;

    if (order.total !== undefined && order.total !== null) {
        return Number(order.total || 0);
    }

    return getOrderItems(order).reduce((sum, item) => {
        return (
            sum +
            Number(item.quantity || 0) *
                Number(item.unit_price || item.price || 0)
        );
    }, 0);
};

const statusStyles = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    partial: "bg-blue-50 text-blue-700 border-blue-200",
};

const paymentIcons = {
    cash: Banknote,
    card: CreditCard,
    esewa: Smartphone,
    khalti: Smartphone,
};

const paymentLabels = {
    cash: "Cash",
    card: "Card",
    esewa: "eSewa",
    khalti: "Khalti",
};

/* ======================================================
   MAIN BILLING COMPONENT
====================================================== */

export default function Billing() {
    const [bills, setBills] = useState([]);
    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [selectedBill, setSelectedBill] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [showCreate, setShowCreate] = useState(false);
    const [showView, setShowView] = useState(false);

    const [form, setForm] = useState({
        order_id: "",
        discount: 0,
        tax: 0,
        service_charge: 0,
        payment_method: "cash",
        paid_amount: 0,
        notes: "",
    });

    /* ==================================================
       RESET FORM
    ================================================== */

    const resetForm = () => {
        setForm({
            order_id: "",
            discount: 0,
            tax: 0,
            service_charge: 0,
            payment_method: "cash",
            paid_amount: 0,
            notes: "",
        });

        setSelectedOrder(null);
    };

    /* ==================================================
       LOAD BILLS
    ================================================== */

    const loadBills = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getBills({
                search: search || undefined,
                per_page: 50,
            });

            /*
             * Laravel pagination usually returns:
             *
             * {
             *   data: [...]
             * }
             *
             * Axios api helper may already return response.data.
             */

            let data = response;

            if (response?.data?.data) {
                data = response.data;
            }

            const billList = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                ? data.data
                : [];

            setBills(billList);
        } catch (err) {
            console.error("Failed to load bills:", err);

            setBills([]);

            setError(
                err?.response?.data?.message ||
                    "Unable to load bills."
            );
        } finally {
            setLoading(false);
        }
    };

    /* ==================================================
       LOAD ORDERS
    ================================================== */

    const loadOrders = async () => {
        try {
            setOrdersLoading(true);

            let response;

            /*
             * If billsApi.js has getOrders(), use it.
             */
            if (typeof getOrders === "function") {
                response = await getOrders({
                    per_page: 100,
                });
            } else {
                response = [];
            }

            let data = response;

            if (response?.data?.data) {
                data = response.data;
            }

            const orderList = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                ? data.data
                : [];

            setOrders(orderList);
        } catch (err) {
            console.error("Failed to load orders:", err);
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    };

    /* ==================================================
       INITIAL LOAD
    ================================================== */

    useEffect(() => {
        loadBills();
        loadOrders();
    }, []);

    /* ==================================================
       SELECT ORDER
    ================================================== */

    const handleSelectOrder = (order) => {
        setSelectedOrder(order);

        setForm({
            order_id: order.id,
            discount: 0,
            tax: 0,
            service_charge: 0,
            payment_method: "cash",
            paid_amount: 0,
            notes: "",
        });
    };

    /* ==================================================
       CALCULATIONS
    ================================================== */

    const orderSubtotal = useMemo(() => {
        if (!selectedOrder) return 0;

        return getOrderItems(selectedOrder).reduce(
            (sum, item) => {
                return (
                    sum +
                    Number(item.quantity || 0) *
                        Number(
                            item.unit_price ||
                                item.price ||
                                0
                        )
                );
            },
            0
        );
    }, [selectedOrder]);

    const discount = Math.max(
        0,
        Number(form.discount || 0)
    );

    const tax = Math.max(
        0,
        Number(form.tax || 0)
    );

    const serviceCharge = Math.max(
        0,
        Number(form.service_charge || 0)
    );

    const total = Math.max(
        0,
        orderSubtotal -
            discount +
            tax +
            serviceCharge
    );

    const paidAmount = Math.max(
        0,
        Number(form.paid_amount || 0)
    );

    const change = Math.max(
        0,
        paidAmount - total
    );

    /* ==================================================
       CREATE BILL
    ================================================== */

    const handleCreateBill = async () => {
        if (!selectedOrder) {
            alert("Please select an order.");
            return;
        }

        if (!form.order_id) {
            alert("Order ID is required.");
            return;
        }

        if (paidAmount > 0 && paidAmount < total) {
            const continuePartial = window.confirm(
                `Paid amount is ${money(
                    paidAmount
                )}, but the bill total is ${money(
                    total
                )}.\n\nDo you want to create a partial payment?`
            );

            if (!continuePartial) {
                return;
            }
        }

        try {
            setSaving(true);

            const payload = {
                order_id: Number(form.order_id),
                discount: discount,
                tax: tax,
                service_charge: serviceCharge,
                payment_method:
                    form.payment_method,
                paid_amount: paidAmount,
                notes: form.notes?.trim() || null,
            };

            const response =
                await createBillApi(payload);

            /*
             * Depending on Laravel response:
             *
             * { bill: {...} }
             * OR
             * {...bill}
             */

            const newBill =
                response?.bill ||
                response?.data?.bill ||
                response?.data ||
                response;

            if (!newBill || !newBill.id) {
                throw new Error(
                    "Bill was created but the server returned invalid bill data."
                );
            }

            setBills((prev) => [
                newBill,
                ...prev.filter(
                    (bill) =>
                        bill.id !== newBill.id
                ),
            ]);

            setSelectedBill(newBill);

            resetForm();

            setShowCreate(false);

            alert(
                "Bill created successfully."
            );
        } catch (err) {
            console.error(
                "Create bill error:",
                err
            );

            alert(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to create bill."
            );
        } finally {
            setSaving(false);
        }
    };

    /* ==================================================
       PAY BILL
    ================================================== */

    const handlePayBill = async (bill) => {
        const amount = window.prompt(
            `Bill Total: ${money(
                bill.total
            )}\n\nEnter paid amount:`,
            String(
                Number(bill.total || 0) -
                    Number(
                        bill.paid_amount || 0
                    )
            )
        );

        if (amount === null) return;

        const numericAmount =
            Number(amount);

        if (
            !Number.isFinite(
                numericAmount
            ) ||
            numericAmount <= 0
        ) {
            alert(
                "Please enter a valid payment amount."
            );
            return;
        }

        const paymentMethod =
            window.prompt(
                "Payment method:\ncash / card / esewa / khalti",
                bill.payment_method ||
                    "cash"
            );

        if (paymentMethod === null) {
            return;
        }

        const normalizedMethod =
            paymentMethod
                .trim()
                .toLowerCase();

        if (
            ![
                "cash",
                "card",
                "esewa",
                "khalti",
            ].includes(normalizedMethod)
        ) {
            alert(
                "Invalid payment method."
            );
            return;
        }

        try {
            let response;

            if (typeof payBillApi === "function") {
                response =
                    await payBillApi(
                        bill.id,
                        {
                            payment_method:
                                normalizedMethod,
                            paid_amount:
                                numericAmount,
                        }
                    );
            } else {
                /*
                 * Fallback in case your billsApi.js
                 * doesn't have payBill yet.
                 */
                throw new Error(
                    "payBill is not available in billsApi.js."
                );
            }

            const updatedBill =
                response?.bill ||
                response?.data?.bill ||
                response?.data ||
                response;

            if (
                !updatedBill ||
                !updatedBill.id
            ) {
                throw new Error(
                    "Payment succeeded but invalid bill data was returned."
                );
            }

            setBills((prev) =>
                prev.map((item) =>
                    item.id ===
                    updatedBill.id
                        ? updatedBill
                        : item
                )
            );

            if (
                selectedBill?.id ===
                updatedBill.id
            ) {
                setSelectedBill(
                    updatedBill
                );
            }

            alert(
                "Payment completed successfully."
            );
        } catch (err) {
            console.error(
                "Payment error:",
                err
            );

            alert(
                err?.response?.data?.message ||
                    err?.message ||
                    "Payment failed."
            );
        }
    };

    /* ==================================================
       DELETE BILL
    ================================================== */

    const handleDeleteBill = async (bill) => {
        if (
            bill.payment_status ===
            "paid"
        ) {
            alert(
                "Paid bills cannot be deleted."
            );
            return;
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to delete bill ${bill.bill_number}?`
            );

        if (!confirmed) {
            return;
        }

        try {
            await deleteBillApi(
                bill.id
            );

            setBills((prev) =>
                prev.filter(
                    (item) =>
                        item.id !== bill.id
                )
            );

            if (
                selectedBill?.id ===
                bill.id
            ) {
                setSelectedBill(null);
                setShowView(false);
            }

            alert(
                "Bill deleted successfully."
            );
        } catch (err) {
            console.error(
                "Delete bill error:",
                err
            );

            alert(
                err?.response?.data?.message ||
                    "Unable to delete bill."
            );
        }
    };

    /* ==================================================
       PRINT BILL
    ================================================== */

    const handlePrintBill = (bill) => {
        setSelectedBill(bill);

        setTimeout(() => {
            window.print();
        }, 200);
    };

    /* ==================================================
       OPEN CREATE MODAL
    ================================================== */

    const openCreateModal = () => {
        resetForm();
        setShowCreate(true);

        if (
            orders.length === 0
        ) {
            loadOrders();
        }
    };

    /* ==================================================
       SUMMARY
    ================================================== */

    const paidBills = bills.filter(
        (bill) =>
            bill.payment_status ===
            "paid"
    );

    const pendingBills = bills.filter(
        (bill) =>
            bill.payment_status ===
            "pending"
    );

    const partialBills = bills.filter(
        (bill) =>
            bill.payment_status ===
            "partial"
    );

    const totalSales = bills.reduce(
        (sum, bill) =>
            sum +
            Number(
                bill.total || 0
            ),
        0
    );

    /* ==================================================
       RENDER
    ================================================== */

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                        <Receipt size={23} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Billing
                        </h1>

                        <p className="text-sm text-slate-500">
                            Create, manage and
                            track cafe bills
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={loadBills}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={17}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={
                            openCreateModal
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                    >
                        <Plus size={18} />

                        New Bill
                    </button>
                </div>
            </div>

            {/* ==========================================
                ERROR
            ========================================== */}

            {error && (
                <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={18} />

                        <span>{error}</span>
                    </div>

                    <button
                        type="button"
                        onClick={
                            loadBills
                        }
                        className="font-semibold hover:underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* ==========================================
                SUMMARY CARDS
            ========================================== */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Total Bills"
                    value={bills.length}
                    icon={Receipt}
                    iconClass="bg-blue-50 text-blue-600"
                />

                <SummaryCard
                    title="Paid Bills"
                    value={paidBills.length}
                    icon={CheckCircle2}
                    iconClass="bg-emerald-50 text-emerald-600"
                />

                <SummaryCard
                    title="Pending"
                    value={
                        pendingBills.length +
                        partialBills.length
                    }
                    icon={Clock3}
                    iconClass="bg-amber-50 text-amber-600"
                />

                <SummaryCard
                    title="Total Sales"
                    value={money(
                        totalSales
                    )}
                    icon={Banknote}
                    iconClass="bg-violet-50 text-violet-600"
                />
            </div>

            {/* ==========================================
                BILL HISTORY
            ========================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="font-bold text-slate-900">
                            Recent Bills
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            View and manage
                            generated invoices
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target
                                        .value
                                )
                            }
                            onKeyDown={(e) => {
                                if (
                                    e.key ===
                                    "Enter"
                                ) {
                                    loadBills();
                                }
                            }}
                            placeholder="Search bill number..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                {/* TABLE */}

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-slate-50">
                            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="px-5 py-4">
                                    Bill
                                </th>

                                <th className="px-5 py-4">
                                    Date
                                </th>

                                <th className="px-5 py-4">
                                    Table
                                </th>

                                <th className="px-5 py-4">
                                    Items
                                </th>

                                <th className="px-5 py-4">
                                    Amount
                                </th>

                                <th className="px-5 py-4">
                                    Status
                                </th>

                                <th className="px-5 py-4 text-right">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <LoadingRows />
                            ) : bills.length ===
                              0 ? (
                                <EmptyBills />
                            ) : (
                                bills.map(
                                    (
                                        bill
                                    ) => (
                                        <BillRow
                                            key={
                                                bill.id
                                            }
                                            bill={
                                                bill
                                            }
                                            onView={() => {
                                                setSelectedBill(
                                                    bill
                                                );

                                                setShowView(
                                                    true
                                                );
                                            }}
                                            onPay={() =>
                                                handlePayBill(
                                                    bill
                                                )
                                            }
                                            onPrint={() =>
                                                handlePrintBill(
                                                    bill
                                                )
                                            }
                                            onDelete={() =>
                                                handleDeleteBill(
                                                    bill
                                                )
                                            }
                                        />
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ==========================================
                CREATE BILL MODAL
            ========================================== */}

            {showCreate && (
                <Modal
                    title="Create New Bill"
                    onClose={() => {
                        if (!saving) {
                            setShowCreate(
                                false
                            );
                            resetForm();
                        }
                    }}
                    width="max-w-6xl"
                >
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* ORDERS */}

                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Select Order
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Choose an
                                        order to
                                        create a
                                        bill
                                    </p>
                                </div>

                                {ordersLoading && (
                                    <RefreshCw
                                        size={16}
                                        className="animate-spin text-blue-600"
                                    />
                                )}
                            </div>

                            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                                {ordersLoading ? (
                                    <div className="rounded-xl border border-slate-200 p-6 text-center">
                                        <RefreshCw
                                            size={
                                                25
                                            }
                                            className="mx-auto mb-2 animate-spin text-blue-500"
                                        />

                                        <p className="text-sm text-slate-500">
                                            Loading
                                            orders...
                                        </p>
                                    </div>
                                ) : orders.length ===
                                  0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                        <AlertCircle
                                            size={
                                                30
                                            }
                                            className="mx-auto mb-2 text-slate-400"
                                        />

                                        <p className="font-medium text-slate-600">
                                            No orders
                                            available
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Create an
                                            order
                                            first.
                                        </p>
                                    </div>
                                ) : (
                                    orders.map(
                                        (
                                            order
                                        ) => {
                                            const orderTotal =
                                                getOrderSubtotal(
                                                    order
                                                );

                                            const isSelected =
                                                selectedOrder?.id ===
                                                order.id;

                                            return (
                                                <button
                                                    type="button"
                                                    key={
                                                        order.id
                                                    }
                                                    onClick={() =>
                                                        handleSelectOrder(
                                                            order
                                                        )
                                                    }
                                                    className={`w-full rounded-xl border p-4 text-left transition ${
                                                        isSelected
                                                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                                                            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="font-bold text-slate-900">
                                                            Order
                                                            #
                                                            {
                                                                order.id
                                                            }
                                                        </span>

                                                        <span className="text-sm font-bold text-blue-600">
                                                            {money(
                                                                orderTotal
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                                        <span>
                                                            Table{" "}
                                                            {getTableNumber(
                                                                order
                                                            )}
                                                        </span>

                                                        <span>
                                                            {
                                                                getOrderItems(
                                                                    order
                                                                )
                                                                    .length
                                                            }{" "}
                                                            items
                                                        </span>
                                                    </div>

                                                    {order.status && (
                                                        <div className="mt-2">
                                                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold capitalize text-slate-600">
                                                                {
                                                                    order.status
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        }
                                    )
                                )}
                            </div>
                        </div>

                        {/* BILL DETAILS */}

                        <div className="lg:col-span-2">
                            {!selectedOrder ? (
                                <div className="flex min-h-[450px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                                    <div className="text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                                            <Receipt
                                                size={
                                                    32
                                                }
                                                className="text-slate-300"
                                            />
                                        </div>

                                        <h3 className="font-semibold text-slate-700">
                                            Select an
                                            order
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Choose an
                                            order from
                                            the left to
                                            generate
                                            its bill.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {/* ORDER ITEMS */}

                                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
                                            <div>
                                                <h3 className="font-bold text-slate-900">
                                                    Order
                                                    #
                                                    {
                                                        selectedOrder.id
                                                    }
                                                </h3>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    Table{" "}
                                                    {getTableNumber(
                                                        selectedOrder
                                                    )}
                                                </p>
                                            </div>

                                            <span className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
                                                BILL
                                            </span>
                                        </div>

                                        <div className="divide-y divide-slate-100">
                                            {getOrderItems(
                                                selectedOrder
                                            ).length ===
                                            0 ? (
                                                <div className="p-8 text-center">
                                                    <AlertCircle
                                                        size={
                                                            28
                                                        }
                                                        className="mx-auto mb-2 text-slate-300"
                                                    />

                                                    <p className="text-sm text-slate-500">
                                                        No
                                                        items
                                                        found
                                                        for
                                                        this
                                                        order.
                                                    </p>
                                                </div>
                                            ) : (
                                                getOrderItems(
                                                    selectedOrder
                                                ).map(
                                                    (
                                                        item,
                                                        index
                                                    ) => {
                                                        const quantity =
                                                            Number(
                                                                item.quantity ||
                                                                    0
                                                            );

                                                        const unitPrice =
                                                            Number(
                                                                item.unit_price ||
                                                                    item.price ||
                                                                    0
                                                            );

                                                        return (
                                                            <div
                                                                key={
                                                                    item.id ||
                                                                    index
                                                                }
                                                                className="flex items-center justify-between gap-4 p-4"
                                                            >
                                                                <div className="min-w-0">
                                                                    <p className="truncate font-medium text-slate-800">
                                                                        {getItemName(
                                                                            item
                                                                        )}
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-slate-500">
                                                                        {
                                                                            quantity
                                                                        }{" "}
                                                                        ×{" "}
                                                                        {money(
                                                                            unitPrice
                                                                        )}
                                                                    </p>
                                                                </div>

                                                                <p className="shrink-0 font-semibold text-slate-900">
                                                                    {money(
                                                                        quantity *
                                                                            unitPrice
                                                                    )}
                                                                </p>
                                                            </div>
                                                        );
                                                    }
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* ADJUSTMENTS */}

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <Input
                                            label="Discount"
                                            type="number"
                                            min="0"
                                            value={
                                                form.discount
                                            }
                                            onChange={(
                                                value
                                            ) =>
                                                setForm(
                                                    (
                                                        prev
                                                    ) => ({
                                                        ...prev,
                                                        discount:
                                                            value,
                                                    })
                                                )
                                            }
                                        />

                                        <Input
                                            label="Tax"
                                            type="number"
                                            min="0"
                                            value={
                                                form.tax
                                            }
                                            onChange={(
                                                value
                                            ) =>
                                                setForm(
                                                    (
                                                        prev
                                                    ) => ({
                                                        ...prev,
                                                        tax: value,
                                                    })
                                                )
                                            }
                                        />

                                        <Input
                                            label="Service Charge"
                                            type="number"
                                            min="0"
                                            value={
                                                form.service_charge
                                            }
                                            onChange={(
                                                value
                                            ) =>
                                                setForm(
                                                    (
                                                        prev
                                                    ) => ({
                                                        ...prev,
                                                        service_charge:
                                                            value,
                                                    })
                                                )
                                            }
                                        />
                                    </div>

                                    {/* TOTAL */}

                                    <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-lg">
                                        <div className="space-y-3">
                                            <PriceRow
                                                label="Subtotal"
                                                value={money(
                                                    orderSubtotal
                                                )}
                                                dark
                                            />

                                            <PriceRow
                                                label="Discount"
                                                value={`- ${money(
                                                    discount
                                                )}`}
                                                dark
                                            />

                                            <PriceRow
                                                label="Tax"
                                                value={money(
                                                    tax
                                                )}
                                                dark
                                            />

                                            <PriceRow
                                                label="Service Charge"
                                                value={money(
                                                    serviceCharge
                                                )}
                                                dark
                                            />

                                            <div className="my-4 border-t border-slate-700" />

                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold">
                                                    Total
                                                </span>

                                                <span className="text-2xl font-black">
                                                    {money(
                                                        total
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PAYMENT METHOD */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Payment
                                            Method
                                        </label>

                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                            {[
                                                [
                                                    "cash",
                                                    "Cash",
                                                    Banknote,
                                                ],
                                                [
                                                    "card",
                                                    "Card",
                                                    CreditCard,
                                                ],
                                                [
                                                    "esewa",
                                                    "eSewa",
                                                    Smartphone,
                                                ],
                                                [
                                                    "khalti",
                                                    "Khalti",
                                                    Smartphone,
                                                ],
                                            ].map(
                                                ([
                                                    value,
                                                    label,
                                                    Icon,
                                                ]) => {
                                                    const active =
                                                        form.payment_method ===
                                                        value;

                                                    return (
                                                        <button
                                                            type="button"
                                                            key={
                                                                value
                                                            }
                                                            onClick={() =>
                                                                setForm(
                                                                    (
                                                                        prev
                                                                    ) => ({
                                                                        ...prev,
                                                                        payment_method:
                                                                            value,
                                                                    })
                                                                )
                                                            }
                                                            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
                                                                active
                                                                    ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                                                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                                            }`}
                                                        >
                                                            <Icon
                                                                size={
                                                                    18
                                                                }
                                                            />

                                                            {
                                                                label
                                                            }
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>

                                    {/* PAID AMOUNT */}

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <Input
                                            label="Paid Amount"
                                            type="number"
                                            min="0"
                                            value={
                                                form.paid_amount
                                            }
                                            onChange={(
                                                value
                                            ) =>
                                                setForm(
                                                    (
                                                        prev
                                                    ) => ({
                                                        ...prev,
                                                        paid_amount:
                                                            value,
                                                    })
                                                )
                                            }
                                        />

                                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                                                Change
                                            </p>

                                            <p className="mt-1 text-xl font-black text-emerald-700">
                                                {money(
                                                    change
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* NOTES */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Notes
                                        </label>

                                        <textarea
                                            value={
                                                form.notes
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setForm(
                                                    (
                                                        prev
                                                    ) => ({
                                                        ...prev,
                                                        notes: e
                                                            .target
                                                            .value,
                                                    })
                                                )
                                            }
                                            placeholder="Add notes about this bill..."
                                            rows={
                                                3
                                            }
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>

                                    {/* CREATE */}

                                    <button
                                        type="button"
                                        onClick={
                                            handleCreateBill
                                        }
                                        disabled={
                                            saving
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Receipt
                                            size={
                                                19
                                            }
                                        />

                                        {saving
                                            ? "Creating Bill..."
                                            : `Create Bill • ${money(
                                                  total
                                              )}`}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            {/* ==========================================
                VIEW BILL
            ========================================== */}

            {showView &&
                selectedBill && (
                    <BillPreview
                        bill={
                            selectedBill
                        }
                        onClose={() =>
                            setShowView(
                                false
                            )
                        }
                        onPrint={() =>
                            handlePrintBill(
                                selectedBill
                            )
                        }
                    />
                )}
        </div>
    );
}

/* ======================================================
   SUMMARY CARD
====================================================== */

function SummaryCard({
    title,
    value,
    icon: Icon,
    iconClass = "bg-blue-50 text-blue-600",
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 truncate text-2xl font-bold text-slate-900">
                        {value}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                >
                    <Icon size={21} />
                </div>
            </div>
        </div>
    );
}

/* ======================================================
   BILL ROW
====================================================== */

function BillRow({
    bill,
    onView,
    onPay,
    onPrint,
    onDelete,
}) {
    const PaymentIcon =
        paymentIcons[
            bill.payment_method
        ] || CreditCard;

    const itemCount =
        getBillItems(bill).length;

    return (
        <tr className="transition hover:bg-slate-50">
            <td className="px-5 py-4">
                <p className="font-bold text-slate-900">
                    {bill.bill_number ||
                        `BILL-${bill.id}`}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                    Order #
                    {bill.order_id ||
                        bill.order?.id ||
                        "-"}
                </p>
            </td>

            <td className="px-5 py-4 text-sm text-slate-600">
                {bill.bill_date
                    ? new Date(
                          bill.bill_date
                      ).toLocaleDateString(
                          "en-NP"
                      )
                    : bill.created_at
                    ? new Date(
                          bill.created_at
                      ).toLocaleDateString(
                          "en-NP"
                      )
                    : "-"}
            </td>

            <td className="px-5 py-4 text-sm text-slate-600">
                {getTableNumber(bill)}
            </td>

            <td className="px-5 py-4 text-sm text-slate-600">
                {itemCount}{" "}
                {itemCount === 1
                    ? "item"
                    : "items"}
            </td>

            <td className="px-5 py-4">
                <p className="font-bold text-slate-900">
                    {money(
                        bill.total
                    )}
                </p>

                {bill.payment_method && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <PaymentIcon
                            size={12}
                        />

                        <span className="capitalize">
                            {paymentLabels[
                                bill.payment_method
                            ] ||
                                bill.payment_method}
                        </span>
                    </div>
                )}
            </td>

            <td className="px-5 py-4">
                <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
                        statusStyles[
                            bill.payment_status
                        ] ||
                        "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                >
                    {bill.payment_status ||
                        "pending"}
                </span>
            </td>

            <td className="px-5 py-4">
                <div className="flex justify-end gap-1">
                    <ActionButton
                        title="View"
                        onClick={
                            onView
                        }
                    >
                        <Eye size={16} />
                    </ActionButton>

                    {bill.payment_status !==
                        "paid" && (
                        <ActionButton
                            title="Pay"
                            onClick={
                                onPay
                            }
                        >
                            <CreditCard
                                size={
                                    16
                                }
                            />
                        </ActionButton>
                    )}

                    <ActionButton
                        title="Print"
                        onClick={
                            onPrint
                        }
                    >
                        <Printer size={16} />
                    </ActionButton>

                    {bill.payment_status !==
                        "paid" && (
                        <ActionButton
                            title="Delete"
                            onClick={
                                onDelete
                            }
                            danger
                        >
                            <Trash2
                                size={
                                    16
                                }
                            />
                        </ActionButton>
                    )}
                </div>
            </td>
        </tr>
    );
}

/* ======================================================
   ACTION BUTTON
====================================================== */

function ActionButton({
    children,
    onClick,
    title,
    danger = false,
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`rounded-lg p-2 transition ${
                danger
                    ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
                    : "text-slate-400 hover:bg-blue-50 hover:text-blue-600"
            }`}
        >
            {children}
        </button>
    );
}

/* ======================================================
   INPUT
====================================================== */

function Input({
    label,
    value,
    onChange,
    type = "text",
    min,
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <input
                type={type}
                value={value}
                min={min}
                onChange={(e) =>
                    onChange(
                        e.target.value
                    )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
        </div>
    );
}

/* ======================================================
   PRICE ROW
====================================================== */

function PriceRow({
    label,
    value,
    dark = false,
}) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span
                className={
                    dark
                        ? "text-slate-400"
                        : "text-slate-500"
                }
            >
                {label}
            </span>

            <span
                className={
                    dark
                        ? "font-medium text-slate-200"
                        : "font-semibold text-slate-800"
                }
            >
                {value}
            </span>
        </div>
    );
}

/* ======================================================
   MODAL
====================================================== */

function Modal({
    title,
    children,
    onClose,
    width = "max-w-2xl",
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div
                className={`flex max-h-[92vh] w-full ${width} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}
            >
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                    <h2 className="text-lg font-bold text-slate-900">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={19} />
                    </button>
                </div>

                <div className="overflow-y-auto p-5">
                    {children}
                </div>
            </div>
        </div>
    );
}

/* ======================================================
   BILL PREVIEW
====================================================== */

function BillPreview({
    bill,
    onClose,
    onPrint,
}) {
    const items =
        getBillItems(bill);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                {/* PREVIEW HEADER */}

                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 print:hidden">
                    <h2 className="font-bold text-slate-900">
                        Bill Preview
                    </h2>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={
                                onPrint
                            }
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            <Printer
                                size={
                                    16
                                }
                            />

                            Print
                        </button>

                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                        >
                            <X size={19} />
                        </button>
                    </div>
                </div>

                {/* BILL */}

                <div
                    className="p-8"
                    id="print-bill"
                >
                    <div className="text-center">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900">
                            CAFE FLOW
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Cafe &
                            Restaurant
                        </p>

                        <div className="my-5 border-t border-dashed border-slate-300" />

                        <div className="flex justify-between text-left text-sm">
                            <div>
                                <p className="font-bold text-slate-900">
                                    {bill.bill_number ||
                                        `BILL-${bill.id}`}
                                </p>

                                <p className="mt-1 text-slate-500">
                                    Order #
                                    {bill.order_id ||
                                        "-"}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="font-medium text-slate-800">
                                    {bill.bill_date
                                        ? new Date(
                                              bill.bill_date
                                          ).toLocaleDateString(
                                              "en-NP"
                                          )
                                        : "-"}
                                </p>

                                <p className="mt-1 text-slate-500">
                                    Table{" "}
                                    {getTableNumber(
                                        bill
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ITEMS */}

                    <div className="my-6">
                        <div className="grid grid-cols-12 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                            <span className="col-span-6">
                                Item
                            </span>

                            <span className="col-span-2 text-center">
                                Qty
                            </span>

                            <span className="col-span-2 text-right">
                                Price
                            </span>

                            <span className="col-span-2 text-right">
                                Total
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {items.length ===
                            0 ? (
                                <div className="py-6 text-center text-sm text-slate-400">
                                    No bill
                                    items.
                                </div>
                            ) : (
                                items.map(
                                    (
                                        item,
                                        index
                                    ) => {
                                        const quantity =
                                            Number(
                                                item.quantity ||
                                                    0
                                            );

                                        const unitPrice =
                                            Number(
                                                item.unit_price ||
                                                    0
                                            );

                                        const subtotal =
                                            item.subtotal !==
                                            undefined
                                                ? Number(
                                                      item.subtotal ||
                                                          0
                                                  )
                                                : quantity *
                                                  unitPrice;

                                        return (
                                            <div
                                                key={
                                                    item.id ||
                                                    index
                                                }
                                                className="grid grid-cols-12 py-3 text-sm"
                                            >
                                                <span className="col-span-6 font-medium text-slate-800">
                                                    {getItemName(
                                                        item
                                                    )}
                                                </span>

                                                <span className="col-span-2 text-center text-slate-500">
                                                    {
                                                        quantity
                                                    }
                                                </span>

                                                <span className="col-span-2 text-right text-slate-500">
                                                    {money(
                                                        unitPrice
                                                    )}
                                                </span>

                                                <span className="col-span-2 text-right font-semibold text-slate-900">
                                                    {money(
                                                        subtotal
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    }
                                )
                            )}
                        </div>
                    </div>

                    {/* TOTALS */}

                    <div className="ml-auto max-w-sm space-y-2 text-sm">
                        <PriceRow
                            label="Subtotal"
                            value={money(
                                bill.subtotal
                            )}
                        />

                        <PriceRow
                            label="Discount"
                            value={`- ${money(
                                bill.discount
                            )}`}
                        />

                        <PriceRow
                            label="Tax"
                            value={money(
                                bill.tax
                            )}
                        />

                        <PriceRow
                            label="Service Charge"
                            value={money(
                                bill.service_charge
                            )}
                        />

                        <div className="my-3 border-t border-slate-300" />

                        <div className="flex justify-between text-lg font-black text-slate-900">
                            <span>
                                Total
                            </span>

                            <span>
                                {money(
                                    bill.total
                                )}
                            </span>
                        </div>

                        <div className="pt-3 text-xs text-slate-500">
                            <div className="flex justify-between">
                                <span>
                                    Payment
                                </span>

                                <span className="font-semibold uppercase">
                                    {bill.payment_method ||
                                        "Pending"}
                                </span>
                            </div>

                            <div className="mt-1 flex justify-between">
                                <span>
                                    Paid
                                </span>

                                <span>
                                    {money(
                                        bill.paid_amount
                                    )}
                                </span>
                            </div>

                            <div className="mt-1 flex justify-between">
                                <span>
                                    Change
                                </span>

                                <span>
                                    {money(
                                        bill.change_amount
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* NOTES */}

                    {bill.notes && (
                        <div className="mt-6 rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Notes
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                                {bill.notes}
                            </p>
                        </div>
                    )}

                    {/* FOOTER */}

                    <div className="mt-10 border-t border-dashed border-slate-300 pt-5 text-center text-xs text-slate-400">
                        Thank you for
                        visiting
                        CafeFlow.
                        <br />
                        Please visit
                        again!
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ======================================================
   LOADING ROWS
====================================================== */

function LoadingRows() {
    return (
        <>
            {Array.from({
                length: 5,
            }).map((_, index) => (
                <tr key={index}>
                    {Array.from({
                        length: 7,
                    }).map(
                        (
                            _,
                            cellIndex
                        ) => (
                            <td
                                key={
                                    cellIndex
                                }
                                className="px-5 py-5"
                            >
                                <div className="h-4 animate-pulse rounded bg-slate-100" />
                            </td>
                        )
                    )}
                </tr>
            ))}
        </>
    );
}

/* ======================================================
   EMPTY BILLS
====================================================== */

function EmptyBills() {
    return (
        <tr>
            <td
                colSpan="7"
                className="py-16 text-center"
            >
                <Receipt
                    size={42}
                    className="mx-auto mb-3 text-slate-300"
                />

                <p className="font-semibold text-slate-700">
                    No bills found
                </p>

                <p className="mt-1 text-sm text-slate-400">
                    Create your first
                    bill to get started.
                </p>
            </td>
        </tr>
    );
}