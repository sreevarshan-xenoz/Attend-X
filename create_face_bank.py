import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
import os
import pickle
import faiss

print("Starting the Face Bank creation process (Cosine Similarity Version)...")

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
        student_name = student_folder.split('_', 1)[1].replace('_', ' ') 
        print(f"Processing images for: {student_name}")
        
        for image_name in os.listdir(folder_path):
            image_path = os.path.join(folder_path, image_name)
            
            img = cv2.imread(image_path)
            if img is None:
                print(f"Warning: Could not read image {image_path}. Skipping.")
                continue

            try:
                faces = app.get(img)
            except Exception as e:
                print(f"Warning: Face detection failed for {image_path}: {e}. Skipping.")
                continue
            
            if len(faces) == 1:
                embedding = faces[0].embedding
                
                # --- NEW STEP: NORMALIZE the embedding vector ---
                # Idhu cosine similarity-ku romba mukkiyam
                norm_embedding = embedding / np.linalg.norm(embedding)
                
                all_embeddings.append(norm_embedding)
                all_names.append(student_name)
            else:
                print(f"Warning: Found {len(faces)} faces in {image_path}. Expected 1. Skipping.")

print(f"Processed a total of {len(all_embeddings)} images.")

# --- 3. FAISS Index (for Cosine Similarity) Create Panrom ---
if not all_embeddings:
    print("Error: No embeddings were generated. Cannot create FAISS index.")
else:
    embedding_dim = all_embeddings[0].shape[0]
    embeddings_matrix = np.array(all_embeddings).astype('float32')
    
    # --- NEW: Using IndexFlatIP for Cosine Similarity ---
    # IP = Inner Product, idhu normalized vectors-ku cosine similarity-a kudukum
    index = faiss.IndexFlatIP(embedding_dim)
    index.add(embeddings_matrix)
    
    # --- 4. Namma Data-va Save Panrom ---
    faiss.write_index(index, 'face_index.bin')
    
    face_bank_data = {
        "names": all_names,
        "embeddings": embeddings_matrix # Namma normalized embeddings-a save panrom
    }
    with open('face_bank.pkl', 'wb') as f:
        pickle.dump(face_bank_data, f)
        
    print("-----------------------------------------")
    print("Face Bank (Cosine Similarity) created successfully!")
    print(f"FAISS index with {index.ntotal} faces saved to 'face_index.bin'")
    print("Detailed face bank saved to 'face_bank.pkl'")
    print("-----------------------------------------")
