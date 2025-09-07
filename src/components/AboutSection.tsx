import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Database, Cpu, Code, Users, Award } from 'lucide-react';

export default function AboutSection() {
  const features = [
    {
      icon: Brain,
      title: 'U-Net Architecture',
      description: 'State-of-the-art convolutional neural network specifically designed for medical image segmentation with skip connections for precise boundary detection.'
    },
    {
      icon: Database,
      title: 'LGG MRI Dataset',
      description: 'Curated dataset of Low-Grade Glioma MRI scans with expert annotations, providing high-quality training data for accurate tumor segmentation.'
    },
    {
      icon: Cpu,
      title: 'Real-time Processing',
      description: 'Optimized inference pipeline that delivers fast segmentation results while maintaining clinical-grade accuracy for immediate analysis.'
    },
    {
      icon: Code,
      title: 'Interactive Visualization',
      description: 'Advanced web-based interface with customizable overlays, comparison tools, and multiple viewing modes for comprehensive analysis.'
    }
  ];

  const techStack = [
    'React', 'TypeScript', 'TailwindCSS', 'ShadCN UI', 'Framer Motion',
    'Python', 'TensorFlow', 'U-Net', 'Medical Imaging', 'NIfTI'
  ];

  const metrics = [
    { label: 'Accuracy', value: '94.7%', description: 'Dice coefficient on test set' },
    { label: 'Processing Time', value: '<2s', description: 'Average inference time' },
    { label: 'Dataset Size', value: '3,929', description: 'MRI scan slices' },
    { label: 'Validation Score', value: '0.947', description: 'IoU metric performance' }
  ];

  return (
    <div className="min-h-screen px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">About This Project</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            An advanced medical imaging platform combining cutting-edge deep learning 
            with intuitive visualization tools for brain MRI segmentation analysis.
          </p>
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <feature.icon className="h-6 w-6 text-blue-400" />
                    <span>{feature.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric) => (
                  <div key={metric.label} className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {metric.value}
                    </div>
                    <div className="font-medium mb-1">{metric.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {metric.description}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Technical Details */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Dataset Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">LGG Segmentation Dataset</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  The dataset contains brain MRI scans of patients with Low-Grade Glioma (LGG), 
                  collected from The Cancer Imaging Archive (TCIA). Each scan includes expert 
                  annotations for tumor boundaries.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data Characteristics</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Format: NIfTI (.nii) medical imaging standard</li>
                  <li>• Resolution: 240x240 pixels per slice</li>
                  <li>• Modalities: FLAIR, T1w, T1gd, T2w sequences</li>
                  <li>• Ground truth: Manual segmentation masks</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Technology Stack</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Frontend Technologies</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {techStack.slice(0, 5).map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Backend & AI Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {techStack.slice(5).map((tech) => (
                    <Badge key={tech} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}