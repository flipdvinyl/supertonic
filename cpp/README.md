# Supertonic C++ Implementation

High-performance text-to-speech inference using ONNX Runtime.

## Requirements

- C++17 compiler, CMake 3.15+
- Libraries: ONNX Runtime, nlohmann/json

## Installation

**Ubuntu/Debian:**
> ⚠️ **Note:** Installation instructions not yet verified.

```bash
sudo apt-get install -y cmake g++ nlohmann-json3-dev
wget https://github.com/microsoft/onnxruntime/releases/download/v1.16.3/onnxruntime-linux-x64-1.16.3.tgz
tar -xzf onnxruntime-linux-x64-1.16.3.tgz
sudo cp -r onnxruntime-linux-x64-1.16.3/include/* /usr/local/include/
sudo cp -r onnxruntime-linux-x64-1.16.3/lib/* /usr/local/lib/
sudo ldconfig
```

**macOS:**
```bash
brew install cmake nlohmann-json onnxruntime
```

**Windows (vcpkg):**
> ⚠️ **Note:** Installation instructions not yet verified.

```powershell
vcpkg install nlohmann-json:x64-windows onnxruntime:x64-windows
vcpkg integrate install
```

## Building

```bash
cd cpp && mkdir build && cd build
cmake .. && cmake --build . --config Release
./example_onnx
```

## Basic Usage

### Example 1: Default Inference
Run inference with default settings:
```bash
./example_onnx
```

This will use:
- Voice style: `../assets/voice_styles/M1.json`
- Text: "This morning, I took a walk in the park, and the sound of the birds and the breeze was so pleasant that I stopped for a long time just to listen."
- Output directory: `results/`
- Total steps: 5
- Number of generations: 4

### Example 2: Batch Inference
Process multiple voice styles and texts at once:
```bash
./example_onnx \
  --voice-style ../assets/voice_styles/M1.json,../assets/voice_styles/F1.json \
  --text "The sun sets behind the mountains, painting the sky in shades of pink and orange.|The weather is beautiful and sunny outside. A gentle breeze makes the air feel fresh and pleasant."
```

This will:
- Generate speech for 2 different voice-text pairs
- Use male voice style (M1.json) for the first text
- Use female voice style (F1.json) for the second text
- Process both samples in a single batch

### Example 3: High Quality Inference
Increase denoising steps for better quality:
```bash
./example_onnx \
  --total-step 10 \
  --voice-style ../assets/voice_styles/M1.json \
  --text "Increasing the number of denoising steps improves the output's fidelity and overall quality."
```

This will:
- Use 10 denoising steps instead of the default 5
- Produce higher quality output at the cost of slower inference

## Available Arguments

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `--onnx-dir` | str | `../assets/onnx` | Path to ONNX model directory |
| `--total-step` | int | 5 | Number of denoising steps (higher = better quality, slower) |
| `--n-test` | int | 4 | Number of times to generate each sample |
| `--voice-style` | str | `../assets/voice_styles/M1.json` | Voice style file path(s) (comma-separated for batch) |
| `--text` | str | (long default text) | Text(s) to synthesize (pipe-separated for batch) |
| `--save-dir` | str | `results` | Output directory |

## Notes

- **Batch Processing**: The number of `--voice-style` files must match the number of `--text` entries
- **Quality vs Speed**: Higher `--total-step` values produce better quality but take longer
