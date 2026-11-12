"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, ArrowLeft, Loader2, ChevronDown } from "lucide-react";
import { supabase } from "../../lib/supabase"; 
import { hashPassword, comparePassword } from "../../lib/auth-utils"; 
import Cookies from "js-cookie"; // 1. Import js-cookie


interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultMode?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) {
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "signup">(defaultMode);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [identifier, setIdentifier] = useState(""); 
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [goal, setGoal] = useState("job");

    const [step, setStep] = useState(1);
    const [userCaptcha, setUserCaptcha] = useState("");
    const [captcha, setCaptcha] = useState({ n1: 0, n2: 0 });
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true); 
        if (isOpen) {
            setCaptcha({
                n1: Math.floor(Math.random() * 10) + 1,
                n2: Math.floor(Math.random() * 10) + 1,
            });
            setUserCaptcha("");
            setError("");
            setStep(1); 
        }
    }, [isOpen, mode]);

    if (!isOpen) return null;

    // --- MANUAL LOGIN LOGIC (Bcrypt + Cookies) ---
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (parseInt(userCaptcha) !== captcha.n1 + captcha.n2) {
            setError("Incorrect math captcha. Please try again.");
            return;
        }

        setLoading(true);

        try {
            const { data: user, error: dbError } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', identifier)
                .single();
    
            if (dbError || !user) throw new Error("Invalid email or password.");
    
            const isPasswordCorrect = await comparePassword(password, user.password_hash);
            if (!isPasswordCorrect) throw new Error("Invalid email or password.");
    
            // 2. Set Cookie Session (7 Days)
           Cookies.set("user_session", JSON.stringify(user.id), { expires: 7, path: '/' });
            
            onClose();
            // Force a refresh or push to dashboard so Navbar detects the cookie
            router.push("/dashboard");
            router.refresh(); 
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- MANUAL SIGNUP LOGIC (Bcrypt + Cookies) ---
    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) { setStep(step + 1); return; }
    
        setLoading(true);
        try {
            const hashedPassword = await hashPassword(password);
    
            const { data, error: dbError } = await supabase
                .from('profiles')
                .insert([{ 
                    full_name: name, 
                    email: identifier, 
                    password_hash: hashedPassword, 
                    learning_goal: goal 
                }])
                .select().single();
    
            if (dbError) throw dbError;
    
            // 3. Set Cookie Session (7 Days)
            Cookies.set("user_session", JSON.stringify(data.id), { expires: 7, path: '/' });
            
            onClose();
            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message.includes("unique") ? "Email already registered." : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative border border-white" onClick={(e) => e.stopPropagation()}>
                
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors z-10">
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    <div className="flex gap-6 mb-8 border-b border-gray-200">
                        <button
                            className={`pb-4 text-lg font-bold transition-colors relative ${mode === "login" ? "text-gray-900" : "text-gray-400"}`}
                            onClick={() => { setMode("login"); setError(""); }}
                        >
                            Sign In
                            {mode === "login" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-t-full"></span>}
                        </button>
                        <button
                            className={`pb-4 text-lg font-bold transition-colors relative ${mode === "signup" ? "text-gray-900" : "text-gray-400"}`}
                            onClick={() => { setMode("signup"); setStep(1); setError(""); }}
                        >
                            Sign Up
                            {mode === "signup" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-t-full"></span>}
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}

                    {mode === "login" && (
                        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                <input
                                    type="email" required
                                    value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900"
                                    placeholder="name@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                <input
                                    type="password" required
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900"
                                    placeholder="••••••••"
                                />
                            </div>

                            {mounted && (
                                <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 flex items-center justify-between gap-4 animate-in fade-in duration-500">
                                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                        Solve: <span className="text-lg font-bold text-gray-900">{captcha.n1} + {captcha.n2} = </span>
                                    </label>
                                    <input
                                        type="number" required
                                        value={userCaptcha} onChange={(e) => setUserCaptcha(e.target.value)}
                                        className="w-24 bg-white border border-gray-200 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/20 text-center text-gray-900 font-bold"
                                        placeholder="?"
                                    />
                                </div>
                            )}

                            <button disabled={loading} type="submit" className="w-full mt-2 bg-[#1c1c1c] text-white rounded-xl px-4 py-3.5 font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/5">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                                {!loading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </form>
                    )}

                    {mode === "signup" && (
                        <form onSubmit={handleSignupSubmit} className="flex flex-col gap-5">
                            <div className="flex items-center gap-2 mb-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className={`h-1.5 flex-1 rounded-full ${step >= i ? 'bg-gray-900' : 'bg-gray-200'}`} />
                                ))}
                            </div>

                            {step === 1 && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900" placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                        <input type="email" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900" placeholder="john@example.com" />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Create a Password</label>
                                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900" placeholder="••••••••" />
                                </div>
                            )}

                            {step === 3 && (
                                <div className="animate-in fade-in slide-in-from-right-2 duration-300 relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">What is your primary goal?</label>
                                    <div className="relative">
                                        <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900 appearance-none cursor-pointer">
                                            <option value="job">Learn for a Job / Career</option>
                                            <option value="hobby">Learn for a Hobby</option>
                                            <option value="exam">Study for an Exam</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                {step > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => setStep(prev => prev - 1)}
                                        className="flex-1 bg-gray-100 text-gray-700 rounded-xl px-4 py-3.5 font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back
                                    </button>
                                )}
                                <button disabled={loading} type="submit" className="flex-[2] bg-[#1c1c1c] text-white rounded-xl px-4 py-3.5 font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/5">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (step < 3 ? "Continue" : "Create Account")}
                                    {!loading && <ArrowRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}