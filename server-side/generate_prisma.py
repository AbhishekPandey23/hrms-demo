import subprocess
import sys

print("Generating Prisma client...")
result = subprocess.run([sys.executable, "-m", "prisma", "generate"], capture_output=True, text=True)
print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr)
print("Return code:", result.returncode)
