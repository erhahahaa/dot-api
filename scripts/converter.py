import os
import logging
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def convert_mov_to_mp4(input_path, output_path):
    try:
        command = [
            'ffmpeg',
            '-i', input_path,
            '-c:v', 'libx264',
            '-preset', 'slow',
            '-an',
            output_path
        ]
        subprocess.run(command, check=True)
        logging.info(f"Converted: {input_path} -> {output_path}")
    except subprocess.CalledProcessError as e:
        logging.error(f"Failed to convert {input_path}: {e}")

def convert_all_files(input_dir, output_dir, max_workers=4):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    mov_files = [f for f in os.listdir(input_dir) if f.endswith(".MOV")]
    if not mov_files:
        logging.warning("No .MOV files found in the directory.")
        return

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        tasks = [
            executor.submit(
                convert_mov_to_mp4,
                os.path.join(input_dir, filename),
                os.path.join(output_dir, filename.replace(".MOV", ".mp4"))
            ) for filename in mov_files
        ]

        for future in as_completed(tasks):
            future.result()

if __name__ == "__main__":
    input_directory = "assets"
    output_directory = "assets/mp4"
    convert_all_files(input_directory, output_directory, max_workers=4)
