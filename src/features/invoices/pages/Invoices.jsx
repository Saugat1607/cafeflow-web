import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Plus,
    Eye,
    Printer,
    Trash2,
    RefreshCw,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    X,
} from "lucide-react";

import {
    getInvoices,
    createInvoice,
    deleteInvoice,
} from "../api/invoiceApi";

export default function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentFilter, setPaymentFilter] = useState("all");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const [form, setForm] = useState({
        customer_name: "",
        customer_phone: "",
        table_number: "",
        payment_method: "cash",
        payment_status: "paid",
        discount: 0,
        tax: 0,
        notes: "",
        items: [
            {
                menu_item_id: null,
                item_name: "",
                quantity: 1,
                unit_price: 0,
            },
        ],
    });

    // --------------------------------------------------
    // LOAD INVOICES
    // --------------------------------------------------

    const loadInvoices = async () => {
        try {
            setLoading(true);

            const response = await getInvoices();

            const data = response?.data;

            setInvoices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load invoices:", error);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvoices();
    }, []);

    // --------------------------------------------------
    // REFRESH
    // --------------------------------------------------

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await loadInvoices();
        } finally {
            setRefreshing(false);
        }
    };

    // --------------------------------------------------
    // FILTER
    // --------------------------------------------------

    const filteredInvoices = useMemo(() => {
        return invoices.filter((invoice) => {
            const searchText = search.toLowerCase();

            const matchesSearch =
                !search ||
                invoice.invoice_number
                    ?.toLowerCase()
                    .includes(searchText) ||
                invoice.customer_name
                    ?.toLowerCase()
                    .includes(searchText) ||
                invoice.customer_phone
                    ?.toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                statusFilter === "all" ||
                invoice.payment_status === statusFilter;

            const matchesPayment =
                paymentFilter === "all" ||
                invoice.payment_method === paymentFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPayment
            );
        });
    }, [
        invoices,
        search,
        statusFilter,
        paymentFilter,
    ]);

    // --------------------------------------------------
    // SUMMARY
    // --------------------------------------------------

    const totalInvoices = invoices.length;

    const paidInvoices = invoices.filter(
        (invoice) => invoice.payment_status === "paid"
    ).length;

    const pendingInvoices = invoices.filter(
        (invoice) => invoice.payment_status === "pending"
    ).length;

    const totalRevenue = invoices
        .filter(
            (invoice) =>
                invoice.payment_status === "paid"
        )
        .reduce(
            (sum, invoice) =>
                sum + Number(invoice.total || 0),
            0
        );

    // --------------------------------------------------
    // FORM
    // --------------------------------------------------

    const updateForm = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const updateItem = (index, field, value) => {
        setForm((previous) => {
            const items = [...previous.items];

            items[index] = {
                ...items[index],
                [field]: value,
            };

            return {
                ...previous,
                items,
            };
        });
    };

    const addItem = () => {
        setForm((previous) => ({
            ...previous,
            items: [
                ...previous.items,
                {
                    menu_item_id: null,
                    item_name: "",
                    quantity: 1,
                    unit_price: 0,
                },
            ],
        }));
    };

    const removeItem = (index) => {
        setForm((previous) => ({
            ...previous,
            items: previous.items.filter(
                (_, itemIndex) => itemIndex !== index
            ),
        }));
    };

    const subtotal = form.items.reduce(
        (sum, item) =>
            sum +
            Number(item.quantity || 0) *
                Number(item.unit_price || 0),
        0
    );

    const discount = Number(form.discount || 0);
    const tax = Number(form.tax || 0);

    const grandTotal = Math.max(
        0,
        subtotal - discount + tax
    );

    // --------------------------------------------------
    // CREATE INVOICE
    // --------------------------------------------------

    const handleCreateInvoice = async (event) => {
        event.preventDefault();

        try {
            const response = await createInvoice({
                customer_name:
                    form.customer_name || null,

                customer_phone:
                    form.customer_phone || null,

                table_number:
                    form.table_number || null,

                payment_method:
                    form.payment_method,

                payment_status:
                    form.payment_status,

                discount,
                tax,

                notes: form.notes || null,

                items: form.items.map((item) => ({
                    menu_item_id:
                        item.menu_item_id || null,

                    item_name: item.item_name,

                    quantity:
                        Number(item.quantity),

                    unit_price:
                        Number(item.unit_price),
                })),
            });

            if (response?.data) {
                setInvoices((previous) => [
                    response.data,
                    ...previous,
                ]);
            }

            setShowCreateModal(false);

            setForm({
                customer_name: "",
                customer_phone: "",
                table_number: "",
                payment_method: "cash",
                payment_status: "paid",
                discount: 0,
                tax: 0,
                notes: "",
                items: [
                    {
                        menu_item_id: null,
                        item_name: "",
                        quantity: 1,
                        unit_price: 0,
                    },
                ],
            });
        } catch (error) {
            console.error(
                "Failed to create invoice:",
                error
            );

            alert(
                error?.response?.data?.message ||
                    "Failed to create invoice."
            );
        }
    };

    // --------------------------------------------------
    // DELETE
    // --------------------------------------------------

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this invoice?"
        );

        if (!confirmed) return;

        try {
            await deleteInvoice(id);

            setInvoices((previous) =>
                previous.filter(
                    (invoice) => invoice.id !== id
                )
            );
        } catch (error) {
            console.error(
                "Failed to delete invoice:",
                error
            );

            alert("Failed to delete invoice.");
        }
    };

    // --------------------------------------------------
    // PRINT
    // --------------------------------------------------

    const handlePrint = (invoice) => {
        const items =
            invoice.items || [];

        const itemRows = items
            .map(
                (item) => `
                    <tr>
                        <td>${item.item_name}</td>
                        <td>${item.quantity}</td>
                        <td>Rs. ${Number(
                            item.unit_price
                        ).toFixed(2)}</td>
                        <td>Rs. ${Number(
                            item.subtotal
                        ).toFixed(2)}</td>
                    </tr>
                `
            )
            .join("");

        const printWindow =
            window.open("", "_blank");

        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${invoice.invoice_number}</title>

                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 40px;
                        color: #111827;
                    }

                    .invoice {
                        max-width: 800px;
                        margin: auto;
                    }

                    .header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                    }

                    h1 {
                        margin: 0;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 25px;
                    }

                    th,
                    td {
                        border-bottom: 1px solid #ddd;
                        padding: 10px;
                        text-align: left;
                    }

                    .totals {
                        margin-top: 25px;
                        margin-left: auto;
                        width: 300px;
                    }

                    .row {
                        display: flex;
                        justify-content: space-between;
                        padding: 6px 0;
                    }

                    .total {
                        font-size: 20px;
                        font-weight: bold;
                        border-top: 2px solid #111;
                        padding-top: 10px;
                    }

                    .footer {
                        margin-top: 50px;
                        text-align: center;
                        color: #666;
                    }

                    @media print {
                        body {
                            padding: 0;
                        }
                    }
                </style>
            </head>

            <body>
                <div class="invoice">

                    <div class="header">
                        <div>
                            <h1>CAFEFLOW</h1>
                            <p>Cafe Management System</p>
                        </div>

                        <div>
                            <strong>Invoice</strong>
                            <p>${invoice.invoice_number}</p>
                            <p>${new Date(
                                invoice.invoice_date
                            ).toLocaleString()}</p>
                        </div>
                    </div>

                    <div>
                        <strong>Customer</strong>

                        <p>
                            ${
                                invoice.customer_name ||
                                "Walk-in Customer"
                            }
                        </p>

                        ${
                            invoice.customer_phone
                                ? `<p>${invoice.customer_phone}</p>`
                                : ""
                        }

                        ${
                            invoice.table_number
                                ? `<p>Table: ${invoice.table_number}</p>`
                                : ""
                        }
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${itemRows}
                        </tbody>
                    </table>

                    <div class="totals">

                        <div class="row">
                            <span>Subtotal</span>
                            <span>
                                Rs. ${Number(
                                    invoice.subtotal
                                ).toFixed(2)}
                            </span>
                        </div>

                        <div class="row">
                            <span>Discount</span>
                            <span>
                                Rs. ${Number(
                                    invoice.discount
                                ).toFixed(2)}
                            </span>
                        </div>

                        <div class="row">
                            <span>Tax</span>
                            <span>
                                Rs. ${Number(
                                    invoice.tax
                                ).toFixed(2)}
                            </span>
                        </div>

                        <div class="row total">
                            <span>Total</span>
                            <span>
                                Rs. ${Number(
                                    invoice.total
                                ).toFixed(2)}
                            </span>
                        </div>

                    </div>

                    <div class="footer">
                        <p>Thank you for visiting CafeFlow!</p>
                    </div>

                </div>

                <script>
                    window.onload = function () {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);

        printWindow.document.close();
    };

    // --------------------------------------------------
    // STATUS
    // --------------------------------------------------

    const statusBadge = (status) => {
        if (status === "paid") {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    <CheckCircle size={13} />
                    Paid
                </span>
            );
        }

        if (status === "pending") {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                    <Clock size={13} />
                    Pending
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                <XCircle size={13} />
                Cancelled
            </span>
        );
    };

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex items-center gap-3 text-gray-500">
                    <RefreshCw
                        className="animate-spin"
                        size={20}
                    />
                    Loading invoices...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">

            {/* HEADER */}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                            <FileText size={24} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Invoices
                            </h1>

                            <p className="text-sm text-gray-500">
                                Manage your cafe invoices and payments
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() =>
                        setShowCreateModal(true)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                    <Plus size={18} />
                    Create Invoice
                </button>

            </div>

            {/* SUMMARY CARDS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <SummaryCard
                    title="Total Invoices"
                    value={totalInvoices}
                    icon={<FileText size={20} />}
                />

                <SummaryCard
                    title="Paid"
                    value={paidInvoices}
                    icon={<CheckCircle size={20} />}
                />

                <SummaryCard
                    title="Pending"
                    value={pendingInvoices}
                    icon={<Clock size={20} />}
                />

                <SummaryCard
                    title="Paid Revenue"
                    value={`Rs. ${totalRevenue.toLocaleString(
                        "en-IN",
                        {
                            minimumFractionDigits: 2,
                        }
                    )}`}
                    icon={<CheckCircle size={20} />}
                />

            </div>

            {/* FILTERS */}

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

                <div className="flex flex-col gap-3 lg:flex-row">

                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search invoice, customer..."
                            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="all">
                            All Status
                        </option>
                        <option value="paid">
                            Paid
                        </option>
                        <option value="pending">
                            Pending
                        </option>
                        <option value="cancelled">
                            Cancelled
                        </option>
                    </select>

                    <select
                        value={paymentFilter}
                        onChange={(event) =>
                            setPaymentFilter(
                                event.target.value
                            )
                        }
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="all">
                            All Payments
                        </option>
                        <option value="cash">
                            Cash
                        </option>
                        <option value="card">
                            Card
                        </option>
                        <option value="online">
                            Online
                        </option>
                    </select>

                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />
                        Refresh
                    </button>

                </div>

            </div>

            {/* TABLE */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                <div className="overflow-x-auto">

                    <table className="w-full text-left">

                        <thead className="border-b border-gray-200 bg-gray-50">

                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Invoice
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Customer
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Date
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Payment
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Total
                                </th>

                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Actions
                                </th>
                            </tr>

                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-6 py-16 text-center"
                                    >
                                        <FileText
                                            size={40}
                                            className="mx-auto mb-3 text-gray-300"
                                        />

                                        <p className="font-medium text-gray-600">
                                            No invoices found
                                        </p>

                                        <p className="mt-1 text-sm text-gray-400">
                                            Create your first invoice to get started.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map(
                                    (invoice) => (
                                        <tr
                                            key={
                                                invoice.id
                                            }
                                            className="transition hover:bg-gray-50"
                                        >

                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">
                                                    {
                                                        invoice.invoice_number
                                                    }
                                                </div>

                                                <div className="text-xs text-gray-400">
                                                    #
                                                    {
                                                        invoice.id
                                                    }
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-800">
                                                    {invoice.customer_name ||
                                                        "Walk-in Customer"}
                                                </div>

                                                {invoice.customer_phone && (
                                                    <div className="text-xs text-gray-400">
                                                        {
                                                            invoice.customer_phone
                                                        }
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(
                                                    invoice.invoice_date
                                                ).toLocaleDateString()}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="capitalize text-sm text-gray-600">
                                                    {
                                                        invoice.payment_method
                                                    }
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                {statusBadge(
                                                    invoice.payment_status
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                Rs.{" "}
                                                {Number(
                                                    invoice.total ||
                                                        0
                                                ).toLocaleString(
                                                    "en-IN",
                                                    {
                                                        minimumFractionDigits: 2,
                                                    }
                                                )}
                                            </td>

                                            <td className="px-6 py-4">

                                                <div className="flex justify-end gap-2">

                                                    <button
                                                        onClick={() =>
                                                            setSelectedInvoice(
                                                                invoice
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                                                        title="View"
                                                    >
                                                        <Eye
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handlePrint(
                                                                invoice
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                                                        title="Print"
                                                    >
                                                        <Printer
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                invoice.id
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                                                        title="Delete"
                                                    >
                                                        <Trash2
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    )
                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* CREATE MODAL */}

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">

                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Create Invoice
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Create a new cafe invoice
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowCreateModal(
                                        false
                                    )
                                }
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleCreateInvoice
                            }
                            className="space-y-6 p-6"
                        >

                            {/* CUSTOMER */}

                            <div>
                                <h3 className="mb-3 font-semibold text-gray-900">
                                    Customer Information
                                </h3>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                                    <input
                                        value={
                                            form.customer_name
                                        }
                                        onChange={(event) =>
                                            updateForm(
                                                "customer_name",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Customer name"
                                        className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <input
                                        value={
                                            form.customer_phone
                                        }
                                        onChange={(event) =>
                                            updateForm(
                                                "customer_phone",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Phone number"
                                        className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <input
                                        value={
                                            form.table_number
                                        }
                                        onChange={(event) =>
                                            updateForm(
                                                "table_number",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Table number"
                                        className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>
                            </div>

                            {/* ITEMS */}

                            <div>

                                <div className="mb-3 flex items-center justify-between">

                                    <h3 className="font-semibold text-gray-900">
                                        Invoice Items
                                    </h3>

                                    <button
                                        type="button"
                                        onClick={
                                            addItem
                                        }
                                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                                    >
                                        + Add Item
                                    </button>

                                </div>

                                <div className="space-y-3">

                                    {form.items.map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    index
                                                }
                                                className="grid grid-cols-12 gap-3 rounded-xl bg-gray-50 p-3"
                                            >

                                                <input
                                                    value={
                                                        item.item_name
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateItem(
                                                            index,
                                                            "item_name",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="Item name"
                                                    className="col-span-5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                    required
                                                />

                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={
                                                        item.quantity
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateItem(
                                                            index,
                                                            "quantity",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="Qty"
                                                    className="col-span-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                    required
                                                />

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={
                                                        item.unit_price
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateItem(
                                                            index,
                                                            "unit_price",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="Price"
                                                    className="col-span-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                    required
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeItem(
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        form
                                                            .items
                                                            .length ===
                                                        1
                                                    }
                                                    className="col-span-2 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                                                >
                                                    <Trash2
                                                        size={
                                                            18
                                                        }
                                                    />
                                                </button>

                                            </div>
                                        )
                                    )}

                                </div>

                            </div>

                            {/* PAYMENT */}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Payment Method
                                    </label>

                                    <select
                                        value={
                                            form.payment_method
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "payment_method",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                                    >
                                        <option value="cash">
                                            Cash
                                        </option>

                                        <option value="card">
                                            Card
                                        </option>

                                        <option value="online">
                                            Online
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Payment Status
                                    </label>

                                    <select
                                        value={
                                            form.payment_status
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "payment_status",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                                    >
                                        <option value="paid">
                                            Paid
                                        </option>

                                        <option value="pending">
                                            Pending
                                        </option>

                                        <option value="cancelled">
                                            Cancelled
                                        </option>
                                    </select>
                                </div>

                            </div>

                            {/* TOTALS */}

                            <div className="ml-auto max-w-sm rounded-2xl bg-gray-50 p-5">

                                <div className="flex justify-between py-2 text-sm">
                                    <span className="text-gray-500">
                                        Subtotal
                                    </span>

                                    <span className="font-medium">
                                        Rs.{" "}
                                        {subtotal.toFixed(
                                            2
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2 text-sm">
                                    <span className="text-gray-500">
                                        Discount
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            form.discount
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "discount",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-right text-sm"
                                    />
                                </div>

                                <div className="flex items-center justify-between py-2 text-sm">
                                    <span className="text-gray-500">
                                        Tax
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            form.tax
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "tax",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-right text-sm"
                                    />
                                </div>

                                <div className="mt-3 flex justify-between border-t border-gray-200 pt-4 text-lg font-bold">
                                    <span>
                                        Total
                                    </span>

                                    <span className="text-blue-600">
                                        Rs.{" "}
                                        {grandTotal.toFixed(
                                            2
                                        )}
                                    </span>
                                </div>

                            </div>

                            {/* NOTES */}

                            <textarea
                                value={
                                    form.notes
                                }
                                onChange={(event) =>
                                    updateForm(
                                        "notes",
                                        event.target.value
                                    )
                                }
                                placeholder="Notes (optional)"
                                rows="3"
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            {/* BUTTONS */}

                            <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCreateModal(
                                            false
                                        )
                                    }
                                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    Create Invoice
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* VIEW MODAL */}

            {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {
                                        selectedInvoice.invoice_number
                                    }
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Invoice details
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setSelectedInvoice(
                                        null
                                    )
                                }
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="space-y-6 p-6">

                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                                <InfoBox
                                    label="Customer"
                                    value={
                                        selectedInvoice.customer_name ||
                                        "Walk-in Customer"
                                    }
                                />

                                <InfoBox
                                    label="Table"
                                    value={
                                        selectedInvoice.table_number ||
                                        "-"
                                    }
                                />

                                <InfoBox
                                    label="Payment"
                                    value={
                                        selectedInvoice.payment_method
                                    }
                                />

                                <InfoBox
                                    label="Status"
                                    value={
                                        selectedInvoice.payment_status
                                    }
                                />

                            </div>

                            <div className="overflow-hidden rounded-xl border border-gray-200">

                                <table className="w-full text-left">

                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-sm font-semibold">
                                                Item
                                            </th>

                                            <th className="px-4 py-3 text-sm font-semibold">
                                                Qty
                                            </th>

                                            <th className="px-4 py-3 text-sm font-semibold">
                                                Price
                                            </th>

                                            <th className="px-4 py-3 text-right text-sm font-semibold">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">

                                        {(
                                            selectedInvoice.items ||
                                            []
                                        ).map(
                                            (
                                                item
                                            ) => (
                                                <tr
                                                    key={
                                                        item.id
                                                    }
                                                >
                                                    <td className="px-4 py-3 text-sm">
                                                        {
                                                            item.item_name
                                                        }
                                                    </td>

                                                    <td className="px-4 py-3 text-sm">
                                                        {
                                                            item.quantity
                                                        }
                                                    </td>

                                                    <td className="px-4 py-3 text-sm">
                                                        Rs.{" "}
                                                        {Number(
                                                            item.unit_price
                                                        ).toFixed(
                                                            2
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3 text-right text-sm font-medium">
                                                        Rs.{" "}
                                                        {Number(
                                                            item.subtotal
                                                        ).toFixed(
                                                            2
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                            <div className="ml-auto max-w-xs space-y-2">

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">
                                        Subtotal
                                    </span>

                                    <span>
                                        Rs.{" "}
                                        {Number(
                                            selectedInvoice.subtotal
                                        ).toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">
                                        Discount
                                    </span>

                                    <span>
                                        Rs.{" "}
                                        {Number(
                                            selectedInvoice.discount
                                        ).toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">
                                        Tax
                                    </span>

                                    <span>
                                        Rs.{" "}
                                        {Number(
                                            selectedInvoice.tax
                                        ).toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between border-t pt-3 text-lg font-bold">
                                    <span>
                                        Grand Total
                                    </span>

                                    <span className="text-blue-600">
                                        Rs.{" "}
                                        {Number(
                                            selectedInvoice.total
                                        ).toFixed(2)}
                                    </span>
                                </div>

                            </div>

                            <div className="flex justify-end">

                                <button
                                    onClick={() =>
                                        handlePrint(
                                            selectedInvoice
                                        )
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                                >
                                    <Printer
                                        size={17}
                                    />
                                    Print Invoice
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

// --------------------------------------------------
// SUMMARY CARD
// --------------------------------------------------

function SummaryCard({
    title,
    value,
    icon,
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <div>
                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {value}
                    </p>
                </div>

                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    {icon}
                </div>

            </div>

        </div>
    );
}

// --------------------------------------------------
// INFO BOX
// --------------------------------------------------

function InfoBox({
    label,
    value,
}) {
    return (
        <div className="rounded-xl bg-gray-50 p-4">

            <p className="text-xs text-gray-400">
                {label}
            </p>

            <p className="mt-1 truncate text-sm font-semibold capitalize text-gray-800">
                {value}
            </p>

        </div>
    );
}