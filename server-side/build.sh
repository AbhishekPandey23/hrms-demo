#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing specific dependencies..."
pip install -r requirements.txt

echo "Generating Prisma Client..."
python -m prisma generate

echo "Build finished successfully!"
