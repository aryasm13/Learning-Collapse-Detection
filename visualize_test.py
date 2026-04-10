import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import os

# -----------------------------
# Load Data
# -----------------------------
df = pd.read_csv("final_clickstream_output.csv")

print("Dataset shape:", df.shape)
print(df.head())

# -----------------------------
# Create graphs folder
# -----------------------------
if not os.path.exists("graphs_test"):
    os.makedirs("graphs_test")

# -----------------------------
# 1. Cluster Distribution
# -----------------------------
plt.figure(figsize=(6,4))
sns.countplot(x="prediction", data=df)
plt.title("Cluster Distribution (Clickstream Data)")
plt.xlabel("Cluster ID")
plt.ylabel("Number of Students")
plt.savefig("graphs_test/cluster_distribution.png")
plt.close()

# -----------------------------
# 2. Engagement vs Active Days
# -----------------------------
plt.figure(figsize=(6,4))
sns.scatterplot(
    x="total_clicks",
    y="active_days",
    hue="prediction",
    data=df
)
plt.title("Engagement vs Active Days")
plt.savefig("graphs_test/engagement_vs_days.png")
plt.close()

# -----------------------------
# 3. Activity Variance vs Clicks
# -----------------------------
plt.figure(figsize=(6,4))
sns.scatterplot(
    x="activity_variance",
    y="total_clicks",
    hue="prediction",
    data=df
)
plt.title("Activity Instability vs Engagement")
plt.savefig("graphs_test/variance_vs_clicks.png")
plt.close()

# -----------------------------
# 4. Cluster vs Total Events
# -----------------------------
plt.figure(figsize=(6,4))
sns.boxplot(x="prediction", y="total_events", data=df)
plt.title("Cluster vs Total Events")
plt.savefig("graphs_test/events_distribution.png")
plt.close()

# -----------------------------
# 5. Feature Correlation Heatmap
# -----------------------------
plt.figure(figsize=(6,4))
corr = df[["total_clicks","active_days","activity_variance"]].corr()
sns.heatmap(corr, annot=True)
plt.title("Feature Correlation")
plt.savefig("graphs_test/correlation_heatmap.png")
plt.close()

# -----------------------------
# 6. Average Feature Values per Cluster
# -----------------------------
cluster_means = df.groupby("prediction")[["total_clicks","active_days","activity_variance"]].mean()

cluster_means.plot(kind="bar", figsize=(8,5))
plt.title("Average Behaviour per Cluster")
plt.ylabel("Value")
plt.savefig("graphs_test/cluster_means.png")
plt.close()

print("All graphs saved inside 'graphs_test' folder.")