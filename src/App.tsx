import React, { useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import EditorialHome from './components/public/EditorialHome';
import AboutSection from './components/public/AboutSection';
import ContactSection from './components/public/ContactSection';
import GitHubShowcase from './components/public/GitHubShowcase';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';

export default function App() {
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans selection:bg-white selection:text-black">
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />

      <main className="pt-20">
        {currentView === 'public' ? (
          <>
            <EditorialHome />
            <AboutSection />
            <GitHubShowcase username="athenas-dev" />
            <ContactSection />
          </>
        ) : isAdminAuthenticated ? (
          <AdminDashboard />
        ) : (
          <AdminLogin onLoginSuccess={() => setIsAdminAuthenticated(true)} />
        )}
      </main>

      <Footer />
    </div>
  );
}
