# TTS ONNX Inference Examples

This guide provides examples for running TTS inference using Rust.

## Installation

This project uses [Cargo](https://doc.rust-lang.org/cargo/) for package management.

### Install Rust (if not already installed)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Build the project
```bash
cargo build --release
```

## Basic Usage

You can run the inference in two ways:
1. **Using cargo run** (builds if needed, then runs)
2. **Direct binary execution** (faster if already built)

### Example 1: Default Inference
Run inference with default settings:
```bash
# Using cargo run
cargo run --release --bin example_onnx

# Or directly execute the built binary (faster)
./target/release/example_onnx
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
# Using cargo run
cargo run --release --bin example_onnx -- \
  --voice-style assets/voice_styles/M1.json,assets/voice_styles/F1.json \
  --text "The sun sets behind the mountains, painting the sky in shades of pink and orange.|The weather is beautiful and sunny outside. A gentle breeze makes the air feel fresh and pleasant."

# Or using the binary directly
./target/release/example_onnx \
  --voice-style assets/voice_styles/M1.json,assets/voice_styles/F1.json \
  --text "The sun sets behind the mountains, painting the sky in shades of pink and orange.|The weather is beautiful and sunny outside. A gentle breeze makes the air feel fresh and pleasant."
```

This will:
- Generate speech for 2 different voice-text pairs
- Use male voice (M1.json) for the first text
- Use female voice (F1.json) for the second text
- Process both samples in a single batch

### Example 3: High Quality Inference
Increase denoising steps for better quality:
```bash
# Using cargo run
cargo run --release --bin example_onnx -- \
  --total-step 10 \
  --voice-style assets/voice_styles/M1.json \
  --text "Increasing the number of denoising steps improves the output's fidelity and overall quality."

# Or using the binary directly
./target/release/example_onnx \
  --total-step 10 \
  --voice-style assets/voice_styles/M1.json \
  --text "Increasing the number of denoising steps improves the output's fidelity and overall quality."
```

This will:
- Use 10 denoising steps instead of the default 5
- Produce higher quality output at the cost of slower inference

## Available Arguments

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `--use-gpu` | flag | False | Use GPU for inference (default: CPU) |
| `--onnx-dir` | str | `assets/onnx` | Path to ONNX model directory |
| `--total-step` | int | 5 | Number of denoising steps (higher = better quality, slower) |
| `--n-test` | int | 4 | Number of times to generate each sample |
| `--voice-style` | str+ | `assets/voice_styles/M1.json` | Voice style file path(s) |
| `--text` | str+ | (long default text) | Text(s) to synthesize |
| `--save-dir` | str | `results` | Output directory |

## Notes

- **Batch Processing**: The number of `--voice-style` files must match the number of `--text` entries
- **Quality vs Speed**: Higher `--total-step` values produce better quality but take longer
- **GPU Support**: GPU mode is not supported yet
- **Known Issues**: On some platforms (especially macOS), there might be a mutex cleanup warning during exit. This is a known ONNX Runtime issue and doesn't affect functionality. The implementation uses `libc::_exit()` and `mem::forget()` to bypass this issue.


