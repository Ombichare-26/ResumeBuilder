import React, { useState } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle2, AlertCircle, X, ArrowRight, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Upload = () => {
  const [resume, setResume] = useState(null);
  const [jd, setJd] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResume(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume || !jd || !targetRole) return;

    setUploading(true);
    setError('');

    try {
      // 1. Upload Resume
      const resumeFormData = new FormData();
      resumeFormData.append('resume', resume);
      await api.post('/resume/upload', resumeFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 2. Upload JD
      await api.post('/jd/upload', {
        targetRole,
        content: jd
      });

      // 3. Trigger Match Analysis
      await api.post('/match');

      // 4. Success -> Dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to process documents. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Upload Your <span className="gradient-text">Profile</span></h1>
        <p className="text-slate-400 max-w-2xl leading-relaxed text-lg font-medium">
          Let our AI analyze your resume against the job description for precise ATS scoring and personalized improvement suggestions.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Resume Upload Box */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Your Resume (PDF/DOCX)</label>
            <div className={`relative h-80 rounded-3xl border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center p-8 text-center ${
              resume ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 glass'
            }`}>
              <input 
                type="file" 
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              
              <AnimatePresence mode="wait">
                {resume ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key="file"
                    className="space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                      <FileText className="text-emerald-400" size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-200 font-bold truncate max-w-[200px]">{resume.name}</p>
                      <p className="text-emerald-400 text-sm font-semibold">File ready for analysis</p>
                    </div>
                    <button 
                      onClick={(e) => { e.preventDefault(); setResume(null); }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest flex items-center gap-1 mx-auto hover:scale-105 transition-transform"
                    >
                      <X size={14} /> Remove
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key="empty"
                    className="space-y-4"
                  >
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all duration-300">
                      <UploadIcon className="text-indigo-400" size={32} />
                    </div>
                    <p className="text-slate-300 font-bold text-lg">Drop your resume here</p>
                    <p className="text-slate-500 text-sm max-w-[200px] font-medium leading-relaxed">Better file, better score. Make sure it's up to date.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-8 flex flex-col h-full">
            {/* Target Role Input */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Target Job Role</label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input 
                  type="text" 
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl py-4 pl-12 pr-6 text-slate-200 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  required
                />
              </div>
            </div>

            {/* Job Description Text Area */}
            <div className="space-y-4 flex-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Job Description</label>
              <div className="glass rounded-3xl p-6 flex flex-col flex-1 h-[210px]">
                <textarea 
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the job requirements here..."
                  className="flex-1 w-full bg-transparent border-none text-slate-200 resize-none outline-none text-base placeholder:text-slate-600 font-medium leading-relaxed"
                  required
                />
                <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold">{jd.length} characters</span>
                  <div className="flex gap-2">
                    <AlertCircle className="text-indigo-500/50" size={16} />
                    <span className="text-xs text-slate-400">Detailed JD yields better results</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <button 
            type="submit"
            disabled={!resume || !jd || !targetRole || uploading}
            className={`px-12 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-3 shadow-xl ${
              !resume || !jd || !targetRole || uploading
                ? 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed opacity-50'
                : 'bg-indigo-500 hover:bg-slate-100 hover:text-indigo-600 text-white shadow-indigo-500/20 active:scale-95'
            }`}
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyzing Profile...
              </>
            ) : (
              <>
                Analyze My Resume 
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
        {[
          { title: "ATS Check", desc: "Instantly see how readable your file is to ATS systems.", icon: FileText },
          { title: "Skill Gap", desc: "Identify exactly which keywords you're missing.", icon: AlertCircle },
          { title: "Action Plan", desc: "Get a customized roadmap to bridge the gaps.", icon: CheckCircle2 }
        ].map((benefit, i) => (
          <div key={i} className="glass p-6 rounded-3xl space-y-3 hover:border-indigo-500/30 transition-all group">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <benefit.icon size={20} />
            </div>
            <h3 className="font-bold text-white tracking-tight">{benefit.title}</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">{benefit.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Upload;
