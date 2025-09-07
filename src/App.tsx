import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import UploadSection from './components/UploadSection';
import VisualizationSection from './components/VisualizationSection';
import AboutSection from './components/AboutSection';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [currentSection, setCurrentSection] = useState('home');

  const renderSection = () => {
    switch (currentSection) {
      case 'home':
        return <HeroSection onGetStarted={() => setCurrentSection('upload')} />;
      case 'upload':
        return <UploadSection onContinueToVisualization={() => setCurrentSection('visualization')} />;
      case 'visualization':
        return <VisualizationSection />;
      case 'about':
        return <AboutSection />;
      default:
        return <HeroSection onGetStarted={() => setCurrentSection('upload')} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header currentSection={currentSection} onNavigate={setCurrentSection} />
      
      <main className="pt-16">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderSection()}
        </motion.div>
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;