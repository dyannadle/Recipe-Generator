# PURPOSE: Import Flask utilities for handling HTTP responses and data.
# WHY: 'jsonify' formats data for the frontend; 'request' accesses uploaded files and form fields.
# IMPACT: Enables the core "Image to Recipe" prediction functionality.
from flask import jsonify, request

# PURPOSE: Import the main app instance and rate limiter.
# WHY: '@app.route' binds URLs to functions; '@limiter' prevents API abuse.
# IMPACT: Hooks this module into the global app structure.
from Foodimg2Ing import app, limiter

# PURPOSE: Import the 'output' function which contains the ML/Logic for recipe generation.
# WHY: Separates the complex 'prediction' logic from the web-server routing logic.
# ALTERNATIVE: Write the prediction logic directly in this file (leads to a messy, hard-to-maintain file).
# IMPACT: The engine that powers the site's main feature.
from Foodimg2Ing.output import output

# PURPOSE: Import the standard OS library.
# WHY: Needed for path manipulation (joining directories) and creating folders.
# IMPACT: Basic utility for managing uploaded files.
import os

# PURPOSE: Health-check route for the API.
# WHY: Lets developers or monitoring tools know the server is up and responsive.
# IMPACT: Basic diagnostics.
@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "active", "message": "Recipe Generator API is running"})

# ============================================================================
# MAIN PREDICTION ENDPOINT
# ============================================================================
# PURPOSE: Accept an image and return a generated recipe.
# WHY: This is the primary feature of the "Food Image to Ingredient" generator.
# IMPACT: The most important endpoint in the codebase; converts user input into results.
@app.route('/predict', methods=['POST'])
# PURPOSE: Limit prediction attempts.
# WHY: Image processing is CPU intensive; prevents an attacker from overloading the server.
# IMPACT: Performance protection.
@limiter.limit("5 per minute")
def predict():
    # PURPOSE: Check if an image was actually uploaded.
    # WHY: Prevents code failure if the user clicks 'Predict' without selecting a file.
    # IMPACT: Input validation.
    if 'imagefile' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    imagefile = request.files['imagefile']
    # PURPOSE: Check if the filename is empty.
    if imagefile.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # PURPOSE: Define where uploaded images will be stored.
        # WHY: The server needs a local copy of the file to process it with the engine.
        # IMPACT: Internal file management.
        upload_dir = os.path.join(app.root_path, 'static', 'demo_imgs')
        
        # PURPOSE: Create the directory if it doesn't exist yet.
        # WHY: Avoids 'Directory not found' errors on a fresh installation.
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
            
        # PURPOSE: Save the file to the local filesystem.
        # IMPACT: Persists the user's image temporarily for processing.
        filename = imagefile.filename
        image_path = os.path.join(upload_dir, filename)
        imagefile.save(image_path)
        
        # PURPOSE: Retrieve optional form data (manual overrides).
        # WHY: Allows users to provide a title/ingredients if the AI needs help.
        user_title = request.form.get('title')
        user_ingredients = request.form.get('ingredients')

        # PURPOSE: CALL THE ENGINE.
        # WHY: This line does the heavy lifting of identifying food and writing steps.
        # IMPACT: Generates the core content (title, ingredients, instructions).
        title, ingredients, recipe, styles = output(image_path, user_title, user_ingredients)
        
        # PURPOSE: Construct a URL so the frontend can display the uploaded image back to the user.
        # WHY: Users want to see the image they just uploaded alongside the results.
        # IMPACT: UI consistency.
        image_url = f"http://127.0.0.1:5000/static/demo_imgs/{filename}"

        # PURPOSE: Return all results to the React frontend.
        # IMPACT: Completes the user's request journey.
        return jsonify({
            'title': title,
            'ingredients': ingredients,
            'recipe': recipe,
            'styles': styles,
            'image_url': image_url 
        })
    except Exception as e:
        # PURPOSE: Error logging.
        print(f"Error processing image: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================================================
# LEGACY SAMPLE PREDICTION
# ============================================================================
# PURPOSE: Allow viewing results for pre-existing sample images.
# WHY: Useful for testing or "Try a sample" buttons on the landing page.
# IMPACT: Secondary feature for onboarding new users.
@app.route('/<samplefoodname>')
def predictsample(samplefoodname):
    try:
        # PURPOSE: Map a URL slug (e.g. /pizza) to a local image file.
        image_path = os.path.join(app.root_path, 'static', 'images', str(samplefoodname) + ".jpg")
        # PURPOSE: Run the prediction engine on the sample.
        title, ingredients, recipe = output(image_path)
        return jsonify({
            'title': title,
            'ingredients': ingredients,
            'recipe': recipe
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
