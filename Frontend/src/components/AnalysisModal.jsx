import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, Briefcase, Target, Award, CheckCircle2 } from 'lucide-react';

const AnalysisModal = ({ isOpen, onClose, title, data, type }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'Technical Skills': return <Code className="text-indigo-400" size={24} />;
      case 'Experience': return <Briefcase className="text-emerald-400" size={24} />;
      case 'Projects': return <Target className="text-cyan-400" size={24} />;
      case 'Achievements': return <Award className="text-rose-400" size={24} />;
      default: return <CheckCircle2 className="text-indigo-400" size={24} />;
    }
  };

  const renderContent = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return (
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto opacity-50">
            <X size={32} className="text-slate-500" />
          </div>
          <p className="text-slate-400 font-medium tracking-tight uppercase text-xs">No analysis data available for this section.</p>
        </div>
      );
    }

    switch (type) {
      case 'Technical Skills':
        return (
          <div className="flex flex-wrap gap-2 pt-2">
            {data.map((skill, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="px-4 py-2 glass rounded-xl text-sm font-semibold text-slate-800 border border-slate-800/50 hover:border-indigo-500/30 transition-colors"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        );

      case 'Experience':
        return (
          <div className="space-y-6 pt-2">
            {data.map((exp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 rounded-[24px] border border-slate-800/50 space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <h4 className="text-lg font-bold text-slate-800 tracking-tight">{exp.role}</h4>
                  <span className="text-[13px] font-black text-white uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full">{exp.duration}</span>
                </div>
                <p className="text-indigo-400 font-bold text-sm">{exp.company}</p>
                <p className="text-slate-400 text-sm font-medium md:flex-row leading-relaxed">{exp.description}</p>
              </motion.div>
            ))}
          </div>
        );

      case 'Projects':
        return (
          <div className="space-y-6 pt-2">
            {data.map((proj, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 rounded-[24px] border border-slate-800/50 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-slate-800 tracking-tight">{proj.name}</h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(proj.technologies || []).map((tech, j) => (
                    <span key={j} className="text-[10px] font-bold text-slate-800 bg-cyan-500/10 px-2.5 py-1 rounded-lg">
                      {tech}
                    </span>
                  ))}
                </div>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">{proj.description}</p>
              </motion.div>
            ))}
          </div>
        );

      case 'Achievements':
        return (
          <div className="space-y-3 pt-2">
            {data.map((achievement, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 p-4 glass rounded-2xl border border-slate-800/50 group hover:border-rose-500/20 transition-all"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0 group-hover:scale-125 transition-transform" />
                <p className="text-slate-800 font-medium text-sm leading-relaxed">{achievement}</p>
              </motion.div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-full overflow-hidden flex flex-col glass rounded-[40px] border border-white/10 shadow-3xl bg-slate-900/40"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center shadow-lg">
                {getIcon()}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">{title}</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Detailed Analysis</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 glass rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
            {renderContent()}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 flex justify-end bg-white/[0.01]">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              Close Breakdown
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AnalysisModal;
