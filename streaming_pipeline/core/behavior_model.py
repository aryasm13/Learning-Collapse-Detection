import pandas as pd
import numpy as np
from typing import Optional

class BehaviorModel:
    """Core logic for student behavior feature engineering."""
    
    def __init__(self, spark=None):
        self.spark = spark
    
    def extract_features_pandas(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create student-level features using pandas (No Spark fallback)."""
        # Ensure correct types
        df['sum_click'] = df['sum_click'].astype(int)
        df['date'] = df['date'].astype(int)
        
        # Basic aggregation
        student_features = df.groupby('id_student').agg({
            'sum_click': 'sum',
            'date': 'nunique',
            'id_site': 'count'
        }).reset_index()
        
        student_features.columns = ['id_student', 'total_clicks', 'active_days', 'total_events']
        
        # Calculate activity variance
        daily_activity = df.groupby(['id_student', 'date'])['sum_click'].sum().reset_index()
        variance_df = daily_activity.groupby('id_student')['sum_click'].var().reset_index()
        variance_df.columns = ['id_student', 'activity_variance']
        
        # Merge results
        features = student_features.merge(variance_df, on='id_student', how='left').fillna(0)
        
        # Add engagement metrics
        features['clicks_per_day'] = features['total_clicks'] / (features['active_days'] + 1)
        
        # Create feature vector string for consistency
        features['features'] = features.apply(
            lambda r: f"[{r['total_clicks']:.1f},{r['active_days']:.1f},{r['activity_variance']:.1f}]", 
            axis=1
        )
        
        return features

    def extract_features(self, df):
        """Create student-level features matching the expected ML schema (Spark)."""
        from pyspark.sql.functions import col, sum, countDistinct, count, stddev
        
        # Basic aggregation
        student_features = df.groupBy("id_student").agg(
            sum("sum_click").alias("total_clicks"),
            countDistinct("date").alias("active_days"),
            count("id_site").alias("total_events")
        )
        
        # Calculate activity variance
        daily_activity = df.groupBy("id_student", "date").agg(sum("sum_click").alias("daily_clicks"))
        variance_df = daily_activity.groupBy("id_student").agg(stddev("daily_clicks").alias("activity_variance"))
        variance_df = variance_df.na.fill(0, subset=["activity_variance"])
        
        # Join variance back
        student_features = student_features.join(variance_df, "id_student", "left").na.fill(0)
        
        # Add engagement metrics
        student_features = student_features.withColumn(
            "clicks_per_day", 
            col("total_clicks") / (col("active_days") + 1)
        )
        
        return student_features

    def vectorize(self, df):
        """Create feature vector for ML model input."""
        from pyspark.ml.feature import VectorAssembler
        feature_cols = ["total_clicks", "active_days", "activity_variance"]
        assembler = VectorAssembler(inputCols=feature_cols, outputCol="features", handleInvalid="skip")
        return assembler.transform(df)
