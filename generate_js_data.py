import os
import json
import re

def clean_str(s):
    return re.sub(r'[^a-zA-Z0-9]', '', str(s)).lower()

prod_dir = 'product_images'
web_dir = 'web_images'
os.makedirs(web_dir, exist_ok=True)

# Build map from web_images folder
available_web_images = {}
if os.path.exists(web_dir):
    for fname in os.listdir(web_dir):
        if fname.endswith('.webp') and 'placeholder' not in fname:
            available_web_images[clean_str(os.path.splitext(fname)[0])] = fname

# Load catalog array
with open('productsData.js', 'r', encoding='utf-8') as f:
    data = f.read()

start = data.find('[')
end = data.rfind(']') + 1
items = json.loads(data[start:end])

for item in items:
    clean_name = clean_str(item['name'])
    
    # 1. Look for exact match in web_images
    if clean_name in available_web_images:
        item['image'] = f"web_images/{available_web_images[clean_name]}"
    else:
        # 2. Look for best matching folder name
        matched_img = None
        for folder in os.listdir(prod_dir):
            if clean_str(folder) == clean_name:
                # Target webp file name
                webp_name = f"{folder.replace(' ', '_').replace('/', '_')}.webp"
                if os.path.exists(os.path.join(web_dir, webp_name)):
                    matched_img = webp_name
                    break
        
        if matched_img:
            item['image'] = f"web_images/{matched_img}"

# Save productsData.js
with open('productsData.js', 'w', encoding='utf-8') as f:
    f.write(f"const productsData = {json.dumps(items, indent=2)};\n")

print("🎉 Updated productsData.js with exact image paths!")