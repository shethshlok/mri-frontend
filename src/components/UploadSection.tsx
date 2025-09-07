import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileImage, Database, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface UploadSectionProps {
  onContinueToVisualization: () => void;
}

export default function UploadSection({ onContinueToVisualization }: UploadSectionProps) {
  const [selectedSample, setSelectedSample] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const sampleDataset = [
    'Patient_001_slice_045.nii',
    'Patient_002_slice_067.nii',
    'Patient_003_slice_032.nii',
    'Patient_004_slice_089.nii',
    'Patient_005_slice_156.nii'
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success(`File "${file.name}" uploaded successfully`);
    }
  };

  const handleSampleSelect = (value: string) => {
    setSelectedSample(value);
    toast.info(`Sample "${value}" selected`);
  };

  const canProceed = selectedSample || uploadedFile;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold mb-4">Upload & Dataset</h2>
          <p className="text-xl text-muted-foreground">
            Upload your MRI scan or select from our sample dataset
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload MRI Scan</span>
                </CardTitle>
                <CardDescription>
                  Upload your own MRI scan in NIfTI format (.nii, .nii.gz)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    accept=".nii,.nii.gz"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      NIfTI files (.nii, .nii.gz) up to 100MB
                    </p>
                  </label>
                </div>
                
                {uploadedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                  >
                    <p className="text-sm font-medium text-green-400">
                      ✓ {uploadedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Sample Dataset</span>
                </CardTitle>
                <CardDescription>
                  Choose from our curated LGG MRI dataset for demonstration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedSample} onValueChange={handleSampleSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sample MRI scan" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleDataset.map((sample) => (
                      <SelectItem key={sample} value={sample}>
                        {sample}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedSample && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-2"
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">MRI Preview</span>
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Mask Preview</span>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex justify-center mt-8"
        >
          <Button
            onClick={onContinueToVisualization}
            disabled={!canProceed}
            size="lg"
            className="px-8"
          >
            Continue to Visualization
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}