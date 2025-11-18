# TTS ONNX Inference Examples

This guide provides examples for running TTS inference using `example_onnx.go`.

## Installation

This project uses Go modules for dependency management.

### Prerequisites

1. Install Go 1.21 or later from [https://golang.org/dl/](https://golang.org/dl/)
2. Install ONNX Runtime C library:

**macOS (via Homebrew):**
```bash
brew install onnxruntime
```

**Linux:**
```bash
# Download ONNX Runtime from GitHub releases
wget https://github.com/microsoft/onnxruntime/releases/download/v1.16.0/onnxruntime-linux-x64-1.16.0.tgz
tar -xzf onnxruntime-linux-x64-1.16.0.tgz
sudo cp onnxruntime-linux-x64-1.16.0/lib/* /usr/local/lib/
sudo cp -r onnxruntime-linux-x64-1.16.0/include/* /usr/local/include/
sudo ldconfig
```

### Install Go dependencies

```bash
go mod download
```

### Configure ONNX Runtime Library Path (Optional)

If the ONNX Runtime library is not in a standard location, set the environment variable:

**Automatic Detection (Recommended):**

```bash
# macOS
export ONNXRUNTIME_LIB_PATH=$(brew --prefix onnxruntime 2>/dev/null)/lib/libonnxruntime.dylib

# Linux
export ONNXRUNTIME_LIB_PATH=$(find /usr/local/lib /usr/lib -name "libonnxruntime.so*" 2>/dev/null | head -n 1)
```

**Manual Configuration:**

```bash
export ONNXRUNTIME_LIB_PATH=/path/to/libonnxruntime.so  # Linux
# or
export ONNXRUNTIME_LIB_PATH=/path/to/libonnxruntime.dylib  # macOS
```

## Basic Usage

### Example 1: Default Inference
Run inference with default settings:
```bash
go run example_onnx.go helper.go
```

This will use:
- Voice style: `assets/voice_styles/M1.json`
- Text: "This morning, I took a walk in the park, and the sound of the birds and the breeze was so pleasant that I stopped for a long time just to listen."
- Output directory: `results/`
- Total steps: 5
- Number of generations: 4

### Example 2: Batch Inference
Process multiple voice styles and texts at once:
```bash
go run example_onnx.go helper.go \
  -voice-style "assets/voice_styles/M1.json,assets/voice_styles/F1.json" \
  -text "The sun sets behind the mountains, painting the sky in shades of pink and orange.|The weather is beautiful and sunny outside. A gentle breeze makes the air feel fresh and pleasant."
```

This will:
- Generate speech for 2 different voice-text pairs
- Use male voice (M1.json) for the first text
- Use female voice (F1.json) for the second text
- Process both samples in a single batch

### Example 3: High Quality Inference
Increase denoising steps for better quality:
```bash
go run example_onnx.go helper.go \
  -total-step 10 \
  -voice-style "assets/voice_styles/M1.json" \
  -text "Increasing the number of denoising steps improves the output's fidelity and overall quality."
```

This will:
- Use 10 denoising steps instead of the default 5
- Produce higher quality output at the cost of slower inference

## Available Arguments

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `-use-gpu` | flag | false | Use GPU for inference (default: CPU) |
| `-onnx-dir` | str | `assets/onnx` | Path to ONNX model directory |
| `-total-step` | int | 5 | Number of denoising steps (higher = better quality, slower) |
| `-n-test` | int | 4 | Number of times to generate each sample |
| `-voice-style` | str | `assets/voice_styles/M1.json` | Voice style file path(s), comma-separated |
| `-text` | str | (long default text) | Text(s) to synthesize, pipe-separated |
| `-save-dir` | str | `results` | Output directory |

## Notes

- **Batch Processing**: The number of `-voice-style` files must match the number of `-text` entries
- **Quality vs Speed**: Higher `-total-step` values produce better quality but take longer
- **GPU Support**: GPU mode is not supported yet

## Building a Binary

To build a standalone executable:
```bash
go build -o tts_example example_onnx.go helper.go
```

Then run it:
```bash
./tts_example -voice-style "../assets/voice_styles/M1.json" -text "Hello world"
```

