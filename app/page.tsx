"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import AuthModal from "../components/auth/AuthModal";
import Cookies from "js-cookie";
import { toast } from "sonner"; // Ensure you have installed 'sonner'

export default function HomePage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [isGenerating, setIsGenerating] = useState(false);

  // Modal State Management
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const openLogin = () => {
    setAuthMode("login");
    setIsAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthMode("signup");
    setIsAuthModalOpen(true);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    // 1. Check for Cookie Session
    const session = Cookies.get("user_session");
    if (!session) {
      openSignup();
      return;
    }

    const user = JSON.parse(session);
    setIsGenerating(true);

    // 2. Start the Progress Toasts
    const toastId = toast.loading("Connecting to AI Architect...");

    try {
      // Step A: Analyzing
      toast.loading("Analyzing the topic depth...", { id: toastId });
      
      // Step B: Call your Next.js API Route
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic, 
          difficulty, 
          userId: user.id 
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      // Step C: Detailed Writing (Simulating visual progress for UX)
      toast.loading("Drafting dynamic modules and lessons...", { id: toastId });
      await new Promise(r => setTimeout(r, 1500));
      
      toast.loading("Generating code samples and exercises...", { id: toastId });
      await new Promise(r => setTimeout(r, 1000));

      // Step D: Success
      toast.success("Course successfully generated!", {
        id: toastId,
        icon: <Sparkles className="w-5 h-5 text-yellow-500" />,
      });

      // 3. Redirect to the Player with the new Course ID
      router.push(`/courses/${result.courseId}`);

    } catch (err: any) {
      toast.error(err.message || "Something went wrong", { id: toastId });
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,#fff5f5_0%,#f3f0ff_50%,#eef2ff_100%)] text-gray-900 font-sans relative flex flex-col">
      
      <Navbar onOpenLogin={openLogin} onOpenSignup={openSignup} />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pb-32 max-w-4xl mx-auto w-full relative z-10">
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-6 text-[#1a1a1a]">
          Master any skill, <br className="hidden md:block" />
          at your own pace.
        </h1>

        <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl">
          Enter a topic and our AI will generate a structured, personalized learning path complete with lessons, code snippets, and quizzes.
        </p>

        <form onSubmit={handleGenerate} className="w-full max-w-3xl flex flex-col sm:flex-row items-center bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-full border border-white p-2 gap-2 sm:gap-0 transition-all focus-within:ring-4 focus-within:ring-purple-500/20 shadow-xl shadow-purple-900/5">
          
          {/* Difficulty Selector */}
          <div className="w-full sm:w-auto flex border-b sm:border-b-0 sm:border-r border-gray-200 pr-2">
            <select 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)} 
              disabled={isGenerating}
              className="w-full bg-transparent text-gray-700 font-medium px-4 py-3 outline-none cursor-pointer appearance-none disabled:opacity-50"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Text Input */}
          <input 
            type="text" 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)} 
            disabled={isGenerating}
            placeholder="I want to learn..." 
            className="flex-1 w-full bg-transparent px-6 py-3 text-gray-900 placeholder-gray-400 outline-none text-lg disabled:opacity-50" 
            required 
          />

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isGenerating}
            className="w-full sm:w-auto bg-[#1c1c1c] text-white rounded-xl sm:rounded-full px-8 py-3.5 font-bold hover:bg-black transition-all flex items-center justify-center gap-2 disabled:bg-gray-700 shadow-lg shadow-black/5"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Generate
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
}