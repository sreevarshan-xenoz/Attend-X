import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
import os
import pickle
import faiss

print("Starting the CALIBRATED face bank creation process...")

# --- 1. Model-a Load Panrom ---
app = FaceAnalysis(providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(640, 640))
print("Face Analysis model loaded successfully.")

# --- 2. Dataset Folder-la irundhu Photos-a Process Panrom ---
dataset_path = 'student_dataset'
all_embeddings = []
all_names = []

print(f"Scanning dataset directory: {dataset_path}")

for student_folder in os.listdir(dataset_path):
    folder_path = os.path.join(dataset_path, student_folder)
    
    if os.path.isdir(folder_path):
        # Folder name format: RollNumber_StudentName
        student_name = student_folder.split('_', 1)[1].replace('_', ' ') 
        print(f"Processing images for: {student_name}")
        
        for image_name in os.listdir(folder_path):
            image_path = os.path.join(folder_path, image_name)
            
            img = cv2.imread(image_path)
            if img is None:
                print(f"Warning: Could not read image {image_path}. Skipping.")
                continue

            faces = app.get(img)
            
            if len(faces) == 1:
                embedding = faces[0].embedding
                all_embeddings.append(embedding)
                all_names.append(student_name)
            else:
                print(f"Warning: Found {len(faces)} faces in {image_path}. Expected 1. Skipping.")

print(f"Processed a total of {len(all_embeddings)} images.")

# --- 3. FAISS Index and Calibration Data Create Panrom ---
if not all_embeddings:
    print("Error: No embeddings were generated. Cannot create FAISS index. Please check your dataset.")
else:
    embedding_dim = all_embeddings[0].shape[0]
    embeddings_matrix = np.array(all_embeddings).astype('float32')
    
    # FAISS index-a create panrom (for fast initial search)
    index = faiss.IndexFlatL2(embedding_dim)
    index.add(embeddings_matrix)
    
    # --- 4. Namma Data-va Save Panrom ---
    # FAISS index-a save panrom
    faiss.write_index(index, 'face_index.bin')
    
    # PUDHUSU: Calibration-kaga ellathayum ore file-la save panrom
    # all_names: Ovvoru embedding-kum adhu yaarodathu-nu solra list
    # embeddings_matrix: Ella embeddings-um sertha oru periya matrix
    face_bank_data = {
        "names": all_names,
        "embeddings": embeddings_matrix
    }
    with open('face_bank.pkl', 'wb') as f:
        pickle.dump(face_bank_data, f)
        
    print("-----------------------------------------")
    print("Face Bank created successfully!")
    print(f"FAISS index with {index.ntotal} faces saved to 'face_index.bin'")
    print("Detailed face bank for calibration saved to 'face_bank.pkl'")
    print("-----------------------------------------")

