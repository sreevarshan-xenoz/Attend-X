import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
import faiss
import pickle

print("Initializing the Live Attendance System with CALIBRATION MODE...")

# --- 1. Model-a Load Panrom ---
app = FaceAnalysis(providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(640, 640))
print("Face Analysis model loaded.")

# --- 2. Namma Save Panna Face Bank-a Load Panrom ---
try:
    index = faiss.read_index('face_index.bin')
    with open('face_bank.pkl', 'rb') as f:
        face_bank = pickle.load(f)
    
    # face_bank dictionary-la irundhu data-va pirikurom
    db_names = face_bank['names']
    db_embeddings = face_bank['embeddings']
    
    print("Face Bank (FAISS index and Calibration data) loaded successfully.")
except Exception as e:
    print(f"Error loading Face Bank: {e}")
    print("Please run the updated 'create_face_bank.py' first.")
    exit()

# --- 3. Camera Source-a Set Panrom ---
video_source = "http://192.168.1.4:4747/video" 

cap = cv2.VideoCapture(video_source)
if not cap.isOpened():
    print(f"Error: Could not open video source: {video_source}")
    exit()

print("Camera started. Press 'q' to quit.")
print("-----------------------------------------")

# --- TUNABLE PARAMETER ---
# Idhu dhaan namma kandupudika pora sariyaana value. Ippo summa oru value-la start panrom.
RECOGNITION_THRESHOLD = 1.1

# --- 4. Main Loop ---
while True:
    ret, frame = cap.read()
    if not ret:
        print("Error: Failed to grab frame. Stream might have ended.")
        break
        
    # Frame-a resize panni, chinadha process panrom
    scale = 640 / max(frame.shape[0], frame.shape[1])
    small_frame = cv2.resize(frame, (0, 0), fx=scale, fy=scale)

    faces = app.get(small_frame)
    
    for face in faces:
        bbox = (face.bbox / scale).astype(int)
        
        # --- Recognition & Calibration Logic ---
        live_embedding = face.embedding
        query_embedding = np.expand_dims(live_embedding, axis=0).astype('float32')
        
        # 1. Fast Search: FAISS vechi vegaama closest match-a kandupudikurom
        D, I = index.search(query_embedding, 1)
        match_index_in_db = I[0][0]
        
        # 2. Get Name: Andha index vechi, antha aal yaaru-nu paakurom
        predicted_name = db_names[match_index_in_db]
        
        # 3. CALIBRATION: Ippo detail-a check panrom
        # Andha predicted_name-oda ella photos-kum evlo distance varudhu-nu paakurom
        distances = []
        for i, name in enumerate(db_names):
            if name == predicted_name:
                dist = np.linalg.norm(live_embedding - db_embeddings[i])
                distances.append(dist)
        
        # Average distance-a calculate panrom
        avg_distance = np.mean(distances) if distances else float('inf')
        
        # 4. Confidence Score: Distance-a vechi confidence % calculate panrom
        confidence = max(0, (RECOGNITION_THRESHOLD - avg_distance) / RECOGNITION_THRESHOLD) * 100
        
        # 5. Final Decision
        name_to_display = "Unknown"
        color = (0, 0, 255) # Red for Unknown
        
        if avg_distance < RECOGNITION_THRESHOLD:
            name_to_display = predicted_name
            color = (0, 255, 0) # Green for known
        
        # --- Result-a Screen-la Kaatrom ---
        # Bounding Box
        cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
        
        # Label 1: Name and Confidence
        label1 = f"{name_to_display} ({confidence:.1f}%)"
        cv2.putText(frame, label1, (bbox[0], bbox[1] - 35), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        # Label 2: Calibration Data (for debugging)
        label2 = f"AvgDist: {avg_distance:.2f}"
        cv2.putText(frame, label2, (bbox[0], bbox[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

    cv2.imshow('Live Attendance - Press Q to Exit', frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# --- 5. Clean Up ---
cap.release()
cv2.destroyAllWindows()
print("System shut down.")

