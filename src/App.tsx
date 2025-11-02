import React from 'react';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
          Welcome to Electron!
        </h1>
        <p className="text-gray-600 text-center mb-6">
          React + TypeScript + Tailwind CSS
        </p>
        <div className="space-y-4">
          <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200">
            Get Started
          </button>
          <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-200">
            Learn More
          </button>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          Built with modern web technologies
        </div>
      </div>
    </div>
  );
};

export default App;
