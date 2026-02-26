// PURPOSE: Import the 'defineConfig' helper from Vite.
// WHY: Provides type-hinting and a standard structure for the configuration object.
// IMPACT: Fundamental utility for the build system.
import { defineConfig } from 'vite'

// PURPOSE: Import the official React plugin for Vite.
// WHY: Enables Fast Refresh, JSX transpilation, and other React-specific optimizations.
// IMPACT: Essential for developing and building a React application.
import react from '@vitejs/plugin-react'

// PURPOSE: Import the Tailwind CSS plugin for Vite.
// WHY: Automates the processing of Tailwind directives (@tailwind, @apply) into standard CSS.
// IMPACT: Powers the entire styling system of the frontend.
import tailwindcss from '@tailwindcss/vite'

// PURPOSE: Export the configuration object.
// WHY: Vite reads this file at startup to determine how to bundle the project.
// IMPACT: Controls everything from the dev server port to the production build output.
export default defineConfig({
  // PURPOSE: Register plugins to extend Vite's core functionality.
  // WHY: Combines React support and Tailwind processing into a single pipeline.
  // IMPACT: Creates a modern, high-performance build environment.
  plugins: [react(), tailwindcss()],
})

