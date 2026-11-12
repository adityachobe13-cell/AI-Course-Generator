"use client";

import { ChevronDown, ChevronUp, PlayCircle, CheckCircle2, Lock, Award, Check } from "lucide-react";
import { Course } from "../../lib/mockData";

interface PlayerSidebarProps {
  course: Course;
  openModuleId: string | null;
  activeLessonId: string | null;
  completedLessons: string[];
  onToggleModule: (moduleId: string) => void;
  onSelectLesson: (lessonId: string, moduleId: string) => void;
  isLessonUnlocked: (lessonId: string) => boolean;
  onProjectClick: () => void;
  isProjectActive: boolean;
  isProjectUnlocked: boolean;
  isProjectSubmitted: boolean; // NEW PROP
}

export default function PlayerSidebar({
  course,
  openModuleId,
  activeLessonId,
  completedLessons,
  onToggleModule,
  onSelectLesson,
  isLessonUnlocked,
  onProjectClick,
  isProjectActive,
  isProjectUnlocked,
  isProjectSubmitted
}: PlayerSidebarProps) {
  return (
    <aside className="w-80 bg-white/60 backdrop-blur-xl border-r border-white flex flex-col shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      
      {/* MODULES LIST */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Course Modules</h2>
        
        <div className="space-y-3">
          {course.modules.map((module, index) => {
            const isOpen = openModuleId === module.id;
            
            return (
              <div key={module.id} className="bg-white/70 rounded-2xl border border-white shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => onToggleModule(module.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white transition-colors"
                >
                  <div>
                    <span className="text-xs font-bold text-purple-600 mb-1 block">Module {index + 1}</span>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight pr-2">{module.title}</h3>
                  </div>
                  <div className="text-gray-500 bg-gray-100 p-1.5 rounded-full">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-2 pb-2 animate-in slide-in-from-top-2 duration-200">
                    {module.lessons.map((lesson) => {
                      const isActive = activeLessonId === lesson.id;
                      const isCompleted = completedLessons.includes(lesson.id);
                      const isUnlocked = isLessonUnlocked(lesson.id);
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => onSelectLesson(lesson.id, module.id)}
                          disabled={!isUnlocked}
                          className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all mb-1 
                            ${isActive ? "bg-purple-100/50 border border-purple-200 shadow-sm" : "border border-transparent"}
                            ${!isUnlocked ? "opacity-50 cursor-not-allowed" : "hover:bg-white"}
                          `}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                          ) : !isUnlocked ? (
                            <Lock className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                          ) : (
                            <PlayCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                          )}
                          
                          <span className={`text-sm leading-snug ${isActive ? "font-bold text-purple-900" : "font-medium text-gray-600"}`}>
                            {lesson.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- FINAL PROJECT BUTTON SECTION --- */}
      <div className="p-6 bg-white/40 border-t border-white shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <button
          onClick={onProjectClick}
          className={`w-full flex items-center gap-4 p-4 rounded-[24px] border transition-all duration-300 group
            ${isProjectSubmitted 
              ? "bg-green-50 border-green-200 text-green-700" // Stylish Green for completion
              : isProjectActive 
                ? "bg-[#1c1c1c] border-[#1c1c1c] text-white shadow-xl shadow-gray-200" 
                : "bg-white border-white text-gray-700 hover:border-purple-200 hover:shadow-lg"}
            ${!isProjectUnlocked && !isProjectSubmitted ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
        >
          <div className={`p-2 rounded-xl transition-colors 
            ${isProjectSubmitted ? "bg-green-500 text-white" : 
              isProjectActive ? "bg-purple-600" : "bg-purple-50 group-hover:bg-purple-100"}`}>
            
            {isProjectSubmitted ? (
               <Check className="w-5 h-5" /> // Completed State
            ) : !isProjectUnlocked ? (
               <Lock className="w-5 h-5 text-gray-400" /> // Locked State
            ) : (
               <Award className={`w-5 h-5 ${isProjectActive ? "text-white" : "text-purple-600"}`} /> // Unlocked/Active State
            )}
          </div>

          <div className="text-left">
            <span className={`text-[10px] font-black uppercase tracking-widest block mb-0.5 
              ${isProjectSubmitted ? "text-green-600" : 
                isProjectActive ? "text-purple-400" : "text-purple-600"}`}>
              {isProjectSubmitted ? "Completed" : "Certification"}
            </span>
            <h3 className="text-sm font-bold leading-none">
              {isProjectSubmitted ? "View Certificate" : "Final Project"}
            </h3>
          </div>
        </button>
      </div>
    </aside>
  );
}