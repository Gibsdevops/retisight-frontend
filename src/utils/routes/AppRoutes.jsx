import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import Home from '../../pages/Home';
import Login from '../../pages/Login';
import DoctorDashboard from '../../pages/DoctorDashboard';
import PatientDashboard from '../../pages/PatientDashboard';
import DoctorList from '../../pages/DoctorList';
import AppointmentList from '../../pages/AppointmentList';
import Participant from '../../pages/Participant';
import AIScreening from '../../pages/AIScreening';
import ResultCard from '../../pages/ResultCard';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
      <Route path="/dashboard/patient" element={<PatientDashboard />} />
      <Route path="/doctors" element={<DoctorList />} />
      <Route path="/appointments" element={<AppointmentList />} />
      <Route path="/participant" element={<Participant />} />
      <Route path="/screening" element={<AIScreening />} />
      <Route path="/results/:appointmentId" element={<ResultCard />} />

      {/* 404 */}
      <Route path="*" element={<div className="p-8 text-center">Page not found</div>} />
    </Routes>
  );
};

export default AppRoutes;