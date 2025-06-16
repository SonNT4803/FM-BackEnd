from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from deepface import DeepFace
import base64
import face_recognition

app = Flask(__name__)
CORS(app)

@app.route('/verify-face', methods=['POST'])
def verify_face():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
            
        
        image_base64 = data['image']
        img2_path = data['reference_image']

        # Decode base64 image
        img_data = base64.b64decode(image_base64)
        nparr = np.frombuffer(img_data, np.uint8)
        img1 = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        img2 = cv2.imread(img2_path)
        
        if img1 is None or img2 is None:
            return jsonify({"error": "Cannot read images"}), 400

        # Ensure 3 channels
        if len(img1.shape) == 2:
            img1 = cv2.cvtColor(img1, cv2.COLOR_GRAY2BGR)
        if len(img2.shape) == 2:
            img2 = cv2.cvtColor(img2, cv2.COLOR_GRAY2BGR)
        
        result = DeepFace.verify(
            img1_path=img1,
            img2_path=img2,
            model_name="VGG-Face",
            detector_backend="opencv",
            distance_metric="cosine",
            enforce_detection=False,
            align=True
        )
        
        # Convert NumPy boolean to Python boolean
        verified = bool(result.get("verified", False))
        return jsonify({"verified": verified})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/verify-class', methods=['POST'])
def verify_class():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        image_base64 = data['image']
        students = data['students']

        # Decode base64 image
        img_data = base64.b64decode(image_base64)
        nparr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({"error": "Cannot read image"}), 400

        # Tìm tất cả khuôn mặt trong frame
        face_locations = face_recognition.face_locations(frame)
        face_encodings = face_recognition.face_encodings(frame, face_locations)

        results = []
        # Duyệt qua từng khuôn mặt được phát hiện trong ảnh lớp học
        for face_encoding, face_location in zip(face_encodings, face_locations):
            matched_student = None
            # So sánh với từng sinh viên trong danh sách
            for student in students:
                if student['avatar'] is not None:
                    student_img = cv2.imread(student['avatar'])
                    if student_img is not None:
                        student_encoding = face_recognition.face_encodings(student_img)[0]
                        # Kiểm tra khuôn mặt có khớp với sinh viên không
                        if face_recognition.compare_faces([student_encoding], face_encoding, tolerance=0.6)[0]:
                            matched_student = {
                                'studentId': student['id'],
                                'verified': True
                            }
                            break
            
            # Nếu tìm thấy sinh viên khớp, thêm vào kết quả
            if matched_student:
                results.append(matched_student)
            else:
                # Thêm thông tin khuôn mặt không nhận dạng được
                results.append({
                    'studentId': None,
                    'verified': False
                })

        return jsonify({
            "results": results,
            "total_faces_detected": len(face_locations)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/verify-class-stream', methods=['POST'])
def verify_class_stream():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        image_base64 = data['image']
        students = data['students']

        # Decode base64 image
        img_data = base64.b64decode(image_base64)
        nparr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({"error": "Cannot read image"}), 400

        # Tìm tất cả khuôn mặt trong frame
        face_locations = face_recognition.face_locations(frame)
        face_encodings = face_recognition.face_encodings(frame, face_locations)

        results = []
        # Duyệt qua từng khuôn mặt được phát hiện trong frame
        for face_encoding in face_encodings:
            matched_student = None
            # So sánh với từng sinh viên trong danh sách
            for student in students:
                if student['avatar'] is not None:
                    student_img = cv2.imread(student['avatar'])
                    if student_img is not None:
                        student_encoding = face_recognition.face_encodings(student_img)[0]
                        # Kiểm tra khuôn mặt có khớp với sinh viên không
                        if face_recognition.compare_faces([student_encoding], face_encoding, tolerance=0.6)[0]:
                            matched_student = {
                                'studentId': student['id'],
                                'verified': True
                            }
                            break
            
            if matched_student:
                results.append(matched_student)
            else:
                results.append({
                    'studentId': None,
                    'verified': False
                })

        return jsonify({
            "results": results,
            "total_faces_detected": len(face_locations)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "Face recognition server is running"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True) 