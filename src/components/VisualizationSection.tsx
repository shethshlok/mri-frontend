import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, RotateCcw, Eye, Layers, SplitSquareHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export default function VisualizationSection() {
  const [opacity, setOpacity] = useState([70]);
  const [viewMode, setViewMode] = useState('overlay');
  const [colorMap, setColorMap] = useState('viridis');
  const [thresholding, setThresholding] = useState(false);
  const [comparePosition, setComparePosition] = useState(50);
  const compareRef = useRef<HTMLDivElement>(null);

  const viewModes = [
    { id: 'mri', label: 'MRI Only', icon: Eye },
    { id: 'mask', label: 'Mask Only', icon: Layers },
    { id: 'overlay', label: 'Overlay', icon: SplitSquareHorizontal }
  ];

  const colorMaps = [
    { value: 'grayscale', label: 'Grayscale' },
    { value: 'viridis', label: 'Viridis' },
    { value: 'heatmap', label: 'Heatmap' },
    { value: 'plasma', label: 'Plasma' }
  ];

  const handleReset = () => {
    setOpacity([70]);
    setViewMode('overlay');
    setColorMap('viridis');
    setThresholding(false);
    setComparePosition(50);
    toast.success('View reset to defaults');
  };

  const handleDownload = () => {
    toast.success('Image downloaded successfully');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (compareRef.current) {
      const rect = compareRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setComparePosition(Math.max(0, Math.min(100, percentage)));
    }
  };

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    toast.info(`View mode changed to ${viewModes.find(v => v.id === mode)?.label}`);
  };

  const handleColorMapChange = (value: string) => {
    setColorMap(value);
    toast.info(`Color map changed to ${colorMaps.find(c => c.value === value)?.label}`);
  };

  const handleThresholdingChange = (checked: boolean) => {
    setThresholding(checked);
    toast.info(`Thresholding ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleOpacityChange = (value: number[]) => {
    setOpacity(value);
  };

  // Helper function to get color map styles
  const getColorMapStyle = (map: string) => {
    switch (map) {
      case 'grayscale':
        return 'from-gray-900 to-gray-300';
      case 'viridis':
        return 'from-purple-900 via-blue-600 to-yellow-400';
      case 'heatmap':
        return 'from-black via-red-600 to-yellow-400';
      case 'plasma':
        return 'from-purple-900 via-pink-600 to-yellow-300';
      default:
        return 'from-purple-900 via-blue-600 to-yellow-400';
    }
  };

  // Helper function to render MRI scan
  const renderMRIScan = () => (
    <div className="aspect-square bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-radial from-gray-600 to-gray-800 rounded-full mx-auto mb-2 opacity-50"></div>
          <span className="text-sm text-muted-foreground">MRI Scan</span>
        </div>
      </div>
    </div>
  );

  // Helper function to render segmentation mask
  const renderSegmentationMask = () => {
    const colorGradient = getColorMapStyle(colorMap);
    const maskOpacity = thresholding ? 0.9 : 0.7;
    
    return (
      <div className={`aspect-square bg-gradient-to-br ${colorGradient} rounded-lg relative overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div 
              className={`w-24 h-24 bg-gradient-radial from-current to-transparent rounded-full mx-auto mb-2`}
              style={{ opacity: maskOpacity }}
            ></div>
            <span className="text-sm text-muted-foreground">Segmentation Mask</span>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to render overlay
  const renderOverlay = () => {
    const colorGradient = getColorMapStyle(colorMap);
    const overlayOpacity = (opacity[0] / 100) * (thresholding ? 0.9 : 0.7);
    
    return (
      <div className="aspect-square bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-lg relative overflow-hidden">
        {/* Base MRI */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-radial from-gray-600 to-gray-800 rounded-full mx-auto mb-2 opacity-50"></div>
          </div>
        </div>
        {/* Overlay mask */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${colorGradient} flex items-center justify-center`}
          style={{ opacity: overlayOpacity }}
        >
          <div className="w-24 h-24 bg-gradient-radial from-white/30 to-transparent rounded-full"></div>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="text-sm text-muted-foreground">MRI + Segmentation</span>
        </div>
      </div>
    );
  };

  // Helper function to get the appropriate visualization for each pane
  const getVisualizationContent = (pane: 'original' | 'prediction') => {
    if (pane === 'original') {
      // Original pane always shows MRI
      return renderMRIScan();
    } else {
      // Prediction pane changes based on view mode
      switch (viewMode) {
        case 'mri':
          return renderMRIScan();
        case 'mask':
          return renderSegmentationMask();
        case 'overlay':
          return renderOverlay();
        default:
          return renderOverlay();
      }
    }
  };

  // Helper function for comparison slider content
  const getComparisonContent = () => {
    const colorGradient = getColorMapStyle(colorMap);
    
    switch (viewMode) {
      case 'mri':
        return {
          left: 'bg-gradient-to-br from-gray-800 to-gray-700',
          right: 'bg-gradient-to-br from-gray-800 to-gray-700',
          leftLabel: 'Original MRI',
          rightLabel: 'MRI View'
        };
      case 'mask':
        return {
          left: 'bg-gradient-to-br from-gray-800 to-gray-700',
          right: `bg-gradient-to-br ${colorGradient}`,
          leftLabel: 'Original MRI',
          rightLabel: 'Segmentation Mask'
        };
      case 'overlay':
        return {
          left: 'bg-gradient-to-br from-gray-800 to-gray-700',
          right: `bg-gradient-to-br ${colorGradient}`,
          leftLabel: 'Original MRI',
          rightLabel: 'MRI + Overlay'
        };
      default:
        return {
          left: 'bg-gradient-to-br from-gray-800 to-gray-700',
          right: `bg-gradient-to-br ${colorGradient}`,
          leftLabel: 'Original MRI',
          rightLabel: 'MRI + Overlay'
        };
    }
  };

  const comparisonContent = getComparisonContent();

  return (
    <div className="min-h-screen px-4 py-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold mb-4">MRI Visualization</h2>
          <p className="text-xl text-muted-foreground">
            Interactive analysis and comparison tools
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* View Mode Toggle */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">View Mode</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {viewModes.map((mode) => {
                      const Icon = mode.icon;
                      return (
                        <Button
                          key={mode.id}
                          variant={viewMode === mode.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleViewModeChange(mode.id)}
                          className="w-full justify-start"
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {mode.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Opacity Slider */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Overlay Opacity ({opacity[0]}%)
                  </Label>
                  <Slider
                    value={opacity}
                    onValueChange={handleOpacityChange}
                    max={100}
                    min={0}
                    step={1}
                    disabled={viewMode !== 'overlay'}
                    className={viewMode !== 'overlay' ? 'opacity-50' : ''}
                  />
                  {viewMode !== 'overlay' && (
                    <p className="text-xs text-muted-foreground">
                      Only available in Overlay mode
                    </p>
                  )}
                </div>

                <Separator />

                {/* Color Map */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Color Map</Label>
                  <Select value={colorMap} onValueChange={handleColorMapChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorMaps.map((map) => (
                        <SelectItem key={map.value} value={map.value}>
                          {map.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Thresholding */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="threshold" className="text-sm font-medium">
                    Thresholding
                  </Label>
                  <Switch
                    id="threshold"
                    checked={thresholding}
                    onCheckedChange={handleThresholdingChange}
                  />
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button onClick={handleReset} variant="outline" className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset View
                  </Button>
                  <Button onClick={handleDownload} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Image
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Visualization Area */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Main Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Brain MRI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Original MRI */}
                  <div className="space-y-3">
                    <h3 className="font-medium">Original MRI Scan</h3>
                    {getVisualizationContent('original')}
                  </div>

                  {/* Segmentation Prediction */}
                  <div className="space-y-3">
                    <h3 className="font-medium">
                      {viewMode === 'mri' ? 'MRI View' : 
                       viewMode === 'mask' ? 'Segmentation Mask' : 
                       'Segmentation Prediction'}
                    </h3>
                    {getVisualizationContent('prediction')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Before/After Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Before/After Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={compareRef}
                  className="relative aspect-video rounded-lg overflow-hidden cursor-ew-resize"
                  onMouseMove={handleMouseMove}
                >
                  <div className="absolute inset-0 flex">
                    {/* Before (Left side) */}
                    <div
                      className={`${comparisonContent.left} flex items-center justify-center`}
                      style={{ width: `${comparePosition}%` }}
                    >
                      <span className="text-muted-foreground">{comparisonContent.leftLabel}</span>
                    </div>
                    
                    {/* After (Right side) */}
                    <div
                      className={`${comparisonContent.right} flex items-center justify-center relative`}
                      style={{ width: `${100 - comparePosition}%` }}
                    >
                      <span className="text-muted-foreground">{comparisonContent.rightLabel}</span>
                      {viewMode === 'overlay' && (
                        <div 
                          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
                          style={{ opacity: opacity[0] / 100 }}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Slider Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                    style={{ left: `${comparePosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <SplitSquareHorizontal className="h-4 w-4 text-gray-800" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}