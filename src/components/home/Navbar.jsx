import React, { useState } from 'react';
import { Menu, X, Eye } from 'lucide-react';

const Navbar = ({ onStart }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-medical-600 rounded-lg flex items-center justify-center">
              <Eye className="text-white" size={24} />
            </div>
            <span className="font-black text-xl text-slate-900">RetiSight</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#products" className="text-slate-700 hover:text-medical-600 font-semibold">
              Products
            </a>
            <a href="#why" className="text-slate-700 hover:text-medical-600 font-semibold">
              Why Us
            </a>
            <a href="#problem" className="text-slate-700 hover:text-medical-600 font-semibold">
              Problem
            </a>
            <button
              onClick={onStart}
              className="px-6 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 font-semibold"
            >
              Login
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <a
              href="#products"
              className="block px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Products
            </a>
            <a
              href="#why"
              className="block px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Why Us
            </a>
            <a
              href="#problem"
              className="block px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Problem
            </a>
            <button
              onClick={() => {
                setIsOpen(false);
                onStart();
              }}
              className="w-full px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 font-semibold"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;