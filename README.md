# Academic Workload Simulator Pipeline

A clean, 4-layer production-style pipeline for clickstream ingestion, transformation, and learning collapse detection.

## Web Architecture

```
streaming_pipeline/
├── core/             # ML Logic & Feature Engineering
├── ingest/           # Data Source Connectors (Simulated & DB)
├── stream/           # Spark Streaming & Transformation Engine
├── output/           # Centralized Results (Predictions, Features)
└── run.py            # Unified Entry Point
```

## Getting Started

### 1. Prerequisites
- Python 3.8+
- Apache Spark 3.5.0+ (for full features)
- Java 8/11 (for Spark)

### 2. Installation
```powershell
pip install -r requirements.txt
```

### 3. Usage

Run the pipeline using the unified launcher:

**Windows:**
```powershell
.\run_demo.bat --mode <mode>
```

**Linux/Mac:**
```bash
./run_demo.sh --mode <mode>
```

#### Available Modes:
- `simulate`: Runs end-to-end demo with generated synthetic data.
- `database`: Pulls real clickstream data from your production database.
- `stream`: Starts the real-time Spark Structured Streaming engine.

## Data Flow

1. **Ingest**: Raw events from `ingest/simulator.py` or `ingest/database.py`.
2. **Transform**: Timestamps converted to relative course days in `stream/transformer.py`.
3. **Core**: Features engineered in `core/behavior_model.py` and passed to `core/collapse_detector.py`.
4. **Output**: Results saved to `output/predictions.csv`.

## Configuration
- **Database**: Set `DATABASE_URL` environment variable for real data extraction.
- **Spark**: Ensure `SPARK_HOME` is set for streaming and distributed processing.

## Verification
After running, check the `output/` directory:
- `raw_simulated.csv`: Raw events generated.
- `predictions/`: KMeans cluster assignments and risk labels.

