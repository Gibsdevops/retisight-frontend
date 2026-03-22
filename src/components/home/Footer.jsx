import React from 'react';
import { Eye, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-12 mb-12">
          {/* Brand Section */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-medical-600 p-2 rounded-lg text-white">
                <Eye size={20} />
              </div>
              <span className="text-xl font-black uppercase tracking-widest">RetiSight AI</span>
            </div>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
              Building the infrastructure for the next generation of tele-ophthalmology. 
              We combine low-cost smartphone optics with state-of-the-art Deep Learning 
              to prevent avoidable blindness globally.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="hover:text-medical-600 transition-all">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-medical-600 transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-medical-600 transition-all">
                <Linkedin size={20} />
              </a>
              <a href="#" className="hover:text-medical-600 transition-all">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-medical-600">Platform</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="hover:text-white cursor-pointer transition-colors">AI Diagnostics</li>
              <li className="hover:text-white cursor-pointer transition-colors">Doctor Portal</li>
              <li className="hover:text-white cursor-pointer transition-colors">Patient Mobile App</li>
              <li className="hover:text-white cursor-pointer transition-colors">Telemedicine</li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-medical-600">Resources</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="hover:text-white cursor-pointer transition-colors">Research Papers</li>
              <li className="hover:text-white cursor-pointer transition-colors">Clinical Guidelines</li>
              <li className="hover:text-white cursor-pointer transition-colors">Privacy & Security</li>
              <li className="hover:text-white cursor-pointer transition-colors">Medical Disclaimer</li>
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-slate-800 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-black text-white mb-6">Get In Touch</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <Mail className="text-medical-600 mt-1 flex-shrink-0" size={24} />
              <div>
                <p className="font-bold text-white">Email</p>
                <a href="mailto:hello@retisight.com" className="text-slate-400 hover:text-medical-600">
                  hello@retisight.com
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="text-medical-600 mt-1 flex-shrink-0" size={24} />
              <div>
                <p className="font-bold text-white">Phone</p>
                <a href="tel:+256701234567" className="text-slate-400 hover:text-medical-600">
                  +256 (0) 701 234 567
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="text-medical-600 mt-1 flex-shrink-0" size={24} />
              <div>
                <p className="font-bold text-white">Location</p>
                <p className="text-slate-400">Kampala, Uganda</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-800">
          <p className="text-sm text-slate-400">
            © {currentYear} RETISIGHT SYSTEMS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8 text-sm text-slate-400">
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">GDPR Compliance</span>
            <span className="hover:text-white cursor-pointer">Medical Disclaimer</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;