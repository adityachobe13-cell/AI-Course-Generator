"use client";

import { useState, useEffect } from "react";
import { Camera, Plus, Instagram, Linkedin, Github, Globe, Loader2, X, Save, Link as LinkIcon, ExternalLink } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";
import Cookies from "js-cookie";

export default function ProfileSection({ userData, onUpdate }: { userData: any, onUpdate: () => void }) {
  const [links, setLinks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: ""
  });

  const [selectedPlatform, setSelectedPlatform] = useState("GitHub");
  const [customLink, setCustomLink] = useState("");

  // Sync data from Dashboard props
  useEffect(() => {
    if (userData) {
      setFormData({
        full_name: userData.full_name || "",
        phone: userData.phone || "",
        email: userData.email || ""
      });
      fetchSocialLinks();
    }
  }, [userData]);

  async function fetchSocialLinks() {
    const { data } = await supabase.from("social_links").select("*").eq("user_id", userData.id);
    if (data) setLinks(data);
  }

  const getCleanUserId = () => {
    const rawCookie = Cookies.get('user-session') || Cookies.get('user_session');
    if (!rawCookie) return null;
    return decodeURIComponent(rawCookie).replace(/"/g, '').replace(/-/g, '');
  };

  async function handleProfileSave() {
    try {
      setIsSaving(true);
      const userId = getCleanUserId();
      if (!userId) throw new Error("Session expired");

      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email,
        })
        .eq('id', userId)
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error("Update failed: User ID not found in database.");
      }

      toast.success("Profile Updated", { description: "Changes saved to your account." });
      if (onUpdate) onUpdate();
    } catch (err: any) {
      toast.error("Update Failed", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddSocial() {
    if (!customLink) return toast.warning("Missing URL");
    
    setIsSaving(true);
    try {
      const userId = getCleanUserId();
      const { error } = await supabase
        .from("social_links")
        .insert([{ user_id: userId, platform_name: selectedPlatform, url: customLink }]);

      if (error) throw error;

      toast.success("Social Linked");
      fetchSocialLinks();
      setIsModalOpen(false);
      setCustomLink("");
    } catch (err: any) {
      toast.error("Connection Error", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  }

  const getPlatformIcon = (name: string) => {
    const p = name.toLowerCase();
    if (p.includes('github')) return <Github className="w-5 h-5 text-gray-500" />;
    if (p.includes('linkedin')) return <Linkedin className="w-5 h-5 text-gray-500" />;
    if (p.includes('instagram')) return <Instagram className="w-5 h-5 text-gray-500" />;
    return <Globe className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white/40 backdrop-blur-md rounded-[48px] border border-white shadow-xl shadow-purple-900/5 animate-in fade-in duration-500">
      
      {/* HEADER: CIRCULAR AVATAR & NAME */}
      <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
        <div className="relative group">
          <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center">
            <img 
              src={userData?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.full_name || 'User'}`} 
              className="w-full h-full object-cover"
              alt="Avatar"
            />
          </div>
          <button className="absolute bottom-1 right-1 bg-[#1c1c1c] text-white p-3 rounded-full border-2 border-white shadow-lg hover:bg-purple-600 transition-all">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 w-full">
          <InputField 
            label="Full Name" 
            value={formData.full_name} 
            locked={!!userData?.full_name}
            onChange={(v: string) => setFormData({...formData, full_name: v})} 
          />
        </div>
      </div>

      {/* CONTACT INFO ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <InputField 
          label="Email Address" 
          value={formData.email} 
          locked={!!userData?.email}
          onChange={(v: string) => setFormData({...formData, email: v})} 
        />
        
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 ml-4">Phone Number</label>
          <div className={`flex items-center bg-white/60 border border-white rounded-[24px] px-6 py-4 ${!!userData?.phone ? 'opacity-60' : ''}`}>
            <span className="text-gray-400 font-bold mr-3 border-r border-gray-100 pr-3">+91</span>
            <input 
              value={formData.phone}
              readOnly={!!userData?.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="bg-transparent outline-none w-full text-gray-600 font-medium"
              placeholder="00000 00000"
            />
          </div>
        </div>
      </div>

      {/* SOCIAL CONNECTIONS SECTION */}
      <div className="pt-10 border-t border-white/60">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-gray-900">Social Connections</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 bg-[#1c1c1c] text-white rounded-2xl flex items-center justify-center hover:bg-purple-600 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {['GitHub', 'LinkedIn', 'Instagram'].map((platform) => {
            const link = links.find(l => l.platform_name.toLowerCase() === platform.toLowerCase());
            return (
              <div 
                key={platform} 
                className={`p-5 rounded-[24px] border border-white flex flex-col gap-4 transition-all ${link ? 'bg-white shadow-sm' : 'bg-white/20 opacity-70'}`}
              >
                <div className="flex items-center justify-between">
                  {getPlatformIcon(platform)}
                  {link ? (
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-md">Linked</span>
                  ) : (
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Not Linked</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-700">{platform}</h4>
                  {link ? (
                    <a 
                      href={link.url} 
                      target="_blank" 
                      className="text-purple-600 text-xs font-medium flex items-center gap-1 mt-1 hover:underline"
                    >
                      Visit Profile <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Connection missing</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER ACTION */}
      <div className="mt-16 flex justify-center">
        <button 
          onClick={handleProfileSave}
          disabled={isSaving}
          className="bg-[#1c1c1c] text-white px-14 py-4 rounded-full font-bold shadow-2xl hover:bg-purple-600 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Profile Details
        </button>
      </div>

      {/* ADD SOCIAL BOX MODEL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl border border-white animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Connect Profile</h2>
            
            <div className="space-y-6">
              <div className="flex gap-2">
                {['GitHub', 'LinkedIn', 'Instagram'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPlatform(p)}
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-bold uppercase border transition-all ${
                      selectedPlatform === p ? 'bg-[#1c1c1c] text-white border-[#1c1c1c] shadow-lg shadow-gray-200' : 'bg-gray-50 text-gray-400 border-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-2">Profile Link</label>
                <div className="flex items-center bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100 focus-within:bg-white transition-all">
                  <LinkIcon className="w-4 h-4 text-gray-400 mr-3" />
                  <input 
                    placeholder="https://..." 
                    value={customLink}
                    onChange={(e) => setCustomLink(e.target.value)}
                    className="bg-transparent outline-none w-full text-sm font-medium text-gray-600"
                  />
                </div>
              </div>

              <button 
                onClick={handleAddSocial}
                className="w-full bg-[#1c1c1c] text-white py-5 rounded-[24px] font-bold shadow-xl hover:bg-purple-600 transition-all"
              >
                Connect Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({ label, value, onChange, locked }: any) {
  return (
    <div className={`flex flex-col gap-2 ${locked ? 'opacity-70' : ''}`}>
      <label className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 ml-4">{label}</label>
      <input 
        value={value} 
        readOnly={locked}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter your ${label.toLowerCase()}...`}
        className={`w-full bg-white/60 border border-white px-6 py-5 rounded-[28px] outline-none transition-all text-gray-600 font-medium
          ${locked ? 'cursor-not-allowed font-semibold' : 'focus:bg-white focus:ring-4 focus:ring-purple-500/5 shadow-sm'}`} 
      />
    </div>
  );
}