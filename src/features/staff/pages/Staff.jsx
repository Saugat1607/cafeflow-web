import { useEffect, useState } from "react";
import {
    Users,
    UserPlus,
    Search,
    Trash2,
    RefreshCw,
    CheckCircle,
    XCircle,
} from "lucide-react";

import {
    getStaff,
    createStaff,
    deleteStaff,
} from "../api/staffApi";

import StaffForm from "../components/StaffForm";

const Staff = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    const loadStaff = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getStaff();

            // Laravel response:
            // {
            //     success: true,
            //     data: [...]
            // }

            setStaff(response.data || []);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    "Failed to load staff."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStaff();
    }, []);

    const handleCreate = async (formData) => {
        try {
            setCreating(true);
            setError("");

            const response = await createStaff(formData);

            setStaff((prev) => [
                response.data,
                ...prev,
            ]);

            setShowForm(false);

            alert("Staff account created successfully!");
        } catch (err) {
            console.error(err);

            const message =
                err.response?.data?.message ||
                "Failed to create staff.";

            setError(message);
            alert(message);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this staff account?"
        );

        if (!confirmed) return;

        try {
            await deleteStaff(id);

            setStaff((prev) =>
                prev.filter((item) => item.id !== id)
            );

            alert("Staff deleted successfully.");
        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                    "Failed to delete staff."
            );
        }
    };

    const filteredStaff = staff.filter((item) => {
        const name = item.user?.name || "";
        const email = item.user?.email || "";
        const code = item.staff_code || "";
        const position = item.position || "";

        const query = search.toLowerCase();

        return (
            name.toLowerCase().includes(query) ||
            email.toLowerCase().includes(query) ||
            code.toLowerCase().includes(query) ||
            position.toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            {/* Header */}
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                            <Users size={24} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Staff Management
                            </h1>

                            <p className="text-sm text-gray-500">
                                Manage your CafeFlow staff accounts
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                    <UserPlus size={19} />
                    Add Staff
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Stats */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Total Staff
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        {staff.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Active Staff
                    </p>

                    <p className="mt-2 text-3xl font-bold text-green-600">
                        {
                            staff.filter(
                                (item) => item.status
                            ).length
                        }
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Inactive Staff
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-500">
                        {
                            staff.filter(
                                (item) => !item.status
                            ).length
                        }
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <Search
                    size={20}
                    className="text-gray-400"
                />

                <input
                    type="text"
                    placeholder="Search staff..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    className="w-full bg-transparent outline-none"
                />

                <button
                    onClick={loadStaff}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    title="Refresh"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Staff table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="text-center">
                            <RefreshCw
                                className="mx-auto animate-spin text-blue-600"
                                size={30}
                            />

                            <p className="mt-3 text-sm text-gray-500">
                                Loading staff...
                            </p>
                        </div>
                    </div>
                ) : filteredStaff.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users
                            className="mx-auto text-gray-300"
                            size={48}
                        />

                        <h3 className="mt-4 font-semibold text-gray-900">
                            No staff found
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Create your first staff account.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                        Staff ID
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                        Staff
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                        Position
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                        Phone
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {filteredStaff.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50"
                                    >

                                        {/* Staff ID */}
                                        <td className="px-6 py-4">
                                            <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                                                {item.staff_code}
                                            </span>
                                        </td>

                                        {/* User */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">

                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                                                    {item.user?.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()}
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {item.user?.name}
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        {item.user?.email}
                                                    </p>
                                                </div>

                                            </div>
                                        </td>

                                        {/* Position */}
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {item.position || "—"}
                                        </td>

                                        {/* Phone */}
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {item.phone || "—"}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            {item.status ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                                    <CheckCircle size={14} />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                                    <XCircle size={14} />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        item.id
                                                    )
                                                }
                                                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>
                        </table>

                    </div>
                )}

            </div>

            {/* Create Staff Modal */}
            {showForm && (
                <StaffForm
                    onClose={() =>
                        setShowForm(false)
                    }
                    onSubmit={handleCreate}
                    loading={creating}
                />
            )}
        </div>
    );
};

export default Staff;