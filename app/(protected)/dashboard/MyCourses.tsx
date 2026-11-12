"use client";

import { useState, useMemo } from "react";
import { BookOpen, Search, Clock, ArrowRight } from "lucide-react";
import CourseCard from "../../../components/course/CourseCard";

interface MyCoursesProps {
  courses: any[];
  completedLessonIds: string[];
}

export default function MyCourses({ courses, completedLessonIds }: MyCoursesProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Filter and Sort logic
  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  // 2. Identify the last accessed course from the ORIGINAL list
  // (We use the original 'courses' list so it stays pinned even if filtered out of view)
  const lastAccessedCourse = useMemo(() => {
    if (!courses.length) return null;
    return [...courses].sort((a, b) => {
      const dateA = new Date(a.last_accessed || 0).getTime();
      const dateB = new Date(b.last_accessed || 0).getTime();
      return dateB - dateA;
    })[0];
  }, [courses]);

  return (
    <div className="flex flex-col min-h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- HEADER --- */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">My Courses</h1>
          <p className="text-gray-600 mt-2">Manage your learning journey.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white shadow-sm focus-within:ring-2 focus-within:ring-purple-200 transition-all">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search my courses..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-gray-700 w-40 md:w-64"
          />
        </div>
      </header>

      {/* --- MAIN GRID --- */}
      <div className="flex-1">
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const allCourseLessons = course.modules?.flatMap((m: any) => m.lessons) || [];
              const completedInThisCourse = allCourseLessons.filter((lesson: any) => 
                  completedLessonIds.includes(lesson.id)
              ).length;

              const progressPercent = allCourseLessons.length > 0 
                ? Math.round((completedInThisCourse / allCourseLessons.length) * 100) 
                : 0;

              return (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  mode="enrolled" 
                  progress={progressPercent} 
                />
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-400 italic">
              {searchQuery ? `No courses match "${searchQuery}"` : "No courses found."}
            </p>
          </div>
        )}
      </div>

      {/* --- RECENTLY VIEWED (STICKY BOTTOM) --- */}
      {!searchQuery && lastAccessedCourse && (
        <div className="mt-12 pt-8 border-t border-white/40">
           <div className="bg-white/40 backdrop-blur-xl border border-white rounded-[32px] p-6 shadow-xl shadow-purple-900/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-purple-600 text-xs font-bold uppercase tracking-widest mb-1">Last Accessed</p>
                  <h2 className="text-xl font-bold text-gray-900">{lastAccessedCourse.title}</h2>
                </div>
              </div>
              
              <a 
                href={`/player/${lastAccessedCourse.id}`}
                className="bg-[#1c1c1c] text-white px-8 py-4 rounded-full font-bold hover:bg-purple-700 transition-all flex items-center gap-2 shadow-lg"
              >
                Resume Learning <ArrowRight className="w-4 h-4" />
              </a>
           </div>
        </div>
      )}
    </div>
  );
}