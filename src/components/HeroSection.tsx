import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BrainCircuit, Layers, Zap } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  // Simplified and rephrased features to match the project description
  const features = [
    {
      icon: BrainCircuit,
      title: 'AI-Powered Segmentation',
      description: 'Utilizes a U-Net model built with Python and TensorFlow to accurately identify tumor regions in MRI scans.'
    },
    {
      icon: Layers,
      title: 'Interactive Overlay',
      description: 'Visually analyze the model\'s findings with a real-time overlay of the segmented tumor on the original MRI scan.'
    },
    {
      icon: Zap,
      title: 'Efficient Analysis',
      description: 'Automates the detection process to improve image analysis efficiency by 40% over manual methods.'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* --- RENAMED PROJECT TITLE --- */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
            Image Analysis Tool
          </h1>
          
          {/* --- REPHRASED SUBTITLE to be more direct --- */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            A web-based application designed to analyze MRI scans for tumors using a U-Net deep learning model.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Button
              onClick={onGetStarted}
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
            >
              Start Analysis
            </Button>
          </motion.div>
        </motion.div>

        {/* --- SIMPLIFIED FEATURE SECTION --- */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          // Changed grid to 3 columns to match the 3 features for a less cluttered look
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-blue-500/50 transition-colors">
                <feature.icon className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
