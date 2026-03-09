import pandas as pd

# Load dataset
df = pd.read_csv("collapse_analysis.csv")

print("Dataset loaded:", df.shape)

# Calculate engagement intensity
df["clicks_per_day"] = df["total_clicks"] / (df["active_days"] + 1)

# Cluster Result Distribution
cluster_stats = df.groupby("prediction")["final_result"].value_counts().unstack().fillna(0)

print("\nCluster Result Distribution")
print(cluster_stats)

# Collapse Ratio per Cluster
cluster_stats["collapse_ratio"] = (
    cluster_stats.get("Fail",0) +
    cluster_stats.get("Withdrawn",0)
) / cluster_stats.sum(axis=1)

print("\nCollapse Ratio by Cluster")
print(cluster_stats["collapse_ratio"])

# Identify collapse cluster automatically
collapse_cluster = cluster_stats["collapse_ratio"].idxmax()

print("\nDetected Collapse Cluster:", collapse_cluster)

# Students in collapse cluster
collapse_students = df[df["prediction"] == collapse_cluster]

print("\nStudents in Collapse Cluster:", len(collapse_students))

# Distribution inside collapse cluster
result_counts = collapse_students["final_result"].value_counts()

print("\nFinal Result Distribution inside Collapse Cluster:")
print(result_counts)

# Collapse detection rate
fail_withdrawn = result_counts.get("Fail",0) + result_counts.get("Withdrawn",0)

collapse_rate = fail_withdrawn / len(collapse_students)

print("\nCollapse Detection Rate:", round(collapse_rate,3))

# Coverage of failing students
dataset_fail_withdrawn = df[df["final_result"].isin(["Fail","Withdrawn"])]

coverage = len(
collapse_students[
collapse_students["final_result"].isin(["Fail","Withdrawn"])
]) / len(dataset_fail_withdrawn)

print("Coverage of actual failing students:", round(coverage,3))

print("\nInterpretation:")
print("Cluster with highest Fail/Withdrawn ratio is identified as collapse cluster.")