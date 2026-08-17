import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import * as menuApi from '../api/menuApi';
import MenuItemForm from '../components/MenuItemForm';

export default function MenuPage() {
    const [items, setItems] = useState(null);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [panel, setPanel] = useState(null); // 'add' | 'edit' | null
    const [editingItem, setEditingItem] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const load = () => {
        menuApi
            .getMenuItems()
            .then((res) => setItems(res.data.data))
            .catch(() => setError('Could not load menu items.'));
    };

    useEffect(() => {
        load();
    }, []);

    const categories = useMemo(() => {
        if (!items) return [];
        return Array.from(new Set(items.map((i) => i.category).filter(Boolean))).sort();
    }, [items]);

    const filtered = useMemo(() => {
        if (!items) return [];
        const q = search.trim().toLowerCase();
        return items.filter((item) => {
            const matchesSearch = !q || item.name.toLowerCase().includes(q);
            const matchesCategory = category === 'all' || item.category === category;
            return matchesSearch && matchesCategory;
        });
    }, [items, search, category]);

    const openAddPanel = () => {
        setEditingItem(null);
        setPanel('add');
    };

    const openEditPanel = (item) => {
        setEditingItem(item);
        setPanel('edit');
    };

    const closePanel = () => {
        setPanel(null);
        setEditingItem(null);
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        menuApi
            .deleteMenuItem(deleteTarget.id)
            .then(() => {
                setDeleteTarget(null);
                load();
            })
            .catch(() => setError('Could not delete item. Please try again.'));
    };

    return (
        <div className="min-h-screen bg-stone-50/50 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-orange-700 rounded-3xl p-8 shadow-xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-200 hover:text-white transition-colors mb-3"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
                            Menu Management
                        </h1>
                        <p className="mt-2 text-amber-100 text-sm lg:text-base">
                            {items ? `${items.length} item${items.length === 1 ? '' : 's'} available on your menu` : 'Loading menu catalog...'}
                        </p>
                    </div>
                    <button
                        onClick={openAddPanel}
                        className="inline-flex items-center gap-2 rounded-xl bg-white text-amber-900 text-sm font-bold px-5 py-3 hover:bg-amber-50 transition-all shadow-md shrink-0"
                    >
                        <PlusIcon /> Add New Item
                    </button>
                </div>

                {/* Filters & Search Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-96">
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 10-10.6 0 7.5 7.5 0 0010.6 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search menu items by name..."
                            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white transition"
                        />
                    </div>
                    
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full sm:w-56 rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white transition"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm text-sm">
                        {error}
                    </div>
                )}

                {/* Content Grid / Skeletons */}
                {!items ? (
                    <MenuSkeleton />
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-16 text-center space-y-3">
                        <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto text-xl">
                            🍔
                        </div>
                        <h3 className="text-lg font-bold text-stone-800">No items found</h3>
                        <p className="text-sm text-stone-500 max-w-sm mx-auto">
                            {items.length === 0
                                ? 'Your menu is empty right now. Add your first dish or beverage to get started.'
                                : 'No items match your active search or category filter.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filtered.map((item) => (
                            <MenuItemCard
                                key={item.id}
                                item={item}
                                onEdit={() => openEditPanel(item)}
                                onDelete={() => setDeleteTarget(item)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add / Edit Slide-Over Drawer */}
            {panel && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity" onClick={closePanel} />
                    <div className="relative w-full sm:w-[460px] h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
                            <h2 className="text-lg font-bold text-stone-800">
                                {panel === 'edit' ? 'Edit Menu Item' : 'Add New Menu Item'}
                            </h2>
                            <button
                                onClick={closePanel}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
                                aria-label="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            <MenuItemForm
                                initialValues={editingItem ?? {}}
                                submitLabel={panel === 'edit' ? 'Save Changes' : 'Create Item'}
                                onSubmit={(payload) => {
                                    const request = editingItem
                                        ? menuApi.updateMenuItem(editingItem.id, payload)
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

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs" onClick={() => setDeleteTarget(null)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4 z-10">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto text-xl">
                            ⚠️
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-stone-800">Delete "{deleteTarget.name}"?</h3>
                            <p className="text-sm text-stone-500 mt-1">This action cannot be undone and will remove it from the live menu.</p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 rounded-xl border border-stone-200 text-stone-700 text-sm font-semibold py-2.5 hover:bg-stone-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 rounded-xl bg-red-600 text-white text-sm font-semibold py-2.5 hover:bg-red-700 transition shadow-sm"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MenuItemCard({ item, onEdit, onDelete }) {
    return (
        <div className="bg-white rounded-2xl shadow-xs hover:shadow-lg border border-stone-100 p-6 transition-all duration-300 flex flex-col justify-between group">
            <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-stone-800 text-base group-hover:text-amber-700 transition">
                        {item.name}
                    </h3>
                    <span className="text-base font-extrabold text-emerald-600 shrink-0">
                        Rs{Number(item.price).toFixed(2)}
                    </span>
                </div>

                {item.category && (
                    <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50 mb-3">
                        {item.category}
                    </span>
                )}

                {item.description && (
                    <p className="text-sm text-stone-500 line-clamp-2 mb-6">
                        {item.description}
                    </p>
                )}
            </div>

            <div className="flex gap-2 pt-4 border-t border-stone-100">
                <button
                    onClick={onEdit}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-700 text-xs font-semibold py-2.5 hover:bg-white hover:border-stone-300 transition shadow-xs"
                >
                    <EditIcon /> Edit
                </button>
                <button
                    onClick={onDelete}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50/30 text-red-600 text-xs font-semibold py-2.5 hover:bg-red-50 transition shadow-xs"
                >
                    <TrashIcon /> Delete
                </button>
            </div>
        </div>
    );
}

function MenuSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-2xl bg-stone-200/70"></div>
            ))}
        </div>
    );
}

function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );
}

function EditIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    );
}