import os
import urllib.request
import ssl

# Bypass SSL errors
ssl._create_default_https_context = ssl._create_unverified_context

# URL map for all cities
cities = {
    "tokyo.jpg": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000&auto=format&fit=crop",
    "yokohama.jpg": "https://images.unsplash.com/photo-1574787167688-6925d57b59e7?q=80&w=1000&auto=format&fit=crop",
    "osaka.jpg": "https://images.unsplash.com/photo-1590559318664-4e493bec940e?q=80&w=1000&auto=format&fit=crop",
    "kyoto.jpg": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop",
    "kobe.jpg": "https://images.unsplash.com/photo-1624591244037-339a17726487?q=80&w=1000&auto=format&fit=crop",
    "sapporo.jpg": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1000&auto=format&fit=crop",
    "fukuoka.jpg": "https://images.unsplash.com/photo-1605218457336-9dbd176722d1?q=80&w=1000&auto=format&fit=crop",
    "nagoya.jpg": "https://images.unsplash.com/photo-1627964434947-a8da87cb2320?q=80&w=1000&auto=format&fit=crop",
    "sendai.jpg": "https://images.unsplash.com/photo-1629683344218-c52992850f3c?q=80&w=1000&auto=format&fit=crop",
    "naha.jpg": "https://images.unsplash.com/photo-1542049079-c5ab3979841c?q=80&w=1000&auto=format&fit=crop"
}

output_dir = "public/images/cities"
os.makedirs(output_dir, exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

for filename, url in cities.items():
    path = os.path.join(output_dir, filename)
    # Re-download if file is small (<30KB)
    if os.path.exists(path) and os.path.getsize(path) > 30000:
        print(f"Skipping {filename}, valid size: {os.path.getsize(path)}")
        continue
    
    print(f"Downloading {filename}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as response, open(path, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Successfully downloaded {filename}")
    except Exception as e:
        print(f"Error downloading {filename}: {e}")
