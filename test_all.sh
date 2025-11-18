#!/bin/bash

# Supertonic - Test All Language Implementations
# This script runs inference tests for all supported languages except web

set -e  # Exit on error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "=================================="
echo "Supertonic - Testing All Examples"
echo "=================================="
echo ""

# Ask user to select test mode
echo "Select test mode:"
echo "  1) Default inference only"
echo "  2) Batch inference only"
echo "  3) Both default and batch inference"
echo -e "Enter your choice (1/2/3) [default: 1]: \c"
read -r test_mode
test_mode=${test_mode:-1}

case $test_mode in
    1)
        TEST_DEFAULT=true
        TEST_BATCH=false
        echo "Running default inference tests only"
        ;;
    2)
        TEST_DEFAULT=false
        TEST_BATCH=true
        echo "Running batch inference tests only"
        ;;
    3)
        TEST_DEFAULT=true
        TEST_BATCH=true
        echo "Running both default and batch inference tests"
        ;;
    *)
        echo "Invalid choice. Using default inference only."
        TEST_DEFAULT=true
        TEST_BATCH=false
        ;;
esac
echo ""

# Batch inference test data - base variables
BATCH_VOICE_STYLE_1="assets/voice_styles/M1.json"
BATCH_VOICE_STYLE_2="assets/voice_styles/F1.json"
BATCH_TEXT_1="The sun sets behind the mountains, painting the sky in shades of pink and orange."
BATCH_TEXT_2="The weather is beautiful and sunny outside. A gentle breeze makes the air feel fresh and pleasant."

# Ask if user wants to clean results folders
echo -e "Do you want to clean all results folders before running tests? (y/N): \c"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "Cleaning results folders..."
    
    # List of result directories
    declare -a RESULT_DIRS=(
        "py/results"
        "nodejs/results"
        "go/results"
        "rust/results"
        "csharp/results"
        "java/results"
        "swift/results"
        "cpp/build/results"
    )
    
    for dir in "${RESULT_DIRS[@]}"; do
        if [ -d "$SCRIPT_DIR/$dir" ]; then
            echo "  - Cleaning $dir"
            rm -rf "$SCRIPT_DIR/$dir"/*
        fi
    done
    
    echo "Results folders cleaned!"
    echo ""
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track results
declare -a PASSED=()
declare -a FAILED=()

# Helper function to run tests
run_test() {
    local name=$1
    local dir=$2
    shift 2
    local cmd="$@"
    
    echo -e "${BLUE}[$name]${NC} Running inference..."
    cd "$SCRIPT_DIR/$dir"
    
    # Run command and prefix each output line with the language name
    if eval "$cmd" 2>&1 | sed "s/^/[$name] /"; then
        echo -e "${GREEN}[$name]${NC} ✓ Success"
        PASSED+=("$name")
    else
        echo -e "${RED}[$name]${NC} ✗ Failed"
        FAILED+=("$name")
    fi
    echo ""
    cd "$SCRIPT_DIR"
}

# ====================================
# Python
# ====================================
echo -e "${YELLOW}Testing Python...${NC}"
if [ "$TEST_DEFAULT" = true ]; then
    run_test "Python (default)" "py" "uv run example_onnx.py"
fi
if [ "$TEST_BATCH" = true ]; then
    run_test "Python (batch)" "py" "uv run example_onnx.py --voice-style $BATCH_VOICE_STYLE_1 $BATCH_VOICE_STYLE_2 --text '$BATCH_TEXT_1' '$BATCH_TEXT_2'"
fi

# ====================================
# JavaScript (Node.js)
# ====================================
echo -e "${YELLOW}Testing JavaScript (Node.js)...${NC}"
echo "Installing Node.js dependencies..."
cd nodejs && npm install --silent && cd ..
if [ "$TEST_DEFAULT" = true ]; then
    run_test "JavaScript (default)" "nodejs" "node example_onnx.js"
fi
if [ "$TEST_BATCH" = true ]; then
    run_test "JavaScript (batch)" "nodejs" "node example_onnx.js --voice-style $BATCH_VOICE_STYLE_1,$BATCH_VOICE_STYLE_2 --text '$BATCH_TEXT_1|$BATCH_TEXT_2'"
fi

# ====================================
# Go
# ====================================
echo -e "${YELLOW}Testing Go...${NC}"
echo "Cleaning Go cache..."
cd go && go clean && cd ..
export ONNXRUNTIME_LIB_PATH=$(brew --prefix onnxruntime 2>/dev/null)/lib/libonnxruntime.dylib
if [ "$TEST_DEFAULT" = true ]; then
    run_test "Go (default)" "go" "go run example_onnx.go helper.go"
fi
if [ "$TEST_BATCH" = true ]; then
    run_test "Go (batch)" "go" "go run example_onnx.go helper.go --voice-style $BATCH_VOICE_STYLE_1,$BATCH_VOICE_STYLE_2 --text '$BATCH_TEXT_1|$BATCH_TEXT_2'"
fi

# ====================================
# Rust
# ====================================
echo -e "${YELLOW}Testing Rust...${NC}"
echo "Building Rust project..."
cd rust && cargo clean && cd ..
if [ "$TEST_DEFAULT" = true ]; then
    run_test "Rust (default)" "rust" "cargo run --release"
fi
if [ "$TEST_BATCH" = true ]; then
    run_test "Rust (batch)" "rust" "cargo run --release -- --voice-style $BATCH_VOICE_STYLE_1,$BATCH_VOICE_STYLE_2 --text '$BATCH_TEXT_1|$BATCH_TEXT_2'"
fi

# ====================================
# C#
# ====================================
echo -e "${YELLOW}Testing C#...${NC}"
echo "Building C# project..."
cd csharp && dotnet clean && cd ..
if [ "$TEST_DEFAULT" = true ]; then
    run_test "C# (default)" "csharp" "dotnet run --configuration Release"
fi
if [ "$TEST_BATCH" = true ]; then
    run_test "C# (batch)" "csharp" "dotnet run --configuration Release -- --voice-style ../$BATCH_VOICE_STYLE_1,../$BATCH_VOICE_STYLE_2 --text '$BATCH_TEXT_1|$BATCH_TEXT_2'"
fi

# ====================================
# Java
# ====================================
echo -e "${YELLOW}Testing Java...${NC}"
echo "Building Java project..."
cd java && mvn clean install -q && cd ..
if [ "$TEST_DEFAULT" = true ]; then
    run_test "Java (default)" "java" "mvn exec:java -q"
fi
if [ "$TEST_BATCH" = true ]; then
    run_test "Java (batch)" "java" "mvn exec:java -q -Dexec.args='--voice-style $BATCH_VOICE_STYLE_1,$BATCH_VOICE_STYLE_2 --text \"$BATCH_TEXT_1|$BATCH_TEXT_2\"'"
fi

# ====================================
# Swift
# ====================================
echo -e "${YELLOW}Testing Swift...${NC}"
echo "Building Swift project..."
cd swift && swift build -c release && cd ..
if [ "$TEST_DEFAULT" = true ]; then
    run_test "Swift (default)" "swift" ".build/release/example_onnx"
fi
if [ "$TEST_BATCH" = true ]; then
    run_test "Swift (batch)" "swift" ".build/release/example_onnx --voice-style $BATCH_VOICE_STYLE_1,$BATCH_VOICE_STYLE_2 --text '$BATCH_TEXT_1|$BATCH_TEXT_2'"
fi

# ====================================
# C++
# ====================================
echo -e "${YELLOW}Testing C++...${NC}"
echo "Building C++ project..."
cd cpp && mkdir -p build && cd build && cmake .. && make && cd ../..
if [ "$TEST_DEFAULT" = true ]; then
    run_test "C++ (default)" "cpp/build" "./example_onnx"
fi
if [ "$TEST_BATCH" = true ]; then
    run_test "C++ (batch)" "cpp/build" "./example_onnx --voice-style ../$BATCH_VOICE_STYLE_1,../$BATCH_VOICE_STYLE_2 --text '$BATCH_TEXT_1|$BATCH_TEXT_2'"
fi

# ====================================
# Summary
# ====================================
echo "=================================="
echo "Test Summary"
echo "=================================="
echo ""

if [ ${#PASSED[@]} -gt 0 ]; then
    echo -e "${GREEN}Passed (${#PASSED[@]}):${NC}"
    for lang in "${PASSED[@]}"; do
        echo -e "  ${GREEN}✓${NC} $lang"
    done
    echo ""
fi

if [ ${#FAILED[@]} -gt 0 ]; then
    echo -e "${RED}Failed (${#FAILED[@]}):${NC}"
    for lang in "${FAILED[@]}"; do
        echo -e "  ${RED}✗${NC} $lang"
    done
    echo ""
    exit 1
else
    echo -e "${GREEN}All tests passed! 🎉${NC}"
    exit 0
fi

