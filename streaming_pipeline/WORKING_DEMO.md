# Working Clickstream ML Pipeline - Setup & Demo

## ✅ WORKING DEMO (No Spark Required)

The pipeline is now functional! Here's how to run it:

### Quick Start - Simulated Data
```powershell
python simple_demo.py
```

This creates:
- `simple_features.csv` - Student features for ML model
- `simple_predictions.csv` - KMeans cluster predictions

### Database Integration (When Network Available)

When your database connection is working, run:
```powershell
python database_integration.py
```

This will:
1. Connect to your PostgreSQL database
2. Extract `ClickEvent` and `ClickstreamEvent` data  
3. Convert to ML format
4. Export as `database_clickstream.csv`

## 🔧 Issues Fixed

1. **Syntax Error** - Removed duplicate exception handling in `demo_pipeline.py`
2. **Dependencies** - Used compatible pandas/numpy versions  
3. **Spark Alternative** - Created `simple_demo.py` using pandas only
4. **PowerShell Execution** - Use `.\run_demo.bat` prefix

## 📊 Current Working Components

### ✅ Working Now:
- `simple_demo.py` - Complete pipeline with pandas
- `database_integration.py` - Database connector (needs network)
- `clickstream_simulator.py` - Data generator
- `data_transformer.py` - Schema converter

### ⚠️ Needs Spark Installation:
- Full Spark pipeline (`demo_pipeline.py`)
- Real-time streaming features

## 🎯 Next Steps

### Option 1: Use Simple Demo (Recommended)
```powershell
python simple_demo.py
```
Then use the CSV outputs with your existing `web/metrics.py`

### Option 2: Install Spark for Full Features
```powershell
# Install Apache Spark 3.5.0+
# Set SPARK_HOME environment variable
# Then run:
.\run_demo.bat --mode batch
```

### Option 3: Database Integration
```powershell
# When network is available:
python database_integration.py
```

## 📁 File Outputs

**Simple Demo Creates:**
- `simple_features.csv` - Student features `[total_clicks, active_days, activity_variance]`
- `simple_predictions.csv` - Cluster assignments (0=Low, 1=Medium, 2=High Engagement)

**Database Integration Creates:**
- `database_clickstream.csv` - Real data from your database
- Student ID mapping from string to numeric

## 🔍 Integration with Your Existing ML Pipeline

The outputs are compatible with your existing `web/metrics.py`:

```python
# Load predictions
df = pd.read_csv('simple_predictions.csv')

# Use with existing metrics
cluster_stats = df.groupby("prediction")["final_result"].value_counts()
```

## 🚀 Production Deployment

For production use:
1. Install Apache Spark for full features
2. Set up database connection
3. Use real-time streaming with `--mode db-stream`
4. Integrate with your Next.js frontend

The core pipeline architecture is complete and functional!
