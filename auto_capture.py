import cv2
import os
import re
import time

# --- A common fix for OpenCV issues on Windows ---
os.environ["OPENCV_VIDEOIO_PRIORITY_MSMF"] = "0"

# --- Camera Source ---
video_source = "http://192.168.1.4:4747/video"

# --- Helper Function: Sariyaana folder name-a create panna ---
def sanitize_filename(name):
    return re.sub(r'[^a-zA-Z0-9_]', '', name.replace(' ', '_'))

# --- Main Program ---
print("--- Manual Capture Tool (with Rotation Fix) ---")

# 1. Student details-a vaangurom
roll_number = input("Enter Student Roll Number (e.g., 61): ")
student_name = input("Enter Student Name (e.g., Sree Varshan V): ")
if not roll_number or not student_name:
    print("Error: Roll number and name cannot be empty.")
    exit()

# 2. Sariyaana folder path-a create panrom
folder_name = f"{roll_number}_{sanitize_filename(student_name)}"
dataset_folder = 'student_dataset'
student_folder_path = os.path.join(dataset_folder, folder_name)

# 3. Folder iruka-nu paathu, illana create panrom
os.makedirs(student_folder_path, exist_ok=True)
print(f"Saving images to: {student_folder_path}")

# 4. Camera-va open panrom
print(f"Trying to open camera at {video_source}...")
cap = cv2.VideoCapture(video_source)

if not cap.isOpened():
    print("CRITICAL ERROR: Could not connect to camera. Please check DroidCam and WiFi.")
    exit()

print("Camera is opened successfully. Waiting for stream...")
time.sleep(2.0) # Stream start aaga 2 seconds wait panrom

print("\n--- INSTRUCTIONS ---")
print("1. A new window should pop up showing the camera feed.")
print("2. Make sure your face is upright (not sideways or upside down).")
print("3. Press 'c' to capture an image. Press 'q' to quit.")
print("--------------------\n")


image_count = len(os.listdir(student_folder_path))
print(f"Found {image_count} existing images.")


# --- Live Capture Loop ---
while True:
    ret, frame = cap.read()
    
    if not ret:
        print("ERROR: Failed to grab frame. Stream might have broken.")
        time.sleep(1)
        continue
    
    # --- ROTATION FIX ---
    # Inga dhaan namma sariyaana rotation-a apply panrom.
    # Unga screenshot-la keela paathu irundhathaala, 180 degree rotate panrom.
    # Vera phone-ku thevaikkum vaaipu iruku!
    frame = cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE) # DroidCam-oda default-a 180 degree-ku maathrom
    
    # Screen-la instructions kaatrom
    display_frame = frame.copy()
    instructions = "Press 'c' to capture, 'q' to quit"
    count_text = f"Captured: {image_count}"
    
    cv2.putText(display_frame, instructions, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
    cv2.putText(display_frame, count_text, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
    
    cv2.imshow('Live Capture Tool', display_frame)
    
    key = cv2.waitKey(20) & 0xFF
    
    # 'c' press panna, image-a save panrom
    if key == ord('c'):
        image_count += 1
        image_name = f"image_{image_count}.jpg"
        image_path = os.path.join(student_folder_path, image_name)
        cv2.imwrite(image_path, frame)
        print(f"Captured: {image_path}")
        
    # 'q' press panna, veliya varom
    elif key == ord('q'):
        break

# --- Clean Up ---
print(f"\nFinished capturing. Total images for {student_name}: {image_count}")
cap.release()
cv2.destroyAllWindows()
print("System shut down cleanly.")