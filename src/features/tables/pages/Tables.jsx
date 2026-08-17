import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import * as tablesApi from '../api/tablesApi';

export default function Tables() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [showModal, setShowModal] = useState(false);
    const [editingTable, setEditingTable] = useState(null);

    const [form, setForm] = useState({
        number: '',
        name: '',
        capacity: '',
        status: 'available',
    });

    // ============================================================
    // LOAD TABLES
    // ============================================================

    const loadTables = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await tablesApi.getTables();

            setTables(response?.data?.data || []);
        } catch (err) {
            console.error(err);

            setError(
                err?.response?.data?.message ||
                'Could not load tables.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTables();
    }, []);

    // ============================================================
    // NORMALIZE STATUS
    // ============================================================

    const normalizeStatus = (status) => {
        const value = String(status || 'available')
            .toLowerCase()
            .trim();

        if (
            value === 'occupied' ||
            value === 'busy'
        ) {
            return 'occupied';
        }

        if (
            value === 'reserved' ||
            value === 'reservation'
        ) {
            return 'reserved';
        }

        if (
            value === 'maintenance' ||
            value === 'inactive'
        ) {
            return 'maintenance';
        }

        return 'available';
    };

    // ============================================================
    // STATISTICS
    // ============================================================

    const stats = useMemo(() => {
        const result = {
            total: tables.length,
            available: 0,
            occupied: 0,
            reserved: 0,
            maintenance: 0,
        };

        tables.forEach((table) => {
            const status = normalizeStatus(
                table.status
            );

            if (result[status] !== undefined) {
                result[status]++;
            }
        });

        return result;
    }, [tables]);

    // ============================================================
    // FILTER TABLES
    // ============================================================

    const filteredTables = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        return tables.filter((table) => {
            const number = String(
                table.number ?? ''
            ).toLowerCase();

            const name = String(
                table.name ?? ''
            ).toLowerCase();

            const status = normalizeStatus(
                table.status
            );

            const matchesSearch =
                !query ||
                number.includes(query) ||
                name.includes(query) ||
                status.includes(query);

            const matchesStatus =
                statusFilter === 'all' ||
                status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [tables, search, statusFilter]);

    // ============================================================
    // OPEN CREATE MODAL
    // ============================================================

    const openCreateModal = () => {
        setEditingTable(null);

        setForm({
            number: '',
            name: '',
            capacity: '',
            status: 'available',
        });

        setError('');
        setShowModal(true);
    };

    // ============================================================
    // OPEN EDIT MODAL
    // ============================================================

    const openEditModal = (table) => {
        setEditingTable(table);

        setForm({
            number: table.number ?? '',
            name: table.name ?? '',
            capacity: table.capacity ?? '',
            status:
                normalizeStatus(
                    table.status
                ),
        });

        setError('');
        setShowModal(true);
    };

    // ============================================================
    // CLOSE MODAL
    // ============================================================

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingTable(null);
    };

    // ============================================================
    // FORM CHANGE
    // ============================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    // ============================================================
    // SAVE TABLE
    // ============================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.number.trim()) {
            setError(
                'Please enter a table number.'
            );

            return;
        }

        try {
            setSaving(true);
            setError('');

            const payload = {
                number: form.number.trim(),
                name: form.name.trim() || null,
                capacity: form.capacity
                    ? Number(form.capacity)
                    : null,
                status: form.status,
            };

            if (editingTable) {
                await tablesApi.updateTable(
                    editingTable.id,
                    payload
                );
            } else {
                await tablesApi.createTable(
                    payload
                );
            }

            setShowModal(false);
            setEditingTable(null);

            await loadTables();
        } catch (err) {
            console.error(err);

            setError(
                err?.response?.data?.message ||
                'Could not save the table.'
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // DELETE TABLE
    // ============================================================

    const handleDelete = async (table) => {
        const tableName =
            table.number ??
            table.name ??
            `Table ${table.id}`;

        const confirmed = window.confirm(
            `Are you sure you want to delete ${tableName}?`
        );

        if (!confirmed) return;

        try {
            setError('');

            await tablesApi.deleteTable(
                table.id
            );

            await loadTables();
        } catch (err) {
            console.error(err);

            setError(
                err?.response?.data?.message ||
                'Could not delete the table.'
            );
        }
    };

    // ============================================================
    // QUICK STATUS UPDATE
    // ============================================================

    const changeStatus = async (
        table,
        newStatus
    ) => {
        try {
            setError('');

            await tablesApi.updateTable(
                table.id,
                {
                    status: newStatus,
                }
            );

            await loadTables();
        } catch (err) {
            console.error(err);

            setError(
                err?.response?.data?.message ||
                'Could not update table status.'
            );
        }
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return <LoadingScreen />;
    }

    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div className="min-h-screen bg-[#F8F6F1]">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">

                <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">

                            <Link
                                to="/"
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                                title="Back to Dashboard"
                            >
                                <ArrowLeftIcon />
                            </Link>

                            <div>

                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
                                    CafeFlow
                                </p>

                                <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">
                                    Tables
                                </h1>

                            </div>

                        </div>

                        <button
                            onClick={
                                openCreateModal
                            }
                            className="flex items-center justify-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-amber-800"
                        >
                            <PlusIcon />
                            Add Table
                        </button>

                    </div>

                </div>

            </header>

            {/* =====================================================
                MAIN
            ====================================================== */}

            <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

                {/* ERROR */}

                {error && !showModal && (
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

                {/* =================================================
                    STAT CARDS
                ================================================== */}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">

                    <StatCard
                        label="Total Tables"
                        value={stats.total}
                        icon={<TableIcon />}
                        type="total"
                        active={
                            statusFilter ===
                            'all'
                        }
                        onClick={() =>
                            setStatusFilter(
                                'all'
                            )
                        }
                    />

                    <StatCard
                        label="Available"
                        value={
                            stats.available
                        }
                        icon={<CheckCircleIcon />}
                        type="available"
                        active={
                            statusFilter ===
                            'available'
                        }
                        onClick={() =>
                            setStatusFilter(
                                'available'
                            )
                        }
                    />

                    <StatCard
                        label="Occupied"
                        value={
                            stats.occupied
                        }
                        icon={<UsersIcon />}
                        type="occupied"
                        active={
                            statusFilter ===
                            'occupied'
                        }
                        onClick={() =>
                            setStatusFilter(
                                'occupied'
                            )
                        }
                    />

                    <StatCard
                        label="Reserved"
                        value={
                            stats.reserved
                        }
                        icon={<CalendarIcon />}
                        type="reserved"
                        active={
                            statusFilter ===
                            'reserved'
                        }
                        onClick={() =>
                            setStatusFilter(
                                'reserved'
                            )
                        }
                    />

                    <StatCard
                        label="Maintenance"
                        value={
                            stats.maintenance
                        }
                        icon={<ToolIcon />}
                        type="maintenance"
                        active={
                            statusFilter ===
                            'maintenance'
                        }
                        onClick={() =>
                            setStatusFilter(
                                'maintenance'
                            )
                        }
                    />

                </div>

                {/* =================================================
                    SEARCH + FILTER
                ================================================== */}

                <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm sm:p-4">

                    <div className="flex flex-col gap-3 lg:flex-row">

                        <div className="relative flex-1">

                            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target
                                            .value
                                    )
                                }
                                placeholder="Search table number or name..."
                                className="w-full rounded-xl border border-stone-200 bg-[#FAF9F6] py-3.5 pl-11 pr-10 text-sm outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                            />

                            {search && (
                                <button
                                    onClick={() =>
                                        setSearch(
                                            ''
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-400 hover:bg-stone-100"
                                >
                                    <CloseIcon />
                                </button>
                            )}

                        </div>

                        <div className="relative">

                            <FilterIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

                            <select
                                value={
                                    statusFilter
                                }
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.target
                                            .value
                                    )
                                }
                                className="w-full appearance-none rounded-xl border border-stone-200 bg-[#FAF9F6] py-3.5 pl-9 pr-10 text-sm font-semibold text-stone-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 sm:min-w-[180px]"
                            >
                                <option value="all">
                                    All Tables
                                </option>

                                <option value="available">
                                    Available
                                </option>

                                <option value="occupied">
                                    Occupied
                                </option>

                                <option value="reserved">
                                    Reserved
                                </option>

                                <option value="maintenance">
                                    Maintenance
                                </option>
                            </select>

                            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

                        </div>

                    </div>

                </div>

                {/* =================================================
                    RESULTS HEADER
                ================================================== */}

                <div className="mb-4 mt-7 flex items-center justify-between">

                    <div>

                        <h2 className="font-bold text-stone-900">
                            {statusFilter ===
                            'all'
                                ? 'All Tables'
                                : `${capitalize(
                                      statusFilter
                                  )} Tables`}
                        </h2>

                        <p className="mt-1 text-xs text-stone-500">
                            Showing{' '}
                            {
                                filteredTables.length
                            }{' '}
                            of {tables.length}{' '}
                            tables
                        </p>

                    </div>

                    {(search ||
                        statusFilter !==
                            'all') && (
                        <button
                            onClick={() => {
                                setSearch('');
                                setStatusFilter(
                                    'all'
                                );
                            }}
                            className="text-xs font-bold text-amber-700 hover:text-amber-800"
                        >
                            Clear filters
                        </button>
                    )}

                </div>

                {/* =================================================
                    TABLE GRID
                ================================================== */}

                {filteredTables.length ===
                0 ? (
                    <EmptyTables
                        search={search}
                        onAdd={openCreateModal}
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

                        {filteredTables.map(
                            (table) => (
                                <TableCard
                                    key={
                                        table.id
                                    }
                                    table={
                                        table
                                    }
                                    status={normalizeStatus(
                                        table.status
                                    )}
                                    onEdit={() =>
                                        openEditModal(
                                            table
                                        )
                                    }
                                    onDelete={() =>
                                        handleDelete(
                                            table
                                        )
                                    }
                                    onStatusChange={
                                        changeStatus
                                    }
                                />
                            )
                        )}

                    </div>
                )}

            </main>

            {/* =====================================================
                MODAL
            ====================================================== */}

            {showModal && (
                <TableModal
                    editingTable={
                        editingTable
                    }
                    form={form}
                    error={error}
                    saving={saving}
                    onChange={
                        handleChange
                    }
                    onSubmit={
                        handleSubmit
                    }
                    onClose={
                        closeModal
                    }
                />
            )}

        </div>
    );
}

/* ================================================================
   STAT CARD
================================================================ */

function StatCard({
    label,
    value,
    icon,
    type,
    active,
    onClick,
}) {
    const styles = {
        total: {
            icon: 'bg-stone-100 text-stone-700',
            active:
                'border-stone-300 ring-2 ring-stone-100',
        },

        available: {
            icon: 'bg-emerald-50 text-emerald-700',
            active:
                'border-emerald-300 ring-2 ring-emerald-100',
        },

        occupied: {
            icon: 'bg-red-50 text-red-600',
            active:
                'border-red-300 ring-2 ring-red-100',
        },

        reserved: {
            icon: 'bg-amber-50 text-amber-700',
            active:
                'border-amber-300 ring-2 ring-amber-100',
        },

        maintenance: {
            icon: 'bg-slate-100 text-slate-600',
            active:
                'border-slate-300 ring-2 ring-slate-100',
        },
    };

    const style =
        styles[type] || styles.total;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                active
                    ? style.active
                    : 'border-stone-200'
            }`}
        >

            <div className="flex items-center justify-between gap-2">

                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.icon}`}
                >
                    {icon}
                </div>

                <span className="text-2xl font-bold text-stone-900">
                    {value}
                </span>

            </div>

            <p className="mt-3 text-xs font-semibold text-stone-500">
                {label}
            </p>

        </button>
    );
}

/* ================================================================
   TABLE CARD
================================================================ */

function TableCard({
    table,
    status,
    onEdit,
    onDelete,
    onStatusChange,
}) {
    const statusInfo =
        getStatusInfo(status);

    const tableName =
        table.number ??
        table.name ??
        `Table ${table.id}`;

    return (
        <div
            className={`group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${statusInfo.border}`}
        >

            {/* TOP */}

            <div className="p-5">

                <div className="flex items-start justify-between">

                    <div className="flex items-center gap-3">

                        <div
                            className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold ${statusInfo.icon}`}
                        >
                            {table.number ??
                                table.id}
                        </div>

                        <div>

                            <h3 className="font-bold text-stone-900">
                                {table.name
                                    ? table.name
                                    : `Table ${table.number ?? table.id}`}
                            </h3>

                            <p className="mt-0.5 text-xs text-stone-400">
                                Table #
                                {table.number ??
                                    table.id}
                            </p>

                        </div>

                    </div>

                    <StatusBadge
                        status={
                            status
                        }
                    />

                </div>

                {/* INFO */}

                <div className="mt-5 grid grid-cols-2 gap-3">

                    <InfoBox
                        icon={
                            <UsersIcon />
                        }
                        label="Capacity"
                        value={
                            table.capacity
                                ? `${table.capacity} seats`
                                : 'Not set'
                        }
                    />

                    <InfoBox
                        icon={
                            <StatusIcon
                                status={
                                    status
                                }
                            />
                        }
                        label="Status"
                        value={capitalize(
                            status
                        )}
                    />

                </div>

            </div>

            {/* STATUS ACTION */}

            <div className="border-t border-stone-100 bg-[#FAF9F6] px-5 py-3">

                <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-stone-400">
                    Change status
                </p>

                <div className="grid grid-cols-4 gap-1.5">

                    <QuickStatusButton
                        label="Free"
                        active={
                            status ===
                            'available'
                        }
                        onClick={() =>
                            onStatusChange(
                                table,
                                'available'
                            )
                        }
                        type="available"
                    />

                    <QuickStatusButton
                        label="Busy"
                        active={
                            status ===
                            'occupied'
                        }
                        onClick={() =>
                            onStatusChange(
                                table,
                                'occupied'
                            )
                        }
                        type="occupied"
                    />

                    <QuickStatusButton
                        label="Reserved"
                        active={
                            status ===
                            'reserved'
                        }
                        onClick={() =>
                            onStatusChange(
                                table,
                                'reserved'
                            )
                        }
                        type="reserved"
                    />

                    <QuickStatusButton
                        label="Off"
                        active={
                            status ===
                            'maintenance'
                        }
                        onClick={() =>
                            onStatusChange(
                                table,
                                'maintenance'
                            )
                        }
                        type="maintenance"
                    />

                </div>

            </div>

            {/* ACTIONS */}

            <div className="flex items-center border-t border-stone-100 bg-white">

                <button
                    type="button"
                    onClick={onEdit}
                    className="flex flex-1 items-center justify-center gap-2 border-r border-stone-100 py-3 text-xs font-bold text-stone-600 transition hover:bg-stone-50 hover:text-amber-700"
                >
                    <EditIcon />
                    Edit
                </button>

                <button
                    type="button"
                    onClick={onDelete}
                    className="flex flex-1 items-center justify-center gap-2 py-3 text-xs font-bold text-stone-500 transition hover:bg-red-50 hover:text-red-600"
                >
                    <TrashIcon />
                    Delete
                </button>

            </div>

        </div>
    );
}

/* ================================================================
   INFO BOX
================================================================ */

function InfoBox({
    icon,
    label,
    value,
}) {
    return (
        <div className="rounded-xl bg-stone-50 p-3">

            <div className="flex items-center gap-2 text-stone-400">

                {icon}

                <span className="text-[9px] font-bold uppercase tracking-wider">
                    {label}
                </span>

            </div>

            <p className="mt-1 text-xs font-bold text-stone-700">
                {value}
            </p>

        </div>
    );
}

/* ================================================================
   QUICK STATUS BUTTON
================================================================ */

function QuickStatusButton({
    label,
    active,
    onClick,
    type,
}) {
    const styles = {
        available:
            'text-emerald-700 hover:bg-emerald-50',
        occupied:
            'text-red-600 hover:bg-red-50',
        reserved:
            'text-amber-700 hover:bg-amber-50',
        maintenance:
            'text-slate-600 hover:bg-slate-100',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-lg px-1 py-2 text-[9px] font-bold transition ${
                active
                    ? 'bg-stone-800 text-white'
                    : styles[type]
            }`}
        >
            {label}
        </button>
    );
}

/* ================================================================
   STATUS BADGE
================================================================ */

function StatusBadge({ status }) {
    const info =
        getStatusInfo(status);

    return (
        <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${info.badge}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${info.dot}`}
            />

            {info.label}
        </span>
    );
}

/* ================================================================
   STATUS ICON
================================================================ */

function StatusIcon({ status }) {
    if (status === 'available') {
        return <CheckCircleIcon />;
    }

    if (status === 'occupied') {
        return <UsersIcon />;
    }

    if (status === 'reserved') {
        return <CalendarIcon />;
    }

    return <ToolIcon />;
}

/* ================================================================
   STATUS INFORMATION
================================================================ */

function getStatusInfo(status) {
    const info = {
        available: {
            label: 'Available',
            badge:
                'bg-emerald-50 text-emerald-700',
            dot: 'bg-emerald-500',
            icon:
                'bg-emerald-50 text-emerald-700',
            border:
                'border-emerald-100 hover:border-emerald-200',
        },

        occupied: {
            label: 'Occupied',
            badge:
                'bg-red-50 text-red-600',
            dot: 'bg-red-500',
            icon:
                'bg-red-50 text-red-600',
            border:
                'border-red-100 hover:border-red-200',
        },

        reserved: {
            label: 'Reserved',
            badge:
                'bg-amber-50 text-amber-700',
            dot: 'bg-amber-500',
            icon:
                'bg-amber-50 text-amber-700',
            border:
                'border-amber-100 hover:border-amber-200',
        },

        maintenance: {
            label: 'Maintenance',
            badge:
                'bg-slate-100 text-slate-600',
            dot: 'bg-slate-500',
            icon:
                'bg-slate-100 text-slate-600',
            border:
                'border-slate-200 hover:border-slate-300',
        },
    };

    return (
        info[status] ||
        info.available
    );
}

/* ================================================================
   TABLE MODAL
================================================================ */

function TableModal({
    editingTable,
    form,
    error,
    saving,
    onChange,
    onSubmit,
    onClose,
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (
                    e.target ===
                    e.currentTarget
                ) {
                    onClose();
                }
            }}
        >

            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">

                    <div>

                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
                            CafeFlow
                        </p>

                        <h2 className="mt-1 text-lg font-bold text-stone-900">
                            {editingTable
                                ? 'Edit Table'
                                : 'Add New Table'}
                        </h2>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200"
                    >
                        <CloseIcon />
                    </button>

                </div>

                {/* FORM */}

                <form
                    onSubmit={onSubmit}
                    className="space-y-5 p-6"
                >

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                            {error}
                        </div>
                    )}

                    {/* NUMBER */}

                    <div>

                        <label className="mb-2 block text-xs font-bold text-stone-700">
                            Table Number
                            <span className="text-red-500">
                                {' '}
                                *
                            </span>
                        </label>

                        <input
                            name="number"
                            value={
                                form.number
                            }
                            onChange={
                                onChange
                            }
                            placeholder="e.g. 1"
                            className="w-full rounded-xl border border-stone-200 bg-[#FAF9F6] px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                        />

                    </div>

                    {/* NAME */}

                    <div>

                        <label className="mb-2 block text-xs font-bold text-stone-700">
                            Table Name
                            <span className="ml-1 font-normal text-stone-400">
                                Optional
                            </span>
                        </label>

                        <input
                            name="name"
                            value={
                                form.name
                            }
                            onChange={
                                onChange
                            }
                            placeholder="e.g. Window Table"
                            className="w-full rounded-xl border border-stone-200 bg-[#FAF9F6] px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                        />

                    </div>

                    {/* CAPACITY */}

                    <div>

                        <label className="mb-2 block text-xs font-bold text-stone-700">
                            Seating Capacity
                            <span className="ml-1 font-normal text-stone-400">
                                Optional
                            </span>
                        </label>

                        <input
                            type="number"
                            min="1"
                            name="capacity"
                            value={
                                form.capacity
                            }
                            onChange={
                                onChange
                            }
                            placeholder="e.g. 4"
                            className="w-full rounded-xl border border-stone-200 bg-[#FAF9F6] px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                        />

                    </div>

                    {/* STATUS */}

                    <div>

                        <label className="mb-2 block text-xs font-bold text-stone-700">
                            Status
                        </label>

                        <select
                            name="status"
                            value={
                                form.status
                            }
                            onChange={
                                onChange
                            }
                            className="w-full appearance-none rounded-xl border border-stone-200 bg-[#FAF9F6] px-4 py-3 text-sm font-semibold text-stone-700 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                        >
                            <option value="available">
                                Available
                            </option>

                            <option value="occupied">
                                Occupied
                            </option>

                            <option value="reserved">
                                Reserved
                            </option>

                            <option value="maintenance">
                                Maintenance
                            </option>
                        </select>

                    </div>

                    {/* BUTTONS */}

                    <div className="flex gap-3 pt-2">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-3 text-sm font-bold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <SpinnerIcon />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckIcon />
                                    {editingTable
                                        ? 'Save Changes'
                                        : 'Create Table'}
                                </>
                            )}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

/* ================================================================
   EMPTY TABLES
================================================================ */

function EmptyTables({
    search,
    onAdd,
}) {
    return (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <TableIcon className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-stone-900">
                {search
                    ? 'No tables found'
                    : 'No tables yet'}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                {search
                    ? `No table matches "${search}". Try another search.`
                    : 'Create your first restaurant table to start managing seating.'}
            </p>

            {!search && (
                <button
                    onClick={onAdd}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-sm font-bold text-white hover:bg-amber-800"
                >
                    <PlusIcon />
                    Add Table
                </button>
            )}

        </div>
    );
}

/* ================================================================
   LOADING
================================================================ */

function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[#F8F6F1]">

            <div className="border-b border-stone-200 bg-white">

                <div className="mx-auto max-w-[1500px] px-6 py-5">

                    <div className="h-8 w-40 animate-pulse rounded-lg bg-stone-200" />

                </div>

            </div>

            <div className="mx-auto max-w-[1500px] space-y-6 p-6">

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">

                    {Array.from({
                        length: 5,
                    }).map((_, i) => (
                        <div
                            key={i}
                            className="h-28 animate-pulse rounded-2xl bg-white"
                        />
                    ))}

                </div>

                <div className="h-16 animate-pulse rounded-2xl bg-white" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

                    {Array.from({
                        length: 8,
                    }).map((_, i) => (
                        <div
                            key={i}
                            className="h-72 animate-pulse rounded-3xl bg-white"
                        />
                    ))}

                </div>

            </div>

        </div>
    );
}

/* ================================================================
   HELPERS
================================================================ */

function capitalize(value) {
    if (!value) return '';

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
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
            <path d="m18 6-12 12" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            className="h-4 w-4"
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
            className="h-5 w-5"
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

function UsersIcon() {
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle
                cx="9"
                cy="7"
                r="4"
            />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function CalendarIcon() {
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
            <rect
                x="3"
                y="4"
                width="18"
                height="17"
                rx="2"
            />
            <path d="M16 2v4" />
            <path d="M8 2v4" />
            <path d="M3 10h18" />
        </svg>
    );
}

function ToolIcon() {
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
            <path d="m14.7 6.3 3 3" />
            <path d="M5 21l5.5-5.5" />
            <path d="m3 3 6 6" />
            <path d="m15 3 6 6" />
            <path d="M9 9 4 14l6 6 5-5" />
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

function FilterIcon({
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
            <path d="M4 6h16" />
            <path d="M7 12h10" />
            <path d="M10 18h4" />
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

function EditIcon() {
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
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
    );
}

function TrashIcon() {
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
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 15H6L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
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
            className="h-4 w-4 animate-spin"
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