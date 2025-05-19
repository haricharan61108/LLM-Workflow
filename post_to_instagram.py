from instagrapi import Client

# Login credentials
USERNAME = process.env.username
PASSWORD = process.env.password

# Path to image and caption
IMAGE_PATH = "documents/india_news_image.png"  
CAPTION = "India: Trump wants Apple to stop making more iPhones in India.\n\nPresident Donald Trump urged Apple CEO Tim Cook to halt iPhone production expansion in India during his visit to Qatar."

# Login
cl = Client()
cl.login(USERNAME, PASSWORD)

# Upload photo
cl.photo_upload(IMAGE_PATH, CAPTION)

print("✅ Post uploaded to Instagram!")
