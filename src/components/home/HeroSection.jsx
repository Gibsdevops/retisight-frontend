import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const HeroSection = ({ onStart }) => {
  const [current, setCurrent] = useState(0);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070",
      text: "AI-Driven Retina Screening",
      sub: "Detecting Diabetic Retinopathy markers with 88% precision using Deep Learning."
    },
    {
      image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=2071",
      text: "Portable & Accessible",
      sub: "Bridging the gap between expensive $20,000 clinic cameras and smartphone-based diagnostics."
    },
    {
      image: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&q=80&w=2000",
      text: "Real-Time Tele-Ophthalmology",
      sub: "Secure, high-resolution streaming from patients to specialists across the globe."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero" className="max-w-7xl mx-auto pt-8 px-6">
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
            <img 
              src={slides[current].image} 
              className="w-full h-full object-cover brightness-[0.4]" 
              alt="Medical Background" 
            />
            <div className="absolute inset-0 flex flex-col justify-center px-16 text-white bg-gradient-to-r from-black/70 via-black/20 to-transparent">
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.2 }}
              >
                <span className="bg-medical-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                  Innovating Vision
                </span>
                <h1 className="text-5xl font-black mb-4 leading-tight max-w-xl">
                  {slides[current].text}
                </h1>
                <p className="text-xl text-slate-300 max-w-lg mb-10 font-medium leading-relaxed">
                  {slides[current].sub}
                </p>
                <button 
                  onClick={onStart} 
                  className="group w-fit bg-white text-medical-900 px-10 py-5 rounded-2xl font-black flex items-center gap-3 transition-all hover:bg-medical-600 hover:text-white shadow-xl"
                >
                  LAUNCH CLINICAL PORTAL <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default HeroSection;