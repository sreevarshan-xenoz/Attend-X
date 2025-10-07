"""import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
import faiss
import pickle

print("Initializing the Live Attendance System (Cosine Similarity Version)...")

# --- 1. Model-a Load Panrom ---
app = FaceAnalysis(providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(640, 640))
print("Face Analysis model loaded.")

# --- 2. Namma Save Panna Face Bank-a Load Panrom ---
try:
    # --- NEW: Using IndexFlatIP for Cosine Similarity ---
    index = faiss.read_index('face_index.bin')
    with open('face_bank.pkl', 'rb') as f:
        face_bank = pickle.load(f)
    db_names = face_bank['names']
    print("Face Bank (Cosine Similarity) loaded successfully.")
except Exception as e:
    print(f"Error loading Face Bank: {e}")
    print("Please run the new 'create_face_bank.py' first.")
    exit()

# --- 3. Camera Source-a Set Panrom ---
video_source = "http://192.168.1.4:4747/video" 

cap = cv2.VideoCapture(video_source)
if not cap.isOpened():
    print(f"Error: Could not open video source: {video_source}")
    exit()

print("Camera started. Press 'q' to quit.")
print("-----------------------------------------")

# --- NEW TUNABLE PARAMETER: SIMILARITY THRESHOLD ---
# Score 0-la irundhu 1 varaikum varum. Score adhigama irundha, match nalladhu.
# Namma 0.5-la start pannalam (50% similarity).
RECOGNITION_THRESHOLD = 0.5 

# --- Camera Rotation Fix ---
CAMERA_ROTATION_FIX = cv2.ROTATE_90_COUNTERCLOCKWISE 

# --- 4. Main Loop ---
while True:
    ret, frame = cap.read()
    if not ret:
        print("Error: Failed to grab frame.")
        break
    
    if CAMERA_ROTATION_FIX is not None:
        frame = cv2.rotate(frame, CAMERA_ROTATION_FIX)
        
    scale = 320 / max(frame.shape[0], frame.shape[1])
    small_frame = cv2.resize(frame, (0, 0), fx=scale, fy=scale)

    faces = app.get(small_frame)
    
    for face in faces:
        bbox = (face.bbox / scale).astype(int)
        
        live_embedding = face.embedding
        # --- NEW STEP: Live embedding-ayum NORMALIZE panrom ---
        norm_live_embedding = live_embedding / np.linalg.norm(live_embedding)
        query_embedding = np.expand_dims(norm_live_embedding, axis=0).astype('float32')
        
        # --- NEW: FAISS ippo similarity score-a kudukum ---
        D, I = index.search(query_embedding, 1)
        similarity_score = D[0][0] # Idhu dhaan namma "similarity score" (0 to 1)
        match_index = I[0][0]
        
        name_to_display = "Unknown"
        color = (0, 0, 255) # Red for Unknown
        
        if similarity_score >= RECOGNITION_THRESHOLD:
            name_to_display = db_names[match_index]
            color = (0, 255, 0) # Green for known
        
        # --- Result-a Screen-la Kaatrom ---
        cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
        
        # Namma ippo similarity score-a percentage-a kaatrom
        label = f"{name_to_display} ({similarity_score*100:.1f}%)"
        cv2.putText(frame, label, (bbox[0], bbox[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

    cv2.imshow('Live Attendance (Cosine Similarity)', frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# --- Clean Up ---
cap.release()
cv2.destroyAllWindows()
print("System shut down.")"""
