# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Development Commands

### Install Dependencies
- Python dependencies (required):
  ```sh
  pip install -r requirements.txt
  ```
- Tailwind CSS (optional, for frontend/
styling):
  ```sh
  npm install
  ```

### Running Scripts
- **Web Interface (recommended):**
  ```sh
  python app.py
  ```
  Starts the Flask web server at http://localhost:5000 with full web interface including live camera feed, dashboard, and reports.

- **Face Bank Creation (enrollment):**
  ```sh
  python create_face_bank.py
  ```
  Scans 'student_dataset/' and creates/rebuilds the face embedding index (`face_index.bin`, `face_bank.pkl`).

- **Attendance System (core logic with DB):**
  ```sh
  python attendance_system.py
  ```
  Runs the main Python class for face recognition and attendance marking using SQLite DB. 

- **Automated Attendance Prototype (with export):**
  ```sh
  python automated_prototype.py
  ```
  Fully automated loop for attendance—with automatic Excel (.xlsx) report export to `Attendance_Reports/`.

- **Manual Student Image Capture (enrollment):**
  ```sh
  python auto_capture.py
  ```
  Collects labeled face data for new students over a camera stream.

- **Live Attendance (stream, quick test):**
  ```sh
  python live_attendance.py
  ```
  Lightweight script for continuous recognition, no DB/Excel output—useful for system checks.

### Linting
- No explicit linter configured. If using one, see if a config/tool needs adding.

### Testing
- No dedicated test scripts or test suite detected. All scripts appear to be utility and application scripts.

---

## Project Architecture and Code Structure

- **Face Recognition:**
  - Uses [insightface](https://github.com/deepinsight/insightface) for face detection/embedding, operating via `FaceAnalysis` class.
  - Embeddings are stored in a FAISS index (`face_index.bin`). Associated student names are kept in a pickled dictionary (`face_bank.pkl`).
  - Recognition uses cosine similarity via FAISS' IndexFlatIP.

- **Database and Reporting:**
  - Attendance marking and queries are done in SQLite (`attendance.db`).
  - On automated prototype runs, attendance records are automatically exported to Excel in `Attendance_Reports/`.

- **Scripts Overview:**
  - `create_face_bank.py` — Generates the facial embeddings and index from image datasets.
  - `auto_capture.py` — Helps collect and label raw images per student.
  - `attendance_system.py` — Provides the main attendance logic: face recognition, database logging, and reporting.
  - `automated_prototype.py` — Runs a full attendance loop with camera input and generates a daily Excel report.
  - `live_attendance.py`, `live_attendance_pi.py` — Quick start scripts for live camera-based face recognition (useful for demo/testing or Pi deployment).

- **Typical Flow for Enrollment → Attendance:**
  1. Collect images using `auto_capture.py` into organized folders under `student_dataset/`.
  2. Build or update the face bank using `create_face_bank.py` (required for recognition).
  3. Run live/automated attendance systems, which use the FAISS index and DB logging.

- **General Notes:**
  - Camera input is expected as an IP camera or DroidCam URL (see default in scripts).
  - All scripts expect required Python dependencies from `requirements.txt`. No test suite or advanced frontend config is included.
  - (Optional) Tailwind CSS via npm is present, but isn't actively used in any Python scripts—could be used if adding web UI.
