from flask import Flask, render_template, jsonify, Response
from flask_socketio import SocketIO, emit
import sqlite3
from datetime import datetime
import threading
import time
import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
import faiss
import pickle
import os
import base64
import json

# --- PART 1: FLASK WEB SERVER SETUP ---
# Sariyaana folder structure-a use panrom
app = Flask(__name__, template_folder='templates')
app.config['SECRET_KEY'] = 'your-secret-key-here'
socketio = SocketIO(app, cors_allowed_origins="*")
DB_FILE = "attendance.db"

# Global variables for live feed
current_frame = None
current_recognitions = []
frame_lock = threading.Lock()

def get_db_connection():
    # (The rest of the backend code is perfect, so no changes needed here)
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/summary')
def api_summary():
    conn = get_db_connection()
    cursor = conn.cursor()
    today_date = datetime.now().strftime("%Y-%m-%d")
    cursor.execute("SELECT status, COUNT(*) as count FROM attendance WHERE attendance_date = ? GROUP BY status", (today_date,))
    records = cursor.fetchall()
    conn.close()
    summary = {'Present': 0, 'Late': 0}
    for record in records:
        if record['status'] in summary:
            summary[record['status']] = record['count']
    return jsonify(summary)

@app.route('/api/log')
def api_log():
    conn = get_db_connection()
    cursor = conn.cursor()
    today_date = datetime.now().strftime("%Y-%m-%d")
    cursor.execute("SELECT student_name, timestamp, status FROM attendance WHERE attendance_date = ? ORDER BY timestamp DESC", (today_date,))
    log_data = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(log_data)

@app.route('/')
def dashboard():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    """Video streaming route with face recognition overlays"""
    def generate():
        global current_frame, current_recognitions
        while True:
            with frame_lock:
                if current_frame is not None:
                    # Draw face boxes and names on the frame
                    display_frame = current_frame.copy()
                    for recognition in current_recognitions:
                        name = recognition['name']
                        bbox = recognition['bbox']
                        confidence = recognition['confidence']
                        status = recognition['status']
                        
                        # Draw bounding box
                        color = (0, 255, 0) if status == "Present" else (0, 165, 255)  # Green for Present, Orange for Late
                        cv2.rectangle(display_frame, (int(bbox[0]), int(bbox[1])), 
                                    (int(bbox[2]), int(bbox[3])), color, 2)
                        
                        # Draw name and status
                        label = f"{name} ({status})"
                        label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
                        cv2.rectangle(display_frame, (int(bbox[0]), int(bbox[1]) - label_size[1] - 10),
                                    (int(bbox[0]) + label_size[0], int(bbox[1])), color, -1)
                        cv2.putText(display_frame, label, (int(bbox[0]), int(bbox[1]) - 5),
                                  cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                    
                    # Encode frame as JPEG
                    ret, buffer = cv2.imencode('.jpg', display_frame)
                    if ret:
                        frame_bytes = buffer.tobytes()
                        yield (b'--frame\r\n'
                               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(0.1)  # 10 FPS
    
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@socketio.on('connect')
def handle_connect():
    print('Client connected to live feed')
    emit('status', {'msg': 'Connected to live attendance feed'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected from live feed')

# --- PART 2: ATTENDANCE LOGIC (BACKGROUND THREAD) ---
def run_attendance_system():
    global current_frame, current_recognitions
    print("[BACKGROUND] Attendance System thread started.")
    ai_app = FaceAnalysis(providers=['CPUExecutionProvider'])
    ai_app.prepare(ctx_id=0, det_size=(640, 640))
    index = faiss.read_index('face_index.bin')
    with open('face_bank.pkl', 'rb') as f: face_bank = pickle.load(f)
    db_names = face_bank['names']
    print("[BACKGROUND] AI Model and Face Bank loaded.")
    video_source = "http://192.168.1.4:4747/video" 
    cap = cv2.VideoCapture(video_source)
    if not cap.isOpened():
        print("[BACKGROUND ERROR] Could not open camera.")
        return
    start_time = time.time()
    SIMILARITY_THRESHOLD = 0.5 
    CAMERA_ROTATION_FIX = cv2.ROTATE_90_COUNTERCLOCKWISE 
    
    while (time.time() - start_time) < (10 * 60): # 10 mins
        current_status = "Present" if (time.time() - start_time) < (5 * 60) else "Late"
        ret, frame = cap.read()
        if not ret: continue
        
        if CAMERA_ROTATION_FIX is not None:
            frame = cv2.rotate(frame, CAMERA_ROTATION_FIX)
        
        # Update global frame for video feed
        with frame_lock:
            current_frame = frame.copy()
            current_recognitions = []
        
        small_frame = cv2.resize(frame, (0,0), fx=0.5, fy=0.5)
        faces = ai_app.get(small_frame)
        
        for face in faces:
            # Scale bbox back to original frame size
            bbox = face.bbox * 2  # Since we resized by 0.5
            
            live_embedding = face.embedding
            norm_live_embedding = live_embedding / np.linalg.norm(live_embedding)
            query_embedding = np.expand_dims(norm_live_embedding, axis=0).astype('float32')
            D, I = index.search(query_embedding, 1)
            similarity_score = D[0][0]
            match_index = I[0][0]
            
            if similarity_score > SIMILARITY_THRESHOLD:
                recognized_name = db_names[match_index]
                
                # Add to current recognitions for live feed
                recognition_data = {
                    'name': recognized_name,
                    'bbox': bbox.tolist(),
                    'confidence': float(similarity_score),
                    'status': current_status,
                    'timestamp': datetime.now().strftime("%H:%M:%S")
                }
                
                with frame_lock:
                    current_recognitions.append(recognition_data)
                
                # Emit real-time recognition event
                socketio.emit('recognition', recognition_data)
                
                # Save to database
                conn = get_db_connection()
                cursor = conn.cursor()
                today_date = datetime.now().strftime("%Y-%m-%d")
                current_time = datetime.now().strftime("%H:%M:%S")
                try:
                    cursor.execute("INSERT INTO attendance (student_name, attendance_date, timestamp, status) VALUES (?, ?, ?, ?)",
                                 (recognized_name, today_date, current_time, current_status))
                    conn.commit()
                    print(f"SUCCESS: Marked {recognized_name} as {current_status}")
                    
                    # Emit attendance marked event
                    socketio.emit('attendance_marked', {
                        'name': recognized_name,
                        'status': current_status,
                        'time': current_time
                    })
                    
                except sqlite3.IntegrityError: 
                    # Already marked today
                    pass
                finally: 
                    conn.close()
                time.sleep(5) 
    
    cap.release()
    print("[BACKGROUND] Attendance capture finished.")

def setup_database():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS attendance (id INTEGER PRIMARY KEY, student_name TEXT NOT NULL, attendance_date TEXT NOT NULL, timestamp TEXT NOT NULL, status TEXT NOT NULL, UNIQUE(student_name, attendance_date))''')
    conn.commit()
    conn.close()
    print("[INFO] Database is ready.")

if __name__ == '__main__':
    setup_database()
    attendance_thread = threading.Thread(target=run_attendance_system, daemon=True)
    attendance_thread.start()
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)