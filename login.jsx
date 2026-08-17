import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Invalid email or password.'
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 px-4">
            <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-xl border border-amber-100 px-8 py-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-amber-800 shadow-lg mb-3">
                        <span className="text-amber-50 text-2xl">☕</span>
                    </div>
                    <h1 className="text-2xl font-bold text-stone-800">
                        Cafe<span className="text-amber-700">Flow</span>
                    </h1>
                </div>

                {error && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border-stone-300 bg-stone-50 px-3 py-2 focus:border-amber-600 focus:ring-amber-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border-stone-300 bg-stone-50 px-3 py-2 focus:border-amber-600 focus:ring-amber-600"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-semibold py-2.5 shadow-md transition disabled:opacity-60"
                    >
                        {submitting ? 'Logging in…' : 'Log in'}
                    </button>
                </form>
            </div>
        </div>
    );
}