import { useState } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface HeatmapOverlayProps {
  originalImage: string;
  heatmapImage: string;
  title?: string;
}

export function HeatmapOverlay({ originalImage, heatmapImage, title = "SSIM Heatmap" }: HeatmapOverlayProps) {
  const [opacity, setOpacity] = useState([70]);

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Red areas show high structural differences, green shows similarity
        </p>
      </div>

      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted shadow-elevated">
        {/* Original image */}
        <img
          src={originalImage}
          alt="Original"
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Heatmap overlay */}
        <motion.img
          src={heatmapImage}
          alt="Heatmap overlay"
          className="absolute inset-0 w-full h-full object-contain mix-blend-multiply"
          style={{ opacity: opacity[0] / 100 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: opacity[0] / 100 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <label htmlFor="opacity-slider" className="text-foreground font-medium">
            Heatmap Opacity
          </label>
          <span className="text-muted-foreground">{opacity[0]}%</span>
        </div>
        <Slider
          id="opacity-slider"
          min={0}
          max={100}
          step={1}
          value={opacity}
          onValueChange={setOpacity}
          className="w-full"
          aria-label="Adjust heatmap opacity"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Original only</span>
          <span>Full heatmap</span>
        </div>
      </div>
    </Card>
  );
}
