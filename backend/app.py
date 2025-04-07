from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
import jwt
import datetime
from smtplib import SMTP
from email.mime.text import MIMEText

from config import MONGO_URI, SECRET_KEY

app = Flask(__name__)
CORS(app)

# MongoDB Setup
client = MongoClient(MONGO_URI)
db = client["todoapp"]
users_collection = db["users"]
tasks_collection = db["tasks"]

# Helper: Verify JWT Token
def verify_token(token):
    try:
        if token.startswith("Bearer "):
            token = token.split(" ")[1]
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded["email"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# Signup Route
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data["email"]
    password = data["password"]

    if users_collection.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 409

    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    users_collection.insert_one({"email": email, "password": hashed_pw})
    return jsonify({"message": "User created successfully"}), 201

# Login Route
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data["email"]
    password = data["password"]

    user = users_collection.find_one({"email": email})
    if user and bcrypt.checkpw(password.encode(), user["password"]):
        token = jwt.encode({
            "email": email,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, SECRET_KEY, algorithm="HS256")
        return jsonify({"token": token})
    return jsonify({"message": "Invalid credentials"}), 401

# Forgot Password Route
@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data["email"]

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"message": "No user found with this email"}), 404

    # Simulate sending an email (for now just return a message)
    reset_token = jwt.encode({
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, SECRET_KEY, algorithm="HS256")
    
    # In a real app, you would send an email with the reset token or a password reset link.
    # For this example, we're just sending back a mock response.
    
    return jsonify({"message": "Password reset link sent to your email", "reset_token": reset_token}), 200

# Get All Tasks (Protected)
@app.route("/tasks", methods=["GET"])
def get_tasks():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Missing token"}), 401

    email = verify_token(token)
    if not email:
        return jsonify({"message": "Invalid or expired token"}), 401

    tasks = list(tasks_collection.find({"email": email}))
    for task in tasks:
        task["_id"] = str(task["_id"])
        task["scheduled_for"] = task.get("scheduled_for", None)
    return jsonify(tasks)

# Add Task (Protected)
@app.route("/tasks", methods=["POST"])
def add_task():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Missing token"}), 401

    email = verify_token(token)
    if not email:
        return jsonify({"message": "Invalid or expired token"}), 401

    data = request.get_json()
    content = data.get("content", "").strip()
    scheduled_for = data.get("scheduled_for", None)

    if not content:
        return jsonify({"message": "Task content required"}), 400

    task = {
        "email": email,
        "content": content,
        "timestamp": datetime.datetime.utcnow(),
        "scheduled_for": datetime.datetime.fromisoformat(scheduled_for) if scheduled_for else None
    }
    result = tasks_collection.insert_one(task)
    task["_id"] = str(result.inserted_id)
    return jsonify(task), 201

# Update Task (Protected)
@app.route("/tasks/<task_id>", methods=["PUT"])
def update_task(task_id):
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Missing token"}), 401

    email = verify_token(token)
    if not email:
        return jsonify({"message": "Invalid or expired token"}), 401

    data = request.get_json()
    content = data.get("content", "").strip()
    scheduled_for = data.get("scheduled_for", None)

    if not content:
        return jsonify({"message": "Task content required"}), 400

    update_data = {
        "content": content,
        "timestamp": datetime.datetime.utcnow(),
        "scheduled_for": datetime.datetime.fromisoformat(scheduled_for) if scheduled_for else None
    }

    result = tasks_collection.update_one(
        {"_id": ObjectId(task_id), "email": email},
        {"$set": update_data}
    )

    if result.modified_count == 1:
        return jsonify({"message": "Task updated"})
    return jsonify({"message": "Task not found or not authorized"}), 404

# Delete Task (Protected)
@app.route("/tasks/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Missing token"}), 401

    email = verify_token(token)
    if not email:
        return jsonify({"message": "Invalid or expired token"}), 401

    result = tasks_collection.delete_one({"_id": ObjectId(task_id), "email": email})
    if result.deleted_count == 1:
        return jsonify({"message": "Task deleted"})
    return jsonify({"message": "Task not found or not authorized"}), 404

# Run Server
if __name__ == "__main__":
    app.run(debug=True)
