import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, Code, BarChart3, Layers } from 'lucide-react';

export default function AboutSection() {
  // Simplified and refocused features for the new narrative
  const features = [
    {
      icon: Cpu,
      title: 'AI-Powered Segmentation',
      description: 'At the core is a U-Net deep learning model, built with Python and TensorFlow, designed to accurately identify and segment tumor regions within MRI scans.'
    },
    {
      icon: Code,
      title: 'Interactive Web Interface',
      description: 'A web application developed with JavaScript and React to provide an intuitive way to upload, visualize, and analyze the MRI scans and the model\'s output overlays.'
    },
    {
      icon: BarChart3,
      title: 'Efficient & Measurable Results',
      description: 'The use of automation and machine learning algorithms led to a 40% improvement in image analysis efficiency compared to manual methods, with a Dice accuracy of 94.7%.'
    }
  ];

  // Updated tech stack including Git
  const techStack = [
    'Python', 'TensorFlow', 'JavaScript', 'React', 'TypeScript', 
    'TailwindCSS', 'Framer Motion', 'Git'
  ];

  return (
    <div className="min-h-screen px-4 py-20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Image Analysis Tool</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A project exploring how AI can assist in healthcare. This tool performs image analysis on brain MRI scans to automatically detect and visualize tumors using a U-Net model.
          </p>
        </motion.div>

        {/* Project Breakdown Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-2xl font-semibold mb-6 text-center">Project Breakdown</h3>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <Card className="h-full text-center">
                  <CardHeader>
                    <CardTitle className="flex flex-col items-center justify-center space-y-3">
                      <feature.icon className="h-8 w-8 text-blue-400" />
                      <span>{feature.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Stack Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Layers className="h-6 w-6" />
                <span>Technology Stack</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {techStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="px-3 py-1 text-sm">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
