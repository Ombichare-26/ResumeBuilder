import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Clock, Target, Play, ExternalLink, Loader2, Star } from 'lucide-react';
import api from '../utils/api';

const Roadmap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { item, type } = location.state || { item: '', type: '' };

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!item) {
        navigate('/analysis');
        return;
      }

      try {
        // 1. Get latest JD for targetRole
        const jdRes = await api.get('/match/jd/latest');
        const targetRole = jdRes.data.targetRole;

        // 2. Get/Generate Roadmap
        const { data } = await api.post('/roadmap', {
          type,
          name: item,
          targetRole
        });
        setRoadmap(data);
      } catch (err) {
        console.error("Roadmap Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, [item, type, navigate]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="text-indigo-500 animate-spin" size={48} />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Roadmap Unavailable</h2>
        <p className="text-slate-400">We couldn't generate your personalized path. Please try again.</p>
        <button onClick={() => navigate(-1)} className="text-indigo-400 font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all active:scale-95 border border-slate-700/50"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{roadmap.name} <span className="text-indigo-400">Roadmap</span></h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">{roadmap.type.replace('_', ' ')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roadmap Timeline */}
        <div className="lg:col-span-2 glass rounded-[40px] p-8 border border-slate-800 space-y-10">
          <div className="flex justify-between items-center group">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Target className="text-indigo-400" size={24} /> Learning Path
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 shadow-lg shadow-indigo-500/5 transition-all">
              <Clock size={14} /> Comprehensive Track
            </div>
          </div>

          <div className="space-y-8 relative">
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800/50"></div>

            {roadmap.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 relative group"
              >
                <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-[#0f172a] transition-all group-hover:scale-110 shadow-lg bg-slate-800 text-slate-500`}>
                  <Circle size={12} fill="currentColor" />
                </div>

                <div className={`p-6 rounded-[24px] border border-slate-800 transition-all flex-1 glass hover:bg-indigo-500/10`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-300 tracking-tight text-lg group-hover:text-indigo-400 transition-colors uppercase">{step.title}</h3>
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Step {i + 1}</span>
                  </div>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">{step.description}</p>
                  {step.objective && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                      <Target size={14} /> {step.objective}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar Resources */}
        <div className="space-y-6">
          <div className="glass rounded-[40px] p-8 border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="text-cyan-400" size={24} /> Learning Resources
            </h2>
            <div className="space-y-3">
              {roadmap.resources?.map((res, i) => (
                <a
                  key={i}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-4 glass rounded-2xl hover:bg-white/5 border border-slate-800/50 group transition-all"
                >
                  <div className="space-y-0.5 max-w-[80%]">
                    <p className="text-slate-800 font-bold text-sm tracking-tight truncate">{res.name}</p>
                    <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest">Official Source</p>
                  </div>
                  <ExternalLink size={16} className="text-slate-500 group-hover:text-cyan-400 transition-all group-hover:scale-110" />
                </a>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-800/50">
              <p className="text-slate-500 text-xs font-medium leading-relaxed">
                {roadmap.personalizationScore || "Generic path generated."}
              </p>
            </div>
          </div>

          <div className="glass rounded-[40px] p-8 border border-indigo-500/10 bg-indigo-500/[0.03] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
                <Star size={20} />
              </div>
              <h3 className="font-bold text-white">Expert Tip</h3>
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed italic border-l-2 border-indigo-500/30 pl-4">
              "{roadmap.expertTip || 'Keep building and experimenting!'}"
            </p>
            <p className="text-xs text-slate-500 font-bold mt-4">Targeting: <span className="text-indigo-400 uppercase tracking-widest">{roadmap.targetRole}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
