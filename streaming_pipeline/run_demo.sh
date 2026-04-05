#!/bin/bash
# Enhanced Clickstream ML Pipeline - Launcher (Linux/Mac)
# This script runs the refactored 4-layer architecture via run.py

echo "=========================================="
echo "Clickstream ML Pipeline Launcher"
echo "=========================================="

# Configuration
DEMO_MODE="simulate"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --mode)
            DEMO_MODE="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --mode simulate     Run with simulated data (default)"
            echo "  --mode database     Run with real data from database"
            echo "  --mode stream       Run real-time streaming engine"
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

echo "Configuration:"
echo "  Mode: $DEMO_MODE"
echo ""

# Check if run.py exists
if [ ! -f "run.py" ]; then
    echo "Error: run.py not found. Please ensure you are in the streaming_pipeline directory."
    exit 1
fi

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not installed."
    exit 1
fi

# Check Spark installation
if [ -z "$SPARK_HOME" ]; then
    echo "Warning: SPARK_HOME environment variable not set."
    echo "Please ensure Apache Spark is installed and SPARK_HOME is set for full features."
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create output directory
mkdir -p output

# Run the pipeline
echo "Starting pipeline [$DEMO_MODE]..."
echo ""

python3 run.py $DEMO_MODE

echo ""
echo "=========================================="
echo "Process Completed"
echo "=========================================="

if [ -d "output" ]; then
    echo "Results generated in output/ directory."
fi
