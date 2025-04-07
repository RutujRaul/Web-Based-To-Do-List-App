import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AddTask from './AddTask'; // Keep the AddTask component for adding tasks
import './TaskList.css';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editSchedule, setEditSchedule] = useState(new Date());
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  // Fetch tasks from the backend
  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setTasks(data || []);
      } else {
        setError(data.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Something went wrong while fetching tasks');
    }
  };

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle task deletion
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchTasks(); // Refresh tasks after deletion
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete task');
      }
    } catch (err) {
      setError('Something went wrong while deleting the task');
    }
  };

  // Set up task for editing
  const handleEdit = (task) => {
    setEditTaskId(task._id);
    setEditContent(task.content);
    setEditSchedule(new Date(task.scheduled_for || Date.now())); // Set edit schedule
  };

  // Update task
  const handleUpdate = async () => {
    if (!editContent.trim()) {
      setError('Task content cannot be empty');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/tasks/${editTaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editContent,
          scheduled_for: editSchedule.toISOString(), // Send updated schedule
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setEditTaskId(null);
        setEditContent('');
        fetchTasks(); // Refresh tasks after update
      } else {
        setError(data.message || 'Failed to update task');
      }
    } catch (err) {
      setError('Something went wrong while updating the task');
    }
  };

  // Handle task addition (triggered from AddTask component)
  const handleTaskAdded = () => {
    fetchTasks(); // Refresh the task list after adding a task
  };

  return (
    <div className="task-list-container">
      <h2>Your Tasks</h2>
      {error && <p className="error-text">{error}</p>}

      {/* AddTask component handles the task input and creation */}
      <AddTask onTaskAdded={handleTaskAdded} />

      <ul className="task-list">
        {tasks.length === 0 && <p>No tasks found.</p>}
        {tasks.map((task) => (
          <li key={task._id} className="task-item">
            {editTaskId === task._id ? (
              <>
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <DatePicker
                  selected={editSchedule}
                  onChange={(date) => setEditSchedule(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="datepicker"
                />
                <button onClick={handleUpdate}>Save</button>
                <button onClick={() => setEditTaskId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <div>
                  <span className="task-content">{task.content}</span>
                  <br />
                  <span className="task-time">
                    {task.scheduled_for
                      ? new Date(task.scheduled_for).toLocaleString()
                      : 'No schedule'}
                  </span>
                </div>
                <div className="actions">
                  <button onClick={() => handleEdit(task)}>Edit</button>
                  <button onClick={() => handleDelete(task._id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
