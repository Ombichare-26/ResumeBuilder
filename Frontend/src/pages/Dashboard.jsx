import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Code, Briefcase, Award, Star, TrendingUp, Search, Loader2 } from 'lucide-react';
import api from '../utils/api';
import AnalysisModal from '../components/AnalysisModal';

const Dashboard = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/match/latest');
        setReport(data);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const openAnalysis = (label) => {
    if (!report?.resumeId) return;

    let data = null;
    let type = label;

    switch (label) {
      case 'Technical Skills':
        data = report.resumeId.skills;
        break;
      case 'Projects':
        data = report.resumeId.projects;
        break;
      case 'Experience':
        data = report.resumeId.experience;
        break;
      case 'Achievements':
        data = report.resumeId.achievements;
        break;
      default:
        data = null;
    }

    setModalTitle(label);
    setModalData(data);
    setModalType(type);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="text-indigo-500 animate-spin" size={48} />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-white">No Analysis Found</h2>
        <p className="text-slate-400">Please upload your resume and job description to see results.</p>
      </div>
    );
  }

  const scores = [
    { label: 'Technical Skills', score: report.categoryScores?.TechnicalSkills || 0, icon: Code, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Projects', score: report.categoryScores?.Projects || 0, icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Experience', score: report.categoryScores?.Experience || 0, icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Achievements', score: report.categoryScores?.Achievements || 0, icon: Award, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  const overallScore = report.overallScore || 0;

  const CircularProgress = ({ score, size = 200, strokeWidth = 15 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center translate-all duration-300">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-800"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-6xl font-black text-white">{score}</span>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">ATS Score</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Your <span className="gradient-text">Analysis</span></h1>
          <p className="text-slate-400 font-medium">Profile matched against <span className="text-indigo-400 font-bold">{report.jdId?.targetRole || 'target role'}</span>.</p>
        </div>
        <div className="hidden md:flex items-center gap-3 glass px-4 py-2 rounded-2xl border border-slate-800">
          <TrendingUp className="text-emerald-400" size={18} />
          <span className="text-sm font-bold text-emerald-400">Score generated by Llama 3</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Score Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 glass rounded-[40px] p-8 flex flex-col items-center justify-center space-y-8 border-indigo-500/10"
        >
          <CircularProgress score={overallScore} />
          <div className="w-full space-y-4 pt-4">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-slate-400 uppercase tracking-widest">Confidence Level</span>
              <span className="text-white">{overallScore > 80 ? 'High Match' : overallScore > 60 ? 'Medium Match' : 'Low Match'}</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallScore}%` }}
                className="h-full bg-indigo-500"
              ></motion.div>
            </div>
            <p className="text-slate-500 text-xs text-center font-medium leading-relaxed">
              Based on your skills and experience compared to JD requirements.
            </p>
          </div>
        </motion.div>

        {/* Section Scores */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {scores.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-[32px] border border-slate-800 hover:border-indigo-500/20 transition-all group flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon size={24} />
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-2xl font-black ${item.color}`}>{item.score}/100</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Section Score</span>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white tracking-tight">{item.label}</h3>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    className={`h-full ${item.bg.replace('/10', '')}`}
                  ></motion.div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Detailed Breakdown</span>
                  <button 
                    onClick={() => openAnalysis(item.label)}
                    className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors flex items-center gap-1 group/btn"
                  >
                    View Analysis <Search size={12} className="group-hover/btn:scale-125 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Quick Insights */}
          <div className="md:col-span-2 glass rounded-[32px] p-6 border border-indigo-500/10 flex flex-col md:flex-row items-center gap-6 justify-between bg-indigo-500/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                <Star size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white">AI Suggestion</h4>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">{report.aiSuggestions || "Analyze your profile to get personalized suggestions."}</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/analysis'}
              className="whitespace-nowrap px-6 py-3 bg-white text-[#0f172a] font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95 shadow-lg shadow-white/5"
            >
              Full Analysis
            </button>
          </div>
        </div>
      </div>
      
      {/* Analysis Modal */}
      <AnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        data={modalData}
        type={modalType}
      />
    </div>
  );
};

export default Dashboard;
