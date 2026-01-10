from flask import jsonify, request
from Foodimg2Ing import app
from Foodimg2Ing.output import output
import os

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "active", "message": "Recipe Generator API is running"})

@app.route('/predict', methods=['POST'])
def predict():
    if 'imagefile' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    imagefile = request.files['imagefile']
    if imagefile.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    image_path = None
    try:
        # Ensure demo_imgs directory exists
        upload_dir = os.path.join(app.root_path, 'static', 'demo_imgs')
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
            
        image_path = os.path.join(upload_dir, imagefile.filename)
        imagefile.save(image_path)
        
        title, ingredients, recipe = output(image_path)
        
        return jsonify({
            'title': title,
            'ingredients': ingredients,
            'recipe': recipe
        })
    except Exception as e:
        print(f"Error processing image: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up the uploaded file to save space
        if image_path and os.path.exists(image_path):
            try:
                os.remove(image_path)
            except Exception as e:
                print(f"Error removing temporary file: {e}")

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