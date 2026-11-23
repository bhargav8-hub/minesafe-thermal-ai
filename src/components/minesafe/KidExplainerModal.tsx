import React from 'react';
import { X, Sparkles, Radio, BrainCircuit, Fan, CheckCircle, ArrowRight } from 'lucide-react';

interface KidExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KidExplainerModal: React.FC<KidExplainerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl shadow-inner">
            💡
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              How MineSafe Thermal AI Works
            </h3>
            <p className="text-sm font-semibold text-slate-500">
              Simple 3-Step Guide for Kids, Students & Presenters
            </p>
          </div>
        </div>

        {/* The 3 Steps */}
        <div className="space-y-4 mb-6">
          
          {/* Step 1 */}
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="font-extrabold text-emerald-950 text-base mb-1 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600" />
                IoT Sensors Measure Heat Every Second
              </h4>
              <p className="text-sm text-emerald-900/80 leading-relaxed font-medium">
                Deep underground, electronic sensors constantly measure temperature and humidity. They send live signals to the AI brain without needing any human to climb down and check.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h4 className="font-extrabold text-indigo-950 text-base mb-1 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-600" />
                AI Predicts Heat 10 Minutes into the Future
              </h4>
              <p className="text-sm text-indigo-900/80 leading-relaxed font-medium">
                Instead of waiting for the tunnel to get boiling hot, the AI calculates how fast heat is rising. It spots the danger <strong>10 minutes early</strong>, like looking into a crystal ball!
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white font-black text-lg flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="font-extrabold text-cyan-950 text-base mb-1 flex items-center gap-2">
                <Fan className="w-4 h-4 text-cyan-600" />
                Cooling Fans Spin Up Automatically
              </h4>
              <p className="text-sm text-cyan-900/80 leading-relaxed font-medium">
                The AI turns the giant ventilation fans from quiet 30% Eco-mode up to 100% turbo power <em>before</em> the miners even feel warm. The cool breeze stops heat in its tracks!
              </p>
            </div>
          </div>

        </div>

        {/* Real World Benefit Card */}
        <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-slate-700">
              Result: Zero heat exhaustion injuries, 40% energy saved on fans, and uninterrupted mining!
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-colors cursor-pointer"
          >
            Got It!
          </button>
        </div>

      </div>
    </div>
  );
};
