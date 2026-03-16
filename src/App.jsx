import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Upload,
  Activity,
  ShieldCheck,
  AlertCircle,
  FileText,
  ChevronRight,
  Eye,
  RefreshCw,
  Info,
  ScanSearch,
  AlertTriangle,
  Trash2,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// API endpoint (you can swap to import.meta.env.VITE_API_URL)
const API_URL = "https://gibsdevops-retisight-api.hf.space/predict";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Clean up preview URL when changed/unmounted
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileSelect = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Please upload a valid image (PNG/JPEG).');
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    handleFileSelect(selected);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer?.files?.[0];
    handleFileSelect(dropped);
  };

  const runAnalysis = async () => {
    if (!file) {
      setError('No file selected. Please upload a fundus image first.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      const data = resp.data || {};
      if (data.status !== 'success') {
        // Try to surface backend message
        throw new Error(data?.message || 'Unexpected response from analysis service');
      }

      // normalize
      const prediction = data.prediction || 'Unknown';
      const confidence = typeof data.confidence === 'number' ? data.confidence : 0;
      const heatmap = data.heatmap === undefined ? null : data.heatmap;

      setResult({
        prediction,
        confidence: Math.max(0, Math.min(1, confidence)),
        heatmap,
      });
    } catch (err) {
      console.error('API Error:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to connect to the backend. Please make sure the API is online.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const diagnosisIsReferable = result?.prediction?.toLowerCase() === 'referable';
  const diagnosisColorClass = diagnosisIsReferable ? 'red' : 'emerald';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-medical-600 p-2 rounded-xl text-white shadow-md">
              <Eye size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">
                RetiSight<span className="text-medical-600">AI</span>
              </div>
              <div className="text-xs text-slate-500">Diabetic Retinopathy Screening • EfficientNet-B0</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-slate-500 font-medium text-sm">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">Cloud Engine v1.0.4</span>
            <div className="h-4 w-px bg-slate-200" />
            <a href="#" className="hover:text-medical-600 transition-colors">Lab Portal</a>
            <a href="#" className="hover:text-medical-600 transition-colors">Documentation</a>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Upload */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Retinal Analysis</h1>
              <p className="text-slate-500 leading-relaxed text-sm">Upload fundus photography for immediate DL screening of referable pathology.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-xl border border-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest">Input Source</h2>
                {file && (
                  <button onClick={resetAll} className="text-xs font-bold text-red-500 flex items-center gap-1 hover:underline transition-all">
                    <RefreshCw size={12} /> Reset
                  </button>
                )}
              </div>

              <label
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`relative group block w-full aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${preview ? 'border-medical-600 shadow-md' : 'border-slate-300 hover:border-medical-600 bg-slate-50'}`}
              >
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                {!preview ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={32} className="text-medical-600" />
                    </div>
                    <p className="text-slate-600 font-bold">Select or drag & drop fundus image</p>
                    <p className="text-slate-400 text-xs mt-1">PNG/JPG • High-resolution recommended</p>
                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-medical-600 text-white text-sm shadow-sm hover:bg-medical-700 transition"
                      >
                        Choose file
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full grid grid-rows-[auto,1fr]">
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-700">{file?.name}</div>
                        <div className="text-xs text-slate-400">{((file?.size || 0) / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1 text-xs rounded-md bg-white border border-slate-200">Replace</button>
                        <button onClick={() => { setFile(null); URL.revokeObjectURL(preview); setPreview(null); }} className="px-3 py-1 text-xs rounded-md bg-red-50 text-red-600 border border-red-100">
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                    <div className="p-3 overflow-hidden">
                      <img src={preview} alt="preview" className="w-full h-full object-contain rounded-md bg-black/2" />
                    </div>
                  </div>
                )}
              </label>

              <button
                onClick={runAnalysis}
                disabled={!file || loading}
                className="w-full mt-8 bg-medical-600 hover:bg-medical-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-5 rounded-2xl transition-all shadow-lg flex justify-center items-center gap-3 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    <span>Analyzing Retinal Morphology...</span>
                  </>
                ) : 'Run AI Diagnosis'}
              </button>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-800">
                <AlertTriangle size={20} />
                <p className="text-xs font-medium leading-relaxed">{error}</p>
              </motion.div>
            )}
          </div>

          {/* Right: Results & Explainability */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Result Header Card */}
                  <div className={`p-8 rounded-3xl shadow-2xl border-l-8 ${diagnosisIsReferable ? 'bg-red-50 border-red-500' : 'bg-emerald-50 border-emerald-500'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Diagnostic Output</h4>
                        <h1 className={`text-5xl font-black tracking-tighter ${diagnosisIsReferable ? 'text-red-600' : 'text-emerald-600'}`}>
                          {result.prediction.toUpperCase()}
                        </h1>
                        <p className="mt-4 flex items-center gap-2 font-bold text-slate-600">
                          AI Confidence:
                          <span className="text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                            {(result.confidence * 100).toFixed(1)}%
                          </span>
                        </p>
                      </div>
                      <div className={`p-6 rounded-3xl shadow-sm ${diagnosisIsReferable ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                        {diagnosisIsReferable ? <AlertCircle size={48} /> : <ShieldCheck size={48} />}
                      </div>
                    </div>
                  </div>

                  {/* Explainability Section */}
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-8">
                      <ScanSearch size={22} className="text-medical-600" />
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">Spatial Intelligence Report</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50 px-2 py-1 rounded block text-center">Reference Scan</span>
                        <div className="rounded-2xl overflow-hidden border-4 border-slate-50 aspect-square">
                          <img src={preview} className="w-full h-full object-cover grayscale opacity-90" alt="Original" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-medical-50 px-2 py-1 rounded block text-center">AI Attention (Grad-CAM)</span>
                        <div className="rounded-2xl overflow-hidden border-4 border-medical-50 aspect-square bg-slate-50 flex items-center justify-center">
                          {result.heatmap ? (
                            // support backend returning raw base64 or data URI; handle both
                            <img
                              src={result.heatmap.startsWith('data:') ? result.heatmap : `data:image/png;base64,${result.heatmap}`}
                              className="w-full h-full object-cover"
                              alt="Explainability Map"
                            />
                          ) : (
                            <div className="text-center p-8">
                              <Activity className="mx-auto text-slate-200 mb-4" size={48} />
                              <p className="text-xs text-slate-400 font-medium">Heatmap data unavailable for this scan.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {result.heatmap && (
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl">
                          <div className="w-3 h-3 bg-red-500 rounded-full mb-2" />
                          <h5 className="text-xs font-bold text-slate-800">Critical Zones</h5>
                          <p className="text-[11px] text-slate-500 mt-1">High-probability retinal lesions detected.</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full mb-2" />
                          <h5 className="text-xs font-bold text-slate-800">Supportive Evidence</h5>
                          <p className="text-[11px] text-slate-500 mt-1">Features contributing to secondary confidence.</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mb-2" />
                          <h5 className="text-xs font-bold text-slate-800">Baseline Context</h5>
                          <p className="text-[11px] text-slate-500 mt-1">Healthy tissue or regions ignored by AI.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recommendation Card */}
                  <div className="bg-slate-900 p-8 rounded-3xl text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                      <FileText size={120} />
                    </div>
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4 relative z-10">
                      <FileText size={20} className="text-medical-600" /> Medical Assessment Summary
                    </h3>
                    <p className="text-slate-300 text-base leading-relaxed italic border-l-4 border-medical-600 pl-6 my-6 relative z-10">
                      {diagnosisIsReferable
                        ? 'Diagnostic markers consistent with Referable Diabetic Retinopathy detected. Recommendation: Ophthalmology referral for confirmatory exam.'
                        : 'No referable pathology detected. Continue routine diabetic eye screening as advised.'}
                    </p>
                    <div className="flex gap-4 relative z-10">
                      <button className="flex-1 bg-white text-slate-900 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-95">
                        GENERATE CLINICAL PDF <FileText size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12">
                  <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 4 }}>
                    <Activity size={100} className="text-slate-100 mb-6" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-400 tracking-tight">Diagnostic Engine Standby</h3>
                  <p className="text-slate-300 max-w-sm mt-3 leading-relaxed">Please provide a fundus scan to initiate the deep learning diagnostic process.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center border-t border-slate-200">
        <div className="flex flex-col items-center gap-2">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">RetiSight AI Diagnostic System v1.0.4</span>
          <p className="text-slate-300 text-[10px] max-w-lg">
            Notice: This software is intended for research and screening support. All AI predictions must be verified by a licensed medical professional. © 2026 GibsDevOps Systems.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;