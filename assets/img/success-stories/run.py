import os

# Change this to your folder path
folder = r"D:\xampp\htdocs\lp\placements"

for filename in os.listdir(folder):
    if ".jpg." in filename.lower():  # find cases like .jpg.jpeg, .jpg.png, etc.
        new_name = filename.lower().replace(".jpg.", ".")
        old_path = os.path.join(folder, filename)
        new_path = os.path.join(folder, new_name)
        os.rename(old_path, new_path)

print("✅ Fixed duplicate .jpg extensions!")
