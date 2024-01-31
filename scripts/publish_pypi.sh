
# Update front-end
bash scripts/update_front.sh

# Update user-guide
bash scripts/update_guide.sh

# Install the dependencies and whombat as an editable package
cd back/

# Activate virtual environment
source .venv/bin/activate

pip install build
