import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [shake, setShake] = useState(false);
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
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] font-[Inter]">

            {/* HERO PANEL */}
            <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#2B1B12] px-14 py-14">
                {/* warm glow behind the cup */}
                <div className="absolute -bottom-24 -left-16 w-[420px] h-[420px] rounded-full bg-[#C1793A]/25 blur-3xl" />
                {/* grain texture */}
                <div
                    className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
                    style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
                        backgroundSize: '18px 18px',
                    }}
                />

                <div className="relative z-10 animate-slideInLeft">
                    <span className="text-[#C1793A] text-xs tracking-[0.25em] uppercase font-semibold">CafeFlow</span>
                    <h1 className="mt-4 font-[Fraunces] text-6xl leading-[0.95] text-[#FAF3E7]">
                        Every cup,<br />in flow.
                    </h1>
                    <p className="mt-6 text-[#FAF3E7]/60 text-base max-w-sm leading-relaxed">
                        Orders, tabs, and inventory — run your whole counter without leaving the till.
                    </p>
                </div>

                {/* SIGNATURE: brewing cup */}
                <div className="relative z-10 flex items-end justify-center animate-slideInLeft" style={{ animationDelay: '0.15s' }}>
                    <svg viewBox="0 0 240 260" className="w-56 h-56">
                        <defs>
                            <clipPath id="cupClip">
                                <path d="M60,58 L180,58 L164,222 Q164,236 150,236 L90,236 Q76,236 76,222 Z" />
                            </clipPath>
                            <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#E0A458" />
                                <stop offset="100%" stopColor="#8B3A2F" />
                            </linearGradient>
                        </defs>

                        {/* saucer */}
                        <ellipse cx="120" cy="244" rx="72" ry="10" fill="#FAF3E7" opacity="0.08" />

                        {/* liquid, clipped to cup interior, animates rising/falling */}
                        <g clipPath="url(#cupClip)">
                            <rect x="60" y="40" width="120" height="200" fill="url(#liquidGrad)" className="liquid-fill" />
                        </g>

                        {/* cup outline */}
                        <path
                            d="M60,58 L180,58 L164,222 Q164,236 150,236 L90,236 Q76,236 76,222 Z"
                            fill="none"
                            stroke="#FAF3E7"
                            strokeWidth="3"
                            strokeLinejoin="round"
                        />
                        {/* handle */}
                        <path
                            d="M180,88 a34,34 0 0 1 0,68"
                            fill="none"
                            stroke="#FAF3E7"
                            strokeWidth="9"
                            strokeLinecap="round"
                        />

                        {/* steam */}
                        <rect x="98" y="20" width="4" height="14" rx="2" fill="#FAF3E7" className="steam-svg" style={{ animationDelay: '0s' }} />
                        <rect x="118" y="14" width="4" height="14" rx="2" fill="#FAF3E7" className="steam-svg" style={{ animationDelay: '0.5s' }} />
                        <rect x="138" y="20" width="4" height="14" rx="2" fill="#FAF3E7" className="steam-svg" style={{ animationDelay: '1s' }} />
                    </svg>
                </div>
            </div>

            {/* FORM PANEL */}
            <div className="relative flex items-center justify-center bg-[#FAF3E7] px-6 py-14">
                <div className={`w-full max-w-sm animate-slideInRight ${shake ? 'animate-shake' : ''}`}>

                    {/* mobile-only brand mark */}
                    <div className="flex lg:hidden items-center gap-2 mb-10">
                        <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[#2B1B12] text-[#FAF3E7] text-lg">☕</span>
                        <span className="font-[Fraunces] text-xl text-[#2B1B12]">CafeFlow</span>
                    </div>

                    <h2 className="font-[Fraunces] text-3xl text-[#2B1B12] mb-1">Welcome back</h2>
                    <p className="text-[#2B1B12]/50 text-sm mb-8">Log in to pick up where you left off.</p>

                    {error && (
                        <div className="mb-5 text-sm text-[#8B3A2F] bg-[#8B3A2F]/10 border border-[#8B3A2F]/20 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold tracking-wide uppercase text-[#2B1B12]/50 mb-1.5">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-[#2B1B12]/15 bg-white px-3 py-2.5 text-[#2B1B12] transition-all duration-200 focus:border-[#C1793A] focus:ring-2 focus:ring-[#C1793A]/30 outline-none"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-semibold tracking-wide uppercase text-[#2B1B12]/50">Password</label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-medium text-[#C1793A] hover:text-[#8B3A2F] story-link"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-[#2B1B12]/15 bg-white px-3 py-2.5 text-[#2B1B12] transition-all duration-200 focus:border-[#C1793A] focus:ring-2 focus:ring-[#C1793A]/30 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="relative w-full overflow-hidden rounded-lg bg-[#2B1B12] hover:bg-[#3d281c] active:scale-[0.98] text-[#FAF3E7] font-semibold py-3 shadow-md transition-all duration-200 disabled:opacity-80 flex items-center justify-center gap-2"
                        >
                            {submitting && (
                                <span
                                    className="absolute inset-0 bg-[#C1793A]/70 origin-left"
                                    style={{ animation: 'brewProgress 1.1s ease-in-out infinite' }}
                                />
                            )}
                            <span className="relative z-10">{submitting ? 'Brewing…' : 'Log in'}</span>
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');

                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-24px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(24px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slideInLeft { animation: slideInLeft 0.6s ease-out both; }
                .animate-slideInRight { animation: slideInRight 0.6s ease-out both; }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-6px); }
                    40% { transform: translateX(6px); }
                    60% { transform: translateX(-4px); }
                    80% { transform: translateX(4px); }
                }
                .animate-shake { animation: shake 0.4s ease-in-out; }

                .liquid-fill {
                    transform-origin: bottom;
                    animation: pourFill 3.5s ease-in-out infinite alternate;
                }
                @keyframes pourFill {
                    0% { transform: translateY(58%); }
                    100% { transform: translateY(6%); }
                }

                .steam-svg {
                    opacity: 0;
                    animation: steamRise 2.4s ease-in infinite;
                }
                @keyframes steamRise {
                    0% { opacity: 0; transform: translateY(0) scaleX(1); }
                    30% { opacity: 0.7; }
                    100% { opacity: 0; transform: translateY(-16px) scaleX(1.8); }
                }

                @keyframes brewProgress {
                    0% { transform: scaleX(0); }
                    50% { transform: scaleX(1); }
                    100% { transform: scaleX(1); opacity: 0; }
                }

                .story-link { position: relative; }
                .story-link::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: -2px;
                    width: 100%;
                    height: 1px;
                    background: currentColor;
                    transform: scaleX(0);
                    transform-origin: right;
                    transition: transform 0.2s ease-out;
                }
                .story-link:hover::after { transform: scaleX(1); transform-origin: left; }

                @media (prefers-reduced-motion: reduce) {
                    * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
                }
            `}</style>
        </div>
    );
}