import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ORBMatchesViewerProps {
  matchesImage: string;
  title?: string;
}

export function ORBMatchesViewer({ matchesImage, title = "ORB Feature Matches" }: ORBMatchesViewerProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">
            Green lines connect matching keypoints between images
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative aspect-[2/1] rounded-lg overflow-hidden bg-muted shadow-elevated cursor-pointer group"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            src={matchesImage}
            alt="ORB feature matches"
            className="w-full h-full object-contain"
          />

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex items-center gap-2 text-white">
              <ZoomIn className="w-6 h-6" />
              <span className="font-medium">Click to zoom</span>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Click image to view full size</span>
        </div>
      </Card>

      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full z-50"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </Button>

            <motion.img
              src={matchesImage}
              alt="ORB feature matches (zoomed)"
              className="max-w-full max-h-full object-contain"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
