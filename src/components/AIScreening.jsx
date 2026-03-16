import React, { useState } from 'react';
import { Upload, Camera, ScanSearch, Activity, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { predictDR } from '../utils/api';

const AIScreening = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleUpload = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setResult(null);
        }
    };

    const analyze = async () => {
        setLoading(true);
        try {
            const data = await predictDR(file);
            setResult(data);
        } catch (err) {
            alert("Analysis failed. Backend might be offline.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Camera className="text-medical-600" /> Capture Scan
                </h2>
                <label className="block w-full aspect-square border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 relative overflow-hidden transition-all">
                    <input type="file" className="hidden" onChange={handleUpload} />
                    {preview ? <img src={preview} className="w-full h-full object-cover" /> : 
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Upload size={48} className="mb-2" />
                        <p>Upload Fundus Photo</p>
                    </div>}
                </label>
                <button onClick={analyze} disabled={!file || loading} className="w-full mt-6 bg-medical-600 text-white py-4 rounded-xl font-bold shadow-md hover:bg-medical-700 disabled:bg-slate-200 transition-all">
                    {loading ? "AI is processing..." : "Run AI Diagnosis"}
                </button>
            </div>

            <div className="space-y-6">
                {result ? (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
                        <div className={`p-6 rounded-2xl border-l-8 ${result.prediction === 'Referable' ? 'bg-red-50 border-red-500' : 'bg-emerald-50 border-emerald-500'}`}>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Prediction</p>
                            <h2 className={`text-3xl font-black ${result.prediction === 'Referable' ? 'text-red-600' : 'text-emerald-600'}`}>{result.prediction.toUpperCase()}</h2>
                            <p className="text-sm mt-2 font-medium text-slate-600">Confidence Index: {(result.confidence * 100).toFixed(2)}%</p>
                        </div>
                        {result.heatmap && (
                            <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-50">
                                <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><ScanSearch size={16}/> AI Attention Zones</h3>
                                <img src={`data:image/jpeg;base64,${result.heatmap}`} className="rounded-xl w-full" />
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-12 text-slate-300">
                        <Activity size={64} className="mb-4 opacity-20" />
                        <p>Awaiting scan data...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIScreening;