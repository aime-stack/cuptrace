#!/bin/bash

# Compile Aiken contracts to Plutus format
# This script compiles all contracts and outputs .plutus files

set -e

echo "🔨 Compiling Aiken contracts..."

# Check if Aiken is installed
if ! command -v aiken &> /dev/null; then
    echo "❌ Aiken is not installed. Please install it first:"
    echo "   curl -sSf https://aiken-lang.org/install.sh | sh"
    exit 1
fi

# Navigate to contracts directory
cd "$(dirname "$0")/.."

# Build the project
echo "📦 Building Aiken project..."
aiken build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Contracts compiled successfully!"
    echo "📁 Compiled contracts are in the build/ directory"
else
    echo "❌ Contract compilation failed"
    exit 1
fi

