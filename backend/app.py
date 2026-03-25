# new branch mock-test-dev created on 25/03/2026
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["mocktestsample"]

modules_collection = db["modules"]
questions_collection = db["questions"]
attempts_collection = db["attempts"]
students_collection = db["students"]

# ===== Students =====
@app.route("/students", methods=["POST"])
def add_student():
    data = request.json
    if not students_collection.find_one({"email": data["email"]}):
        students_collection.insert_one(data)
    return jsonify({"message": "Student added"})

@app.route("/students", methods=["GET"])
def get_students():
    students = [{"email": s.get("email")} for s in students_collection.find()]
    return jsonify(students)

@app.route("/students/check", methods=["GET"])
def check_student():
    email = request.args.get("email")
    student = students_collection.find_one({"email": email})
    return jsonify({"exists": bool(student)})

@app.route("/students/count", methods=["GET"])
def student_count():
    count = students_collection.count_documents({})
    return jsonify({"count": count})

# ===== Modules =====
@app.route("/modules", methods=["POST"])
def create_module():
    data = request.json
    result = modules_collection.insert_one(data)
    return jsonify({"id": str(result.inserted_id)})

@app.route("/modules", methods=["GET"])
def get_modules():
    modules = []
    for m in modules_collection.find():
        m["_id"] = str(m["_id"])
        modules.append(m)
    return jsonify(modules)

@app.route("/modules/<id>", methods=["DELETE"])
def delete_module(id):
    modules_collection.delete_one({"_id": ObjectId(id)})
    questions_collection.delete_many({"moduleId": id})
    return jsonify({"message": "Module and its questions deleted"})

# ===== Questions =====
@app.route("/questions", methods=["POST"])
def add_question():
    data = request.json
    result = questions_collection.insert_one(data)
    return jsonify({"id": str(result.inserted_id)})

@app.route("/questions/<module_id>", methods=["GET"])
def get_questions(module_id):
    questions = []
    for q in questions_collection.find({"moduleId": module_id}):
        q["_id"] = str(q["_id"])
        questions.append(q)
    return jsonify(questions)

@app.route("/questions/<id>", methods=["DELETE"])
def delete_question(id):
    questions_collection.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Deleted"})

@app.route("/questions/<id>", methods=["PUT"])
def update_question(id):
    data = request.json
    questions_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "question": data.get("question"),
            "choices": data.get("choices"),
            "correctAnswer": data.get("correctAnswer")
        }}
    )
    return jsonify({"message": "Question updated"})

# ===== Attempts =====
@app.route("/attempts", methods=["POST"])
def save_attempt():
    data = request.json
    attempts_collection.insert_one(data)
    return jsonify({"message": "Attempt saved"})

@app.route("/attempts/submit", methods=["POST"])
def submit_attempt():
    data = request.json
    student = students_collection.find_one({"email": data["studentEmail"]})
    if not student:
        student_id = students_collection.insert_one({"email": data["studentEmail"]}).inserted_id
    else:
        student_id = student["_id"]

    module_id = data["moduleId"]
    answers = data["answers"]

    questions = list(questions_collection.find({"moduleId": module_id}))
    correct_answers = [q["correctAnswer"] for q in questions]

    marks = sum(1 for i, ans in enumerate(answers) if i < len(correct_answers) and ans == correct_answers[i])
    total_questions = len(correct_answers)

    attempts_collection.insert_one({
        "studentId": student_id,
        "moduleId": module_id,
        "answers": answers,
        "marks": marks,
        "totalQuestions": total_questions
    })

    return jsonify({
        "message": "Attempt saved",
        "marks": marks,
        "totalQuestions": total_questions
    })

@app.route("/attempts/count", methods=["GET"])
def attempts_count():
    count = attempts_collection.count_documents({})
    return jsonify({"count": count})

@app.route("/attempts/summary", methods=["GET"])
def attempts_summary():
    attempts_summary = []
    for attempt in attempts_collection.find():
        student_id = attempt.get("studentId")
        module_id = attempt.get("moduleId")

        student = students_collection.find_one({"_id": student_id}) if student_id else None
        student_email = student["email"] if student else "Unknown Student"

        module = modules_collection.find_one({"_id": module_id}) if module_id else None
        module_title = module["title"] if module else "Unknown Module"

        attempts_summary.append({
            "studentEmail": student_email,
            "moduleTitle": module_title,
            "marks": attempt.get("marks", 0),
            "totalQuestions": attempt.get("totalQuestions", 0)
        })
    return jsonify(attempts_summary)

@app.route("/")
def home():
    return "Backend running"

if __name__ == "__main__":
    app.run(debug=True, port=5050)