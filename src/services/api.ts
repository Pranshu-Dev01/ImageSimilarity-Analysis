/**
 * API service for image comparison
 * Currently using mock data for demo purposes
 * Replace with actual Flask backend endpoint when deployed
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface ComparisonResult {
  cosine_similarity: number;
  cosine_percentage: number;
  ssim_score: number;
  ssim_percentage: number;
  ssim_heatmap: string;
  orb_matches: string;
}

/**
 * Compare two images using the backend API
 * @param image1 - First image file
 * @param image2 - Second image file
 * @param options - Optional comparison settings
 * @returns Comparison results including metrics and visualizations
 */
export async function compareImages(
  image1: File,
  image2: File,
  options?: {
    featureExtractor?: 'resnet50' | 'mobilenet';
    maxOrbMatches?: number;
    resizePolicy?: 'fit' | 'crop' | 'keep_aspect';
  }
): Promise<ComparisonResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock response for demo purposes
  // In production, this would be a real API call:
  /*
  const formData = new FormData();
  formData.append('image1', image1);
  formData.append('image2', image2);
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }
  
  const response = await fetch(`${API_URL}/compare`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return await response.json();
  */

  // Mock data with realistic similarity scores
  const mockSimilarity = 0.65 + Math.random() * 0.25; // 65-90%
  const mockSSIM = 0.5 + Math.random() * 0.3; // 50-80%

  return {
    cosine_similarity: mockSimilarity,
    cosine_percentage: mockSimilarity * 100,
    ssim_score: mockSSIM,
    ssim_percentage: mockSSIM * 100,
    ssim_heatmap: generateMockHeatmap(),
    orb_matches: generateMockORBMatches(),
  };
}

// Generate mock base64 heatmap image
function generateMockHeatmap(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // Create gradient heatmap
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgba(0, 255, 0, 0.3)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 0, 0, 0.7)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add some random hot spots
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 30 + Math.random() * 50;
    
    const radialGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    radialGradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
    radialGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  return canvas.toDataURL('image/png');
}

// Generate mock ORB matches visualization
function generateMockORBMatches(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // Draw two image placeholders
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(0, 0, 380, 400);
  ctx.fillRect(420, 0, 380, 400);
  
  ctx.fillStyle = '#666';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Image 1', 190, 200);
  ctx.fillText('Image 2', 610, 200);
  
  // Draw matching lines
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  
  const numMatches = 15 + Math.floor(Math.random() * 20);
  for (let i = 0; i < numMatches; i++) {
    const x1 = 50 + Math.random() * 280;
    const y1 = 50 + Math.random() * 300;
    const x2 = 470 + Math.random() * 280;
    const y2 = 50 + Math.random() * 300;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Draw keypoints
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(x1, y1, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x2, y2, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  
  return canvas.toDataURL('image/png');
}
