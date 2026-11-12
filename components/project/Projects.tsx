"use client";

import { useState } from "react";
import { 
  X, Upload, Link as LinkIcon, Github, Calendar, 
  Loader2, CheckCircle, Image as ImageIcon, Briefcase 
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface FinalProjectModalProps {
  userId: string;
  courseId: string;
  onClose: () => void;
  onComplete: () => void;
}

export default function FinalProjectModal({ 
  userId, 
  courseId, 
  onClose, 
  onComplete 
}: FinalProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    liveUrl: "",
    githubUrl: ""
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!formData.title || !formData.description) {
      return toast.error("Required Fields");
    }
  
    setLoading(true);
    try {
      let publicImageUrl = "";
  
      // 1. Upload Screenshot (Keep your existing logic)
      if (image) {
        const fileName = `${userId}/${courseId}-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('projects')
          .upload(fileName, image);
        if (uploadError) throw uploadError;
        publicImageUrl = supabase.storage.from('projects').getPublicUrl(fileName).data.publicUrl;
      }
  
      // 2. Insert into 'projects' table
      // We use .select() to get the ID of the newly created project
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert([{
          user_id: userId,
          course_id: courseId,
          title: formData.title,
          description: formData.description,
          image_url: publicImageUrl,
          live_url: formData.liveUrl,
          github_url: formData.githubUrl
        }])
        .select()
        .single();
  
      if (projectError) throw projectError;
  
      // 3. NEW: Add entry to 'certificates' table
      const { error: certError } = await supabase
        .from('certificates')
        .insert([{
          user_id: userId,
          course_id: courseId,
          project_id: newProject.id, // Linking it to the project we just made
        }]);
  
      // If it fails because it already exists (onConflict), we can ignore it or update
      if (certError && certError.code !== '23505') throw certError;
  
      toast.success("Project and Certificate processed!");
      onComplete(); // Triggers redirect to /certificate/[id]
      
    } catch (err: any) {
      toast.error("Submission Failed", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white rounded-[40px] shadow-2xl shadow-purple-900/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      
      <div className="p-8 md:p-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 ml-2 mb-2 block">
                Project Title
              </label>
              <input 
                type="text" 
                placeholder="e.g. AI-Powered Portfolio"
                className="w-full bg-white border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/5 transition-all text-gray-700 font-medium"
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 ml-2 mb-2 block">Start Date</label>
                <input 
                  type="date" 
                  className="w-full bg-white border border-gray-100 px-4 py-4 rounded-2xl text-sm text-gray-500 outline-none" 
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 ml-2 mb-2 block">End Date</label>
                <input 
                  type="date" 
                  className="w-full bg-white border border-gray-100 px-4 py-4 rounded-2xl text-sm text-gray-500 outline-none" 
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                />
              </div>
            </div>
          </div>

          <div className="relative group">
            <label className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 ml-2 mb-2 block">Project Preview Screenshot</label>
            <div className="h-[180px] rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center relative overflow-hidden hover:bg-purple-50 hover:border-purple-200 transition-all cursor-pointer">
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Upload Screenshot</p>
                </>
              )}
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 ml-2 mb-2 block">Description & Key Features</label>
          <textarea 
            rows={4}
            placeholder="Tell us about the tech stack, features, and challenges..."
            className="w-full bg-white border border-gray-100 px-6 py-4 rounded-3xl outline-none focus:ring-4 focus:ring-purple-500/5 transition-all text-gray-700 text-sm leading-relaxed resize-none"
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
            <input 
              placeholder="Live Demo URL" 
              className="w-full bg-white border border-gray-100 pl-14 pr-6 py-4 rounded-2xl outline-none text-sm font-medium"
              onChange={(e) => setFormData({...formData, liveUrl: e.target.value})}
            />
          </div>
          <div className="relative">
            <Github className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
            <input 
              placeholder="Source Code URL" 
              className="w-full bg-white border border-gray-100 pl-14 pr-6 py-4 rounded-2xl outline-none text-sm font-medium"
              onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="p-8 bg-gray-50/50 border-t border-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xs text-gray-500 font-medium max-w-[200px]">
            Ready to submit? Once uploaded, you'll be redirected to your certificate.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={onClose}
            className="px-6 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload}
            disabled={loading}
            className="flex-1 md:flex-none bg-[#1c1c1c] text-white px-12 py-4 rounded-full font-bold shadow-xl hover:bg-purple-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
            ) : (
              <><Briefcase className="w-5 h-5" /> Submit Project</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}