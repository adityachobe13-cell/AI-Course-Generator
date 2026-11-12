"use client";

import { useState, useEffect } from "react";
import { Activity, TrendingUp, CheckCircle2, Clock, Code, Award, Loader2 } from "lucide-react";
import DashboardSidebar from "../../../components/layout/DashboardSidebar";
import { supabase } from "../../../lib/supabase";
import MyCourses from "./MyCourses";
import Cookies from "js-cookie";
import ProfileSection from "./Profile";
import ResumeAnalyzer from './ResumeAnalyzer';
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- ADD THESE TWO STATES ---
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const [stats, setStats] = useState({
    resumeScore: 0,
    completionRate: 0,
    projectCount: 0,
    certCount: 0
  });
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        const rawCookie = Cookies.get('user-session') || Cookies.get('user_session');
        if (!rawCookie) return;
        const userId = decodeURIComponent(rawCookie).replace(/"/g, '');

        // 1. Fetch User Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profile) setUserData(profile);

        // 2. Fetch Progress (IDs for MyCourses calculations)
        const { data: progress } = await supabase
          .from('user_progress')
          .select(`
            is_completed, 
            completed_at, 
            lesson_id,
            courses (title),
            lessons (title)
          `)
          .eq('user_id', userId)
          .order('completed_at', { ascending: false });

        if (progress) {
          // Save completed lesson IDs to state
          const completedIds = progress.filter(p => p.is_completed).map(p => p.lesson_id);
          setCompletedLessons(completedIds);

          // Update Stats
          const completedCount = completedIds.length;
          const mockCompletion = completedCount > 0 ? Math.min(Math.round((completedCount / 20) * 100), 100) : 0;

          setStats(prev => ({
            ...prev,
            resumeScore: profile?.resume_score || 0,
            completionRate: mockCompletion,
          }));

          // Set Activities
          const latestActivities = progress.slice(0, 2).map(p => ({
            action: "Completed Lesson",
            subject: (p.lessons as any)?.title || "Lesson",
            time: p.completed_at ? new Date(p.completed_at).toLocaleDateString() : "Recently"
          }));
          setActivities(latestActivities);
        }

        // 3. Fetch Full Enrolled Course Data (with modules and lessons)
        const { data: enrollments } = await supabase
          .from('user_progress')
          .select(`
            course_id,
            courses (*, modules (*, lessons (*)))
          `)
          .eq('user_id', userId);

        if (enrollments) {
          // Filter unique courses
          const uniqueCourseMap = new Map();
          enrollments.forEach((item: any) => {
            if (item.courses) {
              uniqueCourseMap.set(item.course_id, item.courses);
            }
          });
          setEnrolledCourses(Array.from(uniqueCourseMap.values()));
        }

      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const renderContent = () => {
    if (loading) return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );

    switch (activeTab) {
      case "dashboard":
        return <DashboardHome userData={userData} stats={stats} activities={activities} />;
      case "courses":
        return (
          <MyCourses 
            courses={enrolledCourses} 
            completedLessonIds={completedLessons} 
          />
        );

        case 'resume':
  return <ResumeAnalyzer />;
  
        case "profile":
          return (
            <ProfileSection 
              userData={userData} 
              onUpdate={async () => {
                // Re-fetch logic specifically for manual auth/dash-less IDs
                const rawCookie = Cookies.get('user-session') || Cookies.get('user_session');
                if (!rawCookie) return;
                
                // Maintain your dash-less ID format for the query
                const userId = decodeURIComponent(rawCookie)
                  .replace(/"/g, '')
                  .replace(/-/g, '');
  
                const { data } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', userId)
                  .single();
                
                if (data) setUserData(data);
              }} 
            />
          );
      default:
        return <DashboardHome userData={userData} stats={stats} activities={activities} />;
    }
  };

  return (
    <div className="h-screen flex bg-[linear-gradient(120deg,#fff5f5_0%,#f3f0ff_50%,#eef2ff_100%)] font-sans overflow-hidden">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto p-8 lg:p-10 relative">
        {renderContent()}
      </main>
    </div>
  );
}

// --- KEEP YOUR SUB-COMPONENTS (DashboardHome, StatCard, etc.) BELOW THIS ---
function DashboardHome({ userData, stats, activities }: any) {
    return (
      <>
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-[#1a1a1a]">
            Welcome back, {userData?.full_name?.split(' ')[0] || 'Learner'}! 👋
          </h1>
          <p className="text-gray-600 mt-2">Here is your learning overview.</p>
        </header>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Resume Score" value={stats.resumeScore} icon={<TrendingUp />} color="purple" progress={stats.resumeScore} />
          <StatCard title="Completion" value={`${stats.completionRate}%`} icon={<CheckCircle2 />} color="blue" progress={stats.completionRate} />
          <StatCard title="Projects" value={stats.projectCount} icon={<Code />} color="orange" />
          <StatCard title="Certificates" value={stats.certCount} icon={<Award />} color="green" />
        </div>
  
        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-lg shadow-purple-900/5 max-w-4xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-6 border-l-2 border-gray-100 ml-3">
            {activities.length > 0 ? (
              activities.map((act: any, i: number) => (
                <ActivityLog key={i} action={act.action} subject={act.subject} time={act.time} />
              ))
            ) : (
              <p className="pl-8 text-gray-400 italic">No activity recorded yet.</p>
            )}
          </div>
        </div>
      </>
    );
  }

  function StatCard({ title, value, icon, color, progress }: any) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow-xl shadow-purple-900/5 group hover:shadow-2xl transition-all">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center 
            ${color === 'purple' ? 'bg-purple-100 text-purple-600' : ''}
            ${color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
            ${color === 'orange' ? 'bg-orange-100 text-orange-600' : ''}
            ${color === 'green' ? 'bg-green-100 text-green-600' : ''}
          `}>
            {icon}
          </div>
          <h3 className="text-gray-600 font-medium">{title}</h3>
        </div>
        <span className="text-4xl font-bold text-gray-900">{value}</span>
        {progress !== undefined && (
          <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
    );
  }
  
  function ActivityLog({ action, subject, time }: any) {
    return (
      <div className="relative pl-8">
        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-purple-500"></div>
        <div className="bg-white/50 border border-gray-100 p-4 rounded-2xl flex justify-between items-center">
          <div>
            <span className="font-bold text-gray-900">{action}</span>
            <span className="text-gray-500 mx-2">in</span>
            <span className="font-medium text-purple-700">{subject}</span>
          </div>
          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{time}</span>
        </div>
      </div>
    );
  }