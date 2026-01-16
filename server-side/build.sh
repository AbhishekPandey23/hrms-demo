#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Generating Prisma Client..."
python -m prisma generate

echo "Fetching and placing Prisma binaries..."
python -m prisma py fetch

# Find and copy the engine binary to the current directory
python -c "
import os
import shutil
from prisma.binaries import BINARIES, get_binary_path

for binary in BINARIES:
    try:
        path = get_binary_path(binary.name)
        if path and os.path.exists(path):
            filename = os.path.basename(path)
            dest = os.path.join(os.getcwd(), filename)
            print(f'Copying {filename} binary to {dest}')
            shutil.copy(path, dest)
            os.chmod(dest, 0o755)
    except Exception as e:
        print(f'Error moving {binary.name}: {e}')
"

echo "Build finished successfully!"
