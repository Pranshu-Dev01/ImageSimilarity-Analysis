import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, 
  Sparkles, 
  Smile, 
  Frown, 
  Angry, 
  Meh, 
  AlertCircle, 
  Heart, 
  Activity,
  Camera,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ImageDropzone } from "@/components/ImageDropzone";
import { Header } from "@/components/Header";
import { toast } from "sonner";

type EmotionResult = {
  emotion: string;
  confidence: number;
  breakdown: Record<string, number>;
};

export default function Index() {
  const [image, setImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<EmotionResult | null>(null);
  const [captureMode, setCaptureMode] = useState<'upload' | 'camera'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleDetectEmotion = async () => {
    if (!image) {
      toast.error("Please upload a face image to detect emotion.");
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('image', image);

      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Emotion detection failed');
      }

      const data = await response.json();
      setResults(data);

      toast.success(`Detected emotion: ${data.emotion}`);
    } catch (error) {
      console.error('Error detecting emotion:', error);
      toast.error("There was an error analyzing your image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setResults(null);
    stopCamera();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          setImage(file);
          stopCamera();
          toast.success("Photo captured successfully!");
        }
      }, 'image/jpeg', 0.95);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (captureMode === 'camera' && !isCameraActive && !image) {
      startCamera();
    } else if (captureMode === 'upload') {
      stopCamera();
    }
  }, [captureMode]);

  const getEmotionIcon = (emotion: string) => {
    const emotionLower = emotion.toLowerCase();
    if (emotionLower.includes('happy') || emotionLower.includes('joy')) return Smile;
    if (emotionLower.includes('sad')) return Frown;
    if (emotionLower.includes('angry') || emotionLower.includes('anger')) return Angry;
    if (emotionLower.includes('neutral')) return Meh;
    if (emotionLower.includes('surprise')) return AlertCircle;
    return Heart;
  };

  const getEmotionColor = (emotion: string): string => {
    const emotionLower = emotion.toLowerCase();
    if (emotionLower.includes('happy') || emotionLower.includes('joy')) return 'text-green-500';
    if (emotionLower.includes('sad')) return 'text-blue-500';
    if (emotionLower.includes('angry') || emotionLower.includes('anger')) return 'text-red-500';
    if (emotionLower.includes('neutral')) return 'text-gray-500';
    if (emotionLower.includes('surprise')) return 'text-yellow-500';
    return 'text-purple-500';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background with Glass Morphism */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-background to-blue-500/10" />
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Header />

      <main className="container mx-auto px-4 py-12 relative z-10">
        <AnimatePresence mode="wait">
          {!results ? (
            <motion.div
              key="upload-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <motion.div 
                className="text-center space-y-4 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent leading-tight">
                  How are they feeling?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Upload a face image and let our AI detect emotions like Happy, Sad, Angry, and more
                </p>
              </motion.div>

              {/* Mode Selector */}
              <motion.div
                className="flex justify-center gap-4 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Button
                  variant={captureMode === 'upload' ? 'default' : 'outline'}
                  onClick={() => setCaptureMode('upload')}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </Button>
                <Button
                  variant={captureMode === 'camera' ? 'default' : 'outline'}
                  onClick={() => setCaptureMode('camera')}
                  className="gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Use Camera
                </Button>
              </motion.div>

              {/* Upload or Camera View */}
              <motion.div
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {captureMode === 'upload' ? (
                  <ImageDropzone
                    onImageSelect={setImage}
                    selectedImage={image}
                    label="Upload Face Image"
                    disabled={isAnalyzing}
                  />
                ) : (
                  <div className="space-y-4">
                    {!image ? (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border-4 border-purple-500/30 bg-muted/20">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        {!isCameraActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                            <p className="text-muted-foreground">Starting camera...</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video rounded-2xl overflow-hidden border-4 border-purple-500/30 bg-muted/20">
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Captured"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {isCameraActive && !image && (
                      <Button
                        size="lg"
                        onClick={capturePhoto}
                        className="w-full gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        Capture Photo
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>

              {/* CTA Button */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Button
                  size="lg"
                  onClick={handleDetectEmotion}
                  disabled={!image || isAnalyzing}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed px-12 py-6 text-lg font-semibold"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <Sparkles className="mr-2 h-5 w-5" />
                  {isAnalyzing ? "Analyzing..." : "Detect Emotion"}
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="results-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8 max-w-4xl mx-auto"
            >
              {/* Primary Result Card */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              >
                <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-border/40 shadow-xl">
                  <CardContent className="pt-12 pb-8 px-8">
                    <div className="text-center space-y-6">
                      {/* Emotion Icon */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        className="flex justify-center"
                      >
                        {(() => {
                          const EmotionIcon = getEmotionIcon(results.emotion);
                          return (
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border-4 border-purple-500/30">
                              <EmotionIcon className={`w-16 h-16 ${getEmotionColor(results.emotion)}`} />
                            </div>
                          );
                        })()}
                      </motion.div>

                      {/* Emotion Label */}
                      <div>
                        <h3 className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
                          {results.emotion}
                        </h3>
                        <p className="text-2xl text-muted-foreground">
                          {Math.round(results.confidence * 100)}% Confidence
                        </p>
                      </div>

                      {/* Uploaded Image Preview */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="max-w-md mx-auto"
                      >
                        <div className="aspect-square rounded-2xl overflow-hidden border-4 border-purple-500/30 bg-muted/20 shadow-lg">
                          <img
                            src={image ? URL.createObjectURL(image) : ''}
                            alt="Analyzed face"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Emotion Breakdown */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-border/40 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Emotion Breakdown
                    </CardTitle>
                    <CardDescription>
                      Probability distribution across all detected emotions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(results.breakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([emotion, probability], index) => {
                        const EmotionIcon = getEmotionIcon(emotion);
                        return (
                          <motion.div
                            key={emotion}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className="space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <EmotionIcon className={`w-5 h-5 ${getEmotionColor(emotion)}`} />
                                <span className="font-medium capitalize">{emotion}</span>
                              </div>
                              <span className="text-lg font-bold">
                                {Math.round(probability * 100)}%
                              </span>
                            </div>
                            <Progress value={probability * 100} className="h-2" />
                          </motion.div>
                        );
                      })}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className="flex flex-wrap gap-4 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <Button
                  size="lg"
                  onClick={handleReset}
                  className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="w-4 h-4" />
                  Analyze New Image
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-background/80"
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-12 h-12 text-purple-500 animate-pulse mx-auto" />
              </motion.div>
              <p className="text-xl font-semibold">Detecting emotion...</p>
              <p className="text-sm text-muted-foreground">Analyzing facial features</p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
