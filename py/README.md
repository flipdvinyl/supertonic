# TTS ONNX Inference Examples

This guide provides examples for running TTS inference using `example_onnx.py`.

## Installation

This project uses [uv](https://docs.astral.sh/uv/) for fast package management.

### Install uv (if not already installed)
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Install dependencies
```bash
uv sync
```

Or if you prefer using traditional pip with requirements.txt:
```bash
pip install -r requirements.txt
```

## Basic Usage

### Example 1: Default Inference
Run inference with default settings:
```bash
uv run example_onnx.py
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
uv run example_onnx.py \
  --voice-style assets/voice_styles/M1.json assets/voice_styles/F1.json \
  --text "The sun sets behind the mountains, painting the sky in shades of pink and orange." "The weather is beautiful and sunny outside. A gentle breeze makes the air feel fresh and pleasant."
```

This will:
- Generate speech for 2 different voice-text pairs
- Use male voice style (M1.json) for the first text
- Use female voice style (F1.json) for the second text
- Process both samples in a single batch

### Example 3: High Quality Inference
Increase denoising steps for better quality:
```bash
uv run example_onnx.py \
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
| `--use-gpu` | flag | False | Use GPU for inference (with CPU fallback) |
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

