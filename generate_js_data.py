"""
generate_js_data.py
--------------------
Single source of truth for productsData.js.

What it does:
1. Reads the existing product catalog from productsData.js.
2. Assigns an ACCURATE `category` slug to every item, derived from the
   human-readable `type` field. These slugs are what jss/java.js and the
   filter chips on accessories.html / laptops.html match against, so they
   must be exact:
       Laptop        -> "laptop"
       Desktop       -> "desktop"
       Motherboard   -> "motherboard"
       Screen        -> "screen"
       Keyboard      -> "keyboard"
       Mouse & Pads  -> "mouse"
       Charger       -> "charger"
       Bag           -> "bag"
3. Resolves an exact, existing local image path for every item (checks the
   currently-assigned image first, then falls back to matching against
   web_images/, then product_images/), so nothing renders a broken <img>.
4. Writes productsData.js back out as a plain `const productsData = [...]`
   array (UTF-8, LF line endings) that build_production.js copies + minifies
   into dist/ on every build.

Run with:  python3 generate_js_data.py
"""

import os
import json
import re

PRODUCTS_FILE = "productsData.js"
PROD_DIR = "product_images"
WEB_DIR = "web_images"

# --------------------------------------------------------------------------
# type -> category slug (must match the data-category values used by the
# filter chips in accessories.html and the isAccessoriesPage/isLaptopsPage
# logic in jss/java.js)
# --------------------------------------------------------------------------
TYPE_TO_CATEGORY = {
    "laptop": "laptop",
    "desktop": "desktop",
    "motherboard": "motherboard",
    "screen": "screen",
    "keyboard": "keyboard",
    "mouse & pads": "mouse",
    "mouse": "mouse",
    "charger": "charger",
    "bag": "bag",
}

# Keyword fallback, used only if `type` is missing/unrecognized so every
# item still ends up with an accurate category instead of a generic one.
NAME_KEYWORD_TO_CATEGORY = [
    ("motherboard", "motherboard"),
    ("screen", "screen"),
    ("keyboard", "keyboard"),
    ("mouse", "mouse"),
    ("pad", "mouse"),
    ("charger", "charger"),
    ("adapter", "charger"),
    ("backpack", "bag"),
    ("sleeve", "bag"),
    ("bag", "bag"),
    ("desktop", "desktop"),
    ("sff", "desktop"),
    ("tiny", "desktop"),
    ("micro", "desktop"),
    ("mini", "desktop"),
]


def clean_str(s):
    return re.sub(r"[^a-zA-Z0-9]", "", str(s)).lower()


def resolve_category(item):
    type_key = str(item.get("type", "")).strip().lower()
    if type_key in TYPE_TO_CATEGORY:
        return TYPE_TO_CATEGORY[type_key]

    haystack = f"{item.get('name', '')} {item.get('specs', '')}".lower()
    for keyword, category in NAME_KEYWORD_TO_CATEGORY:
        if keyword in haystack:
            return category

    # Last resort: keep whatever was already there, or mark unknown so it's
    # easy to spot in the console output rather than silently mislabeling it.
    return item.get("category") or "unknown"


def build_image_index():
    """Map cleaned filename -> actual filename for every web_images asset."""
    index = {}
    if os.path.exists(WEB_DIR):
        for fname in os.listdir(WEB_DIR):
            if fname.lower().endswith(".webp") and "placeholder" not in fname.lower():
                index[clean_str(os.path.splitext(fname)[0])] = fname
    return index


def build_folder_index():
    """Map cleaned product_images folder name -> folder name."""
    index = {}
    if os.path.exists(PROD_DIR):
        for folder in os.listdir(PROD_DIR):
            if os.path.isdir(os.path.join(PROD_DIR, folder)):
                index[clean_str(folder)] = folder
    return index


def resolve_image(item, available_web_images, product_folders):
    current = item.get("image", "")

    # 1. Keep the current path if it already points at a real file.
    if current and os.path.exists(current):
        return current

    clean_name = clean_str(item.get("name", ""))

    # 2. Exact match against web_images/*.webp
    if clean_name in available_web_images:
        return f"{WEB_DIR}/{available_web_images[clean_name]}"

    # 3. Exact match against a product_images/<Folder>/ name -> expected webp
    if clean_name in product_folders:
        folder = product_folders[clean_name]
        webp_name = f"{folder.replace(' ', '_').replace('/', '_')}.webp"
        if os.path.exists(os.path.join(WEB_DIR, webp_name)):
            return f"{WEB_DIR}/{webp_name}"
        # Fall back to any raw image file sitting in that product_images folder
        folder_path = os.path.join(PROD_DIR, folder)
        for fname in os.listdir(folder_path):
            if re.search(r"\.(png|jpe?g|webp)$", fname, re.IGNORECASE):
                return f"{PROD_DIR}/{folder}/{fname}"

    # 4. Nothing found — keep whatever was there before rather than deleting data.
    return current


def main():
    with open(PRODUCTS_FILE, "r", encoding="utf-8") as f:
        raw = f.read()

    start = raw.find("[")
    end = raw.rfind("]") + 1
    items = json.loads(raw[start:end])

    available_web_images = build_image_index()
    product_folders = build_folder_index()

    category_counts = {}
    missing_images = []
    unknown_categories = []

    for item in items:
        item["category"] = resolve_category(item)
        item["image"] = resolve_image(item, available_web_images, product_folders)

        category_counts[item["category"]] = category_counts.get(item["category"], 0) + 1
        if item["category"] == "unknown":
            unknown_categories.append(item.get("name"))
        if not item["image"] or not os.path.exists(item["image"]):
            missing_images.append(item.get("name"))

    with open(PRODUCTS_FILE, "w", encoding="utf-8", newline="\n") as f:
        f.write(f"const productsData = {json.dumps(items, indent=2, ensure_ascii=False)};\n")

    print("Category breakdown:", category_counts)
    if unknown_categories:
        print("WARNING - could not classify:", unknown_categories)
    if missing_images:
        print("WARNING - missing local image files for:", missing_images)
    print(f"Updated {PRODUCTS_FILE} with {len(items)} products.")


if __name__ == "__main__":
    main()
