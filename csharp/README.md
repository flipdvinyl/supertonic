# TTS ONNX Inference Examples

This guide provides examples for running TTS inference using `ExampleONNX.cs`.

## Installation

### Prerequisites
- .NET 9.0 SDK or later
- [Download .NET SDK](https://dotnet.microsoft.com/download)

### Install dependencies
```bash
dotnet restore
```

## Basic Usage

### Example 1: Default Inference
Run inference with default settings:
```bash
dotnet run
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
dotnet run -- \
  --voice-style assets/voice_styles/M1.json,assets/voice_styles/F1.json \
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
dotnet run -- \
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
| `--use-gpu` | flag | False | Use GPU for inference (not supported yet) |
| `--onnx-dir` | str | `assets/onnx` | Path to ONNX model directory |
| `--total-step` | int | 5 | Number of denoising steps (higher = better quality, slower) |
| `--n-test` | int | 4 | Number of times to generate each sample |
| `--voice-style` | str+ | `assets/voice_styles/M1.json` | Voice style file path(s) (comma-separated) |
| `--text` | str+ | (long default text) | Text(s) to synthesize (pipe-separated: `|`) |
| `--save-dir` | str | `results` | Output directory |

## Notes

- **Batch Processing**: The number of `--voice-style` files must match the number of `--text` entries
- **Quality vs Speed**: Higher `--total-step` values produce better quality but take longer
- **GPU Support**: GPU mode is not supported yet

## Building the Project

### Build for Release
```bash
dotnet build -c Release
```

### Run the compiled executable
```bash
./bin/Release/net9.0/Supertonic
```

## Project Structure

```
csharp/
├── ExampleONNX.cs        # Main inference script
├── Helper.cs             # Helper functions and classes
├── Supertonic.csproj     # Project configuration
├── README.md             # This file
└── results/              # Output directory (created automatically)
```


