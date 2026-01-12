from flask import jsonify, request
from Foodimg2Ing import app, limiter
from Foodimg2Ing.output import output
import os

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "active", "message": "Recipe Generator API is running"})



@app.route('/predict', methods=['POST'])
@limiter.limit("5 per minute")
def predict():
    if 'imagefile' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    imagefile = request.files['imagefile']
    if imagefile.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Ensure demo_imgs directory exists
        upload_dir = os.path.join(app.root_path, 'static', 'demo_imgs')
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
            
        # Secure filename or use timestamp to avoid collisions
        # For simplicity in this fix, we use the original filename but you might want to consider UUIDs
        filename = imagefile.filename
        image_path = os.path.join(upload_dir, filename)
        imagefile.save(image_path)
        
        user_title = request.form.get('title')
        user_ingredients = request.form.get('ingredients')

        title, ingredients, recipe = output(image_path, user_title, user_ingredients)
        
        # Construct URL for the image
        # Assuming server runs on localhost:5000 for local dev
        image_url = f"http://127.0.0.1:5000/static/demo_imgs/{filename}"

        return jsonify({
            'title': title,
            'ingredients': ingredients,
            'recipe': recipe,
            'image_url': image_url 
        })
    except Exception as e:
        print(f"Error processing image: {e}")
        return jsonify({'error': str(e)}), 500

# Legacy route support if needed, or remove
@app.route('/<samplefoodname>')
def predictsample(samplefoodname):
    try:
        image_path = os.path.join(app.root_path, 'static', 'images', str(samplefoodname) + ".jpg")
        title, ingredients, recipe = output(image_path)
        return jsonify({
            'title': title,
            'ingredients': ingredients,
            'recipe': recipe
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500