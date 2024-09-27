import os
import requests
import time
from concurrent.futures import ThreadPoolExecutor

directory = "assets/mp4"
upload_url = "http://localhost:3000/media/exercise"
jwt_token = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MTEsImVtYWlsIjoiam9obkBnbWFpbC5jb20iLCJuYW1lIjoiSm9obiBEb2UiLCJpbWFnZSI6Imh0dHBzOi8vaGhpZHhlaGtsbWRzc3N0c2pkc3guc3VwYWJhc2UuY28vc3RvcmFnZS92MS9vYmplY3QvcHVibGljL3VzZXJzLzY5MDIwMF8xMDAwMjM4MjkzLmpwZyIsImV4cCI6MTcyNzk5ODQ3OCwiaWF0IjoxNzI3MzkzNjc4fQ.IPLDYnl3bQ49-EliCFSCCVvhzvu7vd7RBPXXylBFq8g"
club_id = 79
allowed_extensions = {".mp4"}

max_workers = 16
delay_between_requests = 3
print(f"Max workers: {max_workers}")

def is_valid_file(file_name):
    return os.path.splitext(file_name)[1].lower() in allowed_extensions

def upload_file(file_name):
    file_path = os.path.join(directory, file_name)

    if os.path.isfile(file_path) and is_valid_file(file_name):
        print(f"Uploading {file_name}...")

        headers = {
            "Authorization": f"Bearer {jwt_token}"
        }
        files = {
            "file": (file_name, open(file_path, "rb"))
        }
        params = {
            "clubId": club_id
        }

        response = requests.post(upload_url, headers=headers, files=files, params=params)

        if response.status_code == 200:
            print(f"Successfully uploaded {file_name}")
            os.remove(file_path)
        else:
            print(f"Failed to upload {file_name}. Status code: {response.status_code}, Response: {response.text}")

        time.sleep(delay_between_requests)

files_to_upload = [file_name for file_name in os.listdir(directory) if is_valid_file(file_name)]

with ThreadPoolExecutor(max_workers=max_workers) as executor:
    executor.map(upload_file, files_to_upload)
