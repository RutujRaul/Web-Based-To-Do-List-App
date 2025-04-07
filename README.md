# To-Do List Web App

A web-based To-Do List app built using React for the frontend and Flask for the backend. It features user authentication, JWT-based protected routes, and task management, including task creation, editing, deletion, and scheduling with timestamps.

## Features

- **User Authentication**: Signup and login with JWT authentication.
- **Task Management**: Create, edit, and delete tasks with timestamps.
- **Scheduled Tasks**: Add tasks with specific dates and times.
- **Protected Routes**: Use JWT for secure access to tasks and related features.
- **Responsive UI**: Modern, user-friendly interface built with React.

## Tech Stack

- **Frontend**: React
- **Backend**: Flask
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Routing**: React Router for frontend routing, Flask for backend routing

## Setup

### Prerequisites

Make sure you have the following installed:

- Node.js (>=14.x)
- Python (>=3.8)
- MongoDB (or use a MongoDB service)

### Frontend Setup

1. Clone the repository:
   git clone https://github.com/your-username/todo-list-app.git
   cd todo-list-app/frontend

2. Install dependencies:

npm install
Run the frontend development server:

3. npm start

### backend Setup

1. Navigate to the backend directory:
cd todo-list-app/backend

2. Install dependencies (using pip):
pip install -r requirements.txt

3. Set up environment variables (.env):
FLASK_APP=app.py
FLASK_ENV=development
MONGO_URI=mongodb://localhost:27017/todoapp
SECRET_KEY=your-secret-key

4. Run the Flask development server:
flask run

---

### License
This project is licensed under the MIT License - see the LICENSE file for details.







