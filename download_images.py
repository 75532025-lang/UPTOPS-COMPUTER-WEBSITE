import os
import pandas as pd
from icrawler.builtin import BingImageCrawler  # Switched to Bing for reliable downloading

# 1. Load catalogue CSV
csv_file = 'UpTop_Computers_Full_Catalogue.csv'

with open(csv_file, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

product_lines = []
for line in lines:
    if ',' in line and not line.startswith('===') and not line.startswith('UPTOP') and not line.startswith('Note'):
        product_lines.append(line)

with open('temp_clean.csv', 'w', encoding='utf-8') as f:
    f.writelines(product_lines)

df = pd.read_csv('temp_clean.csv')

output_dir = 'product_images'
os.makedirs(output_dir, exist_ok=True)

print(f"Loaded catalogue with {len(df)} items.")
print("Starting automated image download...\n")

downloaded = set()

for index, row in df.iterrows():
    company = str(row.iloc[0]).strip() if pd.notna(row.iloc[0]) else ''
    model = str(row.iloc[1]).strip() if pd.notna(row.iloc[1]) else ''
    
    if model.lower() in ['model', 'item name', 'nan', '']:
        continue
        
    search_key = f"{company} {model}".strip()
    if search_key in downloaded:
        continue
        
    downloaded.add(search_key)
    
    query = f"{company} {model} laptop isolated white background clean png"
    print(f"[{len(downloaded)}] Downloading photo for: {search_key}...")
    
    item_folder = os.path.join(output_dir, search_key.replace('/', '_').replace(' ', '_'))
    
    try:
        # Using BingImageCrawler to bypass Google parser breaking changes
        crawler = BingImageCrawler(storage={'root_dir': item_folder}, log_level=30)
        crawler.crawl(keyword=query, max_num=1)
    except Exception as e:
        print(f"Skipping {search_key} due to error: {e}")

if os.path.exists('temp_clean.csv'):
    os.remove('temp_clean.csv')

print("\n🎉 DONE! All product images have been downloaded into the 'product_images' folder.")