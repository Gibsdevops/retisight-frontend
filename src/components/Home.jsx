import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Globe, ShieldCheck, ArrowRight, DollarSign, Eye, AlertCircle } from 'lucide-react';

const slides = [
  {
    // High-res Image of a doctor examining a retina scan
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070",
    text: "AI-Driven Retina Screening",
    sub: "Detecting Diabetic Retinopathy markers with 88% precision using Deep Learning."
  },
  {
    // Close up of a human eye with medical focus
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=2071",
    text: "Portable & Accessible",
    sub: "Bridging the gap between expensive $20,000 clinic cameras and smartphone-based diagnostics."
  },
  {
    // Modern Telemedicine session
    image: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&q=80&w=2000",
    text: "Real-Time Tele-Ophthalmology",
    sub: "Secure, high-resolution streaming from patients to specialists across the globe."
  }
];

const Home = ({ onStart }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* 1. HERO SLIDER SECTION */}
      <section className="max-w-6xl mx-auto pt-8 px-6">
        <div className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
            >
              <img src={slides[current].image} className="w-full h-full object-cover brightness-[0.4]" alt="Medical Background" />
              <div className="absolute inset-0 flex flex-col justify-center px-16 text-white bg-gradient-to-r from-black/70 via-black/20 to-transparent">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <span className="bg-medical-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Innovating Vision</span>
                  <h1 className="text-5xl font-black mb-4 leading-tight max-w-xl">{slides[current].text}</h1>
                  <p className="text-xl text-slate-300 max-w-lg mb-10 font-medium leading-relaxed">{slides[current].sub}</p>
                  <button onClick={onStart} className="group w-fit bg-white text-medical-900 px-10 py-5 rounded-2xl font-black flex items-center gap-3 transition-all hover:bg-medical-600 hover:text-white shadow-xl">
                    LAUNCH CLINICAL PORTAL <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 2. THE CHALLENGE SECTION */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4 text-red-500 font-black uppercase text-xs tracking-widest">
              <AlertCircle size={16} /> The Global Crisis
            </div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight">Eye clinics are expensive. <br/>Sight shouldn't be.</h2>
            <p className="text-slate-500 mt-8 text-lg leading-relaxed">
              Current fundus cameras cost upwards of <strong>$20,000</strong>, confining diagnostic power to high-end city hospitals. This leaves millions in rural areas at risk of irreversible blindness. 
            </p>
            <div className="mt-8 flex gap-4">
               <div className="flex-1 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <DollarSign className="text-medical-600 mb-3" size={28} />
                  <h4 className="font-bold text-slate-800">High Equipment Costs</h4>
                  <p className="text-xs text-slate-400 mt-1">Specialized hardware remains unaffordable for local clinics.</p>
               </div>
               <div className="flex-1 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <Globe className="text-medical-600 mb-3" size={28} />
                  <h4 className="font-bold text-slate-800">Travel Barriers</h4>
                  <p className="text-xs text-slate-400 mt-1">Patients travel hundreds of miles for simple 5-minute screenings.</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-medical-600 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-medical-200">
              <h3 className="text-5xl font-black">1 in 3</h3>
              <p className="text-sm font-bold opacity-80 uppercase mt-2 tracking-tighter">Diabetics will develop DR</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] text-slate-800 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-center">
              <h3 className="text-5xl font-black text-red-500">80%</h3>
              <p className="text-sm font-bold text-slate-400 uppercase mt-2 tracking-tighter">Of blindness is preventable</p>
            </div>
            <div className="col-span-2 bg-slate-900 p-10 rounded-[2.5rem] text-white flex items-center gap-8 shadow-2xl">
              <div className="bg-medical-600/20 p-4 rounded-2xl border border-medical-600/30">
                <Activity className="text-medical-600" size={40} />
              </div>
              <div>
                  <h4 className="text-xl font-bold italic">The Tele-Retina Solution</h4>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    By combining 3D-printed smartphone attachments with our Explainable AI, we bring the hospital to the patient's home.
                  </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOOTER */}
        // Add this at the bottom of Home.jsx inside the main return
        <footer className="bg-slate-900 text-white pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-12">
            <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-medical-600 p-2 rounded-lg text-white"><Eye size={20} /></div>
                <span className="text-xl font-black uppercase tracking-widest">RetiSight AI</span>
            </div>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
                Building the infrastructure for the next generation of tele-ophthalmology. 
                We combine low-cost smartphone optics with state-of-the-art Deep Learning 
                to prevent avoidable blindness globally.
            </p>
            </div>
            <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-medical-600">Platform</h4>
            <ul className="space-y-4 text-sm text-slate-400">
                <li className="hover:text-white cursor-pointer transition-colors">AI Diagnostics</li>
                <li className="hover:text-white cursor-pointer transition-colors">Doctor Portal</li>
                <li className="hover:text-white cursor-pointer transition-colors">Patient Mobile App</li>
            </ul>
            </div>
            <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-medical-600">Resources</h4>
            <ul className="space-y-4 text-sm text-slate-400">
                <li className="hover:text-white cursor-pointer transition-colors">Research Papers</li>
                <li className="hover:text-white cursor-pointer transition-colors">Clinical Guidelines</li>
                <li className="hover:text-white cursor-pointer transition-colors">Privacy & Security</li>
            </ul>
            </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            <p>© 2026 RETISIGHT SYSTEMS. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8">
            <span>Terms of Service</span>
            <span>GDPR Compliance</span>
            <span>Medical Disclaimer</span>
            </div>
        </div>
</footer>
    </div>
  );
};

export default Home;