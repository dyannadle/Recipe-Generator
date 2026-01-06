import matplotlib.pyplot as plt
import torch
import torch.nn as nn
import numpy as np
import os
from Foodimg2Ing.args import get_parser
import pickle
from Foodimg2Ing.model import get_model
from torchvision import transforms
from Foodimg2Ing.utils.output_utils import prepare_output
from PIL import Image
import time
from Foodimg2Ing import app
from torchvision.models import resnet50, ResNet50_Weights
from Foodimg2Ing.utils.food_classes import final_food_indices

# Initialize Food Classifier (Global to load only once)
print("Loading food classifier...")
food_classifier = resnet50(weights=ResNet50_Weights.DEFAULT)
food_classifier.to(torch.device('cuda' if torch.cuda.is_available() else 'cpu'))
food_classifier.eval()
print("Food classifier loaded.")


def output(uploadedfile):

    # Keep all the codes and pre-trained weights in data directory
    data_dir=os.path.join(app.root_path,'data')


    # code will run in gpu if available and if the flag is set to True, else it will run on cpu
    use_gpu = True
    device = torch.device('cuda' if torch.cuda.is_available() and use_gpu else 'cpu')
    map_loc = None if torch.cuda.is_available() and use_gpu else 'cpu'



    # code below was used to save vocab files so that they can be loaded without Vocabulary class
    ingrs_vocab = pickle.load(open(os.path.join(data_dir, 'ingr_vocab.pkl'), 'rb'))
    vocab = pickle.load(open(os.path.join(data_dir, 'instr_vocab.pkl'), 'rb'))

    ingr_vocab_size = len(ingrs_vocab)
    instrs_vocab_size = len(vocab)
    output_dim = instrs_vocab_size

    

    t = time.time()
    import sys; sys.argv=['']; del sys
    args = get_parser()
    args.maxseqlen = 15
    args.ingrs_only=False
    model=get_model(args, ingr_vocab_size, instrs_vocab_size)
   
    # Load the pre-trained model parameters
    model_path = os.path.join(data_dir, 'modelbest.ckpt')
    model.load_state_dict(torch.load(model_path, map_location=map_loc))
    model.to(device)
    model.eval()
    model.ingrs_only = False
    model.recipe_only = False
   


    transf_list_batch = []
    transf_list_batch.append(transforms.ToTensor())
    transf_list_batch.append(transforms.Normalize((0.485, 0.456, 0.406), 
                                                (0.229, 0.224, 0.225)))
    to_input_transf = transforms.Compose(transf_list_batch)

    greedy = [True, False, False]
    beam = [-1, -1, -1]
    temperature = [1.0, 0.8, 1.2] # Standard, Conservative, Creative
    numgens = len(greedy)

    uploaded_file=uploadedfile

    img = Image.open(uploaded_file).convert('RGB')
    
    show_anyways = False #if True, it will show the recipe even if it's not valid
    transf_list = []
    transf_list.append(transforms.Resize(256))
    transf_list.append(transforms.CenterCrop(224))
    transform = transforms.Compose(transf_list)
    
    image_transf = transform(img)
    image_tensor = to_input_transf(image_transf).unsqueeze(0).to(device)

    # --- Food Check ---
    with torch.no_grad():
        food_output = food_classifier(image_tensor)
        probabilities = torch.nn.functional.softmax(food_output[0], dim=0)
        
        # Calculate total probability of it being food
        food_prob_mass = sum(probabilities[i] for i in final_food_indices)
        
        # Get top prediction for logging/debugging
        top_prob, top_catid = torch.topk(probabilities, 1)
        cat_id = top_catid.item()
        
        print(f"DEBUG: Top Class: {cat_id}, Prob: {top_prob.item():.4f}, Total Food Prob: {food_prob_mass:.4f}")

        # Threshold: if less than 15% probability mass is on 'food' classes, reject it.
        # This allows for some uncertainty but rejects clear non-food.
        if food_prob_mass < 0.15:
             print("REJECTED: Not food.")
             return ["Not a valid food image!"], ["Please upload a clear image of food."], ["Our AI detected non-food content (Class ID: {}, Confidence: {:.2f}).".format(cat_id, food_prob_mass)]
             

    # ------------------

    # Sub-recipe tips dictionary
    sub_recipe_tips = {
        "burger": "Pro Tip: For a juicy patty, mix ground meat with salt, pepper, and a dash of Worcestershire sauce. Form gently and indent the center to prevent bulging.",
        "sandwich": "Pro Tip: Toasting the bread and applying a thin layer of mayo or butter creates a moisture barrier to prevent sogginess.",
        "pizza": "Pro Tip: For the best dough, let it rest in the fridge overnight. Stretch it by hand instead of rolling to keep air bubbles.",
        "pasta": "Pro Tip: Save some pasta water before draining! Use it to emulsify the sauce for a silky texture.",
        "salad": "Pro Tip: Only dress the salad right before serving to keep the leaves crisp and fresh.",
        "cake": "Pro Tip: Let the cake layers cool completely before frosting to prevent the frosting from melting.",
        "soup": "Pro Tip: Sauté the aromatic vegetables (onions, carrots, celery) first to build a deep flavor base.",
        "pie": "Pro Tip: Keep your butter and water ice-cold when making the crust for maximum flakiness.",
        "curry": "Pro Tip: Toast your spices in oil before adding liquids to release their essential oils and enhance flavor."
    }

    num_valid = 1
    title=[]
    ingredients=[]
    recipe=[]
    for i in range(numgens):
        with torch.no_grad():
            # Explicitly cast temperature to float to avoid PyTorch errors
            current_temp = float(temperature[i])
            outputs = model.sample(image_tensor, greedy=greedy[i], 
                                temperature=current_temp, beam=beam[i], true_ingrs=None)
                
        ingr_ids = outputs['ingr_ids'].cpu().numpy()
        recipe_ids = outputs['recipe_ids'].cpu().numpy()
                
        outs, valid = prepare_output(recipe_ids[0], ingr_ids[0], ingrs_vocab, vocab)
            
        if valid['is_valid'] or show_anyways:
            gen_title = outs['title']
            gen_recipe = outs['recipe']

            # Check for sub-recipe tips
            title_lower = gen_title.lower()
            for key, tip in sub_recipe_tips.items():
                if key in title_lower:
                    gen_recipe.append(tip)
                    break # Add only one tip
            
            # Universal Tip
            gen_recipe.append("General: Ensure all fresh ingredients are washed and prepped before starting.")

            title.append(gen_title)
            ingredients.append(outs['ingrs'])
            recipe.append(gen_recipe)

        else:
            title.append("Not a valid recipe!")
            recipe.append("Reason: "+valid['reason'])
            
    return title,ingredients,recipe
