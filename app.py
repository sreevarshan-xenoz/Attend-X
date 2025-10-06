from flask import Flask, render_template, request, jsonify, Response
import cv2
import sqlite3
import json
from datetime import datetime, timedelta
import threading
import time
import base64
import numpy as np
from attendance_system import AttendanceSystem

# Check if face recognition is available
try:
    import insightface
    import faiss
    import pickle
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False

app = Flask(__name__)

# Global variables for camera stream
camera = None
attendance_system = None
streaming = False
stream_thread = None

class WebAttendanceSystem(AttendanceSystem):
    def __init__(self):
        super().__init__()
        self.current_frame = None
        self.recognitions = []
        self.is_running = False
        self.frame_count = 0
        self.process_every_n_frames = 5  # Process face recognition every 5th frame
        self.last_recognitions = []
        self.recognition_cooldown = {}  # Prevent spam recognition
        
    def start_camera(self, video_source):
        """Start camera for web streaming"""
        self.cap = cv2.VideoCapture(video_source)
        
        # Optimize camera settings for better performance
        if self.cap.isOpened():
            # Set buffer size to reduce lag
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            # Set reasonable resolution for better performance
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            # Set FPS
            self.cap.set(cv2.CAP_PROP_FPS, 30)
        
        # Set rotation based on camera type
        if isinstance(video_source, str) and "http" in video_source:
            self.CAMERA_ROTATION = cv2.ROTATE_90_COUNTERCLOCKWISE
        else:
            self.CAMERA_ROTATION = None
            
        return self.cap.isOpened()
    
    def get_frame(self):
        """Get current frame with optimized face recognition"""
        if not hasattr(self, 'cap') or not self.cap.isOpened():
            return None
            
        ret, frame = self.cap.read()
        if not ret:
            return None
            
        # Apply rotation if needed
        if self.CAMERA_ROTATION is not None:
            frame = cv2.rotate(frame, self.CAMERA_ROTATION)
            
        self.frame_count += 1
        
        # Only process face recognition every N frames to reduce lag
        if self.frame_count % self.process_every_n_frames == 0:
            # Get current status based on time
            current_hour = datetime.now().hour
            current_status = "Present" if current_hour < 12 else "Late"
            
            # Recognize faces on smaller frame for speed
            small_frame = cv2.resize(frame, (320, 240))
            recognitions = self.recognize_face_optimized(small_frame, frame.shape)
            
            # Update last recognitions
            self.last_recognitions = recognitions
            
            # Save attendance with cooldown to prevent spam
            current_time = time.time()
            for recognition in recognitions:
                name = recognition['name']
                if name not in self.recognition_cooldown or (current_time - self.recognition_cooldown[name]) > 10:
                    self.save_attendance(name, current_status)
                    self.recognition_cooldown[name] = current_time
        
        # Always draw the last known recognitions for smooth display
        display_frame = self.draw_recognitions(frame, self.last_recognitions, 
                                             "Present" if datetime.now().hour < 12 else "Late")
            
        return display_frame
    
    def recognize_face_optimized(self, small_frame, original_shape):
        """Optimized face recognition for web streaming"""
        if not FACE_RECOGNITION_AVAILABLE:
            return self.demo_face_detection(small_frame, original_shape)
        
        try:
            faces = self.ai_app.get(small_frame)
            recognitions = []
            
            # Scale factors for bbox conversion
            scale_x = original_shape[1] / small_frame.shape[1]
            scale_y = original_shape[0] / small_frame.shape[0]
            
            for face in faces:
                # Scale bbox back to original size
                bbox = face.bbox
                scaled_bbox = [
                    bbox[0] * scale_x,
                    bbox[1] * scale_y,
                    bbox[2] * scale_x,
                    bbox[3] * scale_y
                ]
                
                # Get face embedding
                embedding = face.embedding
                normalized_embedding = embedding / np.linalg.norm(embedding)
                query_embedding = np.expand_dims(normalized_embedding, axis=0).astype('float32')
                
                # Search in face database
                distances, indices = self.index.search(query_embedding, 1)
                similarity = distances[0][0]
                match_index = indices[0][0]
                
                if similarity > self.SIMILARITY_THRESHOLD:
                    recognized_name = self.db_names[match_index]
                    recognitions.append({
                        'name': recognized_name,
                        'bbox': scaled_bbox,
                        'confidence': similarity
                    })
            
            return recognitions
        except Exception as e:
            print(f"[WARNING] Face recognition error: {e}")
            return []
    
    def demo_face_detection(self, small_frame, original_shape):
        """Optimized demo face detection"""
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        gray = cv2.cvtColor(small_frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        # Scale factors
        scale_x = original_shape[1] / small_frame.shape[1]
        scale_y = original_shape[0] / small_frame.shape[0]
        
        recognitions = []
        for (x, y, w, h) in faces:
            # Scale bbox to original size
            scaled_bbox = [x * scale_x, y * scale_y, (x + w) * scale_x, (y + h) * scale_y]
            
            demo_names = ["Demo Student", "Test User", "Sample Person"]
            import random
            demo_name = random.choice(demo_names)
            
            recognitions.append({
                'name': demo_name,
                'bbox': scaled_bbox,
                'confidence': 0.85
            })
        
        return recognitions
    
    def stop_camera(self):
        """Stop camera"""
        if hasattr(self, 'cap'):
            self.cap.release()

@app.route('/')
def index():
    """Main dashboard"""
    return render_template('index.html')

@app.route('/live')
def live():
    """Live attendance page"""
    return render_template('live.html')

@app.route('/reports')
def reports():
    """Reports page"""
    return render_template('reports.html')

@app.route('/api/camera/start', methods=['POST'])
def start_camera():
    """Start camera stream"""
    global attendance_system, streaming
    
    data = request.get_json()
    camera_type = data.get('camera_type', '0')
    ip_address = data.get('ip_address', '192.168.29.28')
    
    # Determine video source
    if camera_type == '0':
        video_source = 0
    else:
        video_source = f"http://{ip_address}:4747/video"
    
    try:
        attendance_system = WebAttendanceSystem()
        if attendance_system.start_camera(video_source):
            streaming = True
            return jsonify({'success': True, 'message': 'Camera started successfully'})
        else:
            return jsonify({'success': False, 'message': 'Failed to connect to camera'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/camera/stop', methods=['POST'])
def stop_camera():
    """Stop camera stream"""
    global attendance_system, streaming
    
    streaming = False
    if attendance_system:
        attendance_system.stop_camera()
        attendance_system = None
    
    return jsonify({'success': True, 'message': 'Camera stopped'})

def generate_frames():
    """Generate frames for video stream with optimized encoding"""
    global attendance_system, streaming
    
    while streaming and attendance_system:
        frame = attendance_system.get_frame()
        if frame is not None:
            # Resize frame for web streaming to reduce bandwidth
            height, width = frame.shape[:2]
            if width > 640:
                scale = 640 / width
                new_width = int(width * scale)
                new_height = int(height * scale)
                frame = cv2.resize(frame, (new_width, new_height))
            
            # Encode frame as JPEG with optimized quality
            encode_params = [cv2.IMWRITE_JPEG_QUALITY, 80]  # Reduce quality for speed
            ret, buffer = cv2.imencode('.jpg', frame, encode_params)
            if ret:
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.033)  # ~30 FPS

@app.route('/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/attendance/today')
def get_today_attendance():
    """Get today's attendance summary"""
    conn = sqlite3.connect('attendance.db')
    cursor = conn.cursor()
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Get summary
    cursor.execute("""
        SELECT status, COUNT(*) as count 
        FROM attendance 
        WHERE attendance_date = ? 
        GROUP BY status
    """, (today,))
    
    summary_data = cursor.fetchall()
    summary = {'Present': 0, 'Late': 0, 'Total': 0}
    
    for row in summary_data:
        summary[row[0]] = row[1]
        summary['Total'] += row[1]
    
    # Get detailed records
    cursor.execute("""
        SELECT student_name, timestamp, status 
        FROM attendance 
        WHERE attendance_date = ? 
        ORDER BY timestamp DESC
    """, (today,))
    
    records = []
    for row in cursor.fetchall():
        records.append({
            'name': row[0],
            'time': row[1],
            'status': row[2]
        })
    
    conn.close()
    
    return jsonify({
        'summary': summary,
        'records': records
    })

@app.route('/api/attendance/range')
def get_attendance_range():
    """Get attendance for date range"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if not start_date or not end_date:
        return jsonify({'error': 'Start date and end date required'}), 400
    
    conn = sqlite3.connect('attendance.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT attendance_date, student_name, timestamp, status 
        FROM attendance 
        WHERE attendance_date BETWEEN ? AND ? 
        ORDER BY attendance_date DESC, timestamp DESC
    """, (start_date, end_date))
    
    records = []
    for row in cursor.fetchall():
        records.append({
            'date': row[0],
            'name': row[1],
            'time': row[2],
            'status': row[3]
        })
    
    conn.close()
    
    return jsonify({'records': records})

@app.route('/api/students')
def get_students():
    """Get list of enrolled students"""
    try:
        import pickle
        with open('face_bank.pkl', 'rb') as f:
            face_bank = pickle.load(f)
        students = face_bank['names']
        return jsonify({'students': list(set(students))})
    except FileNotFoundError:
        return jsonify({'students': []})

@app.route('/api/performance')
def get_performance():
    """Get system performance stats"""
    global attendance_system
    
    if attendance_system:
        return jsonify({
            'frame_count': getattr(attendance_system, 'frame_count', 0),
            'process_interval': getattr(attendance_system, 'process_every_n_frames', 5),
            'face_recognition_available': FACE_RECOGNITION_AVAILABLE,
            'streaming': streaming,
            'last_recognitions': getattr(attendance_system, 'last_recognitions', []),
            'faces_detected': len(getattr(attendance_system, 'last_recognitions', []))
        })
    else:
        return jsonify({
            'frame_count': 0,
            'process_interval': 5,
            'face_recognition_available': FACE_RECOGNITION_AVAILABLE,
            'streaming': False,
            'last_recognitions': [],
            'faces_detected': 0
        })

@app.route('/api/face-events')
def get_face_events():
    """Get real-time face detection events"""
    global attendance_system
    
    if attendance_system and hasattr(attendance_system, 'last_recognitions'):
        events = []
        for recognition in attendance_system.last_recognitions:
            events.append({
                'name': recognition['name'],
                'confidence': recognition['confidence'],
                'timestamp': datetime.now().isoformat(),
                'status': "Present" if datetime.now().hour < 12 else "Late"
            })
        return jsonify({'events': events})
    else:
        return jsonify({'events': []})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)