"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronDown, 
  ChevronUp, 
  PlayCircle, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  Loader2
} from "lucide-react";
import Navbar from "../../../components/layout/Navbar"; 
import { supabase } from "../../../lib/supabase"; 
import Cookies from "js-cookie";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        setLoading(true);
        // Fetch course with nested modules and lessons
        const { data, error } = await supabase
          .from('courses')
          .select(`
            *,
            modules (
              *,
              lessons (*)
            )
          `)
          .eq('id', params.id)
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          setCourse(null);
          return;
        }

        // Sort modules by order_index
        const sortedModules = (data.modules || []).sort((a: any, b: any) => a.order_index - b.order_index);
        
        // Sort lessons within each module
        sortedModules.forEach((m: any) => {
          if (m.lessons) {
            m.lessons.sort((a: any, b: any) => a.order_index - b.order_index);
          }
        });

        setCourse({ ...data, modules: sortedModules });
        setOpenModuleId(sortedModules[0]?.id || null);
      } catch (err: any) {
        console.error("Error fetching course:", err.message);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) fetchCourseDetails();
  }, [params.id]);

  const toggleModule = (moduleId: string) => {
    setOpenModuleId((prev) => (prev === moduleId ? null : moduleId));
  };

  const handleEnroll = () => {
    const session = Cookies.get("user_session");
    if (!session) {
      alert("Please Sign In to enroll in this course.");
      return;
    }
    // Redirect to the first lesson of the first module
    const firstLessonId = course?.modules?.[0]?.lessons?.[0]?.id;
    if (firstLessonId) {
      router.push(`/player/${course.id}?lesson=${firstLessonId}`);
    } else {
      router.push(`/player/${course.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(120deg,#fff5f5_0%,#f3f0ff_50%,#eef2ff_100%)] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[linear-gradient(120deg,#fff5f5_0%,#f3f0ff_50%,#eef2ff_100%)] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Course not found</h1>
            <button onClick={() => router.push('/')} className="text-purple-600 font-semibold hover:underline">
              Go back home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,#fff5f5_0%,#f3f0ff_50%,#eef2ff_100%)] text-gray-900 font-sans pb-24">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
          
          <div className="flex flex-col items-start pt-4">
            <div className="bg-white/80 backdrop-blur-md border border-gray-200 text-sm font-bold px-4 py-1.5 rounded-full text-gray-900 uppercase tracking-wider shadow-sm mb-6">
              {course.difficulty}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1a1a1a] mb-6 leading-tight">
              {course.title}
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {course.description || `Embark on a professional journey to master ${course.title}. This AI-curated course covers everything from fundamentals to advanced concepts.`}
            </p>

            <div className="flex items-center gap-6 mb-10 text-gray-600 font-medium border-y border-gray-200/50 py-4 w-full">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span>{course.modules?.length || 0} Modules</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span>Self-paced</span>
              </div>
            </div>

            <button 
              onClick={handleEnroll}
              className="bg-[#1c1c1c] text-white px-10 py-4 rounded-full hover:bg-black transition-all flex items-center justify-center gap-3 font-bold shadow-xl shadow-black/10 group"
            >
              Start Learning Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/10 border-4 border-white">
            <img 
              src={course.thumbnail_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop`} 
              alt={course.title}
              className="w-full h-auto object-cover aspect-video"
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-8 text-center">Course Curriculum</h2>

          <div className="bg-white/60 backdrop-blur-xl border border-white rounded-3xl shadow-lg shadow-purple-900/5 overflow-hidden">
            {course.modules.map((module: any, index: number) => {
              const isOpen = openModuleId === module.id;
              return (
                <div key={module.id} className="border-b border-gray-200/60 last:border-0">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between p-6 hover:bg-white/40 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold shadow-inner">
                        {index + 1}
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-gray-900">{module.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{module.lessons?.length || 0} Lessons</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-full p-1 shadow-sm border border-gray-100">
                        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="bg-white/30 px-6 pb-6 pt-2 space-y-2">
                      {module.lessons?.map((lesson: any) => (
                        <div 
                           key={lesson.id} 
                           onClick={() => router.push(`/player/${course.id}?lesson=${lesson.id}`)}
                           className="flex items-center justify-between p-4 rounded-xl hover:bg-white/80 border border-transparent hover:border-white shadow-sm transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <PlayCircle className="w-5 h-5 text-gray-300 group-hover:text-purple-600 transition-colors" />
                            <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                                {lesson.title}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-purple-500 transition-colors">
                            View Lesson
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}