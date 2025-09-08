import { useState, useRef, useEffect } from 'react';
import { fromArrayBuffer } from 'geotiff';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, RotateCcw, Eye, Layers, SplitSquareHorizontal, ZoomIn, ZoomOut, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';

// Reusable ImageViewer Component
const ImageViewer = ({ children, zoomLevel, panOffset, onPanStart, isPanning, isZoomed, className }: any) => {
  return (
    <div 
      className={`aspect-square w-full rounded-lg relative overflow-hidden bg-black ${isZoomed ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : ''} ${className}`}
      onMouseDown={isZoomed ? onPanStart : undefined}
    >
      <div 
        className="w-full h-full transition-transform duration-100 ease-out"
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};


export default function VisualizationSection() {
  const [opacity, setOpacity] = useState([70]);
  const [viewMode, setViewMode] = useState('overlay');
  const [thresholding, setThresholding] = useState(false);
  const [comparePosition, setComparePosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const compareRef = useRef<HTMLDivElement>(null);
  const [mriScan, setMriScan] = useState<string | null>(null);
  const [maskImage, setMaskImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // --- Zoom and Pan State ---
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const canvasRefOriginal = useRef<HTMLCanvasElement>(null);
  const canvasRefPrediction = useRef<HTMLCanvasElement>(null);
  const canvasRefCompareLeft = useRef<HTMLCanvasElement>(null);
  const canvasRefCompareRightBase = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Component setup logic...
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
              canvasRefCompareRightBase.current,
            ].filter(Boolean);

            const width = image.getWidth();
            const height = image.getHeight();
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
      }
    }
  }, [mriScan, viewMode]);

  // --- Event Handlers ---
  const handleSliderMove = (clientX: number) => {
    if (!compareRef.current) return;
    const rect = compareRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setComparePosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleDownload = () => {
    const fileBaseName = localStorage.getItem('mriScan') ? JSON.parse(localStorage.getItem('mriScan') as string).name.replace(/\.[^/.]+$/, "") : 'mri_scan';
    // get the segmentation image and download it
    const link = document.createElement('a');
    link.href = maskImage || '';
    link.download = `${fileBaseName}_segmentation.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Segmentation image downloaded');
  };

  // --- Pan Logic Handlers ---
  const handlePanStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel <= 1) return;
    e.preventDefault();
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    };
  };

  const handlePanMove = (e: MouseEvent) => {
    if (!isPanning || !containerRef.current) return;
    const newX = e.clientX - panStartRef.current.x;
    const newY = e.clientY - panStartRef.current.y;
    
    // Constrain panning within the bounds of the zoomed image
    const containerWidth = containerRef.current.offsetWidth;
    const maxPan = (containerWidth * (zoomLevel - 1)) / (2 * zoomLevel);

    setPanOffset({
      x: Math.max(-maxPan, Math.min(maxPan, newX)),
      y: Math.max(-maxPan, Math.min(maxPan, newY)),
    });
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDraggingSlider(false);
      handlePanEnd();
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider) handleSliderMove(e.clientX);
      if (isPanning) handlePanMove(e);
    };
    
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDraggingSlider, isPanning]);

  // --- Zoom Logic Handlers ---
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.5, 8));
  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = prev / 1.5;
      if (newZoom <= 1) {
        setPanOffset({ x: 0, y: 0 }); // Reset pan when zooming out to fit
        return 1;
      }
      return newZoom;
    });
  };
  const resetZoomAndPan = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };


  const handleReset = () => {
    setOpacity([70]);
    setViewMode('overlay');
    setThresholding(false);
    setComparePosition(50);
    resetZoomAndPan();
    toast.success('View reset to defaults');
  };

  const commonHandlers = {
    zoomLevel,
    panOffset,
    onPanStart: handlePanStart,
    isPanning,
    isZoomed: zoomLevel > 1,
  };

  const renderImageOrCanvas = (customRef: React.RefObject<HTMLCanvasElement>) => (
      <div className="absolute inset-0 w-full h-full">
        {(mriScan?.startsWith('data:image/tiff') || mriScan?.startsWith('data:image/tif')) 
          ? <canvas ref={customRef} className="w-full h-full object-cover" />
          : mriScan 
            ? <img src={mriScan} alt="MRI Scan" className="w-full h-full object-cover" /> 
            : <div className="flex items-center justify-center h-full text-muted-foreground">Scan placeholder</div>
        }
      </div>
  );

  const renderSegmentationMask = () => (
    <ImageViewer {...commonHandlers}>
      <div className="absolute inset-0 w-full h-full">
        {maskImage ? (
                <img src={maskImage} alt="Segmentation Mask" className="w-full h-full object-cover" style={{ opacity: thresholding ? 0.9 : 0.7 }} />
        ) : (
             <div className="flex items-center justify-center h-full text-muted-foreground">Mask placeholder</div>
        )}
      </div>
    </ImageViewer>
  );

  const renderOverlay = (customRef: React.RefObject<HTMLCanvasElement>) => (
    <ImageViewer {...commonHandlers}>
      {renderImageOrCanvas(customRef)}
      {maskImage && (
        <img
          src={maskImage}
          alt="Segmentation Mask"
          className="absolute inset-0 w-full h-full object-cover rounded-lg"
          style={{ opacity: (opacity[0] / 100) * (thresholding ? 0.9 : 0.7), mixBlendMode: 'lighten' }}
        />
      )}
    </ImageViewer>
  );

  const getVisualizationContent = (pane: 'original' | 'prediction') => {
    const customRef = pane === 'original' ? canvasRefOriginal : canvasRefPrediction;
    if (pane === 'original') {
        return <ImageViewer {...commonHandlers}>{renderImageOrCanvas(customRef)}</ImageViewer>;
    } else {
        switch (viewMode) {
        case 'mri':
            return <ImageViewer {...commonHandlers}>{renderImageOrCanvas(customRef)}</ImageViewer>;
        case 'mask':
            return renderSegmentationMask();
        case 'overlay':
        default:
            return renderOverlay(customRef);
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
                 {/* ... View Mode ... */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">View Mode</Label>
                    <div className="grid grid-cols-1 gap-2">
                    {[{ id: 'overlay', label: 'Overlay', icon: SplitSquareHorizontal }, { id: 'mri', label: 'MRI Only', icon: Eye }, { id: 'mask', label: 'Mask Only', icon: Layers }].map((mode) => (
                        <Button key={mode.id} variant={viewMode === mode.id ? 'default' : 'outline'} size="sm" onClick={() => setViewMode(mode.id)} className="w-full justify-start">
                            <mode.icon className="h-4 w-4 mr-2" /> {mode.label}
                        </Button>
                    ))}
                    </div>
                </div>
                <Separator />
                {/* --- Zoom & Pan Controls --- */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Zoom & Pan</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 8}>
                            <ZoomIn className="h-4 w-4 mr-2" /> Zoom In
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 1}>
                             <ZoomOut className="h-4 w-4 mr-2" /> Zoom Out
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={resetZoomAndPan} disabled={zoomLevel === 1 && panOffset.x === 0 && panOffset.y === 0}>
                        <Minimize2 className="h-4 w-4 mr-2" /> Reset View
                    </Button>
                     {zoomLevel > 1 && <p className="text-xs text-muted-foreground text-center">Click and drag image to pan.</p>}
                </div>
                <Separator />
                 {/* ... Opacity ... */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Overlay Opacity ({opacity[0]}%)</Label>
                    <Slider value={opacity} onValueChange={setOpacity} max={100} step={1} disabled={viewMode !== 'overlay'} className={viewMode !== 'overlay' ? 'opacity-50' : ''} />
                </div>
                <Separator />
                 {/* ... Thresholding and Actions ... */}
                <div className="flex items-center justify-between"><Label htmlFor="threshold" className="text-sm font-medium">Thresholding</Label><Switch id="threshold" checked={thresholding} onCheckedChange={setThresholding} /></div>
                <Separator />
                <div className="space-y-2">
                    <Button onClick={handleReset} variant="outline" className="w-full"><RotateCcw className="h-4 w-4 mr-2" /> Reset All</Button>
                    <Button onClick={handleDownload} className="w-full"><Download className="h-4 w-4 mr-2" /> Download Image</Button>
                </div>
                </CardContent>
            </Card>
            </motion.div>

            <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-3 space-y-6"
            ref={containerRef}
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
                            <h3 className="font-medium">{viewMode === 'mri' ? 'MRI View' : viewMode === 'mask' ? 'Segmentation Mask' : 'Segmentation Prediction'}</h3>
                            {getVisualizationContent('prediction')}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Controlled Overlay</CardTitle></CardHeader>
                <CardContent>
                <div
                    ref={compareRef}
                    className="relative w-full aspect-square rounded-lg overflow-hidden select-none bg-black"
                >
                    <ImageViewer 
                        {...commonHandlers}
                        className="cursor-ew-resize" // Override grab cursor for slider
                        onPanStart={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} // Prevent pan on this component
                    >
                         <div onMouseDown={(e) => { e.preventDefault(); setIsDraggingSlider(true); }} className="absolute inset-0">
                            {renderImageOrCanvas(canvasRefCompareLeft)}
                        </div>
                        <div
                            className="absolute inset-0 w-full h-full"
                            style={{ clipPath: `inset(0 ${100 - comparePosition}% 0 0)` }}
                            onMouseDown={(e) => { e.preventDefault(); setIsDraggingSlider(true); }}
                        >
                            <div className="absolute inset-0 w-full h-full">
                                {renderImageOrCanvas(canvasRefCompareRightBase)}
                                {maskImage && (
                                    <img 
                                        src={maskImage} alt="Segmentation Mask" className="absolute inset-0 w-full h-full object-cover"
                                        style={{ opacity: (opacity[0] / 100) * (thresholding ? 0.9 : 0.7), mixBlendMode: 'lighten' }}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="absolute top-0 bottom-0 w-1 bg-white/70 backdrop-blur-sm shadow-lg pointer-events-none" style={{ left: `${comparePosition}%`, transform: 'translateX(-50%)' }}>
                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white/70 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center">
                                <SplitSquareHorizontal className="h-5 w-5 text-gray-800" />
                            </div>
                        </div>
                    </ImageViewer>
                </div>
                </CardContent>
            </Card>
            </motion.div>
        </div>
      </div>
    </div>
  );
}
