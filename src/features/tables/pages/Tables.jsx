import { useEffect, useState } from 'react';
import * as tablesApi from '../api/tablesApi';

export default function Tables() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        tablesApi.getTables()
            .then((res) => setTables(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-stone-500">Loading tables…</div>;

    return (
        <div className="max-w-5xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-stone-800 mb-6">🪑 Tables</h1>

            <div className="grid sm:grid-cols-3 gap-5">
                {tables.map((table) => (
                    <div key={table.id} className="bg-white rounded-2xl shadow border border-amber-100 p-5">
                        <h3 className="font-bold text-lg text-stone-800">{table.name}</h3>
                        <p className="text-sm text-stone-500 mt-1">{table.status ?? 'available'}</p>
                    </div>
                ))}
            </div>

            {tables.length === 0 && (
                <p className="text-stone-500 text-center mt-10">No tables yet.</p>
            )}
        </div>
    );
}
