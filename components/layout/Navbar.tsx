"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Diamond, ArrowRight, LogOut, LayoutDashboard } from "lucide-react";
import Cookies from "js-cookie"; // Import js-cookie

interface NavbarProps {
    onOpenLogin?: () => void;
    onOpenSignup?: () => void;
}

export default function Navbar({ onOpenLogin, onOpenSignup }: NavbarProps) {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check for cookie session on mount
    useEffect(() => {
        const session = Cookies.get("user_session");
        if (session) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const handleLogout = () => {
        // 1. Remove the cookie
        Cookies.remove("user_session");
        setIsLoggedIn(false);
        
        // 2. Clear state and redirect
        router.push("/");
        router.refresh(); // Forces a refresh to clear any cached user data in the UI
    };

    return (
        <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full z-10 relative">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-2 cursor-pointer text-gray-900">
                <Diamond className="w-8 h-8 fill-current text-purple-600" />
                <span className="font-bold text-xl tracking-tight">CourseAI</span>
            </Link>

            {/* Center: Links (Hidden on mobile) */}
            <ul className="hidden md:flex items-center gap-8 font-medium text-gray-600">
                <li>
                    <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
                </li>
                <li>
                    <Link href="/courses" className="hover:text-gray-900 transition-colors">Courses</Link>
                </li>
               
            </ul>

            {/* Right: Dynamic Auth Buttons */}
            <div className="flex items-center gap-4 sm:gap-6 font-medium">
                {isLoggedIn ? (
                    <>
                        <Link
                            href="/dashboard"
                            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="bg-red-50 text-red-600 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full hover:bg-red-100 transition-all flex items-center gap-2 font-semibold shadow-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={onOpenLogin}
                            className="text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={onOpenSignup}
                            className="bg-[#1c1c1c] text-white px-5 py-2.5 rounded-full hover:bg-black transition-all flex items-center gap-2 font-semibold shadow-lg"
                        >
                            Get started
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}