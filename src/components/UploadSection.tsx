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
    'Patient_001_slice_045.tif',
    'Patient_002_slice_067.tif',
    'Patient_003_slice_032.tif',
    'Patient_004_slice_089.tif',
    'Patient_005_slice_156.tif'
  ];


  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read blob as Base64 string.'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const getMriSegmentation = async (): Promise<void> => {
    try {
      const storedMriScan = localStorage.getItem('mriScan');

      if (!storedMriScan) {
        console.error('mriScan not found in local storage.');
        return;
      }

      const mriScanObject = JSON.parse(storedMriScan);
      const base64Url = mriScanObject.url;

      if (!base64Url || typeof base64Url !== 'string') {
        console.error('Valid URL not found in mriScan object.');
        return;
      }

      const parts = base64Url.split(',');
      const meta = parts[0];
      const data = parts[1];

      const mimeMatch = meta.match(/:(.*?);/);
      if (!mimeMatch || !mimeMatch[1]) {
        console.error('Could not determine MIME type from base64 string.');
        return;
      }
      const mimeType = mimeMatch[1];
      const imageBlob = base64ToBlob(data, mimeType);
      const imageFile = new File([imageBlob], 'mri_scan.png', { type: mimeType });

      const formData = new FormData();
      formData.append('file', imageFile);

      const apiUrl = 'http://segment.shloksheth.tech/predict/image';
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const resultBlob = await response.blob();
      const resultBase64Url = await blobToBase64(resultBlob);

      localStorage.setItem('segmentationMask', resultBase64Url);

    } catch (error) {
      console.error('An error occurred during the MRI segmentation process:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setSelectedSample('');
      toast.success(`File "${file.name}" uploaded successfully`);
      const reader = new FileReader();
      reader.onload = () => {
        const scanData = {
          name: file.name,
          url: reader.result as string,
        };
        localStorage.removeItem('mriScan');
        localStorage.setItem('mriScan', JSON.stringify(scanData));
        getMriSegmentation();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleSelect = async (value: string) => {
    setSelectedSample(value);
    setUploadedFile(null);
    toast.info(`Sample "${value}" selected`);

    const response = await fetch(`/${value}`);
    const blob = await response.blob();
    const reader = new FileReader();
    reader.onload = () => {
      const scanData = {
        name: value,
        url: reader.result as string,
      };
      localStorage.removeItem('mriScan');
      localStorage.setItem('mriScan', JSON.stringify(scanData));
      getMriSegmentation();
    };
    reader.readAsDataURL(blob);
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
                  Upload your own MRI scan in .tif, .jpg, .jpeg, .png formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    accept=".tif,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported formats: .tif, .jpg, .jpeg, .png up to 100MB
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
.
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