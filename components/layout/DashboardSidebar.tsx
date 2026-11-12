"use client";

import { LayoutDashboard, BookOpen, Briefcase, Award, FileText, User, Settings, Diamond } from "lucide-react";
import { useEffect, useState } from "react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function DashboardSidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [userEmail, setUserEmail] = useState("student@courseai.com");
  const [userName, setUserName] = useState("Student");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || "Student");
        setUserEmail(user.email || "student@courseai.com");
      } catch (e) {}
    }
  }, []);

  const navItems = [
    { name: "Dashboard", id: "dashboard", icon: LayoutDashboard },
    { name: "My Courses", id: "courses", icon: BookOpen },
    { name: "Projects", id: "projects", icon: Briefcase },
    { name: "Certificates", id: "certificates", icon: Award },
    { name: "Resume Analyzer", id: "resume", icon: FileText },
    { name: "Profile", id: "profile", icon: User },
  ];

  return (
    <aside className="w-64 h-screen bg-white/60 backdrop-blur-xl border-r border-white flex flex-col justify-between shrink-0 hidden md:flex">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-white/50 mb-6">
          <div className="flex items-center gap-2 text-gray-900 cursor-pointer">
            <Diamond className="w-6 h-6 fill-current text-purple-600" />
            <span className="font-bold text-lg">CourseAI</span>
          </div>
        </div>

        <nav className="px-4 space-y-1.5">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === item.id 
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/10" 
                  : "text-gray-600 hover:bg-white/80 hover:text-gray-900"
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-white" : "text-gray-400"}`} />
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/50 bg-white/30 m-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden text-left">
            <span className="text-sm font-bold text-gray-900 truncate">{userName}</span>
            <span className="text-xs text-gray-500 truncate">{userEmail}</span>
          </div>
        </div>
        <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-900" />
      </div>
    </aside>
  );
}