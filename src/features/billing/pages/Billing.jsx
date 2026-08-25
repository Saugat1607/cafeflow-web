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
    createBill,
    updateBill,
    deleteBill,
} from "../api/billsApi";

const money = (value) =>
    `Rs. ${Number(value || 0).toLocaleString("en-NP", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

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

export default function Billing() {
    const [bills, setBills] = useState([]);
    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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

    // --------------------------------------------------
    // LOAD BILLS
    // --------------------------------------------------

    const loadBills = async () => {
        try {
            setLoading(true);

            const response = await api.get("/bills", {
                params: {
                    search: search || undefined,
                    per_page: 50,
                },
            });

            setBills(response.data.data || []);
        } catch (error) {
            console.error("Failed to load bills:", error);
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // LOAD ORDERS
    // --------------------------------------------------

    const loadOrders = async () => {
        try {
            const response = await api.get("/orders", {
                params: {
                    per_page: 100,
                },
            });

            setOrders(response.data.data || response.data || []);
        } catch (error) {
            console.error("Failed to load orders:", error);
        }
    };

    useEffect(() => {
        loadBills();
        loadOrders();
    }, []);

    // --------------------------------------------------
    // SELECT ORDER
    // --------------------------------------------------

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

    // --------------------------------------------------
    // CALCULATIONS
    // --------------------------------------------------

    const orderSubtotal = useMemo(() => {
        if (!selectedOrder?.items) return 0;

        return selectedOrder.items.reduce((sum, item) => {
            return (
                sum +
                Number(item.quantity || 0) *
                    Number(item.unit_price || 0)
            );
        }, 0);
    }, [selectedOrder]);

    const discount = Number(form.discount || 0);
    const tax = Number(form.tax || 0);
    const serviceCharge = Number(form.service_charge || 0);

    const total = Math.max(
        0,
        orderSubtotal - discount + tax + serviceCharge
    );

    const paidAmount = Number(form.paid_amount || 0);

    const change = Math.max(0, paidAmount - total);

    // --------------------------------------------------
    // CREATE BILL
    // --------------------------------------------------

    const createBill = async () => {
        if (!selectedOrder) {
            alert("Please select an order.");
            return;
        }

        try {
            setSaving(true);

            const response = await api.post("/bills", {
                order_id: Number(form.order_id),
                discount: Number(form.discount || 0),
                tax: Number(form.tax || 0),
                service_charge: Number(
                    form.service_charge || 0
                ),
                payment_method: form.payment_method,
                paid_amount: Number(form.paid_amount || 0),
                notes: form.notes || null,
            });

            const newBill = response.data.bill;

            setBills((prev) => [newBill, ...prev]);

            setSelectedBill(newBill);
            setSelectedOrder(null);
            setShowCreate(false);

            setForm({
                order_id: "",
                discount: 0,
                tax: 0,
                service_charge: 0,
                payment_method: "cash",
                paid_amount: 0,
                notes: "",
            });

            alert("Bill created successfully.");
        } catch (error) {
            console.error(error);

            alert(
                error?.response?.data?.message ||
                    "Failed to create bill."
            );
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // PAY BILL
    // --------------------------------------------------

    const payBill = async (bill) => {
        const amount = prompt(
            `Bill total: ${money(bill.total)}\nEnter paid amount:`
        );

        if (!amount) return;

        const paymentMethod =
            prompt(
                "Payment method: cash / card / esewa / khalti",
                "cash"
            ) || "cash";

        try {
            const response = await api.post(
                `/bills/${bill.id}/pay`,
                {
                    payment_method: paymentMethod,
                    paid_amount: Number(amount),
                }
            );

            const updatedBill = response.data.bill;

            setBills((prev) =>
                prev.map((item) =>
                    item.id === updatedBill.id
                        ? updatedBill
                        : item
                )
            );

            if (selectedBill?.id === updatedBill.id) {
                setSelectedBill(updatedBill);
            }

            alert("Payment completed successfully.");
        } catch (error) {
            alert(
                error?.response?.data?.message ||
                    "Payment failed."
            );
        }
    };

    // --------------------------------------------------
    // DELETE BILL
    // --------------------------------------------------

    const deleteBill = async (bill) => {
        if (bill.payment_status === "paid") {
            alert("Paid bills cannot be deleted.");
            return;
        }

        if (
            !window.confirm(
                `Delete bill ${bill.bill_number}?`
            )
        ) {
            return;
        }

        try {
            await api.delete(`/bills/${bill.id}`);

            setBills((prev) =>
                prev.filter((item) => item.id !== bill.id)
            );

            if (selectedBill?.id === bill.id) {
                setSelectedBill(null);
            }
        } catch (error) {
            alert(
                error?.response?.data?.message ||
                    "Unable to delete bill."
            );
        }
    };

    // --------------------------------------------------
    // PRINT
    // --------------------------------------------------

    const printBill = (bill) => {
        setSelectedBill(bill);

        setTimeout(() => {
            window.print();
        }, 300);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            {/* HEADER */}

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                            <Receipt size={22} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Billing
                            </h1>

                            <p className="text-sm text-slate-500">
                                Create, manage and track cafe bills
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={loadBills}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        New Bill
                    </button>
                </div>
            </div>

            {/* SUMMARY CARDS */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Total Bills"
                    value={bills.length}
                    icon={Receipt}
                />

                <SummaryCard
                    title="Paid"
                    value={
                        bills.filter(
                            (bill) =>
                                bill.payment_status === "paid"
                        ).length
                    }
                    icon={CheckCircle2}
                />

                <SummaryCard
                    title="Pending"
                    value={
                        bills.filter(
                            (bill) =>
                                bill.payment_status ===
                                "pending"
                        ).length
                    }
                    icon={Clock3}
                />

                <SummaryCard
                    title="Total Sales"
                    value={money(
                        bills.reduce(
                            (sum, bill) =>
                                sum + Number(bill.total || 0),
                            0
                        )
                    )}
                    icon={Banknote}
                />
            </div>

            {/* BILL HISTORY */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="font-bold text-slate-900">
                            Recent Bills
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            View and manage generated invoices
                        </p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    loadBills();
                                }
                            }}
                            placeholder="Search bill number..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px]">
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
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="py-16 text-center text-sm text-slate-500"
                                    >
                                        Loading bills...
                                    </td>
                                </tr>
                            ) : bills.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="py-16 text-center"
                                    >
                                        <Receipt
                                            size={40}
                                            className="mx-auto mb-3 text-slate-300"
                                        />

                                        <p className="font-medium text-slate-700">
                                            No bills found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Create your first bill
                                            to get started.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                bills.map((bill) => (
                                    <BillRow
                                        key={bill.id}
                                        bill={bill}
                                        onView={() => {
                                            setSelectedBill(
                                                bill
                                            );
                                            setShowView(true);
                                        }}
                                        onPay={() =>
                                            payBill(bill)
                                        }
                                        onPrint={() =>
                                            printBill(bill)
                                        }
                                        onDelete={() =>
                                            deleteBill(bill)
                                        }
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE BILL MODAL */}

            {showCreate && (
                <Modal
                    title="Create New Bill"
                    onClose={() => setShowCreate(false)}
                    width="max-w-6xl"
                >
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* ORDERS */}

                        <div className="lg:col-span-1">
                            <h3 className="mb-3 text-sm font-bold text-slate-900">
                                Select Order
                            </h3>

                            <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
                                {orders.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                                        <AlertCircle
                                            size={28}
                                            className="mx-auto mb-2 text-slate-400"
                                        />

                                        <p className="text-sm text-slate-500">
                                            No orders available.
                                        </p>
                                    </div>
                                ) : (
                                    orders.map((order) => (
                                        <button
                                            key={order.id}
                                            onClick={() =>
                                                handleSelectOrder(
                                                    order
                                                )
                                            }
                                            className={`w-full rounded-xl border p-4 text-left transition ${
                                                selectedOrder?.id ===
                                                order.id
                                                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                                                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-slate-900">
                                                    Order #
                                                    {order.id}
                                                </span>

                                                <span className="text-sm font-semibold text-blue-600">
                                                    {money(
                                                        order.total ||
                                                            order.items?.reduce(
                                                                (
                                                                    sum,
                                                                    item
                                                                ) =>
                                                                    sum +
                                                                    Number(
                                                                        item.quantity ||
                                                                            0
                                                                    ) *
                                                                        Number(
                                                                            item.unit_price ||
                                                                                0
                                                                        ),
                                                                0
                                                            )
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-2 text-xs text-slate-500">
                                                Table{" "}
                                                {order.table
                                                    ?.table_number ||
                                                    order.restaurant_table_id ||
                                                    "N/A"}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* BILL */}

                        <div className="lg:col-span-2">
                            {!selectedOrder ? (
                                <div className="flex h-full min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                                    <div className="text-center">
                                        <Receipt
                                            size={45}
                                            className="mx-auto mb-3 text-slate-300"
                                        />

                                        <h3 className="font-semibold text-slate-700">
                                            Select an order
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Choose an order to
                                            generate its bill.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {/* ITEMS */}

                                    <div className="rounded-2xl border border-slate-200">
                                        <div className="border-b border-slate-200 p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-bold text-slate-900">
                                                        Order #
                                                        {
                                                            selectedOrder.id
                                                        }
                                                    </h3>

                                                    <p className="text-xs text-slate-500">
                                                        Table{" "}
                                                        {selectedOrder
                                                            .table
                                                            ?.table_number ||
                                                            selectedOrder.restaurant_table_id ||
                                                            "N/A"}
                                                    </p>
                                                </div>

                                                <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                                    BILL
                                                </span>
                                            </div>
                                        </div>

                                        <div className="divide-y divide-slate-100">
                                            {selectedOrder.items?.map(
                                                (
                                                    item,
                                                    index
                                                ) => (
                                                    <div
                                                        key={
                                                            item.id ||
                                                            index
                                                        }
                                                        className="flex items-center justify-between p-4"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-slate-800">
                                                                {item
                                                                    .menu_item
                                                                    ?.name ||
                                                                    item.menuItem
                                                                        ?.name ||
                                                                    item.item_name ||
                                                                    "Menu Item"}
                                                            </p>

                                                            <p className="text-xs text-slate-500">
                                                                {
                                                                    item.quantity
                                                                }{" "}
                                                                ×{" "}
                                                                {money(
                                                                    item.unit_price
                                                                )}
                                                            </p>
                                                        </div>

                                                        <p className="font-semibold text-slate-900">
                                                            {money(
                                                                Number(
                                                                    item.quantity
                                                                ) *
                                                                    Number(
                                                                        item.unit_price
                                                                    )
                                                            )}
                                                        </p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* CALCULATIONS */}

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <Input
                                            label="Discount"
                                            type="number"
                                            value={
                                                form.discount
                                            }
                                            onChange={(value) =>
                                                setForm({
                                                    ...form,
                                                    discount:
                                                        value,
                                                })
                                            }
                                        />

                                        <Input
                                            label="Tax"
                                            type="number"
                                            value={form.tax}
                                            onChange={(value) =>
                                                setForm({
                                                    ...form,
                                                    tax: value,
                                                })
                                            }
                                        />

                                        <Input
                                            label="Service Charge"
                                            type="number"
                                            value={
                                                form.service_charge
                                            }
                                            onChange={(value) =>
                                                setForm({
                                                    ...form,
                                                    service_charge:
                                                        value,
                                                })
                                            }
                                        />
                                    </div>

                                    {/* PAYMENT */}

                                    <div className="rounded-2xl bg-slate-900 p-5 text-white">
                                        <div className="space-y-3">
                                            <PriceRow
                                                label="Subtotal"
                                                value={money(
                                                    orderSubtotal
                                                )}
                                            />

                                            <PriceRow
                                                label="Discount"
                                                value={`- ${money(
                                                    discount
                                                )}`}
                                            />

                                            <PriceRow
                                                label="Tax"
                                                value={money(tax)}
                                            />

                                            <PriceRow
                                                label="Service Charge"
                                                value={money(
                                                    serviceCharge
                                                )}
                                            />

                                            <div className="my-4 border-t border-slate-700" />

                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold">
                                                    Total
                                                </span>

                                                <span className="text-2xl font-bold">
                                                    {money(total)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PAYMENT METHOD */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Payment Method
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
                                                ]) => (
                                                    <button
                                                        key={value}
                                                        onClick={() =>
                                                            setForm({
                                                                ...form,
                                                                payment_method:
                                                                    value,
                                                            })
                                                        }
                                                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
                                                            form.payment_method ===
                                                            value
                                                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                                        }`}
                                                    >
                                                        <Icon
                                                            size={
                                                                18
                                                            }
                                                        />

                                                        {label}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <Input
                                            label="Paid Amount"
                                            type="number"
                                            value={
                                                form.paid_amount
                                            }
                                            onChange={(value) =>
                                                setForm({
                                                    ...form,
                                                    paid_amount:
                                                        value,
                                                })
                                            }
                                        />

                                        <div className="rounded-xl bg-emerald-50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                                                Change
                                            </p>

                                            <p className="mt-1 text-xl font-bold text-emerald-700">
                                                {money(change)}
                                            </p>
                                        </div>
                                    </div>

                                    <textarea
                                        value={form.notes}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                notes: e.target
                                                    .value,
                                            })
                                        }
                                        placeholder="Notes..."
                                        rows="2"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <button
                                        onClick={createBill}
                                        disabled={saving}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Receipt size={19} />

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

            {/* VIEW BILL MODAL */}

            {showView && selectedBill && (
                <BillPreview
                    bill={selectedBill}
                    onClose={() => setShowView(false)}
                    onPrint={() => printBill(selectedBill)}
                />
            )}
        </div>
    );
}

/* ======================================================
   COMPONENTS
====================================================== */

function SummaryCard({
    title,
    value,
    icon: Icon,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {value}
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={21} />
                </div>
            </div>
        </div>
    );
}

function BillRow({
    bill,
    onView,
    onPay,
    onPrint,
    onDelete,
}) {
    const PaymentIcon =
        paymentIcons[bill.payment_method] || CreditCard;

    return (
        <tr className="hover:bg-slate-50">
            <td className="px-5 py-4">
                <p className="font-bold text-slate-900">
                    {bill.bill_number}
                </p>

                <p className="text-xs text-slate-400">
                    Order #{bill.order_id}
                </p>
            </td>

            <td className="px-5 py-4 text-sm text-slate-600">
                {bill.bill_date
                    ? new Date(
                          bill.bill_date
                      ).toLocaleDateString("en-NP")
                    : "-"}
            </td>

            <td className="px-5 py-4 text-sm text-slate-600">
                {bill.table?.table_number ||
                    bill.restaurant_table_id ||
                    "N/A"}
            </td>

            <td className="px-5 py-4 text-sm text-slate-600">
                {bill.items?.length || 0} items
            </td>

            <td className="px-5 py-4">
                <p className="font-bold text-slate-900">
                    {money(bill.total)}
                </p>

                {bill.payment_method && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <PaymentIcon size={12} />

                        {bill.payment_method}
                    </div>
                )}
            </td>

            <td className="px-5 py-4">
                <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        statusStyles[
                            bill.payment_status
                        ] ||
                        "bg-slate-50 text-slate-600"
                    }`}
                >
                    {bill.payment_status}
                </span>
            </td>

            <td className="px-5 py-4">
                <div className="flex justify-end gap-1">
                    <ActionButton
                        title="View"
                        onClick={onView}
                    >
                        <Eye size={16} />
                    </ActionButton>

                    {bill.payment_status !== "paid" && (
                        <ActionButton
                            title="Pay"
                            onClick={onPay}
                        >
                            <CreditCard size={16} />
                        </ActionButton>
                    )}

                    <ActionButton
                        title="Print"
                        onClick={onPrint}
                    >
                        <Printer size={16} />
                    </ActionButton>

                    {bill.payment_status !== "paid" && (
                        <ActionButton
                            title="Delete"
                            onClick={onDelete}
                            danger
                        >
                            <Trash2 size={16} />
                        </ActionButton>
                    )}
                </div>
            </td>
        </tr>
    );
}

function ActionButton({
    children,
    onClick,
    title,
    danger = false,
}) {
    return (
        <button
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

function Input({
    label,
    value,
    onChange,
    type = "text",
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                min="0"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
        </div>
    );
}

function PriceRow({ label, value }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
                {label}
            </span>

            <span className="font-medium text-slate-200">
                {value}
            </span>
        </div>
    );
}

function Modal({
    title,
    children,
    onClose,
    width = "max-w-2xl",
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div
                className={`max-h-[90vh] w-full ${width} overflow-y-auto rounded-2xl bg-white shadow-2xl`}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                    <h2 className="text-lg font-bold text-slate-900">
                        {title}
                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={19} />
                    </button>
                </div>

                <div className="p-5">{children}</div>
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
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 print:hidden">
                    <h2 className="font-bold text-slate-900">
                        Bill Preview
                    </h2>

                    <div className="flex gap-2">
                        <button
                            onClick={onPrint}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            <Printer size={16} />
                            Print
                        </button>

                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                        >
                            <X size={19} />
                        </button>
                    </div>
                </div>

                <div className="p-8" id="print-bill">
                    <div className="text-center">
                        <h1 className="text-2xl font-black text-slate-900">
                            CAFE FLOW
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Cafe & Restaurant
                        </p>

                        <div className="my-5 border-t border-dashed border-slate-300" />

                        <div className="flex justify-between text-left text-sm">
                            <div>
                                <p className="font-bold">
                                    {bill.bill_number}
                                </p>

                                <p className="text-slate-500">
                                    Order #{bill.order_id}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="font-medium">
                                    {bill.bill_date}
                                </p>

                                <p className="text-slate-500">
                                    Table{" "}
                                    {bill.table
                                        ?.table_number ||
                                        bill.restaurant_table_id ||
                                        "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="my-6">
                        <div className="grid grid-cols-12 border-b border-slate-200 pb-2 text-xs font-bold uppercase text-slate-500">
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
                            {bill.items?.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-12 py-3 text-sm"
                                >
                                    <span className="col-span-6 font-medium">
                                        {item.item_name}
                                    </span>

                                    <span className="col-span-2 text-center text-slate-500">
                                        {item.quantity}
                                    </span>

                                    <span className="col-span-2 text-right text-slate-500">
                                        {money(
                                            item.unit_price
                                        )}
                                    </span>

                                    <span className="col-span-2 text-right font-semibold">
                                        {money(
                                            item.subtotal
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

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
                            value={money(bill.tax)}
                        />

                        <PriceRow
                            label="Service Charge"
                            value={money(
                                bill.service_charge
                            )}
                        />

                        <div className="my-3 border-t border-slate-300" />

                        <div className="flex justify-between text-lg font-black">
                            <span>Total</span>

                            <span>
                                {money(bill.total)}
                            </span>
                        </div>

                        <div className="pt-3 text-xs text-slate-500">
                            <div className="flex justify-between">
                                <span>Payment</span>
                                <span className="font-semibold uppercase">
                                    {bill.payment_method ||
                                        "Pending"}
                                </span>
                            </div>

                            <div className="mt-1 flex justify-between">
                                <span>Paid</span>
                                <span>
                                    {money(
                                        bill.paid_amount
                                    )}
                                </span>
                            </div>

                            <div className="mt-1 flex justify-between">
                                <span>Change</span>
                                <span>
                                    {money(
                                        bill.change_amount
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 border-t border-dashed border-slate-300 pt-5 text-center text-xs text-slate-400">
                        Thank you for visiting CafeFlow.
                        <br />
                        Please visit again!
                    </div>
                </div>
            </div>
        </div>
    );
}