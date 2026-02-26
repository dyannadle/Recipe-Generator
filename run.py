# PURPOSE: Import the configured Flask application instance 'app' from the 'Foodimg2Ing' package.
# WHY: This centralizes the app configuration (routes, database, extensions) inside the package's __init__.py, keeping this entry point clean.
# ALTERNATIVE: You could define the entire app in this file, but that leads to a messy 'God object' file as the project grows.
# IMPACT: Without this, the server cannot access the application logic and will fail to start.
from Foodimg2Ing import app

# PURPOSE: Standard Python idiom to ensure the server only runs if this script is executed directly.
# WHY: Prevents the development server from starting if this file is imported as a module in another script (e.g., during testing).
# ALTERNATIVE: Could just call app.run() directly, but that makes the script less portable and harder to test.
# IMPACT: Ensures controlled execution flow; prevents accidental server boots during imports.
if __name__=='__main__':
    # PURPOSE: Launch the Flask development web server with debug mode enabled.
    # WHY: 'debug=True' provides an interactive debugger in the browser and auto-reloads the server on code changes, which is essential for development.
    # ALTERNATIVE: 'app.run()' (without debug) for production, or using a production WSGI server like Gunicorn/uWSGI.
    # IMPACT: Starts the listener on http://127.0.0.1:5000; debug mode exposes the system to security risks if used in production.
    app.run(debug=True)
