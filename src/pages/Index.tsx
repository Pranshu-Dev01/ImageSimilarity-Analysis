import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, HelpCircle, Images, ChevronDown } from 'lucide-react';
// --- FIX: Reverted import paths back to alias '@/' ---
import { Header } from '@/components/Header';
import { ImageDropzone } from '@/components/ImageDropzone';
import { HeatmapOverlay } from '@/components/HeatmapOverlay';
import { ORBMatchesViewer } from '@/components/ORBMatchesViewer';
import { ComparisonSettings, ComparisonOptions } from '@/components/ComparisonSettings';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';

// Define the ComparisonResult type here so the component knows its shape
// This MUST match what your UI is expecting.
type ComparisonResult = {
  cosine_similarity: number;
  cosine_percentage: number;
  ssim_score: number;
  ssim_percentage: number;
  ssim_heatmap: string;
  orb_matches: string;
};

const Index = () => {
  // These are the correct state variables for your component
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [results, setResults] = useState<ComparisonResult | null>(null);
  const [options, setOptions] = useState<ComparisonOptions>({
    featureExtractor: 'resnet50',
    maxOrbMatches: 30,
    resizePolicy: 'fit',
  });

  // This is the single, corrected handleCompare function
  const handleCompare = async () => {
    // 1. Check if files exist
    if (!image1 || !image2) {
      toast.error('Please upload both images.');
      return;
    }

    // 2. Set loading state
    setIsComparing(true);
    setResults(null);

    // 3. Create FormData to send files to Python
    const formData = new FormData();
    formData.append('image1', image1);
    formData.append('image2', image2);

    try {
      // 4. Send the request to your Flask backend
      const response = await fetch('http://localhost:5000/compare', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      // 5. Get the result from the backend
      const data = await response.json();

      if (data.cosine_similarity !== undefined) {
        
        // The backend sends all properties. We just need to
        // cast them into the ComparisonResult type.
        const newResult: ComparisonResult = {
          cosine_similarity: data.cosine_similarity,
          cosine_percentage: data.cosine_percentage,
          ssim_score: data.ssim_score,
          ssim_percentage: data.ssim_percentage,
          ssim_heatmap: data.ssim_heatmap,
          orb_matches: data.orb_matches,
        };

        // 6. Set the result object and show success
        setResults(newResult); 
        toast.success('Comparison complete!');

      } else {
        // 7. Show backend error
        toast.error(data.error || 'An unknown error occurred.');
      }

    } catch (err) {
      // 8. Show network error
      console.error('Fetch error:', err);
      toast.error('Failed to connect to the backend. Is it running?');
    } finally {
      // 9. Stop loading state
      setIsComparing(false);
    }
  };

  const handleReset = () => {
    setImage1(null);
    setImage2(null);
    setResults(null);
  };

  const handleDownloadResults = () => {
    if (!results) return;

    // This will now download the full object
    const data = {
      cosine_similarity: results.cosine_similarity,
      cosine_percentage: results.cosine_percentage,
      ssim_score: results.ssim_score,
      ssim_percentage: results.ssim_percentage,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Results downloaded successfully!');
  };

  // --- Helper Functions for UI ---

  const getQualitativeLabel = (percentage: number) => {
    if (percentage >= 71) return { label: 'Highly Similar', color: 'text-green-500' };
    if (percentage >= 31) return { label: 'Moderately Similar', color: 'text-yellow-500' };
    return { label: 'Dissimilar', color: 'text-red-500' };
  };

  const getOverallScore = () => {
    if (!results) return 0;
    // Use both scores for a better "overall" metric
    return (results.cosine_percentage + results.ssim_percentage) / 2;
  };

  const getExplanation = () => {
    if (!results) return '';

    // Use both scores for a better explanation
    const semantic = results.cosine_percentage;
    const structural = results.ssim_percentage;

    if (semantic > 80 && structural > 70) {
      return 'High semantic and structural similarity — likely the same or very similar objects.';
    } else if (semantic > 70 && structural < 50) {
      return 'High semantic similarity but low structural match — same object class from different angles or lighting.';
    } else if (semantic < 50 && structural > 60) {
      return 'Low semantic similarity but structural match — different objects with similar shapes or textures.';
    } else if (semantic < 50 && structural < 50) {
      return 'Low similarity overall — these images show different subjects or scenes.';
    }
    return 'Moderate similarity — images share some common features but differ in significant ways.';
  };


  // --- JSX / RENDER ---

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <Header />

      <main className="container mx-auto px-6 py-12 max-w-7xl relative z-10">
        <AnimatePresence mode="wait">
          {!results ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="text-center space-y-6 py-12">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-primary text-primary-foreground relative group"
                  style={{ boxShadow: 'var(--shadow-glow)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 rounded-full" />
                  <Sparkles className="w-4 h-4 relative z-10" />
                  <span className="text-sm font-semibold relative z-10">AI-Powered Deep Learning</span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-5xl md:text-6xl font-extrabold bg-gradient-primary bg-clip-text text-transparent leading-tight"
                >
                  Compare Your Images
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                >
                  Upload two images to analyze semantic similarity, structural differences, and feature matches using state-of-the-art AI models.
                </motion.p>
              </div>

              {/* Upload Card */}
              <Card className="p-8 md:p-10 backdrop-blur-xl bg-gradient-glass border-border/40 relative overflow-hidden" style={{ boxShadow: 'var(--shadow-elevated)' }}>
                <div className="absolute inset-0 bg-gradient-hero opacity-30 pointer-events-none" />
                <div className="grid md:grid-cols-2 gap-8 mb-8 relative z-10">
                  <ImageDropzone
                    label="Image 1"
                    selectedImage={image1}
                    onImageSelect={setImage1}
                    disabled={isComparing}
                  />
                  <ImageDropzone
                    label="Image 2"
                    selectedImage={image2}
                    onImageSelect={setImage2}
                    disabled={isComparing}
                  />
                </div>

                <div className="relative z-10">
                  <ComparisonSettings
                    options={options}
                    onChange={setOptions}
                    disabled={isComparing}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8 relative z-10">
                  <Button
                    size="lg"
                    className="flex-1 bg-gradient-primary text-primary-foreground h-14 text-lg font-semibold relative overflow-hidden group transition-all duration-300"
                    style={{ boxShadow: 'var(--shadow-glow)' }}
                    onClick={handleCompare}
                    disabled={!image1 || !image2 || isComparing}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    {isComparing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2 relative z-10"
                        />
                        <span className="relative z-10">Analyzing Images...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 relative z-10" />
                        <span className="relative z-10">Compare Images</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="sm:w-auto hover:bg-primary/10 hover:border-primary transition-all duration-300"
                    disabled
                  >
                    <Images className="w-5 h-5 mr-2" />
                    Example Images
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Primary Score Display */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-6"
              >
                <Card className="p-12 backdrop-blur-xl bg-gradient-glass border-border/40 relative overflow-hidden" style={{ boxShadow: 'var(--shadow-elevated)' }}>
                  <div className="absolute inset-0 bg-gradient-hero opacity-20 pointer-events-none" />
                  
                  <div className="relative z-10 space-y-6">
                    <h2 className="text-2xl font-semibold text-muted-foreground">Overall Similarity</h2>
                    
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <svg className="w-64 h-64 transform -rotate-90">
                          <circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            className="text-muted/20"
                          />
                          <circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke="url(#gradient)"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 120}`}
                            strokeDashoffset={`${2 * Math.PI * 120 * (1 - getOverallScore() / 100)}`}
                            className="transition-all duration-1000 ease-out"
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="hsl(var(--primary))" />
                              <stop offset="100%" stopColor="hsl(var(--accent))" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                            className="text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent"
                          >
                            {Math.round(getOverallScore())}%
                          </motion.span>
                          <span className={`text-xl font-semibold mt-2 ${getQualitativeLabel(getOverallScore()).color}`}>
                            {getQualitativeLabel(getOverallScore()).label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                      {getExplanation()}
                    </p>

                    <div className="flex gap-3 justify-center">
                      <Button variant="outline" onClick={handleDownloadResults} className="hover:bg-primary/10 hover:border-primary transition-all duration-300">
                        <Download className="w-4 h-4 mr-2" />
                        Download Results
                      </Button>
                      <Button onClick={handleReset} className="bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300">
                        Compare New Images
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Detailed Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card className="p-8 backdrop-blur-xl bg-gradient-glass border-border/40" style={{ boxShadow: 'var(--shadow-elevated)' }}>
                  <h3 className="text-2xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">Detailed Analysis</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Semantic Similarity</span>
                        <span className={`font-bold ${getQualitativeLabel(results.cosine_percentage).color}`}>
                          {Math.round(results.cosine_percentage)}%
                        </span>
                      </div>
                      <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${results.cosine_percentage}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Measures how similar the deep features are using VGG16/ResNet50
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Raw score: {results.cosine_similarity.toFixed(4)}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Structural Similarity</span>
                        <span className={`font-bold ${getQualitativeLabel(results.ssim_percentage).color}`}>
                          {Math.round(results.ssim_percentage)}%
                        </span>
                      </div>
                      <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${results.ssim_percentage}%` }}
                          transition={{ duration: 1, delay: 0.6 }}
                          className="h-full bg-gradient-to-r from-accent to-accent/60 rounded-full"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Measures pixel-level similarity using SSIM
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Raw score: {results.ssim_score.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="mt-8">
                    <AccordionItem value="explanation" className="border-border/40">
                      <AccordionTrigger className="text-lg font-semibold hover:text-primary transition-colors">
                        How was this calculated?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground space-y-4 pt-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Semantic Similarity (Cosine)</h4>
                            <p className="text-sm">
                              We use a pre-trained deep learning model (VGG16) to extract high-level features from each image. 
                              These features capture the essence of what's in the image. We then calculate 
                              the cosine similarity between these feature vectors. A score of 100% means the extracted features are 
                              virtually identical, indicating the images show very similar content.
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Structural Similarity (SSIM)</h4>
                            <p className="text-sm">
                              SSIM (Structural Similarity Index) compares images at the pixel level, accounting for luminance (brightness), 
                              contrast, and structure. High SSIM scores indicate similar visual appearance and composition.
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Feature Matching (ORB)</h4>
                            <p className="text-sm">
                              ORB (Oriented FAST and Rotated BRIEF) detects distinctive keypoints in both images and matches them. 
                              This helps identify common features even when images are rotated, scaled, or viewed from different angles.
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              </motion.div>

              {/* Image Comparison */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Card className="p-8 backdrop-blur-xl bg-gradient-glass border-border/40" style={{ boxShadow: 'var(--shadow-elevated)' }}>
                  <h3 className="text-2xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">Side-by-Side Comparison</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-muted-foreground">Image 1</p>
                      <div className="rounded-2xl overflow-hidden border-2 border-border/40">
                        <img
                          src={image1 ? URL.createObjectURL(image1) : ''}
                          alt="Image 1"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-muted-foreground">Image 2</p>
                      <div className="rounded-2xl overflow-hidden border-2 border-border/40">
                        <img
                          src={image2 ? URL.createObjectURL(image2) : ''}
                          alt="Image 2"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Visualizations */}
              <div className="grid lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <HeatmapOverlay
                    originalImage={image1 ? URL.createObjectURL(image1) : ''}
                    heatmapImage={results.ssim_heatmap}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <ORBMatchesViewer matchesImage={results.orb_matches} />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Skeleton */}
        {isComparing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/90 backdrop-blur-lg z-40 flex items-center justify-center"
          >
            <Card className="p-10 space-y-6 max-w-md w-full mx-4 backdrop-blur-xl bg-gradient-glass border-border/40" style={{ boxShadow: 'var(--shadow-elevated)' }}>
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full mx-auto"
                  style={{ boxShadow: 'var(--shadow-glow)' }}
                />
                <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">Analyzing Images...</h3>
                {/* --- FIX: Corrected the closing </p> tag --- */}
                <p className="text-sm text-muted-foreground">
                  Extracting features and comparing similarity...
                </p>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Index;

