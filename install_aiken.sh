#!/bin/bash
# Aiken offline install script from local tar.gz

# Change this if your file is somewhere else
AIKEN_TAR="$HOME/aiken-x86_64-unknown-linux-musl.tar.gz"

# Check if the file exists
if [ ! -f "$AIKEN_TAR" ]; then
    echo "Error: $AIKEN_TAR not found. Please place the tar.gz in your home directory."
    exit 1
fi

# Extract the tar.gz
tar -xzf "$AIKEN_TAR" -C "$HOME"

# Move the binary to /usr/local/bin
sudo mv "$HOME/aiken" /usr/local/bin/

# Ensure it is executable
sudo chmod +x /usr/local/bin/aiken

# Verify installation
if command -v aiken >/dev/null 2>&1; then
    echo "Aiken installed successfully!"
    aiken -V
else
    echo "Installation failed. Please check permissions or PATH."
fi
