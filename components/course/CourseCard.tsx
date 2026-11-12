"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, PlayCircle } from "lucide-react";

interface CourseCardProps {
  course: any;
  progress?: number; // Pass this only in dashboard mode
  mode?: "public" | "enrolled"; // Switch behavior
}

export default function CourseCard({ course, progress = 0, mode = "public" }: CourseCardProps) {
  // Determine destination based on mode
  const destination = mode === "enrolled" 
    ? `/player/${course.id}` 
    : `/courses/${course.id}`;

  return (
    <Link href={destination} className="block group h-full">
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-white shadow-xl shadow-purple-900/5 hover:shadow-2xl hover:shadow-purple-900/10 transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1">
        
        {/* Thumbnail Image */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={course.thumbnail_url || course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Difficulty Badge */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-full text-gray-900 uppercase tracking-wider shadow-sm">
            {course.difficulty}
          </div>

          {/* Play Icon Overlay (Only shows on dashboard/enrolled mode) */}
          {mode === "enrolled" && (
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-purple-700 transition-colors">
            {course.title}
          </h3>

          {/* CONDITIONAL CONTENT: Progress Bar vs Description */}
          {mode === "enrolled" ? (
            <div className="mb-6 mt-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 font-medium">Progress</span>
                <span className="text-purple-700 font-bold">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600 transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
              {course.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center text-sm font-medium text-gray-500 gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{course.modules?.length || 0} Modules</span>
            </div>

            <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center group-hover:bg-[#1c1c1c] group-hover:border-[#1c1c1c] group-hover:text-white transition-all text-gray-900">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}