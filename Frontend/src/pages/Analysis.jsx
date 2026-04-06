import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wrench, BookOpen, Lightbulb, Compass, ChevronRight, Zap, Target, Star, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

const Analysis = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [jd, setJd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, jdRes] = await Promise.all([
          api.get('/match/latest'),
          api.get('/match/jd/latest')
        ]);
        setReport(reportRes.data);
        setJd(jdRes.data);
      } catch (err) {
        console.error("Analysis Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="text-indigo-500 animate-spin" size={48} />
      </div>
    );
  }

  if (!report || !jd) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-white">No Analysis Data</h2>
        <p className="text-slate-400">Complete a match analysis first to see your gap report.</p>
      </div>
    );
  }

  // Map items to preserve their DB structure
  const skillsWithCategories = jd.requiredSkills?.reduce((acc, cat) => {
    // Add a marker for the category
    acc.push({ isHeader: true, name: cat.category });
    cat.details.forEach(detail => acc.push({ isHeader: false, name: detail }));
    return acc;
  }, []) || [];

  const projectsWithDetails = jd.recommendedProjects?.map(p => ({
    name: p.name,
    description: p.description,
    isHeader: false
  })) || [];

  const columns = [
    {
      title: 'Missing Tools',
      icon: Wrench,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      items: (report.missingSkills || []).map(s => ({ name: s, isHeader: false })),
      description: 'Critical software and libraries required for this role.'
    },
    {
      title: 'Required Skills',
      icon: BookOpen,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      items: skillsWithCategories, // Now showing ALL skills and categories
      description: 'Core competencies you need to demonstrate or learn.'
    },
    {
      title: 'Required Projects',
      icon: Lightbulb,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      items: projectsWithDetails, // Now showing all projects with details
      description: 'Projects that will showcase your missing expertise.'
    }
  ];

  const handleItemClick = (item, type) => {
    navigate('/roadmap', { state: { item, type: type === 'Missing Tools' ? 'missing_tools' : type === 'Required Skills' ? 'required_skills' : 'project' } });
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Gap <span className="gradient-text">Analysis</span></h1>
        <p className="text-slate-400 font-medium max-w-2xl leading-relaxed">
          Based on the Job Description for <span className="text-indigo-400 font-bold">{jd.targetRole}</span>, we've identified the following gaps. Click any item for its roadmap.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {columns.map((column, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex flex-col h-full"
          >
            <div className="glass rounded-[40px] p-8 flex-1 border border-slate-800 flex flex-col space-y-8 hover:border-indigo-500/10 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 ${column.bg} ${column.color} rounded-[20px] shadow-lg flex items-center justify-center`}>
                  <column.icon size={32} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{column.title}</h2>
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">{column.description}</p>
                </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {column.items.length > 0 ? column.items.map((item, j) => (
                  item.isHeader ? (
                    <div key={j} className="pt-4 pb-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                        {item.name}
                      </span>
                    </div>
                  ) : (
                    <motion.button
                      key={j}
                      whileHover={{ x: 6, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleItemClick(item.name, column.title)}
                      className="w-full flex items-center justify-between p-4 glass rounded-2xl hover:bg-white/5 border border-slate-800/50 text-left group transition-all"
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${column.color.replace('text-', 'bg-')}`}></div>
                          <span className="text-slate-800 font-semibold text-sm group-hover:text-slate-500 transition-colors">{item.name}</span>
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 font-medium pl-[1.1rem] line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${column.bg} ${column.color}`}>
                        <ChevronRight size={14} />
                      </div>
                    </motion.button>
                  )
                )) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={24} />
                    <p className="text-slate-500 text-xs font-bold">No items found.</p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-800/50 flex flex-col items-center bg-transparent">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Priority Level</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className={`h-1.5 w-6 rounded-full ${s <= (3 - i) + i ? column.color.replace('text-', 'bg-') : 'bg-slate-800'}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-[32px] p-8 border border-indigo-500/20 bg-indigo-500/[0.03] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Zap className="text-amber-400" size={24} /> AI Recommendation
            </h3>
            <p className="text-slate-400 font-medium max-w-2xl">
              Based on the results, we recommend focusing on <span className="text-indigo-400 font-bold">{columns[0]?.items[0]?.name || 'your core gaps'}</span> to make the biggest impact on your matching score.
            </p>
          </div>
          <button
            onClick={() => handleItemClick(columns[0]?.items[0]?.name, columns[0]?.title)}
            className="whitespace-nowrap px-8 py-4 bg-indigo-500 text-white font-bold rounded-2xl hover:bg-indigo-400 hover:scale-[1.02] shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
          >
            Start Learning Journey <Compass size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
