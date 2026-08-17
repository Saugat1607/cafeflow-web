import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import * as menuApi from '../api/menuApi';
import MenuItemForm from '../components/MenuItemForm';

export default function MenuPage() {
    const [items, setItems] = useState(null);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');

    const [panel, setPanel] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // ============================================================
    // LOAD MENU
    // ============================================================

    const load = () => {
        setError('');

        menuApi
            .getMenuItems()
            .then((res) => {
                setItems(res.data.data || []);
            })
            .catch(() => {
                setError('Could not load menu items.');
            });
    };

    useEffect(() => {
        load();
    }, []);

    // ============================================================
    // CATEGORIES
    // ============================================================

    const categories = useMemo(() => {
        if (!items) return [];

        return Array.from(
            new Set(
                items
                    .map((item) => item.category)
                    .filter(Boolean)
                    .map((cat) => cat.trim())
            )
        ).sort();
    }, [items]);

    // ============================================================
    // FILTER ITEMS
    // ============================================================

    const filteredItems = useMemo(() => {
        if (!items) return [];

        const query = search.trim().toLowerCase();

        return items.filter((item) => {
            const name = item.name?.toLowerCase() || '';
            const description = item.description?.toLowerCase() || '';
            const itemCategory = item.category?.toLowerCase() || '';

            const matchesSearch =
                !query ||
                name.includes(query) ||
                description.includes(query) ||
                itemCategory.includes(query);

            const matchesCategory =
                category === 'all' ||
                item.category === category;

            return matchesSearch && matchesCategory;
        });
    }, [items, search, category]);

    // ============================================================
    // GROUP BY CATEGORY
    // ============================================================

    const groupedItems = useMemo(() => {
        const groups = {};

        filteredItems.forEach((item) => {
            const categoryName = item.category || 'Uncategorized';

            if (!groups[categoryName]) {
                groups[categoryName] = [];
            }

            groups[categoryName].push(item);
        });

        return groups;
    }, [filteredItems]);

    // ============================================================
    // ADD
    // ============================================================

    const openAddPanel = () => {
        setEditingItem(null);
        setPanel('add');
    };

    // ============================================================
    // EDIT
    // ============================================================

    const openEditPanel = (item) => {
        setEditingItem(item);
        setPanel('edit');
    };

    // ============================================================
    // CLOSE PANEL
    // ============================================================

    const closePanel = () => {
        setPanel(null);
        setEditingItem(null);
    };

    // ============================================================
    // DELETE
    // ============================================================

    const handleDelete = () => {
        if (!deleteTarget) return;

        menuApi
            .deleteMenuItem(deleteTarget.id)
            .then(() => {
                setDeleteTarget(null);
                load();
            })
            .catch(() => {
                setError('Could not delete item. Please try again.');
            });
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (!items) {
        return <MenuLoading />;
    }

    return (
        <div className="min-h-screen bg-[#F8F6F1] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <header className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">

                    <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <Link
                                to="/"
                                className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500 transition hover:text-amber-700"
                            >
                                <ArrowLeftIcon />
                                Back to Dashboard
                            </Link>

                            <div className="flex items-center gap-4">

                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                                    <RestaurantIcon />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                                        Menu Management
                                    </h1>

                                    <p className="mt-1 text-sm text-stone-500">
                                        Organize and manage your restaurant menu.
                                    </p>
                                </div>

                            </div>
                        </div>

                        <button
                            onClick={openAddPanel}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-amber-800 active:scale-[0.98]"
                        >
                            <PlusIcon />
                            Add New Item
                        </button>

                    </div>

                    {/* ==================================================
                        STATS
                    ================================================== */}

                    <div className="grid grid-cols-3 border-t border-stone-200 bg-[#FAF9F6]">

                        <Stat
                            value={items.length}
                            label="Total Items"
                        />

                        <Stat
                            value={categories.length}
                            label="Categories"
                        />

                        <Stat
                            value={filteredItems.length}
                            label="Showing"
                        />

                    </div>

                </header>

                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">

                        <AlertIcon />

                        <span>{error}</span>

                        <button
                            onClick={() => setError('')}
                            className="ml-auto rounded-lg p-1 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                        >
                            <CloseIcon />
                        </button>

                    </div>
                )}

                {/* ==================================================
                    SEARCH
                ================================================== */}

                <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                        <div className="relative flex-1">

                            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search menu items..."
                                className="w-full rounded-xl border border-stone-200 bg-[#FAF9F6] py-3 pl-11 pr-10 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-100"
                            />

                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                                >
                                    <CloseIcon />
                                </button>
                            )}

                        </div>

                        <div className="text-sm text-stone-500">

                            <span className="font-semibold text-stone-800">
                                {filteredItems.length}
                            </span>

                            {' '}
                            {filteredItems.length === 1
                                ? 'item'
                                : 'items'} found

                        </div>

                    </div>

                </section>

                {/* ==================================================
                    CATEGORY TABS
                ================================================== */}

                <section className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">

                    <div className="flex gap-2 overflow-x-auto">

                        <CategoryTab
                            label="All Items"
                            count={items.length}
                            active={category === 'all'}
                            onClick={() => setCategory('all')}
                            icon={<GridIcon />}
                        />

                        {categories.map((cat) => {

                            const count = items.filter(
                                (item) => item.category === cat
                            ).length;

                            return (
                                <CategoryTab
                                    key={cat}
                                    label={cat}
                                    count={count}
                                    active={category === cat}
                                    onClick={() => setCategory(cat)}
                                />
                            );
                        })}

                    </div>

                </section>

                {/* ==================================================
                    MENU CONTENT
                ================================================== */}

                {filteredItems.length === 0 ? (

                    <EmptyState
                        hasItems={items.length > 0}
                        search={search}
                        onAdd={openAddPanel}
                    />

                ) : category === 'all' ? (

                    <div className="space-y-10">

                        {Object.entries(groupedItems).map(
                            ([groupCategory, groupItems]) => (

                                <CategorySection
                                    key={groupCategory}
                                    category={groupCategory}
                                    items={groupItems}
                                    onEdit={openEditPanel}
                                    onDelete={setDeleteTarget}
                                />

                            )
                        )}

                    </div>

                ) : (

                    <CategorySection
                        category={category}
                        items={filteredItems}
                        onEdit={openEditPanel}
                        onDelete={setDeleteTarget}
                    />

                )}

            </div>

            {/* ======================================================
                ADD / EDIT DRAWER
            ======================================================= */}

            {panel && (
                <div className="fixed inset-0 z-50 flex justify-end">

                    <div
                        className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm"
                        onClick={closePanel}
                    />

                    <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">

                            <div>

                                <h2 className="text-lg font-bold text-stone-900">
                                    {panel === 'edit'
                                        ? 'Edit Menu Item'
                                        : 'Add New Menu Item'}
                                </h2>

                                <p className="mt-1 text-xs text-stone-500">
                                    {panel === 'edit'
                                        ? 'Update this menu item.'
                                        : 'Add a new item to your menu.'}
                                </p>

                            </div>

                            <button
                                onClick={closePanel}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                            >
                                <CloseIcon />
                            </button>

                        </div>

                        <div className="flex-1 overflow-y-auto p-6">

                            <MenuItemForm
                                initialValues={editingItem ?? {}}
                                submitLabel={
                                    panel === 'edit'
                                        ? 'Save Changes'
                                        : 'Create Item'
                                }
                                onSubmit={(payload) => {

                                    const request = editingItem
                                        ? menuApi.updateMenuItem(
                                            editingItem.id,
                                            payload
                                        )
                                        : menuApi.createMenuItem(payload);

                                    return request.then(() => {
                                        closePanel();
                                        load();
                                    });

                                }}
                            />

                        </div>

                    </div>

                </div>
            )}

            {/* ======================================================
                DELETE MODAL
            ======================================================= */}

            {deleteTarget && (
                <DeleteModal
                    item={deleteTarget}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                />
            )}

        </div>
    );
}

/* =====================================================================
   CATEGORY SECTION
===================================================================== */

function CategorySection({
    category,
    items,
    onEdit,
    onDelete,
}) {
    return (
        <section>

            {/* Category Header */}

            <div className="mb-5 flex items-center gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <CategoryIcon />
                </div>

                <div className="shrink-0">

                    <div className="flex items-center gap-3">

                        <h2 className="text-xl font-bold text-stone-900">
                            {category}
                        </h2>

                        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">
                            {items.length}
                        </span>

                    </div>

                    <p className="mt-0.5 text-xs text-stone-500">
                        {items.length === 1
                            ? '1 menu item'
                            : `${items.length} menu items`}
                    </p>

                </div>

                <div className="h-px flex-1 bg-stone-200" />

            </div>

            {/* Cards */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                {items.map((item) => (

                    <MenuItemCard
                        key={item.id}
                        item={item}
                        onEdit={() => onEdit(item)}
                        onDelete={() => onDelete(item)}
                    />

                ))}

            </div>

        </section>
    );
}

/* =====================================================================
   MENU ITEM CARD
===================================================================== */

function MenuItemCard({
    item,
    onEdit,
    onDelete,
}) {
    return (
        <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md">

            <div className="p-5">

                <div className="mb-4 flex items-start justify-between gap-4">

                    <div className="min-w-0">

                        <h3 className="truncate text-base font-bold text-stone-900">
                            {item.name}
                        </h3>

                        {item.category && (
                            <span className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                                {item.category}
                            </span>
                        )}

                    </div>

                    {/* Price */}

                    <div className="shrink-0 text-right">

                        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                            Price
                        </p>

                        <p className="mt-0.5 text-lg font-bold text-emerald-700">
                            Rs. {Number(item.price).toFixed(2)}
                        </p>

                    </div>

                </div>

                {/* Description */}

                <div className="min-h-[48px]">

                    {item.description ? (

                        <p className="line-clamp-2 text-sm leading-6 text-stone-500">
                            {item.description}
                        </p>

                    ) : (

                        <p className="text-sm italic text-stone-400">
                            No description available
                        </p>

                    )}

                </div>

            </div>

            {/* Actions */}

            <div className="mt-auto flex border-t border-stone-100 bg-[#FAF9F6]">

                <button
                    onClick={onEdit}
                    className="flex flex-1 items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-stone-600 transition hover:bg-white hover:text-amber-700"
                >
                    <EditIcon />
                    Edit
                </button>

                <div className="w-px bg-stone-200" />

                <button
                    onClick={onDelete}
                    className="flex flex-1 items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-stone-600 transition hover:bg-red-50 hover:text-red-600"
                >
                    <TrashIcon />
                    Delete
                </button>

            </div>

        </article>
    );
}

/* =====================================================================
   CATEGORY TAB
===================================================================== */

function CategoryTab({
    label,
    count,
    active,
    onClick,
    icon,
}) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                active
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:bg-amber-50 hover:text-amber-800'
            }`}
        >

            {icon}

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

/* =====================================================================
   STAT
===================================================================== */

function Stat({
    value,
    label,
}) {
    return (
        <div className="px-5 py-4 sm:px-7">

            <p className="text-xl font-bold text-stone-900">
                {value}
            </p>

            <p className="mt-0.5 text-[11px] font-medium text-stone-500">
                {label}
            </p>

        </div>
    );
}

/* =====================================================================
   EMPTY STATE
===================================================================== */

function EmptyState({
    hasItems,
    search,
    onAdd,
}) {
    return (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">

                {search
                    ? <SearchIcon />
                    : <RestaurantIcon />
                }

            </div>

            <h3 className="mt-5 text-lg font-bold text-stone-900">

                {hasItems
                    ? 'No menu items found'
                    : 'Your menu is empty'}

            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">

                {hasItems
                    ? 'Try changing your search or selecting another category.'
                    : 'Start building your menu by adding your first item.'}

            </p>

            {!hasItems && (
                <button
                    onClick={onAdd}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-800"
                >
                    <PlusIcon />
                    Add First Item
                </button>
            )}

        </div>
    );
}

/* =====================================================================
   DELETE MODAL
===================================================================== */

function DeleteModal({
    item,
    onCancel,
    onConfirm,
}) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

            <div
                className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <TrashIcon />
                </div>

                <h3 className="mt-5 text-lg font-bold text-stone-900">
                    Delete menu item?
                </h3>

                <p className="mt-2 text-sm leading-6 text-stone-500">

                    Are you sure you want to delete{' '}

                    <span className="font-semibold text-stone-800">
                        "{item.name}"
                    </span>

                    ?

                    This action cannot be undone.

                </p>

                <div className="mt-6 flex gap-3">

                    <button
                        onClick={onCancel}
                        className="flex-1 rounded-xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                        Delete Item
                    </button>

                </div>

            </div>

        </div>
    );
}

/* =====================================================================
   LOADING
===================================================================== */

function MenuLoading() {
    return (
        <div className="min-h-screen bg-[#F8F6F1] px-4 py-6 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-7xl space-y-6">

                <div className="h-48 animate-pulse rounded-3xl bg-stone-200" />

                <div className="h-20 animate-pulse rounded-2xl bg-white" />

                <div className="h-14 animate-pulse rounded-2xl bg-white" />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                    {Array.from({ length: 6 }).map((_, index) => (

                        <div
                            key={index}
                            className="h-48 animate-pulse rounded-2xl bg-white"
                        />

                    ))}

                </div>

            </div>

        </div>
    );
}

/* =====================================================================
   ICONS
===================================================================== */

function RestaurantIcon() {
    return (
        <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 3v8" />
            <path d="M8 3v8" />
            <path d="M6 3v18" />
            <path d="M4 11h4" />
            <path d="M14 3v18" />
            <path d="M14 3c4 1 6 4 6 7v2h-6" />
        </svg>
    );
}

function CategoryIcon() {
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
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}

function GridIcon() {
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
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}

function SearchIcon({ className = 'h-5 w-5' }) {
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
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg
            className="h-5 w-5"
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
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v5" />
            <path d="M14 11v5" />
        </svg>
    );
}

function ArrowLeftIcon() {
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
            <path d="m15 18-6-6 6-6" />
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