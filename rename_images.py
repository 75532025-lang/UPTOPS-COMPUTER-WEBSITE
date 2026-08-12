import os

input_dir = 'product_images'

if not os.path.exists(input_dir):
    print(f"Error: Folder '{input_dir}' not found.")
else:
    renamed_count = 0
    for root, dirs, files in os.walk(input_dir):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                old_path = os.path.join(root, file)
                ext = os.path.splitext(file)[1].lower()
                
                # Standardize filename to image.jpg / image.png inside its folder
                new_filename = f"image{ext}"
                new_path = os.path.join(root, new_filename)
                
                if old_path != new_path:
                    if os.path.exists(new_path):
                        os.remove(new_path)
                    os.rename(old_path, new_path)
                    renamed_count += 1
                    print(f"[✓] Renamed: {file} -> {new_filename} in {os.path.basename(root)}")

    print(f"\n🎉 Successfully cleaned and renamed {renamed_count} image files!")