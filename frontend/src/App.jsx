import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';

function App() {
  const uploadSectionRef = useRef(null);

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
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
          </Routes>
        </div>

        <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} SnapCook AI. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
