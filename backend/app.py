import os
import cv2  # OpenCV for image processing
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS  # To handle cross-origin requests
from sklearn.metrics.pairwise import cosine_similarity
from tensorflow.keras.applications.vgg16 import VGG16, preprocess_input
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import img_to_array, load_img
from werkzeug.utils import secure_filename
import base64  # For encoding images
import io  # For byte streams
from PIL import Image  # For image conversion
from skimage.metrics import structural_similarity  # For SSIM

# --- 1. SETUP ---

# Create the Flask app
app = Flask(__name__)

# Enable CORS (Cross-Origin Resource Sharing)
CORS(app)

# Configure a folder to temporarily store uploaded images
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- 2. LOAD DEEP LEARNING MODEL ---
print("Loading pre-trained VGG16 model...")
base_model = VGG16(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
feature_model = Model(inputs=base_model.input, outputs=base_model.get_layer('block5_pool').output)
print("Model loaded successfully.")


# --- NEW HELPER: Encode CV2 image to Base64 ---
def encode_image_to_base64(img_array):
    """Encodes a CV2 image (numpy array) to a base64 string."""
    try:
        # Convert BGR (cv2 default) to RGB
        img_rgb = cv2.cvtColor(img_array, cv2.COLOR_BGR2RGB)
        # Convert to PIL Image
        pil_img = Image.fromarray(img_rgb)
        # Save to a byte buffer
        buffer = io.BytesIO()
        pil_img.save(buffer, format="PNG")
        # Encode as base64
        img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return f"data:image/png;base64,{img_base64}"
    except Exception as e:
        print(f"Error encoding image to base64: {e}")
        return ""


# --- 3. HELPER FUNCTION (Image Pre-processing for VGG16) ---

def preprocess_image(image_path):
    """
    Loads an image from a file path and prepares it for the VGG16 model.
    """
    try:
        img = load_img(image_path, target_size=(224, 224))
        img_array = img_to_array(img)
        img_array_expanded = np.expand_dims(img_array, axis=0)
        return preprocess_input(img_array_expanded)
    except Exception as e:
        print(f"Error preprocessing image {image_path}: {e}")
        return None

# --- 4. HELPER FUNCTIONS (Similarity Calculations) ---

def get_vgg_similarity(image_path1, image_path2):
    """Calculates VGG16 Cosine Similarity."""
    print("Processing VGG16...")
    img1_processed = preprocess_image(image_path1)
    img2_processed = preprocess_image(image_path2)
    if img1_processed is None or img2_processed is None:
        return 0.0, 0.0

    try:
        features1 = feature_model.predict(img1_processed).flatten()
        features2 = feature_model.predict(img2_processed).flatten()

        similarity = cosine_similarity(features1.reshape(1, -1), features2.reshape(1, -1))[0][0]
        if similarity < 0:
            similarity = 0
        
        score_percentage = round(float(similarity) * 100, 2)
        print(f"VGG16 score: {score_percentage}%")
        return similarity, score_percentage
    except Exception as e:
        print(f"Error in VGG16 calculation: {e}")
        return 0.0, 0.0

def get_ssim_similarity(image_path1, image_path2):
    """Calculates SSIM and generates a heatmap."""
    print("Processing SSIM...")
    try:
        img1 = cv2.imread(image_path1)
        img2 = cv2.imread(image_path2)
        if img1 is None or img2 is None:
            raise ValueError("Could not read one or both images for SSIM")

        # Resize images to be the same size for comparison
        height, width, _ = img1.shape
        img2_resized = cv2.resize(img2, (width, height))
        
        # Convert to grayscale for SSIM
        img1_gray = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
        img2_gray = cv2.cvtColor(img2_resized, cv2.COLOR_BGR2GRAY)

        (score, diff) = structural_similarity(img1_gray, img2_gray, full=True)
        
        # 'diff' image is in range [-1, 1]. Convert to [0, 255] uint8
        diff = (diff * 255).astype("uint8")
        
        # Create heatmap
        heatmap = cv2.applyColorMap(diff, cv2.COLORMAP_JET)
        
        # Blend heatmap with original image
        blended_img = cv2.addWeighted(img1, 0.6, heatmap, 0.4, 0)
        
        heatmap_base64 = encode_image_to_base64(blended_img)
        
        score_percentage = round(float(score) * 100, 2)
        print(f"SSIM score: {score_percentage}%")
        
        return score, score_percentage, heatmap_base64
    except Exception as e:
        print(f"Error in SSIM calculation: {e}")
        return 0.0, 0.0, ""

def get_orb_matches(image_path1, image_path2):
    """Generates ORB feature matching visualization."""
    print("Processing ORB...")
    try:
        img1 = cv2.imread(image_path1)
        img2 = cv2.imread(image_path2)
        if img1 is None or img2 is None:
            raise ValueError("Could not read one or both images for ORB")

        # Initialize ORB
        orb = cv2.ORB_create(nfeatures=500) # Limit features for performance

        # Find keypoints and descriptors
        kp1, des1 = orb.detectAndCompute(img1, None)
        kp2, des2 = orb.detectAndCompute(img2, None)
        
        if des1 is None or des2 is None:
            print("Could not find descriptors for one or both images in ORB.")
            return ""

        # Brute-Force Matcher
        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
        # Find 2 best matches for each descriptor
        matches = bf.knnMatch(des1, des2, k=2)

        # Apply Lowe's ratio test
        good_matches = []
        if matches:
            for match_pair in matches:
                # Ensure we have pairs and avoid index errors
                if len(match_pair) == 2: 
                    m, n = match_pair
                    if m.distance < 0.75 * n.distance:
                        good_matches.append(m)
        
        # Draw matches
        img_matches = cv2.drawMatches(
            img1, kp1, 
            img2, kp2, 
            good_matches, None, # Draw only good matches
            flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS
        )
        
        matches_base64 = encode_image_to_base64(img_matches)
        print(f"Found {len(good_matches)} good ORB matches.")
        return matches_base64
    except Exception as e:
        print(f"Error in ORB calculation: {e}")
        return ""

# --- 5. THE API ENDPOINT ---

@app.route('/compare', methods=['POST'])
def compare_images():
    """
    This is the API endpoint that your frontend will call.
    """
    print("\nReceived /compare request")
    
    if 'image1' not in request.files or 'image2' not in request.files:
        return jsonify({'error': 'Missing one or both images'}), 400

    file1 = request.files['image1']
    file2 = request.files['image2']

    if file1.filename == '' or file2.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename1 = secure_filename(file1.filename)
    filename2 = secure_filename(file2.filename)
    
    path1 = os.path.join(app.config['UPLOAD_FOLDER'], filename1)
    path2 = os.path.join(app.config['UPLOAD_FOLDER'], filename2)
    
    file1.save(path1)
    file2.save(path2)
    print(f"Files saved: {path1}, {path2}")
    
    results = {}
    try:
        # 1. VGG16 (Deep Learning) Similarity
        vgg_score, vgg_percent = get_vgg_similarity(path1, path2)
        # --- FIX: Cast to standard python float ---
        results['cosine_similarity'] = float(vgg_score)
        results['cosine_percentage'] = float(vgg_percent)

        # 2. SSIM (Structural) Similarity
        ssim_score, ssim_percent, ssim_heatmap_b64 = get_ssim_similarity(path1, path2)
        # --- FIX: Cast to standard python float ---
        results['ssim_score'] = float(ssim_score)
        results['ssim_percentage'] = float(ssim_percent)
        results['ssim_heatmap'] = ssim_heatmap_b64

        # 3. ORB (Feature Matching) Visualization
        orb_matches_b64 = get_orb_matches(path1, path2)
        results['orb_matches'] = orb_matches_b64
        
        # --- Clean up the uploaded files ---
        os.remove(path1)
        if path1 != path2: # Only remove second file if it's different
            os.remove(path2)
        
        print("Temporary files removed.")
        
        # Return the full results object to the frontend
        return jsonify(results)
        
    except Exception as e:
        print(f"An error occurred: {e}")
        
        # Clean up files even if an error occurs
        if os.path.exists(path1):
            os.remove(path1)
        if os.path.exists(path2) and path1 != path2:
            os.remove(path2)
            
        print("Temporary files removed after error.")
        return jsonify({'error': 'An internal error occurred during processing', 'details': str(e)}), 500

# --- 6. RUN THE APP ---

if __name__ == '__main__':
    app.run(debug=True, port=5000)

