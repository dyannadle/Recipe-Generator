import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Dashboard from './components/Dashboard/Dashboard';
import RecipeDetail from './components/RecipeDetail';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const uploadSectionRef = useRef(null);

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col transition-colors duration-200">
            <Toaster position="top-center" />
            <Navbar />
            <div className="flex-grow">
              <Routes>
                <Route
                  path="/"
                  element={
                    <Home
                      scrollToUpload={scrollToUpload}
                      uploadSectionRef={uploadSectionRef}
                    />
                  }
                />
                <Route path="/about" element={<About />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/recipe/:id" element={<RecipeDetail />} />
              </Routes>
            </div>

            <footer className="bg-white dark:bg-dark-surface border-t border-gray-100 dark:border-dark-border py-12 mt-auto transition-colors duration-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 dark:text-dark-text-secondary text-sm">
                <p>&copy; {new Date().getFullYear()} SnapCook AI. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
