package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	ort "github.com/yalue/onnxruntime_go"
)

// Args holds command line arguments
type Args struct {
	useGPU      bool
	onnxDir     string
	totalStep   int
	nTest       int
	voiceStyle  []string
	text        []string
	saveDir     string
}

func parseArgs() *Args {
	args := &Args{}

	flag.BoolVar(&args.useGPU, "use-gpu", false, "Use GPU for inference (default: CPU)")
	flag.StringVar(&args.onnxDir, "onnx-dir", "assets/onnx", "Path to ONNX model directory")
	flag.IntVar(&args.totalStep, "total-step", 5, "Number of denoising steps")
	flag.IntVar(&args.nTest, "n-test", 4, "Number of times to generate")
	flag.StringVar(&args.saveDir, "save-dir", "results", "Output directory")

	var voiceStyleStr, textStr string
	flag.StringVar(&voiceStyleStr, "voice-style", "assets/voice_styles/M1.json", "Voice style file path(s), comma-separated")
	flag.StringVar(&textStr, "text", "This morning, I took a walk in the park, and the sound of the birds and the breeze was so pleasant that I stopped for a long time just to listen.", "Text(s) to synthesize, pipe-separated")

	flag.Parse()

	// Parse comma-separated voice-style
	if voiceStyleStr != "" {
		args.voiceStyle = strings.Split(voiceStyleStr, ",")
		for i := range args.voiceStyle {
			args.voiceStyle[i] = strings.TrimSpace(args.voiceStyle[i])
		}
	}

	// Parse pipe-separated text
	if textStr != "" {
		args.text = strings.Split(textStr, "|")
		for i := range args.text {
			args.text[i] = strings.TrimSpace(args.text[i])
		}
	}

	return args
}

func main() {
	fmt.Println("=== TTS Inference with ONNX Runtime (Go) ===\n")

	// --- 1. Parse arguments --- //
	args := parseArgs()
	totalStep := args.totalStep
	nTest := args.nTest
	saveDir := args.saveDir
	voiceStylePaths := args.voiceStyle
	textList := args.text

	if len(voiceStylePaths) != len(textList) {
		fmt.Printf("Error: Number of voice styles (%d) must match number of texts (%d)\n",
			len(voiceStylePaths), len(textList))
		os.Exit(1)
	}

	bsz := len(voiceStylePaths)

	// Initialize ONNX Runtime
	if err := InitializeONNXRuntime(); err != nil {
		fmt.Printf("Error initializing ONNX Runtime: %v\n", err)
		os.Exit(1)
	}
	defer ort.DestroyEnvironment()

	// --- 2. Load config --- //
	cfg, err := LoadCfgs(args.onnxDir)
	if err != nil {
		fmt.Printf("Error loading config: %v\n", err)
		os.Exit(1)
	}

	// --- 3. Load TTS components --- //
	textToSpeech, err := LoadTextToSpeech(args.onnxDir, args.useGPU, cfg)
	if err != nil {
		fmt.Printf("Error loading TTS components: %v\n", err)
		os.Exit(1)
	}
	defer textToSpeech.Destroy()

	// --- 4. Load voice styles --- //
	style, err := LoadVoiceStyle(voiceStylePaths, true)
	if err != nil {
		fmt.Printf("Error loading voice styles: %v\n", err)
		os.Exit(1)
	}
	defer style.Destroy()

	// --- 5. Synthesize speech --- //
	if err := os.MkdirAll(saveDir, 0755); err != nil {
		fmt.Printf("Error creating save directory: %v\n", err)
		os.Exit(1)
	}

	for n := 0; n < nTest; n++ {
		fmt.Printf("\n[%d/%d] Starting synthesis...\n", n+1, nTest)

		var wav []float32
		var duration []float32
		Timer("Generating speech from text", func() interface{} {
			w, d, err := textToSpeech.Call(textList, style, totalStep)
			if err != nil {
				fmt.Printf("Error generating speech: %v\n", err)
				os.Exit(1)
			}
			wav = w
			duration = d
			return nil
		})

		// Save outputs
		for i := 0; i < bsz; i++ {
			fname := fmt.Sprintf("%s_%d.wav", sanitizeFilename(textList[i], 20), n+1)
			wavOut := extractWavSegment(wav, duration[i], textToSpeech.SampleRate, i, bsz)
			
			outputPath := filepath.Join(saveDir, fname)
			if err := writeWavFile(outputPath, wavOut, textToSpeech.SampleRate); err != nil {
				fmt.Printf("Error writing wav file: %v\n", err)
				continue
			}
			fmt.Printf("Saved: %s\n", outputPath)
		}
	}

	fmt.Println("\n=== Synthesis completed successfully! ===")
}
