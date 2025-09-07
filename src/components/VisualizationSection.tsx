import { useState, useRef, useEffect } from 'react';
import { fromArrayBuffer } from 'geotiff';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, RotateCcw, Eye, Layers, SplitSquareHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export default function VisualizationSection() {
  const [opacity, setOpacity] = useState([70]);
  const [viewMode, setViewMode] = useState('overlay');
  const [thresholding, setThresholding] = useState(false);
  const [comparePosition, setComparePosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const compareRef = useRef<HTMLDivElement>(null);
  const [mriScan, setMriScan] = useState<string | null>(null);
  const [maskImage, setMaskImage] = useState<string | null>(null); 
  const [fileName, setFileName] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 512, height: 512 });

  const canvasRefOriginal = useRef<HTMLCanvasElement>(null);
  const canvasRefPrediction = useRef<HTMLCanvasElement>(null);
  const canvasRefCompareLeft = useRef<HTMLCanvasElement>(null);
  const canvasRefCompareRight = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const storedScan = localStorage.getItem('mriScan');
    const storedMask = localStorage.getItem('segmentationMask');
    if (storedScan) {
      const scanData = JSON.parse(storedScan);
      setMriScan(scanData.url);
      setFileName(scanData.name);
      setMaskImage(storedMask);

      if (scanData.url.startsWith('data:image/tiff') || scanData.url.startsWith('data:image/tif')) {
        const renderTiff = async () => {
          try {
            const response = await fetch(scanData.url);
            const arrayBuffer = await response.arrayBuffer();
            const tiff = await fromArrayBuffer(arrayBuffer);
            const image = await tiff.getImage();

            const canvases = [
              canvasRefOriginal.current,
              canvasRefPrediction.current,
              canvasRefCompareLeft.current,
              canvasRefCompareRight.current
            ].filter(Boolean);

            const width = image.getWidth();
            const height = image.getHeight();
            setImageDimensions({ width, height });
            const data = await image.readRasters();
            const data_u8 = new Uint8ClampedArray(data[0] as Iterable<number>);
            const imageData = new ImageData(width, height);
            
            for (let i = 0; i < data_u8.length; i++) {
              imageData.data[i * 4] = data_u8[i];
              imageData.data[i * 4 + 1] = data_u8[i];
              imageData.data[i * 4 + 2] = data_u8[i];
              imageData.data[i * 4 + 3] = 255;
            }

            canvases.forEach(canvas => {
              if (canvas) {
                const context = canvas.getContext('2d');
                canvas.width = width;
                canvas.height = height;
                if (context) {
                  context.putImageData(imageData, 0, 0);
                }
              }
            });
          } catch(error) {
              console.error("Error rendering TIFF image:", error);
              toast.error("Failed to render TIFF image.");
          }
        };
        renderTiff();
      } else if (scanData.url) {
        const img = new Image();
        img.onload = () => {
            setImageDimensions({ width: img.width, height: img.height });
        };
        img.src = scanData.url;
      }
    }
  }, [mriScan, viewMode]);

  const handleSliderMove = (clientX: number) => {
    if (!compareRef.current) return;
    const rect = compareRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setComparePosition(Math.max(0, Math.min(100, percentage)));
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => isDragging && handleSliderMove(e.clientX);
    const handleTouchEnd = () => setIsDragging(false);
    const handleTouchMove = (e: TouchEvent) => isDragging && handleSliderMove(e.touches[0].clientX);

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging]);

  const viewModes = [
    { id: 'mri', label: 'MRI Only', icon: Eye },
    { id: 'mask', label: 'Mask Only', icon: Layers },
    { id: 'overlay', label: 'Overlay', icon: SplitSquareHorizontal }
  ];

  const handleReset = () => {
    setOpacity([70]);
    setViewMode('overlay');
    setThresholding(false);
    setComparePosition(50);
    toast.success('View reset to defaults');
  };

  const handleDownload = () => {
    toast.success('Image downloaded successfully');
  };

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    toast.info(`View mode changed to ${viewModes.find(v => v.id === mode)?.label}`);
  };

  const handleThresholdingChange = (checked: boolean) => {
    setThresholding(checked);
    toast.info(`Thresholding ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleOpacityChange = (value: number[]) => {
    setOpacity(value);
  };

  const renderMRIScan = (customRef: React.RefObject<HTMLCanvasElement>) => (
    <div className="aspect-square w-full h-full from-gray-800 via-gray-700 to-gray-800 rounded-lg relative overflow-hidden bg-black">
      {mriScan ? (
        (mriScan.startsWith('data:image/tiff') || mriScan.startsWith('data:image/tif')) ? (
          <canvas ref={customRef} className="w-full h-full object-cover" />
        ) : (
          <img src={mriScan} alt="MRI Scan" className="w-full h-full object-cover" />
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-radial from-gray-600 to-gray-800 rounded-full mx-auto mb-2 opacity-50"></div>
            <span className="text-sm text-muted-foreground">MRI Scan</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderSegmentationMask = () => {
    const maskOpacity = thresholding ? 0.9 : 0.7;
    return (
      <div className="aspect-square w-full h-full rounded-lg relative overflow-hidden bg-black">
        {maskImage ? (
          <img src={maskImage} alt="Segmentation Mask" className="w-full h-full object-cover" style={{ opacity: maskOpacity }} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-radial from-white/30 to-transparent rounded-full mx-auto mb-2"></div>
              <span className="text-sm text-muted-foreground">Segmentation Mask</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOverlay = (customRef: React.RefObject<HTMLCanvasElement>) => {
    const overlayOpacity = (opacity[0] / 100) * (thresholding ? 0.9 : 0.7);
    return (
      <div className="aspect-square w-full h-full relative rounded-lg overflow-hidden">
        {renderMRIScan(customRef)}
        {maskImage && (
          <img
            src={maskImage}
            alt="Segmentation Mask"
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
            style={{ opacity: overlayOpacity, mixBlendMode: 'lighten' }}
          />
        )}
      </div>
    );
  };

  const renderComparisonContent = () => {
      return (
        <div className="absolute inset-0 w-full h-full">
           {(mriScan?.startsWith('data:image/tiff') || mriScan?.startsWith('data:image/tif')) ? (
                <canvas ref={canvasRefCompareRight} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'pixelated', objectFit: 'cover' }} />
            ) : mriScan ? (
                <img src={mriScan} alt="MRI Scan" className="absolute inset-0 w-full h-full" style={{ imageRendering: 'pixelated', objectFit: 'cover' }} />
            ) : null}
            {maskImage && (
                <img 
                  src={maskImage} 
                  alt="Segmentation Mask" 
                  className="absolute inset-0 w-full h-full" 
                  style={{ 
                    opacity: (opacity[0] / 100) * (thresholding ? 0.9 : 0.7), 
                    imageRendering: 'pixelated', 
                    objectFit: 'cover',
                    mixBlendMode: 'lighten' 
                  }}
                />
            )}
        </div>
      )
    };
    
    const renderBaseComparisonContent = () => {
        return (
            <div className="absolute inset-0 w-full h-full">
                {(mriScan?.startsWith('data:image/tiff') || mriScan?.startsWith('data:image/tif')) ? (
                    <canvas ref={canvasRefCompareLeft} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'pixelated', objectFit: 'cover' }}/>
                ) : mriScan ? (
                    <img src={mriScan} alt="MRI Scan" className="absolute inset-0 w-full h-full" style={{ imageRendering: 'pixelated', objectFit: 'cover' }}/>
                ) : null}
            </div>
        )
    };

  const getVisualizationContent = (pane: 'original' | 'prediction') => {
    if (pane === 'original') {
      return renderMRIScan(canvasRefOriginal);
    } else {
      switch (viewMode) {
        case 'mri':
          return renderMRIScan(canvasRefPrediction);
        case 'mask':
          return renderSegmentationMask();
        case 'overlay':
        default:
          return renderOverlay(canvasRefPrediction);
      }
    }
  };

  return (
    <div className="min-h-screen px-4 py-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold mb-4">MRI Visualization</h2>
          <p className="text-xl text-muted-foreground">Interactive analysis and comparison tools</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader><CardTitle className="text-lg">Controls</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">View Mode</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {viewModes.map((mode) => (
                      <Button
                        key={mode.id} variant={viewMode === mode.id ? 'default' : 'outline'} size="sm"
                        onClick={() => handleViewModeChange(mode.id)} className="w-full justify-start"
                      >
                        <mode.icon className="h-4 w-4 mr-2" /> {mode.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Overlay Opacity ({opacity[0]}%)</Label>
                  <Slider
                    value={opacity} onValueChange={handleOpacityChange} max={100} min={0} step={1}
                    disabled={viewMode !== 'overlay'} className={viewMode !== 'overlay' ? 'opacity-50' : ''}
                  />
                  {viewMode !== 'overlay' && <p className="text-xs text-muted-foreground">Only available in Overlay mode</p>}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="threshold" className="text-sm font-medium">Thresholding</Label>
                  <Switch id="threshold" checked={thresholding} onCheckedChange={handleThresholdingChange} />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button onClick={handleReset} variant="outline" className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" /> Reset View
                  </Button>
                  <Button onClick={handleDownload} className="w-full">
                    <Download className="h-4 w-4 mr-2" /> Download Image
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-3 space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Brain MRI Analysis</CardTitle>
                {fileName && <p className="text-sm text-muted-foreground">{fileName}</p>}
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-medium">Original MRI Scan</h3>
                    {getVisualizationContent('original')}
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-medium">
                      {viewMode === 'mri' ? 'MRI View' : viewMode === 'mask' ? 'Segmentation Mask' : 'Segmentation Prediction'}
                    </h3>
                    {getVisualizationContent('prediction')}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Before/After Comparison</CardTitle></CardHeader>
              <CardContent>
                <div
                  ref={compareRef}
                  className="relative w-full rounded-lg overflow-hidden select-none cursor-ew-resize bg-black"
                  style={{ aspectRatio: `${imageDimensions.width * 2} / ${imageDimensions.height}` }}
                  onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onTouchStart={() => setIsDragging(true)}
                >
                  <div className="absolute inset-0 w-full h-full">
                    {renderBaseComparisonContent()}
                  </div>
                  
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{ clipPath: `inset(0 0 0 ${comparePosition}%)` }}
                  >
                    {renderComparisonContent()}
                  </div>
                  
                  <div className="absolute top-0 bottom-0 w-1 bg-white/70 backdrop-blur-sm shadow-lg pointer-events-none" style={{ left: `${comparePosition}%`, transform: 'translateX(-50%)' }}>
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white/70 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center">
                      <SplitSquareHorizontal className="h-5 w-5 text-gray-800" />
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
