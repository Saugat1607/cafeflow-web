import { useState } from 'react';

// Reusable form for both "add menu item" and "edit menu item".
// Pass initialValues when editing; the parent decides whether onSubmit
// calls create or update.
export default function MenuItemForm({ initialValues = {}, onSubmit, submitLabel = 'Add menu item' }) {
    const [name, setName] = useState(initialValues.name ?? '');
    const [price, setPrice] = useState(initialValues.price ?? '');
    const [category, setCategory] = useState(initialValues.category ?? '');
    const [description, setDescription] = useState(initialValues.description ?? '');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !price) {
            setError('Name and price are required.');
            return;
        }
        setSubmitting(true);
        setError('');
        Promise.resolve(
            onSubmit({
                name: name.trim(),
                price: Number(price),
                category: category.trim() || undefined,
                description: description.trim() || undefined,
            })
        )
            .catch(() => setError('Something went wrong. Please try again.'))
            .finally(() => setSubmitting(false));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Item name">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cappuccino"
                    className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
            </Field>

            <Field label="Price">
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 4.50"
                    className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
            </Field>

            <Field label="Category (optional)">
                <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Drinks"
                    className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
            </Field>

            <Field label="Description (optional)">
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Short description shown on the menu"
                    className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                />
            </Field>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-amber-700 text-white text-sm font-semibold py-2.5 hover:bg-amber-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
                {submitting ? 'Saving…' : submitLabel}
            </button>
        </form>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">{label}</span>
            {children}
        </label>
    );
}