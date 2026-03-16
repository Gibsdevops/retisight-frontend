import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

const ResultCard = ({ result }) => {
  if (!result) return null;

  const isReferable = result.prediction === 'Referable';

  return (
    <div className={`p-8 rounded-3xl border-l-8 shadow-xl ${
      isReferable ? 'bg-red-50 border-red-500' : 'bg-emerald-50 border-emerald-500'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">
            AI Screening Result
          </h4>
          <h1 className={`text-4xl font-black ${isReferable ? 'text-red-600' : 'text-emerald-600'}`}>
            {result.prediction.toUpperCase()}
          </h1>
          <div className="mt-6">
            <span className="text-sm font-bold text-slate-500 block mb-1">Confidence Level</span>
            <div className="text-2xl font-black text-slate-800">
              {(result.confidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-2xl ${isReferable ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
          {isReferable ? <AlertCircle size={40} /> : <ShieldCheck size={40} />}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;