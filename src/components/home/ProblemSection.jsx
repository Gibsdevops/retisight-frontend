import React from 'react';
import { TrendingUp, AlertCircle, Users, Clock, DollarSign, Globe } from 'lucide-react';

const ProblemSection = () => {
  const problemData = [
    {
      id: 1,
      title: 'Blindness Crisis',
      stat: '43 Million',
      description: 'people globally are blind, many preventable',
      icon: AlertCircle,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50'
    },
    {
      id: 2,
      title: 'Late Detection',
      stat: '80%',
      description: 'of eye diseases detected too late for treatment',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    },
    {
      id: 3,
      title: 'Limited Access',
      stat: '1:500K',
      description: 'ratio of ophthalmologists to population in Africa',
      icon: Users,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 4,
      title: 'Hospital Burden',
      stat: '50%',
      description: 'of patients skip appointments due to distance',
      icon: Clock,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <section id="problem" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">
            The Problem We Solve
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Eye health is a global crisis. Limited access to experts, late detection, 
            and preventable blindness affect millions.
          </p>
        </div>

        {/* Grid of Problems */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {problemData.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className={`${item.bgColor} rounded-2xl p-6 border-l-4 border-slate-200 hover:shadow-lg transition-all`}>
                <div className={`bg-gradient-to-r ${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{item.stat}</h3>
                <p className="text-slate-700 font-semibold">{item.title}</p>
                <p className="text-slate-600 text-sm mt-2">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* The Challenge Section (from your existing Home) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4 text-red-500 font-black uppercase text-xs tracking-widest">
              <AlertCircle size={16} /> The Global Crisis
            </div>
            <h3 className="text-4xl font-black text-slate-900 leading-tight">
              Eye clinics are expensive. <br/>Sight shouldn't be.
            </h3>
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
              <h4 className="text-5xl font-black">1 in 3</h4>
              <p className="text-sm font-bold opacity-80 uppercase mt-2 tracking-tighter">Diabetics will develop DR</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] text-slate-800 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-center">
              <h4 className="text-5xl font-black text-red-500">80%</h4>
              <p className="text-sm font-bold text-slate-400 uppercase mt-2 tracking-tighter">Of blindness is preventable</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;