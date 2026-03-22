import React, { useState } from 'react';
import { Camera, Zap, Network, CheckCircle, Users, Stethoscope } from 'lucide-react';

const ProductsSection = () => {
  const [activeProduct, setActiveProduct] = useState(0);

  const products = [
    {
      id: 1,
      name: 'Fundus Camera',
      tagline: 'Portable Retinal Imaging',
      icon: Camera,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      image: '📷',
      description: 'Compact, affordable fundus camera for high-quality retinal imaging. Captures clear retinal images in seconds.',
      features: [
        'High-resolution retinal imaging',
        'Portable and lightweight',
        'Easy to use interface',
        'Real-time image capture',
        'Cloud-based storage'
      ],
      useCase: 'How It Works',
      caseDetails: [
        {
          role: '👨‍🦳 Patients',
          benefit: 'Get retinal screening from home or clinic. No hospital visit needed.',
          action: 'Self-screening or clinic-based screening'
        },
        {
          role: '🏥 Clinics & Optical Shops',
          benefit: 'Provide retinal screening services. Hybrid model - both online and in-clinic.',
          action: 'Purchase camera, screen patients, connect with experts'
        },
        {
          role: '👨‍⚕️ Ophthalmologists',
          benefit: 'Access high-quality images from patients globally for remote diagnosis.',
          action: 'Review images, provide consultation'
        }
      ],
      price: '$2,999 - $5,999',
      target: 'Patients, Clinics, Optical Shops, Hospitals'
    },
    {
      id: 2,
      name: 'AI Processing Engine',
      tagline: 'Real-Time Retina Analysis',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      image: '⚙️',
      description: 'Hardware tool that processes retinal images in real-time. Delivers instant AI-powered analysis with high accuracy.',
      features: [
        'Real-time image processing',
        'AI disease detection',
        'Hardware-accelerated computation',
        'Instant results to patients',
        'Integration with EHR systems'
      ],
      useCase: 'How It Works',
      caseDetails: [
        {
          role: '🏥 Hospitals',
          benefit: 'Deploy on-premises for instant retinal analysis without cloud dependency.',
          action: 'Install hardware, process images, get instant AI results'
        },
        {
          role: '🔬 Diagnostic Centers',
          benefit: 'Provide faster diagnosis. Reduce patient wait time from hours to seconds.',
          action: 'Integrate with screening workflow, deliver results instantly'
        },
        {
          role: '👨‍⚕️ Doctors',
          benefit: 'Get AI-assisted diagnosis instantly. Focus on complex cases.',
          action: 'Review AI findings, make expert decisions faster'
        }
      ],
      price: '$15,000 - $50,000',
      target: 'Hospitals, Diagnostic Centers, Clinics'
    },
    {
      id: 3,
      name: 'Decentralized Platform',
      tagline: 'Connect. Diagnose. Treat.',
      icon: Network,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      image: '🌐',
      description: 'All-in-one telemedicine platform. Connect patients with doctors, enable AI diagnosis, and manage complete eye care workflow.',
      features: [
        'Live video consultation',
        'AI-powered diagnosis',
        'Appointment management',
        'Medical records storage',
        'Prescription management'
      ],
      useCase: 'How It Works',
      caseDetails: [
        {
          role: '👨‍🦳 Patients',
          benefit: 'Upload retinal images, get AI analysis, consult with doctors, all in one app.',
          action: 'Screen → Diagnose → Consult → Treat'
        },
        {
          role: '👨‍⚕️ Doctors',
          benefit: 'Manage patient consultations, review AI findings, provide expert opinions.',
          action: 'Review cases, provide diagnosis, prescribe treatment'
        },
        {
          role: '🏥 Clinics/Hospitals',
          benefit: 'White-label solution. Manage entire patient workflow with AI assistance.',
          action: 'Deploy on clinic, manage patients, improve revenue'
        }
      ],
      price: 'Subscription: $99-$999/month',
      target: 'Patients, Doctors, Clinics, Hospitals'
    }
  ];

  const activeItem = products[activeProduct];
  const Icon = activeItem.icon;

  return (
    <section id="products" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-medical-100 text-medical-700 rounded-full font-bold text-sm mb-4">
            OUR PRODUCTS
          </span>
          <h2 className="text-4xl font-black text-slate-900 mb-4">
            Complete Eye Care Solutions
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Three powerful products working together to revolutionize eye care delivery.
          </p>
        </div>

        {/* Product Tabs */}
        <div className="flex flex-col lg:flex-row gap-8 mb-16">
          {/* Tabs Navigation */}
          <div className="lg:w-1/4">
            <div className="space-y-3">
              {products.map((product, index) => {
                const TabIcon = product.icon;
                return (
                  <button
                    key={product.id}
                    onClick={() => setActiveProduct(index)}
                    className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all ${
                      activeProduct === index
                        ? `bg-gradient-to-r ${product.color} text-white border-transparent`
                        : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TabIcon size={20} />
                      <div className="text-left">
                        <p className="font-bold">{product.name}</p>
                        <p className="text-xs opacity-75">{product.tagline}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Product Details */}
          <div className="lg:w-3/4">
            <div className={`bg-gradient-to-r ${activeItem.color} rounded-2xl p-1`}>
              <div className={`${activeItem.bgColor} rounded-xl p-8`}>
                {/* Product Header */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 mb-2">{activeItem.name}</h3>
                    <p className="text-lg text-slate-600">{activeItem.description}</p>
                  </div>
                  <div className="text-6xl">{activeItem.image}</div>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <p className="font-bold text-slate-900 mb-4">✨ Key Features</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {activeItem.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle size={20} className="text-green-600" />
                        <p className="text-slate-700">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use Cases */}
                <div className="mb-8">
                  <p className="font-bold text-slate-900 mb-4">👥 Who Uses It</p>
                  <div className="space-y-3">
                    {activeItem.caseDetails.map((useCase, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="font-bold text-slate-900 mb-2">{useCase.role}</p>
                        <p className="text-slate-700 text-sm mb-2">{useCase.benefit}</p>
                        <p className="text-xs font-semibold text-medical-600">→ {useCase.action}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-75 mb-1">Starting at</p>
                    <p className="text-3xl font-black">{activeItem.price}</p>
                  </div>
                  <button className="px-8 py-3 bg-medical-600 hover:bg-medical-700 text-white font-bold rounded-lg transition-all">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Ecosystem */}
        <div className="bg-slate-50 rounded-2xl p-12">
          <h3 className="text-3xl font-black text-slate-900 mb-8 text-center">
            How They Work Together
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Camera className="text-blue-600" size={32} />
              </div>
              <p className="font-bold text-slate-900 mb-2">1. Capture</p>
              <p className="text-slate-600">Fundus Camera captures high-quality retinal images</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="text-purple-600" size={32} />
              </div>
              <p className="font-bold text-slate-900 mb-2">2. Analyze</p>
              <p className="text-slate-600">AI Engine processes images in real-time</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Network className="text-green-600" size={32} />
              </div>
              <p className="font-bold text-slate-900 mb-2">3. Consult</p>
              <p className="text-slate-600">Platform connects with doctors for expert review</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;