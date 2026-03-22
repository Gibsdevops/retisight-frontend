import React from 'react';
import { Heart, Globe, Zap, Target, Users, TrendingUp } from 'lucide-react';

const WhyExistsSection = () => {
  const reasons = [
    {
      id: 1,
      icon: Heart,
      title: 'Save Vision',
      description: 'Early detection prevents 80% of blindness. We make screening accessible to everyone.'
    },
    {
      id: 2,
      icon: Globe,
      title: 'Bridge the Gap',
      description: 'Connecting patients in remote areas with world-class ophthalmologists instantly.'
    },
    {
      id: 3,
      icon: Zap,
      title: 'Empower with Technology',
      description: 'AI-powered diagnostics provide instant insights while expert doctors validate findings.'
    },
    {
      id: 4,
      icon: Target,
      title: 'Affordable Care',
      description: 'Reduce healthcare costs by enabling preventive care instead of emergency treatment.'
    },
    {
      id: 5,
      icon: Users,
      title: 'Scale Impact',
      description: 'One platform serving millions globally. Decentralized, efficient, and sustainable.'
    },
    {
      id: 6,
      icon: TrendingUp,
      title: 'Drive Innovation',
      description: 'Building the future of telemedicine with AI, real-time diagnostics, and expert networks.'
    }
  ];

  return (
    <section id="why" className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-medical-100 text-medical-700 rounded-full font-bold text-sm mb-4">
            OUR MISSION
          </span>
          <h2 className="text-5xl font-black text-slate-900 mb-6">
            Why RetiSight Exists
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            We believe every person deserves access to quality eye care, 
            regardless of location or economic status. That's why we built RetiSight.
          </p>
        </div>

        {/* Grid of Reasons */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.id}
                className="bg-white rounded-xl p-8 border border-slate-200 hover:border-medical-600 hover:shadow-xl transition-all group"
              >
                <div className="bg-medical-50 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:bg-medical-600 transition-all">
                  <Icon className="text-medical-600 group-hover:text-white transition-all" size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{reason.title}</h3>
                <p className="text-slate-600 leading-relaxed">{reason.description}</p>
              </div>
            );
          })}
        </div>

        {/* Vision Statement */}
        <div className="bg-gradient-to-r from-medical-600 via-medical-700 to-medical-800 rounded-2xl p-12 text-white text-center">
          <h3 className="text-3xl font-black mb-4">Our Vision</h3>
          <p className="text-lg opacity-95 max-w-2xl mx-auto leading-relaxed">
            To democratize eye care globally. We envision a world where anyone can get expert 
            eye screening and consultation within minutes, from anywhere, at affordable prices. 
            Where AI augments doctors, not replaces them. Where vision is protected for all.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyExistsSection;