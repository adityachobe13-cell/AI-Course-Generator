"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { Loader2, Award, Printer, Share2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

export default function CertificatePage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState<any>(null);

  useEffect(() => {
    async function fetchCert() {
        try {
          const rawCookie = Cookies.get('user-session') || Cookies.get('user_session');
          if (!rawCookie) throw new Error("User not authenticated");
          
          // Ensure the ID is clean and matches the format stored in your DB
          const userId = decodeURIComponent(rawCookie).replace(/"/g, '');
      
          const { data: cert, error } = await supabase
            .from('certificates')
            .select(`
              id,
              issued_at,
              courses ( title ),
              profiles:user_id ( full_name ),
              projects:project_id ( title )
            `) // Removed extra spaces and weird indentation
            .eq('course_id', params.id)
            .eq('user_id', userId)
            .single();
      
          if (error) {
            console.error("Supabase Error:", error);
            throw new Error(error.message);
          }
      
          if (!cert) throw new Error("Certificate not found");
      
          // Debugging: Check if ID exists in the returned object
          console.log("Retrieved Cert Object:", cert);
      
          setCertData({
            // Fixed: Added .[0] to target the first profile
            userName: cert.profiles?.[0]?.full_name || "Aditya chobe",
            
            courseName: cert.courses?.[0]?.title || "Html",
        
            
            // Fixed: Added .[0] to target the first project
            projectName: cert.projects?.[0]?.title || "Capstone Project",
            
            date: new Date(cert.issued_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            }),
            
            // Use cert.id (ensure it's lowercase 'id' as per your SQL table)
            certId: cert.id ? `VERIFY-${cert.id.toString().toUpperCase()}` : "N/A"
        });
        
      
        } catch (err: any) {
          console.error("System Error:", err);
        } finally {
          setLoading(false);
        }
      }

    if (params.id) fetchCert();
  }, [params.id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
    </div>
  );

  if (!certData) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-xl font-bold text-gray-900">Certificate Not Found</h1>
      <p className="text-gray-500 mt-2">Make sure you have submitted your project for this course.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center print:bg-white print:py-0">
      
      {/* THE CERTIFICATE */}
      <div className="relative w-full max-w-5xl aspect-[1.414/1] bg-white shadow-2xl border-20 border-white p-16 flex flex-col items-center text-center">
        
        <header className="mb-10">
          <Award className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-purple-600 font-black tracking-[0.4em] uppercase text-xs">Certificate of Completion</h1>
        </header>

        <div className="flex-1 flex flex-col justify-center">
          <p className="text-slate-400 italic mb-4">This is to certify that</p>
          <h2 className="text-6xl font-serif font-bold text-slate-900 mb-8 border-b-2 border-slate-100 pb-4">
            {certData.userName}
          </h2>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            has successfully completed the requirements for the course:
            <span className="block text-2xl text-slate-900 font-extrabold mt-4 uppercase">
              {certData.courseName}
            </span>
          </p>

          <div className="mt-10 inline-block px-8 py-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Final Project Submission</p>
            <p className="text-slate-900 font-bold">{certData.projectName}</p>
          </div>
        </div>

        <div className="w-full flex justify-between items-end mt-16">
          <div className="text-left">
            <p className="font-bold text-slate-900">{certData.date}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Date</p>
          </div>

          <div className="text-center">
            <p className="text-4xl text-slate-900 mb-1" style={{ fontFamily: 'Dancing Script, cursive' }}>
              Daksh Patel
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-200 pt-1">Director & Owner</p>
          </div>

          <div className="text-right">
            <p className="font-mono text-[10px] text-slate-400">{certData.certId}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verify ID</p>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-10 flex gap-4 print:hidden">
        <button onClick={() => window.print()} className="bg-[#1c1c1c] text-white px-8 py-4 rounded-full font-bold shadow-xl">
          Download PDF
        </button>
      </div>
    </div>
  );
}