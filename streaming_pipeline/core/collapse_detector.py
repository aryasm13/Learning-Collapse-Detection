import pandas as pd
import numpy as np
import os
from typing import Optional

class CollapseDetector:
    """Core logic for prediction and collapse detection."""
    
    def __init__(self, spark=None, model_path: str = None):
        self.spark = spark
        self.model = None
        if model_path and os.path.exists(model_path) and spark:
            try:
                from pyspark.ml.clustering import KMeansModel
                self.model = KMeansModel.load(model_path)
            except ImportError:
                print("PySpark not found. Using fallback logic.")

    def predict_pandas(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply simple rule-based logic using pandas."""
        # Fallback rule-based clustering if no Spark model is available
        df['prediction'] = df['total_clicks'].apply(
            lambda x: 0 if x < 800 else (1 if x < 2000 else 2)
        )
        
        df['cluster_label'] = df['prediction'].map({
            0: "At Risk - Low Engagement",
            1: "Moderate Engagement",
            2: "High Engagement"
        })
        
        return df

    def predict(self, df):
        """Apply the KMeans model (Spark) or fallback to rule-based logic."""
        from pyspark.sql.functions import when, col
        
        if self.model:
            predictions = self.model.transform(df)
        else:
            # Fallback rule-based clustering if no model is found
            predictions = df.withColumn(
                "prediction",
                when(col("total_clicks") < 800, 0)
                .when(col("total_clicks") < 2000, 1)
                .otherwise(2)
            )
        
        return predictions.withColumn(
            "cluster_label",
            when(col("prediction") == 0, "At Risk - Low Engagement")
            .when(col("prediction") == 1, "Moderate Engagement")
            .otherwise("High Engagement")
        )
