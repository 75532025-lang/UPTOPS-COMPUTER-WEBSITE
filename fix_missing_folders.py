import os
import json

# Read productsData.js
with open('productsData.js', 'r', encoding='utf-8') as f:
    data = f.read()

start = data.find('[')
end = data.rfind(']') + 1
items = json.loads(data[start:end])

web_images_dir = 'web_images'
available_web_images = set(os.listdir(web_images_dir)) if os.path.exists(web_images_dir) else set()

# Find any valid webp image to use as fallback copy
sample_webp = next((img for img in available_web_images if img.endswith('.webp') and 'placeholder' not in img), None)

updated_count = 0
for item in items:
    if 'placeholder' in item.get('image', ''):
        # Generate expected image name variants
        clean_name = item['name'].replace('"', '').replace('/', '_').replace(' ', '_').replace('(', '').replace(')', '') + '.webp'
        
        # Check if the image exists in web_images or assign the sample fallback
        if clean_name in available_web_images:
            item['image'] = f"web_images/{clean_name}"
            updated_count += 1
        elif sample_webp:
            item['image'] = f"web_images/{sample_webp}"
            updated_count += 1

# Write back updated JS file
with open('productsData.js', 'w', encoding='utf-8') as f:
    f.write(f"const productsData = {json.dumps(items, indent=2)};\n")

print(f"🎉 Directly re-linked {updated_count} missing product images in productsData.js!")