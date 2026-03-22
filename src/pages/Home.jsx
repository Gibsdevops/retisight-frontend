import React from 'react';
import Navbar from '../components/home/Navbar';
import HeroSection from '../components/home/HeroSection';
import ProblemSection from '../components/home/ProblemSection';
import WhyExistsSection from '../components/home/WhyExistsSection';
import ProductsSection from '../components/home/ProductsSection';
import FooterSection from '../components/home/Footer';

const Home = ({ onStart }) => {
  return (
    <div className="bg-white">
      <Navbar onStart={onStart} />
      <HeroSection onStart={onStart} />
      <ProblemSection />
      <WhyExistsSection />
      <ProductsSection />
      <FooterSection />
    </div>
  );
};

export default Home;