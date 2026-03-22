import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SlideSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'Early Detection Saves Vision',
      description: 'AI-powered screening detects eye diseases before symptoms appear',
      image: '👁️',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Expert Consultation Anytime',
      description: 'Connect with ophthalmologists from the comfort of your home',
      image: '👨‍⚕️',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      title: 'Affordable Eye Care',
      description: 'Reduce hospital visits and access quality care at lower costs',
      image: '💰',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="py-20 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-black text-slate-900 mb-12 text-center">
          Why RetiSight?
        </h2>

        {/* Slide */}
        <div className="relative h-96 rounded-2xl overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute w-full h-full transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className={`bg-gradient-to-r ${slide.color} w-full h-full flex items-center justify-center text-white`}>
                <div className="text-center">
                  <div className="text-8xl mb-4">{slide.image}</div>
                  <h3 className="text-4xl font-black mb-4">{slide.title}</h3>
                  <p className="text-lg opacity-90">{slide.description}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 p-3 rounded-full transition-all z-10"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 p-3 rounded-full transition-all z-10"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-white w-8'
                    : 'bg-white/50 w-3 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SlideSection;