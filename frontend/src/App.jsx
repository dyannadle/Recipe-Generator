// PURPOSE: Import React core and the 'useRef' hook.
// WHY: 'useRef' is used here to reference the upload section for smooth scrolling.
// IMPACT: Fundamental UI logic for navigation within the page.
import React, { useRef } from 'react';

// PURPOSE: Import React Router components for multi-page navigation.
// WHY: 'BrowserRouter' provides the routing context; 'Routes' and 'Route' define the URL mapping.
// IMPACT: Enables the application to behave like a multi-page site without full page reloads.
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// PURPOSE: Import layout and page components.
// WHY: Breaks the UI into manageable, reusable chunks.
// IMPACT: Defines the visual structure of the site.
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Dashboard from './components/Dashboard/Dashboard';
import RecipeDetail from './components/RecipeDetail';
import ShoppingList from './components/ShoppingList';

// PURPOSE: Import the Toaster component for global notifications.
// WHY: Allows any component to trigger a pop-up alert (toast).
// IMPACT: Consistent user feedback system.
import { Toaster } from 'react-hot-toast';

// PURPOSE: Import the Authentication Context provider.
// WHY: Wraps the app to provide logged-in user data to all children.
// IMPACT: Foundation for secure/private routes.
import { AuthProvider } from './contexts/AuthContext';

// PURPOSE: Import the Theme Context provider (Dark/Light mode).
// WHY: Manages the visual aesthetic across the entire app.
// IMPACT: Powers the 'premium' look with dark mode support.
import { ThemeProvider } from './contexts/ThemeContext';

// PURPOSE: Main application component.
// WHY: The root of the React component tree.
// IMPACT: Everything starts here.
function App() {
  // PURPOSE: Create a reference to the 'Upload' section on the Home page.
  // WHY: To allow the "Get Started" button in the Hero section to scroll down to the image picker.
  // IMPACT: Improves the landing page conversion flow.
  const uploadSectionRef = useRef(null);

  // PURPOSE: Helper function to trigger a smooth scroll.
  // WHY: Provides a professional, non-jarring navigation experience.
  // IMPACT: User Experience (UX) enhancement.
  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // PURPOSE: The HTML/JSX structure of the entire application.
  return (
    // PURPOSE: Apply theme-aware styling context.
    <ThemeProvider>
      {/* PURPOSE: Apply authentication/session state context. */}
      <AuthProvider>
        {/* PURPOSE: Enable the router for URL-based page changes. */}
        <Router>
          {/* 
            PURPOSE: Root container with base styling.
            WHY: 'min-h-screen' ensures the background covers the whole window; 'dark:bg-dark-bg' handles dark mode.
          */}
          <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col transition-colors duration-200">
            {/* PURPOSE: Global notification container. */}
            <Toaster position="top-center" />

            {/* PURPOSE: Persistent navigation bar shown on every page. */}
            <Navbar />

            {/* PURPOSE: Main content area. */}
            <div className="flex-grow">
              <Routes>
                {/* 
                  PURPOSE: Home Page route.
                  WHY: Passes scroll-refs down so they can be attached to the hero button and upload section.
                */}
                <Route
                  path="/"
                  element={
                    <Home
                      scrollToUpload={scrollToUpload}
                      uploadSectionRef={uploadSectionRef}
                    />
                  }
                />
                {/* PURPOSE: STATIC PAGES: About, Dashboard, Details, and Shopping. */}
                <Route path="/about" element={<About />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/recipe/:id" element={<RecipeDetail />} />
                <Route path="/shopping-list" element={<ShoppingList />} />
              </Routes>
            </div>

            {/* PURPOSE: Persistent footer. */}
            <footer className="bg-white dark:bg-dark-surface border-t border-gray-100 dark:border-dark-border py-12 mt-auto transition-colors duration-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 dark:text-dark-text-secondary text-sm">
                {/* PURPOSE: Copyright notice with dynamic year. */}
                <p>&copy; {new Date().getFullYear()} SnapCook AI. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// PURPOSE: Export for the entry point (main.jsx).
export default App;

