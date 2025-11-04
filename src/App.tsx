import React, { useEffect, useState } from 'react';
import './App.css';
import { Task } from './types/database';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      if (window.electronAPI) {
        const tasksData = await window.electronAPI.database.getAllTasks();
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      if (window.electronAPI) {
        await window.electronAPI.database.createTask({
          title: newTaskTitle,
          description: 'New task description',
          status: 'pending',
          priority: 2
        });
        setNewTaskTitle('');
        await loadTasks();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">
          Electron + SQLite Demo
        </h1>
        
        {/* Add Task Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
            <button
              onClick={addTask}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Add Task
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Tasks ({tasks.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div key={task.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{task.title}</h3>
                    <p className="text-gray-600 mt-1">{task.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Priority: {task.priority}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(task.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                No tasks yet. Add your first task above!
              </div>
            )}
          </div>
        </div>

        {/* Database Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          SQLite database is automatically created in user data directory
        </div>
      </div>
    </div>
  );
};

export default App;
