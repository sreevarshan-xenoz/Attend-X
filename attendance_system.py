import cv2
import numpy as np
import sqlite3
from datetime import datetime
import time
import os

# Try to import face recognition libraries
FACE_RECOGNITION_AVAILABLE = False
try:
    import insightface
    from insightface.app import FaceAnalysis
    import faiss
    import pickle
    FACE_RECOGNITION_AVAILABLE = True
    print("[INFO] Face recognition libraries loaded successfully")
except ImportError as e:
    print(f"[WARNING] Face recognition libraries not available: {e}")
    print("[INFO] Running in camera-only mode for testing")

class DatabaseManager:
    """Simple database connection manager"""
    def __init__(self, db_file):
        self.db_file = db_file
    
    def get_connection(self):
        """Get a database connection"""
        return sqlite3.connect(self.db_file, check_same_thread=False)

class AttendanceSystem:
    def __init__(self):
        self.DB_FILE = "attendance.db"
        self.SIMILARITY_THRESHOLD = 0.5
        self.CAMERA_ROTATION = None  # Will be set based on camera type
        self.SYSTEM_DURATION = 10 * 60  # 10 minutes
        self.db_manager = DatabaseManager(self.DB_FILE)
        
        # Initialize database
        self.setup_database()
        
        if FACE_RECOGNITION_AVAILABLE:
            # Load AI models
            print("[SYSTEM] Loading AI models...")
            self.ai_app = insightface.app.FaceAnalysis(providers=['CPUExecutionProvider'])
            self.ai_app.prepare(ctx_id=0, det_size=(640, 640))
            
            # Load face database
            self.load_face_database()
            print("[SYSTEM] Attendance system initialized successfully")
        else:
            print("[SYSTEM] Running in demo mode - camera feed only")
            self.ai_app = None
            self.index = None
            self.db_names = []
    
    def setup_database(self):
        """Initialize SQLite database for attendance records"""
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute('''CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY, 
            student_name TEXT NOT NULL, 
            attendance_date TEXT NOT NULL, 
            timestamp TEXT NOT NULL, 
            status TEXT NOT NULL, 
            UNIQUE(student_name, attendance_date)
        )''')
        conn.commit()
        conn.close()
        print("[INFO] Database ready")
    
    def load_face_database(self):
        """Load the face recognition database"""
        try:
            self.index = faiss.read_index('face_index.bin')
            with open('face_bank.pkl', 'rb') as f:
                face_bank = pickle.load(f)
            self.db_names = face_bank['names']
            print(f"[INFO] Loaded face database with {len(self.db_names)} students")
        except FileNotFoundError:
            print("[ERROR] Face database not found. Please run face enrollment first.")
            exit(1)
    
    def save_attendance(self, student_name, status):
        """Save attendance record to database"""
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        today = datetime.now().strftime("%Y-%m-%d")
        current_time = datetime.now().strftime("%H:%M:%S")
        
        try:
            cursor.execute("""
                INSERT INTO attendance (student_name, attendance_date, timestamp, status) 
                VALUES (?, ?, ?, ?)
            """, (student_name, today, current_time, status))
            conn.commit()
            print(f"[SUCCESS] {student_name} marked as {status} at {current_time}")
            return True
        except sqlite3.IntegrityError:
            print(f"[INFO] {student_name} already marked for today")
            return False
        finally:
            conn.close()
    
    def get_today_summary(self):
        """Get today's attendance summary"""
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        today = datetime.now().strftime("%Y-%m-%d")
        
        cursor.execute("""
            SELECT status, COUNT(*) as count 
            FROM attendance 
            WHERE attendance_date = ? 
            GROUP BY status
        """, (today,))
        
        records = cursor.fetchall()
        conn.close()
        
        summary = {'Present': 0, 'Late': 0, 'Total': 0}
        for record in records:
            summary[record[0]] = record[1]
            summary['Total'] += record[1]
        
        return summary
    
    def get_current_status(self):
        """Consistent status determination based on time"""
        current_hour = datetime.now().hour
        return "Present" if current_hour < 12 else "Late"
    
    def recognize_face(self, frame):
        """Process frame and recognize faces"""
        if not FACE_RECOGNITION_AVAILABLE:
            # Demo mode - simulate face detection with OpenCV
            return self.demo_face_detection(frame)
        
        try:
            # Process faces in smaller frame for speed
            small_frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
            faces = self.ai_app.get(small_frame)
        except Exception as e:
            print(f"[ERROR] Face detection failed: {e}")
            return []
        
        recognitions = []
        
        for face in faces:
            # Scale bbox back to original size
            bbox = face.bbox * 2
            
            # Get face embedding
            embedding = face.embedding
            normalized_embedding = embedding / np.linalg.norm(embedding)
            query_embedding = np.expand_dims(normalized_embedding, axis=0).astype('float32')
            
            # Search in face database
            distances, indices = self.index.search(query_embedding, 1)
            similarity = distances[0][0]
            match_index = indices[0][0]
            
            if similarity >= self.SIMILARITY_THRESHOLD:
                recognized_name = self.db_names[match_index]
                recognitions.append({
                    'name': recognized_name,
                    'bbox': bbox,
                    'confidence': similarity
                })
        
        return recognitions
    
    def demo_face_detection(self, frame):
        """Demo face detection using OpenCV Haar cascades"""
        # Load OpenCV face detector
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Convert to grayscale for detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        recognitions = []
        for (x, y, w, h) in faces:
            # Simulate recognition with demo names
            demo_names = ["Demo Student", "Test User", "Sample Person"]
            import random
            demo_name = random.choice(demo_names)
            
            recognitions.append({
                'name': demo_name,
                'bbox': [x, y, x+w, y+h],
                'confidence': 0.85  # Demo confidence
            })
        
        return recognitions
    
    def draw_recognitions(self, frame, recognitions, status):
        """Draw bounding boxes and labels on frame"""
        display_frame = frame.copy()
        
        for recognition in recognitions:
            name = recognition['name']
            bbox = recognition['bbox']
            confidence = recognition['confidence']
            
            # Colors: Green for Present, Orange for Late
            color = (0, 255, 0) if status == "Present" else (0, 165, 255)
            
            # Draw bounding box
            cv2.rectangle(display_frame, 
                        (int(bbox[0]), int(bbox[1])), 
                        (int(bbox[2]), int(bbox[3])), 
                        color, 3)
            
            # Draw name and status
            label = f"{name} - {status} ({confidence:.2f})"
            label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)[0]
            
            # Background for text
            cv2.rectangle(display_frame, 
                        (int(bbox[0]), int(bbox[1]) - label_size[1] - 15),
                        (int(bbox[0]) + label_size[0] + 10, int(bbox[1])), 
                        color, -1)
            
            # Text
            cv2.putText(display_frame, label, 
                      (int(bbox[0]) + 5, int(bbox[1]) - 8),
                      cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        
        return display_frame
    
    def get_camera_source(self):
        """Get camera source from user input"""
        print("\n=== Camera Selection ===")
        print("1. Default Camera (Webcam)")
        print("2. DroidCam (IP Camera)")
        
        while True:
            choice = input("Select camera source (1 or 2): ").strip()
            
            if choice == "1":
                return 0  # Default camera index
            elif choice == "2":
                ip_address = input("Enter DroidCam IP address (default: 192.168.29.28): ").strip()
                if not ip_address:
                    ip_address = "192.168.29.28"
                return f"http://{ip_address}:4747/video"
            else:
                print("Invalid choice. Please enter 1 or 2.")

    def run(self, video_source=None):
        """Main attendance system loop"""
        if video_source is None:
            video_source = self.get_camera_source()
            
        # Set rotation based on camera type
        if isinstance(video_source, str) and "http" in video_source:
            self.CAMERA_ROTATION = cv2.ROTATE_90_COUNTERCLOCKWISE
        else:
            self.CAMERA_ROTATION = None
            
        print(f"[SYSTEM] Starting attendance system...")
        print(f"[SYSTEM] Video source: {video_source}")
        
        # Camera setup
        cap = cv2.VideoCapture(video_source)
        
        if not cap.isOpened():
            print("[ERROR] Could not connect to camera")
            return
        
        print("[SYSTEM] Camera connected successfully")
        print("[SYSTEM] Press 'q' to quit, 's' to show summary")
        
        start_time = time.time()
        
        while (time.time() - start_time) < self.SYSTEM_DURATION:
            # Determine current status based on time (consistent with web app)
            current_status = self.get_current_status()
            
            ret, frame = cap.read()
            if not ret:
                print("[WARNING] Failed to grab frame")
                continue
            
            # Apply camera rotation if needed
            if self.CAMERA_ROTATION is not None:
                frame = cv2.rotate(frame, self.CAMERA_ROTATION)
            
            # Recognize faces
            recognitions = self.recognize_face(frame)
            
            # Draw recognitions on frame
            display_frame = self.draw_recognitions(frame, recognitions, current_status)
            
            # Add system info overlay
            time_remaining = int(self.SYSTEM_DURATION - elapsed_time)
            info_text = f"Status: {current_status} | Time: {time_remaining//60}:{time_remaining%60:02d}"
            cv2.putText(display_frame, info_text, (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
            
            # Show frame
            cv2.imshow('Attendance System', display_frame)
            
            # Save attendance for recognized faces
            for recognition in recognitions:
                self.save_attendance(recognition['name'], current_status)
            
            # Handle key presses
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s'):
                summary = self.get_today_summary()
                print(f"\n--- Today's Summary ---")
                print(f"Present: {summary['Present']}")
                print(f"Late: {summary['Late']}")
                print(f"Total: {summary['Total']}")
                print("----------------------\n")
        
        cap.release()
        cv2.destroyAllWindows()
        
        # Final summary
        final_summary = self.get_today_summary()
        print(f"\n[SYSTEM] Attendance session completed")
        print(f"Final Summary - Present: {final_summary['Present']}, Late: {final_summary['Late']}, Total: {final_summary['Total']}")

if __name__ == '__main__':
    # Create and run attendance system
    system = AttendanceSystem()
    system.run()