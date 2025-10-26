import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings2 } from 'lucide-react';

export interface ComparisonOptions {
  featureExtractor: 'resnet50' | 'mobilenet';
  maxOrbMatches: number;
  resizePolicy: 'fit' | 'crop' | 'keep_aspect';
}

interface ComparisonSettingsProps {
  options: ComparisonOptions;
  onChange: (options: ComparisonOptions) => void;
  disabled?: boolean;
}

export function ComparisonSettings({ options, onChange, disabled }: ComparisonSettingsProps) {
  return (
    <Card className="p-4 space-y-4 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Settings2 className="w-4 h-4" />
        <span>Comparison Settings</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="feature-extractor" className="text-xs">
            Feature Extractor
          </Label>
          <Select
            value={options.featureExtractor}
            onValueChange={(value: 'resnet50' | 'mobilenet') =>
              onChange({ ...options, featureExtractor: value })
            }
            disabled={disabled}
          >
            <SelectTrigger id="feature-extractor" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resnet50">ResNet50 (Higher quality)</SelectItem>
              <SelectItem value="mobilenet">MobileNet (Faster)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="orb-matches" className="text-xs">
            Max ORB Matches
          </Label>
          <Select
            value={String(options.maxOrbMatches)}
            onValueChange={(value) =>
              onChange({ ...options, maxOrbMatches: parseInt(value) })
            }
            disabled={disabled}
          >
            <SelectTrigger id="orb-matches" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 matches</SelectItem>
              <SelectItem value="30">30 matches</SelectItem>
              <SelectItem value="60">60 matches</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resize-policy" className="text-xs">
            Resize Policy
          </Label>
          <Select
            value={options.resizePolicy}
            onValueChange={(value: 'fit' | 'crop' | 'keep_aspect') =>
              onChange({ ...options, resizePolicy: value })
            }
            disabled={disabled}
          >
            <SelectTrigger id="resize-policy" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fit">Fit to canvas</SelectItem>
              <SelectItem value="crop">Crop to square</SelectItem>
              <SelectItem value="keep_aspect">Keep aspect ratio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
