"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, Copy, Check, BookOpen, PartyPopper, XCircle, ArrowRight, Loader2, Award
} from "lucide-react";
import { supabase } from "../../../../lib/supabase"; 
import PlayerSidebar from "../../../../components/course/PlayerSidebar";
import FinalProjectModal from "../../../../components/project/Projects";
import Cookies from "js-cookie";
import { toast } from "sonner";

// --- TYPES ---
interface Lesson {
  id: string;
  title: string;
  content: string;
  code_snippet?: string;
  quiz_data?: {
    question: string;
    options: string[];
    correct_answer?: string;
    answer?: string;
  };
  order_index: number;
  moduleId?: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  order_index: number;
}

export default function CoursePlayerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [isProjectSubmitted, setIsProjectSubmitted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizStatus, setQuizStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [isCopied, setIsCopied] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
const [youtubeTitle, setYoutubeTitle] = useState<string>("");
const [youtubeLoading, setYoutubeLoading] = useState(false);

  useEffect(() => {
    async function initPlayer() {
      try {
        setLoading(true);

        // A. Extract User ID from Cookie
        const rawCookie = Cookies.get('user-session') || Cookies.get('user_session');
        let currentUserId = null;
        if (rawCookie) {
          currentUserId = decodeURIComponent(rawCookie).replace(/"/g, '').replace(/-/g, '');
          setUserId(currentUserId);
        }

        // B. Fetch Course Content
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select(`*, modules (*, lessons (*))`)
          .eq('id', params.id)
          .single();

        if (courseError) throw courseError;

        if (currentUserId) {
          // C. Fetch Lesson Progress
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', currentUserId)
            .eq('course_id', params.id)
            .eq('is_completed', true);

          if (progressData) {
            setCompletedLessons(progressData.map(p => p.lesson_id));
          }

          // D. Check if Final Project is already submitted
          const { data: projectData } = await supabase
            .from('projects')
            .select('id')
            .eq('user_id', currentUserId)
            .eq('course_id', params.id)
            .maybeSingle();

          if (projectData) {
            setIsProjectSubmitted(true);
          }
        }

        // E. Sort Content
        const sortedModules = (courseData.modules || []).sort((a: any, b: any) => a.order_index - b.order_index);
        sortedModules.forEach((m: any) => {
          if (m.lessons) m.lessons.sort((a: any, b: any) => a.order_index - b.order_index);
        });

        setCourse({ ...courseData, modules: sortedModules });

        // F. Handle Routing Logic
        const lessonIdFromUrl = searchParams.get("lesson");
        const viewFromUrl = searchParams.get("view");

        if (viewFromUrl === "project") {
          if (isProjectSubmitted) {
            // If already done, redirect to certificate instead of showing form
            router.replace(`/certificate/${params.id}`);
          } else {
            setShowProjectForm(true);
            setActiveLessonId(null);
          }
        } else if (lessonIdFromUrl) {
          setActiveLessonId(lessonIdFromUrl);
          setShowProjectForm(false);
          const parentModule = sortedModules.find((m: any) => 
            m.lessons?.some((l: any) => l.id === lessonIdFromUrl)
          );
          if (parentModule) setOpenModuleId(parentModule.id);
        } else if (sortedModules[0]?.lessons?.[0]) {
          setActiveLessonId(sortedModules[0].lessons[0].id);
          setOpenModuleId(sortedModules[0].id);
        }

      } catch (err) {
        console.error("Init Error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) initPlayer();
  }, [params.id, searchParams, isProjectSubmitted]);

  // --- HELPERS ---
  const allLessons = useMemo((): Lesson[] => {
    if (!course || !course.modules) return [];
    return course.modules.flatMap((m: Module) => 
      (m.lessons || []).map((l: Lesson) => ({ ...l, moduleId: m.id }))
    );
  }, [course]);

  const activeLessonIndex = useMemo(() => {
    if (!activeLessonId || allLessons.length === 0) return -1;
    return allLessons.findIndex((l: Lesson) => l.id === activeLessonId);
  }, [allLessons, activeLessonId]);

  const activeLesson = activeLessonIndex !== -1 ? allLessons[activeLessonIndex] : null;
  useEffect(() => {
  async function loadYouTubeVideo() {
    if (!activeLesson || !course) {
      setYoutubeVideoId(null);
      setYoutubeTitle("");
      return;
    }

    try {
      setYoutubeLoading(true);
      setYoutubeVideoId(null);
      setYoutubeTitle("");

      const params = new URLSearchParams({
        lesson: activeLesson.title,
        course: course.title || "",
        difficulty: course.difficulty || "",
      });

      const response = await fetch(
        `/api/youtube?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("YouTube search failed");
      }

      const data = await response.json();

      if (data.videoId) {
        setYoutubeVideoId(data.videoId);
        setYoutubeTitle(data.title || "");
      }
    } catch (error) {
      console.error("Failed to load YouTube video:", error);
      setYoutubeVideoId(null);
    } finally {
      setYoutubeLoading(false);
    }
  }

  loadYouTubeVideo();
}, [activeLesson?.id, course?.title, course?.difficulty]);

  const currentProgress = allLessons.length > 0 
    ? Math.round((completedLessons.length / allLessons.length) * 100) 
    : 0;

  // Final Project unlocks only if ALL lessons are done AND it hasn't been submitted yet
  const isProjectUnlocked = useMemo(() => {
    return allLessons.length > 0 && 
           completedLessons.length === allLessons.length && 
           !isProjectSubmitted;
  }, [allLessons, completedLessons, isProjectSubmitted]);

  const isLessonUnlocked = (lessonId: string) => {
    const index = allLessons.findIndex((l: Lesson) => l.id === lessonId);
    if (index <= 0) return true; 
    return completedLessons.includes(allLessons[index - 1].id); 
  };

  // --- HANDLERS ---
  const handleLessonSelect = (lessonId: string, moduleId: string) => {
    if (!isLessonUnlocked(lessonId)) return; 
    setShowProjectForm(false); 
    setActiveLessonId(lessonId);
    setOpenModuleId(moduleId);
    setSelectedAnswer(null);
    setQuizStatus("idle");
    router.replace(`/player/${params.id}?lesson=${lessonId}`);
  };

  const handleProjectClick = () => {
    if (isProjectSubmitted) {
      toast.info("Course already completed!");
      router.push(`/certificate/${params.id}`);
      return;
    }
    if (!isProjectUnlocked) {
      toast.error("Finish all lessons first!");
      return;
    }
    setShowProjectForm(true);
    setActiveLessonId(null);
    router.replace(`/player/${params.id}?view=project`);
  };

  const markLessonCompleteAndProceed = async () => {
    if (!userId) return toast.error("User session not found");
    const currentCourseId = course?.id || params.id;
    
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({ 
          user_id: userId, 
          course_id: currentCourseId, 
          lesson_id: activeLessonId,
          is_completed: true,
          completed_at: new Date().toISOString()
        }, { onConflict: 'user_id,lesson_id' });

      if (error) throw error;

      if (activeLessonId && !completedLessons.includes(activeLessonId)) {
        setCompletedLessons(prev => [...prev, activeLessonId]);
      }
      
      if (activeLessonIndex < allLessons.length - 1) {
        const next = allLessons[activeLessonIndex + 1];
        handleLessonSelect(next.id, next.moduleId!);
      } else {
        if (!isProjectSubmitted) {
          toast.success("Lessons 100% complete! Now submit your project.");
          handleProjectClick();
        } else {
          toast.success("Lessons complete! View your certificate in the sidebar.");
        }
      }
    } catch (err: any) {
      toast.error("Progress Error: " + err.message);
    }
  };

  const handleSubmitAnswer = () => {
    if (!activeLesson?.quiz_data || !selectedAnswer) return;
    const quiz = activeLesson.quiz_data;
    const options = quiz.options || [];
    const rawDbValue = quiz.correct_answer || quiz.answer || "";
    const isIndex = !isNaN(Number(rawDbValue.toString().trim()));
    
    let isCorrect = false;
    if (isIndex) {
        const dbNumber = parseInt(rawDbValue.toString().replace(/\D/g, "")); 
        const userIndex = options.indexOf(selectedAnswer);
        isCorrect = (userIndex + 1) === dbNumber;
    } else {
        isCorrect = selectedAnswer.trim().toLowerCase() === rawDbValue.toString().trim().toLowerCase();
    }
    setQuizStatus(isCorrect ? "correct" : "wrong");
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
    </div>
  );

  if (!course) return <div className="p-20 text-center font-bold">Course not found.</div>;

  return (
    <div className="h-screen flex flex-col bg-[linear-gradient(120deg,#fff5f5_0%,#f3f0ff_50%,#eef2ff_100%)] font-sans overflow-hidden">
      
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-white flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push(`/courses/${params.id}`)} className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm font-medium bg-white/50 px-3 py-1.5 rounded-full border border-gray-200">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="font-bold text-gray-900 truncate max-w-md flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            {course.title}
          </h1>
        </div>
        
        <div className="flex items-center gap-4 hidden sm:flex">
          <span className="text-sm font-bold text-purple-700">{currentProgress}%</span>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${currentProgress}%` }}></div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <PlayerSidebar 
          course={course}
          openModuleId={openModuleId}
          activeLessonId={activeLessonId}
          completedLessons={completedLessons}
          onToggleModule={(id: string) => setOpenModuleId(prev => prev === id ? null : id)}
          onSelectLesson={handleLessonSelect}
          isLessonUnlocked={isLessonUnlocked}
          onProjectClick={handleProjectClick}
          isProjectActive={showProjectForm}
          isProjectUnlocked={isProjectUnlocked}
          isProjectSubmitted={isProjectSubmitted}
        />

        <main className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth">
          {showProjectForm && !isProjectSubmitted ? (
            <div className="max-w-4xl mx-auto pb-32 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="mb-10 text-center md:text-left">
                 <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Capstone Project</h1>
                 <p className="text-gray-500 mt-3 text-lg max-w-2xl leading-relaxed">
                   Upload your project details for {course.title} to get your certificate.
                 </p>
               </div>
               
               <FinalProjectModal 
                  userId={userId || ""} 
                  courseId={params.id as string} 
                  onClose={() => setShowProjectForm(false)} 
                  onComplete={() => {
                    setIsProjectSubmitted(true);
                    toast.success("Project Saved!");
                    router.push(`/certificate/${params.id}`);
                  }}
               />
            </div>
          ) : activeLesson ? (
            <div className="max-w-3xl mx-auto pb-32 animate-in fade-in duration-300">
              <h1 className="text-3xl font-bold text-[#1a1a1a] mb-8">{activeLesson.title}</h1>
              {/* YouTube Video Explanation */}
{youtubeLoading && (
  <div className="mb-10">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
      </div>

      <h2 className="text-xl font-bold text-gray-900">
        Finding Video Explanation...
      </h2>
    </div>

    <div className="w-full aspect-video rounded-2xl bg-gray-200 animate-pulse" />
  </div>
)}

{youtubeVideoId && !youtubeLoading && (
  <div className="mb-12">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
        <BookOpen className="w-5 h-5 text-purple-600" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Video Explanation
        </h2>

        {youtubeTitle && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
            {youtubeTitle}
          </p>
        )}
      </div>
    </div>

    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-gray-200">
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}`}
        title={`${activeLesson.title} - Video Explanation`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>

    <p className="text-xs text-gray-500 mt-3">
      Video explanation for this lesson.
    </p>
  </div>
)}
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-10 whitespace-pre-wrap">
                {activeLesson.content}
              </div>

              {activeLesson.code_snippet && (
                <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl bg-[#0d1117] border border-gray-800">
                   <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-gray-800">
                    <span className="text-gray-400 text-xs font-mono tracking-widest">SOURCE CODE</span>
                    <button onClick={() => {
                        if (activeLesson.code_snippet) {
                          navigator.clipboard.writeText(activeLesson.code_snippet);
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        }
                    }} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                      {isCopied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? "Copied" : "Copy Code"}
                    </button>
                  </div>
                  <pre className="p-6 text-sm text-gray-300 font-mono overflow-x-auto leading-relaxed">
                    <code>{activeLesson.code_snippet}</code>
                  </pre>
                </div>
              )}

              {activeLesson.quiz_data ? (
                <div className={`rounded-3xl p-8 border shadow-xl transition-all duration-500 mt-16 text-gray-900
                  ${quizStatus === 'correct' ? 'bg-green-50 border-green-200' : 
                    quizStatus === 'wrong' ? 'bg-red-50 border-red-200' : 'bg-white border-purple-100'}`}>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                       <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Module Quiz</h3>
                  </div>
                  
                  <p className="mb-8 font-medium text-gray-800 text-lg">{activeLesson.quiz_data.question}</p>
                  
                  <div className="space-y-3">
                    {activeLesson.quiz_data.options?.map((option: string, idx: number) => {
                        const isSelected = selectedAnswer === option;
                        let btnClass = "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 text-gray-900";
                        if (quizStatus === 'idle') {
                          if (isSelected) btnClass = "border-purple-600 bg-purple-50 ring-2 ring-purple-600/20 text-purple-700 font-bold";
                        } else {
                          if (isSelected) {
                            btnClass = quizStatus === 'correct' ? 'border-green-500 bg-green-100 text-green-800 font-bold' : 'border-red-500 bg-red-100 text-red-800 font-bold';
                          } else {
                            btnClass = 'border-gray-100 bg-gray-50 text-gray-900 opacity-50 cursor-not-allowed';
                          }
                        }
                        return (
                          <button 
                            key={idx} 
                            disabled={quizStatus !== 'idle'} 
                            onClick={() => setSelectedAnswer(option)} 
                            className={`w-full text-left p-5 rounded-2xl border transition-all text-sm font-medium ${btnClass}`}
                          >
                            {option}
                          </button>
                        );
                    })}
                  </div>

                  <div className="mt-10 flex flex-col items-center justify-center min-h-[80px]">
                    {quizStatus === 'idle' && (
                      <button disabled={!selectedAnswer} onClick={handleSubmitAnswer} className="bg-purple-600 text-white px-12 py-3.5 rounded-full font-bold hover:bg-purple-700 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all shadow-xl shadow-purple-200">
                        Check Answer
                      </button>
                    )}
                    {quizStatus === 'wrong' && (
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 text-red-600 font-bold animate-bounce"><XCircle className="w-5 h-5" /> Incorrect, try again!</div>
                        <button onClick={() => { setQuizStatus("idle"); setSelectedAnswer(null); }} className="text-gray-500 text-sm underline font-bold hover:text-gray-900">Reset Quiz</button>
                      </div>
                    )}
                    {quizStatus === 'correct' && (
                      <div className="flex flex-col items-center gap-5">
                        <div className="flex items-center gap-2 text-green-700 font-bold text-xl"><PartyPopper className="w-6 h-6" /> Perfect Answer!</div>
                        <button onClick={markLessonCompleteAndProceed} className="bg-green-600 text-white px-10 py-3.5 rounded-full font-bold hover:bg-green-700 transition-all flex items-center gap-2 shadow-xl shadow-green-200">
                          Next Lesson <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-16 flex justify-end">
                  <button onClick={markLessonCompleteAndProceed} className="bg-[#1c1c1c] text-white px-10 py-4 rounded-full font-bold flex items-center gap-3 hover:bg-purple-600 transition-all shadow-2xl">
                    Mark Complete & Proceed <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ) : isProjectSubmitted ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6 animate-in fade-in zoom-in-95">
               <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="w-12 h-12 text-green-600" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-gray-900">Course Completed!</h2>
                  <p className="text-gray-500 mt-2 max-w-sm">You have finished all lessons and submitted your project. Your certificate is ready.</p>
               </div>
               <button 
                onClick={() => router.push(`/certificate/${params.id}`)}
                className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-purple-700 transition-all"
               >
                 View Certificate
               </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
               <Award className="w-20 h-20 text-gray-200 opacity-50" />
               <p className="italic text-lg font-medium">Choose a module from the sidebar to continue.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}