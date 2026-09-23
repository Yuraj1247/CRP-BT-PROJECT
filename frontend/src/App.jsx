import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import CreateCertificate from './pages/CreateCertificate';
import VerifyCertificate from './pages/VerifyCertificate';
import ProcessFlow from './pages/ProcessFlow';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create" element={<CreateCertificate />} />
            <Route path="/verify" element={<VerifyCertificate />} />
            <Route path="/verify/:id" element={<VerifyCertificate />} />
            <Route path="/process" element={<ProcessFlow />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
