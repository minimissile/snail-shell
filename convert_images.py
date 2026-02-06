import os
from PIL import Image

source_path = '/Users/nuke/Desktop/snail-shell/miniprogram/images/nearby-stores/store-card-image@2x.webp'
output_dir = '/Users/nuke/Desktop/snail-shell/miniprogram/images/nearby-stores/'

if os.path.exists(source_path):
    img = Image.open(source_path)

    # Calculate dimensions
    # Figma width is 351px, height 224px
    base_w = 351
    base_h = 224

    # 3x
    img_3x = img.resize((base_w * 3, base_h * 3), Image.LANCZOS)
    img_3x.save(os.path.join(output_dir, 'store-card-image@3x.webp'), 'WEBP', quality=85)

    # 2x
    img_2x = img.resize((base_w * 2, base_h * 2), Image.LANCZOS)
    img_2x.save(os.path.join(output_dir, 'store-card-image@2x.webp'), 'WEBP', quality=85)

    print("Images converted and resized successfully.")
else:
    print(f"Source image not found at {source_path}")
