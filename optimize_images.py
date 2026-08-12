import os
from PIL import Image

input_dir = 'product_images'
output_dir = 'web_images'

if not os.path.exists(input_dir):
    print("Error: product_images folder not found.")
else:
    os.makedirs(output_dir, exist_ok=True)
    count = 0
    for root, dirs, files in os.walk(input_dir):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                full_path = os.path.join(root, file)
                folder_name = os.path.basename(root)
                
                # Skip summary or header folders
                if 'TOTAL_PRODUCTS' in folder_name or 'CATALOGUE' in folder_name:
                    continue
                    
                output_filename = f"{folder_name}.webp"
                output_path = os.path.join(output_dir, output_filename)

                try:
                    with Image.open(full_path) as img:
                        img = img.convert("RGB")
                        img.thumbnail((600, 600))  # Standard web card dimension
                        img.save(output_path, "WEBP", quality=82)
                        count += 1
                        print(f"[{count}] Processed: {output_filename}")
                except Exception as e:
                    print(f"Error processing {full_path}: {e}")

    print(f"\n🎉 Finished! Processed {count} web images in '{output_dir}'.")