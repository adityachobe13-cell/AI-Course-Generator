"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import Navbar from "../../components/layout/Navbar"; // Adjust path if needed
import CourseCard from "../../components/course/CourseCard";
import { mockCourses } from "../../lib/mockData"

export default function CoursesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("All");

    // Filter Logic: Checks both the search input and the dropdown
    const filteredCourses = mockCourses.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = difficultyFilter === "All" || course.difficulty === difficultyFilter;

        return matchesSearch && matchesDifficulty;
    });

    return (
        // Reusing the same beautiful gradient background
        <div className="min-h-screen bg-[linear-gradient(120deg,#fff5f5_0%,#f3f0ff_50%,#eef2ff_100%)] text-gray-900 font-sans pb-24">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-12">

                {/* Page Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1a1a1a] mb-4">
                        Explore Courses
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Browse our AI-generated curriculum or search for a specific topic to start learning immediately.
                    </p>
                </div>

                {/* Search & Filter Bar (Glassmorphic Pill) */}
                <div className="max-w-3xl mx-auto mb-16">
                    <div className="flex flex-col sm:flex-row items-center bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-full border border-white p-2 gap-2 sm:gap-0 transition-all focus-within:ring-4 focus-within:ring-purple-500/20 shadow-xl shadow-purple-900/5">

                        {/* Search Input */}
                        <div className="flex-1 w-full flex items-center px-4 py-2 border-b sm:border-b-0 sm:border-r border-gray-200">
                            <Search className="w-5 h-5 text-gray-400 mr-3" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for JavaScript, React, etc..."
                                className="w-full bg-transparent text-gray-900 placeholder-gray-400 outline-none text-base"
                            />
                        </div>

                        {/* Difficulty Filter */}
                        <div className="w-full sm:w-auto flex items-center px-4 py-2">
                            <SlidersHorizontal className="w-4 h-4 text-gray-400 mr-2" />
                            <select
                                value={difficultyFilter}
                                onChange={(e) => setDifficultyFilter(e.target.value)}
                                className="bg-transparent text-gray-700 font-medium outline-none cursor-pointer appearance-none pr-4"
                            >
                                <option value="All">All Levels</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                    </div>
                </div>

                {/* Courses Grid */}
                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    // Empty State if search yields no results
                    <div className="text-center py-20 bg-white/40 backdrop-blur-sm rounded-3xl border border-white">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No courses found</h3>
                        <p className="text-gray-600">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                )}

            </main>
        </div>
    );
}