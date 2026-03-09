import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import os

# Load dataset
df = pd.read_csv("collapse_analysis.csv")

print("Dataset shape:", df.shape)
print(df.head())

# Create engagement intensity feature
df["clicks_per_day"] = df["total_clicks"] / (df["active_days"] + 1)

# Create graphs folder if it does not exist
if not os.path.exists("graphs"):
    os.makedirs("graphs")

# Cluster label mapping
cluster_map = {
    0: "Cluster 0 - Low Engagement",
    1: "Cluster 1 - Moderate Engagement",
    2: "Cluster 2 - High Engagement"
}

df["cluster_label"] = df["prediction"].map(cluster_map)

# 1 Cluster Distribution
plt.figure(figsize=(7,5))
sns.countplot(x="cluster_label", data=df)
plt.title("Student Behaviour Cluster Distribution")
plt.xlabel("Cluster")
plt.ylabel("Number of Students")
plt.tight_layout()
plt.savefig("graphs/graphs_cluster_distribution.png")
plt.close()

# 2 Engagement vs Active Days
plt.figure(figsize=(7,5))
sns.scatterplot(
    x="total_clicks",
    y="active_days",
    hue="cluster_label",
    data=df,
    alpha=0.6
)

plt.title("Student Engagement vs Active Days")
plt.xlabel("Total Clicks")
plt.ylabel("Active Days")
plt.tight_layout()
plt.savefig("graphs/graphs_engagement_vs_active_days.png")
plt.close()

# 3 Activity Variance vs Engagement
plt.figure(figsize=(7,5))

sns.scatterplot(
    x="activity_variance",
    y="total_clicks",
    hue="cluster_label",
    data=df,
    alpha=0.6
)

plt.title("Activity Variance vs Engagement")
plt.xlabel("Activity Variance")
plt.ylabel("Total Clicks")
plt.tight_layout()
plt.savefig("graphs/graphs_activity_variance_vs_engagement.png")
plt.close()

# 4 Cluster vs Final Result
plt.figure(figsize=(7,5))

sns.countplot(
    x="final_result",
    hue="cluster_label",
    data=df
)

plt.title("Cluster vs Final Result")
plt.xlabel("Final Result")
plt.ylabel("Number of Students")
plt.tight_layout()
plt.savefig("graphs/graphs_cluster_vs_final_result.png")
plt.close()

# 5 Feature Correlation Heatmap
plt.figure(figsize=(6,5))

corr = df[[
    "total_clicks",
    "active_days",
    "activity_variance",
    "clicks_per_day"
]].corr()

sns.heatmap(
    corr,
    annot=True,
    cmap="Blues",
    fmt=".2f"
)

plt.title("Feature Correlation Heatmap")
plt.tight_layout()
plt.savefig("graphs/graphs_feature_correlation_heatmap.png")
plt.close()

# 6) Average Engagement per Cluster
plt.figure(figsize=(7,5))

df.groupby("cluster_label")["total_clicks"].mean().plot(kind="bar")

plt.title("Average Engagement per Cluster")
plt.xlabel("Cluster")
plt.ylabel("Average Total Clicks")
plt.tight_layout()
plt.savefig("graphs/graphs_avg_engagement_cluster.png")
plt.close()

print("Graphs saved successfully.")