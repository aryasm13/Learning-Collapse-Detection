import argparse
import os
import sys
import pandas as pd
from core.behavior_model import BehaviorModel
from core.collapse_detector import CollapseDetector
from ingest.simulator import ClickstreamSimulator
from ingest.database import DatabaseIngest
from stream.realtime_engine import RealtimeEngine
from stream.transformer import Transformer

def setup_spark():
    try:
        from pyspark.sql import SparkSession
        return SparkSession.builder \
            .appName("AcademicWorkloadPipeline") \
            .config("spark.sql.adaptive.enabled", "true") \
            .getOrCreate()
    except ImportError:
        return None

def run_simulate(args):
    print("Running Simulator Ingestion...")
    simulator = ClickstreamSimulator()
    raw_data_path = "output/raw_simulated.csv"
    simulator.generate_events(raw_data_path)
    
    spark = setup_spark() if not args.simple else None
    
    if spark:
        print("Using PySpark for processing...")
        df = spark.read.option("header", "true").csv(raw_data_path)
        engine = RealtimeEngine(spark)
        transformed_df = engine.transform(df)
        model = BehaviorModel(spark)
        features = model.extract_features(transformed_df)
        vectorized = model.vectorize(features)
        detector = CollapseDetector(spark)
        predictions = detector.predict(vectorized)
        predictions.coalesce(1).write.mode("overwrite").option("header", "true").csv("output/predictions")
    else:
        print("Using Pandas for processing (Simple Mode)...")
        df = pd.read_csv(raw_data_path)
        transformer = Transformer()
        events = df.to_dict('records')
        transformed_df = transformer.transform_batch(events)
        model = BehaviorModel()
        features = model.extract_features_pandas(transformed_df)
        detector = CollapseDetector()
        predictions = detector.predict_pandas(features)
        predictions.to_csv("output/predictions.csv", index=False)
        
    print("Simulation complete. Results in output/predictions")

def run_database(args):
    print("Running Database Ingestion...")
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL not set")
        return
        
    ingest = DatabaseIngest(db_url)
    events = ingest.fetch_events()
    
    transformer = Transformer()
    df_transformed = transformer.transform_batch(events)
    df_transformed.to_csv("output/database_transformed.csv", index=False)
    
    spark = setup_spark() if not args.simple else None
    
    if spark:
        print("Using PySpark for processing...")
        spark_df = spark.read.option("header", "true").csv("output/database_transformed.csv")
        model = BehaviorModel(spark)
        features = model.extract_features(spark_df)
        vectorized = model.vectorize(features)
        detector = CollapseDetector(spark)
        predictions = detector.predict(vectorized)
        predictions.coalesce(1).write.mode("overwrite").option("header", "true").csv("output/database_predictions")
    else:
        print("Using Pandas for processing (Simple Mode)...")
        model = BehaviorModel()
        features = model.extract_features_pandas(df_transformed)
        detector = CollapseDetector()
        predictions = detector.predict_pandas(features)
        predictions.to_csv("output/database_predictions.csv", index=False)
        
    print("Database integration complete.")

def run_stream(args):
    print("Running Real-time Streaming Engine...")
    spark = setup_spark()
    if not spark:
        print("Error: PySpark required for streaming mode.")
        return
        
    engine = RealtimeEngine(spark)
    input_df = engine.read_stream("stream_folder/")
    transformed_df = engine.transform(input_df)
    query = engine.write_stream(transformed_df, "output/streaming", "output/checkpoints")
    query.awaitTermination()

def main():
    parser = argparse.ArgumentParser(description="Academic Workload Simulator Pipeline")
    parser.add_argument("mode", choices=["simulate", "database", "stream"])
    parser.add_argument("--simple", action="store_true", help="Run without PySpark using pandas fallback")
    args = parser.parse_args()
    
    if not os.path.exists("output"):
        os.makedirs("output")
        
    if args.mode == "simulate":
        run_simulate(args)
    elif args.mode == "database":
        run_database(args)
    elif args.mode == "stream":
        run_stream(args)

if __name__ == "__main__":
    main()
