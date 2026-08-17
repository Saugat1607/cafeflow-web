import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// Dropdown used in the dashboard header. Adjust the "to" paths below to
// match the routes you register in your router (see MenuPage.jsx notes).
export default function NavDropdown() {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-3.5 py-2 backdrop-blur-sm transition-colors"
            >
                Manage
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white shadow-lg border border-stone-100 py-1 z-20 overflow-hidden">
                    <Link
                        to="/"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50"
                    >
                        Tables
                    </Link>
                    <Link
                        to="/menu"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50"
                    >
                        Menu
                    </Link>
                </div>
            )}
        </div>
    );
}