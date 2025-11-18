# TTS ONNX Inference Examples

This guide provides examples for running TTS inference using `ExampleONNX.java`.

## Installation

This project uses [Maven](https://maven.apache.org/) for dependency management.

### Prerequisites

- Java 11 or higher
- Maven 3.6 or higher

### Install dependencies

```bash
mvn clean install
```

## Basic Usage

### Example 1: Default Inference
Run inference with default settings:
```bash
mvn exec:java
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
mvn exec:java -Dexec.args="--voice-style assets/voice_styles/M1.json,assets/voice_styles/F1.json --text 'The sun sets behind the mountains, painting the sky in shades of pink and orange.|The weather is beautiful and sunny outside. A gentle breeze makes the air feel fresh and pleasant.'"
```

This will:
- Generate speech for 2 different voice-text pairs
- Use male voice (M1.json) for the first text
- Use female voice (F1.json) for the second text
- Process both samples in a single batch

### Example 3: High Quality Inference
Increase denoising steps for better quality:
```bash
mvn exec:java -Dexec.args="--total-step 10 --voice-style assets/voice_styles/M1.json --text 'Increasing the number of denoising steps improves the output fidelity and overall quality.'"
```

This will:
- Use 10 denoising steps instead of the default 5
- Produce higher quality output at the cost of slower inference

**Note**: If your text contains apostrophes, use escaping or run the JAR directly:
```bash
java -jar target/tts-example.jar --total-step 10 --text "Text with apostrophe's here"
```

## Building a Fat JAR

To create a standalone JAR with all dependencies:
```bash
mvn clean package
```

Then run it directly:
```bash
java -jar target/tts-example.jar
```

Or with arguments:
```bash
java -jar target/tts-example.jar --total-step 10 --text "Your custom text here"
```

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
- **Voice Styles**: Uses pre-extracted voice style JSON files for fast inference

