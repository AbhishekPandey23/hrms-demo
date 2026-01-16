#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Generate Prisma client
python -m prisma generate

# Fetch Prisma binaries (important for deployment environments)
python -m prisma py fetch
