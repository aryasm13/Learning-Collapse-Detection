class RealtimeEngine:
    """Spark Structured Streaming engine for clickstream processing."""
    
    def __init__(self, spark, course_start_date: str = "2023-09-01"):
        from pyspark.sql.types import StructType, StructField, IntegerType, StringType
        self.spark = spark
        self.course_start_date = course_start_date
        self.schema = StructType([
            StructField("id_student", IntegerType(), True),
            StructField("timestamp", StringType(), True),
            StructField("id_site", IntegerType(), True),
            StructField("action", StringType(), True),
            StructField("click_count", IntegerType(), True)
        ])

    def read_stream(self, path: str):
        return self.spark.readStream \
            .option("header", "true") \
            .schema(self.schema) \
            .csv(path)

    def transform(self, df):
        """Standard transformation for streaming data."""
        from pyspark.sql.functions import col, datediff, to_date, lit
        return df.withColumn("date", 
                    datediff(to_date(col("timestamp")), 
                            to_date(lit(self.course_start_date)))) \
                .select(
                    col("id_student"),
                    col("date"),
                    col("id_site"),
                    col("click_count").alias("sum_click")
                ).filter(col("sum_click") > 0)

    def write_stream(self, df, output_path: str, checkpoint_path: str):
        return df.writeStream \
            .outputMode("append") \
            .option("header", "true") \
            .option("checkpointLocation", checkpoint_path) \
            .csv(output_path)
