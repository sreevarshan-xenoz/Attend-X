import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
import faiss
import pickle
import time
import sqlite3
from datetime import datetime
import pandas as pd
import os

# --- PART 1: DATABASE AND EXCEL FUNCTIONS ---

DB_FILE = "attendance.db"
EXPORT_FOLDER = "Attendance_Reports"

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
            status TEXT NOT NULL,
            UNIQUE(student_name, attendance_date)
        )
    ''')
    conn.commit()
    conn.close()
    print(f"[INFO] Database '{DB_FILE}' is ready.")

def mark_attendance(name, current_status):
    """Database-la attendance-a sariyaana status-oda save pannum."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    today_date = datetime.now().strftime("%Y-%m-%d")
    current_time = datetime.now().strftime("%H:%M:%S")
    
    try:
        cursor.execute(
            "INSERT INTO attendance (student_name, attendance_date, timestamp, status) VALUES (?, ?, ?, ?)",
            (name, today_date, current_time, current_status)
        )
        conn.commit()
        print(f"SUCCESS: Marked {name} as {current_status} at {current_time}")
    except sqlite3.IntegrityError:
        pass # Already marked today
    finally:
        conn.close()

def export_today_attendance():
    """Innaiku attendance-a oru Excel file-a export pannum."""
    print("\n[INFO] Auto-Exporting today's attendance to Excel...")
    
    # --- FIX 1: Corrected variable name from DB_File to DB_FILE ---
    conn = sqlite3.connect(DB_FILE)
    today_date = datetime.now().strftime("%Y-%m-%d")
    query = f"SELECT student_name, attendance_date, timestamp, status FROM attendance WHERE attendance_date = '{today_date}'"
    
    df = pd.read_sql_query(query, conn)
    conn.close()

    if df.empty:
        print("[INFO] No new attendance records found for today. Nothing to export.")
    else:
        os.makedirs(EXPORT_FOLDER, exist_ok=True)
        file_name = f"attendance_report_{today_date}.xlsx"
        file_path = os.path.join(EXPORT_FOLDER, file_name)
        
        df = df[['student_name', 'attendance_date', 'timestamp', 'status']]
        df.to_excel(file_path, index=False)
        
        print("\n-----------------------------------------")
        print(f"SUCCESS! Automated Attendance report created.")
        print(f"File saved at: {file_path}")
        print(f"Total records exported: {len(df)}")
        print("-----------------------------------------")

# --- PART 2: MAIN ATTENDANCE LOGIC ---

if __name__ == "__main__":
    
    print("--- Starting FULLY AUTOMATED 5-Minute Attendance Prototype ---")
    setup_database()

    # --- AI Model & Face Bank Loading ---
    app = FaceAnalysis(providers=['CPUExecutionProvider'])
    app.prepare(ctx_id=0, det_size=(640, 640))
    index = faiss.read_index('face_index.bin')
    with open('face_bank.pkl', 'rb') as f:
        face_bank = pickle.load(f)
    db_names = face_bank['names']
    print("[INFO] AI Model and Face Bank loaded.")

    # --- Camera ---
    video_source = "http://192.168.1.4:4747/video" 
    cap = cv2.VideoCapture(video_source)
    if not cap.isOpened():
        print("[ERROR] Could not open camera.")
        exit()

    print("[INFO] Camera connected. Prototype will run for 4 minutes.")
    print("-----------------------------------------")

    # --- PROTOTYPE TIME PARAMETERS ---
    PROTOTYPE_DURATION_MINUTES = 4
    PRESENT_WINDOW_MINUTES = 2
    start_time = time.time()

    # --- Other Parameters ---
    SIMILARITY_THRESHOLD = 0.5 
    FRAME_SKIP = 4
    CAMERA_ROTATION_FIX = cv2.ROTATE_90_COUNTERCLOCKWISE 

    # --- Main Loop (for 4 minutes) ---
    try:
        while (time.time() - start_time) < (PROTOTYPE_DURATION_MINUTES * 60):
            elapsed_seconds = time.time() - start_time
            
            if elapsed_seconds < (PRESENT_WINDOW_MINUTES * 60):
                current_status = "Present"
            else:
                current_status = "Late"

            ret, frame = cap.read()
            if not ret:
                time.sleep(1)
                continue
            
            if CAMERA_ROTATION_FIX is not None:
                # --- FIX 2: Corrected function call from cv.rotate to cv2.rotate ---
                frame = cv2.rotate(frame, CAMERA_ROTATION_FIX)
            
            # Simplified recognition logic...
            small_frame = cv2.resize(frame, (0,0), fx=0.5, fy=0.5)
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
                    mark_attendance(recognized_name, current_status)
                    time.sleep(5) 

    except KeyboardInterrupt:
        print("\n[INFO] Stopping the prototype early.")
    finally:
        cap.release()
        print("\n-----------------------------------------")
        print("[INFO] Attendance capture finished.")
        
        # --- AUTOMATIC EXCEL EXPORT ---
        export_today_attendance()
        
        print("[INFO] System shut down cleanly.")