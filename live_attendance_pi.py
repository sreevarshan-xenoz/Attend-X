import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
import faiss
import pickle
import time
import sqlite3
from datetime import datetime

# --- Database Setup ---
DB_FILE = "attendance.db"

def setup_database():
    """Database and table-a create pannum (illana)."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_name TEXT NOT NULL,
            attendance_date TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            UNIQUE(student_name, attendance_date)
        )
    ''')
    conn.commit()
    conn.close()
    print(f"Database '{DB_FILE}' is ready.")

def mark_attendance(name):
    """Database-la attendance-a save pannum."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    today_date = datetime.now().strftime("%Y-%m-%d")
    current_time = datetime.now().strftime("%H:%M:%S")
    
    try:
        cursor.execute(
            "INSERT INTO attendance (student_name, attendance_date, timestamp) VALUES (?, ?, ?)",
            (name, today_date, current_time)
        )
        conn.commit()
        print(f"SUCCESS: Attendance marked for {name} at {current_time}")
    except sqlite3.IntegrityError:
        # Indha error vandha, innaiku already andha student-ku attendance pottutom-nu artham
        # So, onnum panna theva illa
        pass
    finally:
        conn.close()

# --- Main Program Starts Here ---

print("Initializing the Raspberry Pi - Database Attendance System...")
setup_database() # Database-a ready panrom

# --- 1. Model-a Load Panrom ---
app = FaceAnalysis(providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(640, 640))
print("Face Analysis model loaded.")

# --- 2. Face Bank-a Load Panrom ---
try:
    index = faiss.read_index('face_index.bin')
    with open('face_bank.pkl', 'rb') as f:
        face_bank = pickle.load(f)
    db_names = face_bank['names']
    print("Face Bank loaded successfully.")
except Exception as e:
    print(f"Error loading Face Bank: {e}")
    exit()

# --- 3. Camera Source ---
video_source = "http://192.168.1.4:4747/video" 
cap = cv2.VideoCapture(video_source)
if not cap.isOpened():
    print(f"Error: Could not open video source: {video_source}")
    exit()

print("Camera connected. Starting attendance process...")
print("Press Ctrl+C in the terminal to stop.")
print("-----------------------------------------")


# --- Parameters ---
SIMILARITY_THRESHOLD = 0.5 
FRAME_SKIP = 4
RESIZE_WIDTH = 240
CAMERA_ROTATION_FIX = cv2.ROTATE_90_COUNTERCLOCKWISE 

# --- 4. Main Loop (Headless Mode) ---
frame_count = 0
try:
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Warning: Failed to grab frame. Retrying...")
            time.sleep(1)
            continue
        
        if CAMERA_ROTATION_FIX is not None:
            frame = cv2.rotate(frame, CAMERA_ROTATION_FIX)
            
        frame_count += 1
        
        if frame_count % FRAME_SKIP == 0:
            scale = RESIZE_WIDTH / max(frame.shape[0], frame.shape[1])
            small_frame = cv2.resize(frame, (0, 0), fx=scale, fy=scale)
            faces = app.get(small_frame)
            
            for face in faces:
                live_embedding = face.embedding
                norm_live_embedding = live_embedding / np.linalg.norm(live_embedding)
                query_embedding = np.expand_dims(norm_live_embedding, axis=0).astype('float32')
                
                D, I = index.search(query_embedding, 1)
                similarity_score = D[0][0]
                match_index = I[0][0]
                
                if similarity_score > SIMILARITY_THRESHOLD:
                    recognized_name = db_names[match_index]
                    
                    # --- ACTION: Mark attendance in SQLite DB ---
                    mark_attendance(recognized_name)
                    
                    # Oru thadava mark panna apram, konja nerathuku marubadiyum mark pannama iruka
                    time.sleep(5)
except KeyboardInterrupt:
    print("\nStopping the attendance system.")
finally:
    cap.release()
    print("System shut down cleanly.")