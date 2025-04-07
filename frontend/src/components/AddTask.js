import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AddTask.css';

function AddTask({ onTaskAdded }) {
  const [content, setContent] = useState('');
  const [scheduledFor, setScheduledFor] = useState(new Date());
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);  // New state to track submission status

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Task content cannot be empty');
      return;
    }

    setIsSubmitting(true);  // Set submitting state to true

    try {
      const res = await fetch('http://localhost:5000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          scheduled_for: scheduledFor.toISOString(), // Send scheduled date to the backend
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setContent('');  // Clear content field on successful submission
        setScheduledFor(new Date());  // Reset scheduled date
        setError('');  // Clear error message
        onTaskAdded();  // Refresh task list in the parent component
      } else {
        setError(data.message || 'Failed to add task');
      }
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Something went wrong');
    } finally {
      setIsSubmitting(false);  // Reset submitting state after request is done
    }
  };

  return (
    <div className="add-task-container">
      <form onSubmit={handleSubmit} className="add-task-form">
        <input
          type="text"
          placeholder="Enter task"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <DatePicker
          selected={scheduledFor}
          onChange={(date) => setScheduledFor(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="MMMM d, yyyy h:mm aa"
          className="datepicker"
        />
        <button type="submit" disabled={isSubmitting}>Add Task</button> {/* Disable button when submitting */}
      </form>
      {error && <p className="error-text">{error}</p>} {/* Display error if any */}
    </div>
  );
}

export default AddTask;
