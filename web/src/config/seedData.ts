import type { AssessmentType } from "@/lib/data/types";

export type SeedCourse = {
  title: string;
  description: string;
  modules: Array<{
    week: number;
    order: number;
    title: string;
    assessments: Array<{
      type: AssessmentType;
      title: string;
      time_limit_seconds: number;
      max_questions: number;
      questions: Array<{
        question: string;
        options: string[];
        correct_answer: string;
      }>;
    }>;
  }>;
};

export const seedCourses: SeedCourse[] = [
  {
    title: "Machine Learning Techniques",
    description:
      "A workload-focused simulation of ML study patterns: practice, pacing, and assessment pressure.",
    modules: [
      {
        week: 1,
        order: 1,
        title: "Supervised learning foundations",
        assessments: [
          {
            type: "quiz",
            title: "Week 1 quiz · Supervised learning",
            time_limit_seconds: 300,
            max_questions: 5,
            questions: [
              {
                question:
                  "Which setup best describes supervised learning?",
                options: [
                  "Learning patterns from labeled input-output pairs",
                  "Finding structure without labels",
                  "Optimizing a policy via rewards",
                  "Compressing data into fewer dimensions",
                ],
                correct_answer: "Learning patterns from labeled input-output pairs",
              },
              {
                question:
                  "Logistic regression is typically used for:",
                options: [
                  "Clustering",
                  "Binary classification",
                  "Dimensionality reduction",
                  "Time series decomposition",
                ],
                correct_answer: "Binary classification",
              },
              {
                question:
                  "Overfitting most directly indicates:",
                options: [
                  "Poor performance on training and test data",
                  "Good generalization to unseen data",
                  "Very low training error but high test error",
                  "A model that is too simple",
                ],
                correct_answer: "Very low training error but high test error",
              },
              {
                question:
                  "A typical purpose of regularization is to:",
                options: [
                  "Increase feature variance",
                  "Reduce overfitting by penalizing complexity",
                  "Guarantee perfect accuracy",
                  "Replace cross-validation",
                ],
                correct_answer: "Reduce overfitting by penalizing complexity",
              },
              {
                question:
                  "Which metric is often preferred for imbalanced classes?",
                options: ["Accuracy", "MSE", "Precision/Recall", "R-squared"],
                correct_answer: "Precision/Recall",
              },
              {
                question:
                  "A confusion matrix summarizes:",
                options: [
                  "Distances between clusters",
                  "Classification outcomes by class (TP/FP/TN/FN)",
                  "Feature correlations only",
                  "Gradient magnitudes during training",
                ],
                correct_answer:
                  "Classification outcomes by class (TP/FP/TN/FN)",
              },
              {
                question:
                  "A key risk of data leakage is:",
                options: [
                  "The model is under-parameterized",
                  "The test set influences training decisions",
                  "The optimizer diverges",
                  "Labels are missing in training",
                ],
                correct_answer: "The test set influences training decisions",
              },
              {
                question:
                  "Train/validation/test splits are used to:",
                options: [
                  "Increase dataset size",
                  "Measure generalization and tune choices safely",
                  "Guarantee no bias",
                  "Avoid the need for preprocessing",
                ],
                correct_answer:
                  "Measure generalization and tune choices safely",
              },
            ],
          },
        ],
      },
      {
        week: 2,
        order: 1,
        title: "Model evaluation & tuning",
        assessments: [
          {
            type: "quiz",
            title: "Week 2 quiz · Evaluation",
            time_limit_seconds: 300,
            max_questions: 5,
            questions: [
              {
                question: "Cross-validation is mainly used to:",
                options: [
                  "Increase dataset size",
                  "Tune hyperparameters robustly",
                  "Reduce number of features",
                  "Normalize input data",
                ],
                correct_answer: "Tune hyperparameters robustly",
              },
              {
                question: "AUC-ROC captures:",
                options: [
                  "Calibration error only",
                  "Tradeoff between TPR and FPR across thresholds",
                  "Mean absolute error",
                  "Variance explained",
                ],
                correct_answer:
                  "Tradeoff between TPR and FPR across thresholds",
              },
              {
                question: "A high-variance model typically:",
                options: [
                  "Underfits training data",
                  "Overfits and is sensitive to data changes",
                  "Has no hyperparameters",
                  "Cannot be regularized",
                ],
                correct_answer: "Overfits and is sensitive to data changes",
              },
              {
                question: "Early stopping is used to:",
                options: [
                  "Increase model capacity",
                  "Avoid overfitting by stopping when validation degrades",
                  "Guarantee higher training accuracy",
                  "Remove the need for a validation set",
                ],
                correct_answer:
                  "Avoid overfitting by stopping when validation degrades",
              },
              {
                question: "Grid search differs from random search because it:",
                options: [
                  "Samples hyperparameters uniformly at random",
                  "Enumerates a fixed set of combinations",
                  "Requires no validation set",
                  "Only works for linear models",
                ],
                correct_answer: "Enumerates a fixed set of combinations",
              },
              {
                question: "Calibration refers to:",
                options: [
                  "The ordering of predicted probabilities only",
                  "Whether predicted probabilities match observed frequencies",
                  "The number of trees in a forest",
                  "The batch size used in training",
                ],
                correct_answer:
                  "Whether predicted probabilities match observed frequencies",
              },
              {
                question: "Precision answers:",
                options: [
                  "Of actual positives, how many were found?",
                  "Of predicted positives, how many were correct?",
                  "How many negatives were correctly rejected?",
                  "How correlated the features are",
                ],
                correct_answer:
                  "Of predicted positives, how many were correct?",
              },
              {
                question: "Recall answers:",
                options: [
                  "Of actual positives, how many were found?",
                  "Of predicted positives, how many were correct?",
                  "How long training took",
                  "How stable gradients are",
                ],
                correct_answer: "Of actual positives, how many were found?",
              },
            ],
          },
        ],
      },
      {
        week: 3,
        order: 1,
        title: "Unsupervised learning & clustering",
        assessments: [
          {
            type: "quiz",
            title: "Week 3 quiz · Clustering",
            time_limit_seconds: 300,
            max_questions: 5,
            questions: [
              {
                question: "K-means attempts to minimize:",
                options: [
                  "Within-cluster sum of squared distances",
                  "Between-cluster variance only",
                  "Cross-entropy loss",
                  "Classification error rate",
                ],
                correct_answer:
                  "Within-cluster sum of squared distances",
              },
              {
                question:
                  "A common weakness of k-means is that it:",
                options: [
                  "Requires labeled data",
                  "Assumes spherical clusters and a chosen k",
                  "Cannot scale to many points",
                  "Never converges",
                ],
                correct_answer:
                  "Assumes spherical clusters and a chosen k",
              },
              {
                question: "PCA is used primarily for:",
                options: [
                  "Clustering only",
                  "Dimensionality reduction",
                  "Binary classification",
                  "Ensemble stacking",
                ],
                correct_answer: "Dimensionality reduction",
              },
              {
                question: "Silhouette score measures:",
                options: [
                  "Cluster cohesion and separation",
                  "Classifier accuracy",
                  "Model calibration",
                  "Gradient stability",
                ],
                correct_answer: "Cluster cohesion and separation",
              },
              {
                question: "DBSCAN is useful when clusters are:",
                options: [
                  "Always spherical",
                  "Arbitrarily shaped with noise points",
                  "Linearly separable",
                  "Ordered by time",
                ],
                correct_answer: "Arbitrarily shaped with noise points",
              },
              {
                question: "Hierarchical clustering produces:",
                options: [
                  "A single flat partition only",
                  "A dendrogram (tree of merges/splits)",
                  "Only k clusters",
                  "Only density estimates",
                ],
                correct_answer: "A dendrogram (tree of merges/splits)",
              },
              {
                question: "Feature scaling matters for k-means because:",
                options: [
                  "It changes labels directly",
                  "Distance metrics are scale-sensitive",
                  "It increases dataset size",
                  "It removes outliers automatically",
                ],
                correct_answer: "Distance metrics are scale-sensitive",
              },
              {
                question: "A centroid in k-means is:",
                options: [
                  "A randomly chosen training label",
                  "The mean of points in a cluster",
                  "The farthest point from all others",
                  "A decision boundary",
                ],
                correct_answer: "The mean of points in a cluster",
              },
            ],
          },
        ],
      },
      {
        week: 4,
        order: 1,
        title: "Ensembles & wrap-up",
        assessments: [
          {
            type: "quiz",
            title: "Week 4 quiz · Ensembles",
            time_limit_seconds: 300,
            max_questions: 5,
            questions: [
              {
                question: "Bagging primarily reduces:",
                options: [
                  "Bias",
                  "Variance",
                  "The number of features",
                  "The need for validation",
                ],
                correct_answer: "Variance",
              },
              {
                question: "Boosting builds models that:",
                options: [
                  "Train independently in parallel",
                  "Correct errors of prior learners sequentially",
                  "Require no hyperparameters",
                  "Only do clustering",
                ],
                correct_answer:
                  "Correct errors of prior learners sequentially",
              },
              {
                question: "Random forests combine:",
                options: [
                  "Neural nets with SVMs",
                  "Many decision trees with feature randomness",
                  "Only linear models",
                  "Only k-means results",
                ],
                correct_answer:
                  "Many decision trees with feature randomness",
              },
              {
                question: "A common ensemble strategy is to:",
                options: [
                  "Use a single model always",
                  "Average or vote across multiple learners",
                  "Remove all regularization",
                  "Avoid cross-validation",
                ],
                correct_answer:
                  "Average or vote across multiple learners",
              },
              {
                question: "Stacking is:",
                options: [
                  "Training one model then discarding it",
                  "Training a meta-model on base model outputs",
                  "Only for unsupervised learning",
                  "A synonym for bagging",
                ],
                correct_answer:
                  "Training a meta-model on base model outputs",
              },
              {
                question: "Ensembles often help because they:",
                options: [
                  "Increase error by design",
                  "Reduce error via diversity across learners",
                  "Eliminate the need for data",
                  "Make labels unnecessary",
                ],
                correct_answer:
                  "Reduce error via diversity across learners",
              },
              {
                question: "A decision stump is:",
                options: [
                  "A deep neural network layer",
                  "A shallow tree with one split",
                  "A clustering centroid",
                  "A feature scaling method",
                ],
                correct_answer: "A shallow tree with one split",
              },
              {
                question: "Out-of-bag evaluation applies to:",
                options: [
                  "Bagging / random forests",
                  "PCA",
                  "K-means",
                  "Logistic regression only",
                ],
                correct_answer: "Bagging / random forests",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Big Data Systems",
    description:
      "A simulation of the cognitive load of distributed systems: throughput, trade-offs, and reliability thinking.",
    modules: [
      {
        week: 1,
        order: 1,
        title: "Data pipelines & ingestion",
        assessments: [
          {
            type: "quiz",
            title: "Week 1 quiz · Ingestion",
            time_limit_seconds: 300,
            max_questions: 5,
            questions: [
              {
                question: "A key difference between batch and streaming is:",
                options: [
                  "Streaming requires files; batch requires events",
                  "Batch processes bounded data; streaming processes unbounded data",
                  "Streaming cannot be fault-tolerant",
                  "Batch cannot scale horizontally",
                ],
                correct_answer:
                  "Batch processes bounded data; streaming processes unbounded data",
              },
              {
                question: "Backpressure helps a system:",
                options: [
                  "Increase memory usage",
                  "Match producer rate to consumer capacity",
                  "Avoid schema evolution",
                  "Guarantee exactly-once without checkpoints",
                ],
                correct_answer: "Match producer rate to consumer capacity",
              },
              {
                question: "Idempotent writes are useful to:",
                options: [
                  "Prevent retries",
                  "Make retries safe without duplicates",
                  "Increase latency",
                  "Avoid monitoring",
                ],
                correct_answer: "Make retries safe without duplicates",
              },
              {
                question: "A message broker is often used to:",
                options: [
                  "Store images only",
                  "Decouple producers and consumers",
                  "Replace databases entirely",
                  "Encrypt all network traffic automatically",
                ],
                correct_answer: "Decouple producers and consumers",
              },
              {
                question: "Schema registry helps with:",
                options: [
                  "UI rendering",
                  "Managing event schema evolution",
                  "GPU acceleration",
                  "Avoiding partitions",
                ],
                correct_answer: "Managing event schema evolution",
              },
              {
                question: "Exactly-once processing typically requires:",
                options: [
                  "No checkpoints",
                  "State + checkpoints + idempotent sinks/transactions",
                  "A single-node deployment",
                  "Disabling retries",
                ],
                correct_answer:
                  "State + checkpoints + idempotent sinks/transactions",
              },
              {
                question: "A partition key is used to:",
                options: [
                  "Encrypt data",
                  "Route events to partitions deterministically",
                  "Remove duplicates",
                  "Compress payloads",
                ],
                correct_answer: "Route events to partitions deterministically",
              },
              {
                question: "At-least-once delivery means:",
                options: [
                  "No duplicates can occur",
                  "Messages may be delivered more than once",
                  "Messages are delivered in order across topics",
                  "Delivery is guaranteed within 1ms",
                ],
                correct_answer: "Messages may be delivered more than once",
              },
            ],
          },
        ],
      },
      {
        week: 2,
        order: 1,
        title: "Distributed storage & consistency",
        assessments: [
          {
            type: "quiz",
            title: "Week 2 quiz · Consistency",
            time_limit_seconds: 300,
            max_questions: 5,
            questions: [
              {
                question: "CAP theorem tradeoff involves:",
                options: [
                  "CPU, cache, and performance",
                  "Consistency, availability, and partition tolerance",
                  "Concurrency, atomicity, and persistence",
                  "Compression, archiving, and privacy",
                ],
                correct_answer:
                  "Consistency, availability, and partition tolerance",
              },
              {
                question: "Eventual consistency means:",
                options: [
                  "Writes are always lost",
                  "Replicas converge over time if no new updates occur",
                  "Reads are always linearizable",
                  "Transactions are never needed",
                ],
                correct_answer:
                  "Replicas converge over time if no new updates occur",
              },
              {
                question: "Quorum reads/writes are used to:",
                options: [
                  "Avoid network partitions",
                  "Balance consistency and availability",
                  "Eliminate replication",
                  "Guarantee zero latency",
                ],
                correct_answer: "Balance consistency and availability",
              },
              {
                question: "Replication factor determines:",
                options: [
                  "Number of indexes",
                  "How many copies of data exist",
                  "The SQL dialect",
                  "How often compaction runs",
                ],
                correct_answer: "How many copies of data exist",
              },
              {
                question: "Leader-follower replication typically provides:",
                options: [
                  "No single point of failure",
                  "A primary write node with replicas for reads/failover",
                  "Only client-side caching",
                  "Zero downtime without any coordination",
                ],
                correct_answer:
                  "A primary write node with replicas for reads/failover",
              },
              {
                question: "Read-your-writes is a form of:",
                options: [
                  "Session consistency",
                  "Hardware acceleration",
                  "Network compression",
                  "Batch scheduling",
                ],
                correct_answer: "Session consistency",
              },
              {
                question: "Consistent hashing helps with:",
                options: [
                  "Reducing rebalancing when nodes change",
                  "Encrypting data at rest",
                  "Increasing single-node throughput",
                  "Avoiding partitions entirely",
                ],
                correct_answer:
                  "Reducing rebalancing when nodes change",
              },
              {
                question: "A write-ahead log is used to:",
                options: [
                  "Render UI faster",
                  "Recover after crashes by replaying writes",
                  "Generate random keys",
                  "Delete old data automatically",
                ],
                correct_answer:
                  "Recover after crashes by replaying writes",
              },
            ],
          },
        ],
      },
      {
        week: 3,
        order: 1,
        title: "Compute frameworks & scheduling",
        assessments: [
          {
            type: "quiz",
            title: "Week 3 quiz · Compute",
            time_limit_seconds: 300,
            max_questions: 5,
            questions: [
              {
                question: "Spark is optimized for:",
                options: [
                  "Single-row SQL only",
                  "In-memory distributed data processing",
                  "Mobile app rendering",
                  "GPU-only workloads",
                ],
                correct_answer:
                  "In-memory distributed data processing",
              },
              {
                question: "A DAG in compute engines represents:",
                options: [
                  "A static UI layout",
                  "A dependency graph of transformations",
                  "A network firewall policy",
                  "A database schema",
                ],
                correct_answer:
                  "A dependency graph of transformations",
              },
              {
                question: "Checkpointing is used to:",
                options: [
                  "Increase CPU clock",
                  "Enable fault tolerance for stateful workloads",
                  "Avoid retries",
                  "Replace monitoring",
                ],
                correct_answer:
                  "Enable fault tolerance for stateful workloads",
              },
              {
                question: "Resource scheduling handles:",
                options: [
                  "Only data formats",
                  "Allocation of CPU/memory across jobs",
                  "User authentication",
                  "Schema evolution",
                ],
                correct_answer:
                  "Allocation of CPU/memory across jobs",
              },
              {
                question: "Stragglers are:",
                options: [
                  "Fast tasks",
                  "Slow tasks that delay job completion",
                  "Unused disks",
                  "Invalid schemas",
                ],
                correct_answer:
                  "Slow tasks that delay job completion",
              },
              {
                question: "Shuffle-heavy workloads often incur:",
                options: [
                  "No network IO",
                  "High network and disk IO",
                  "Only CPU cost",
                  "Only UI latency",
                ],
                correct_answer: "High network and disk IO",
              },
              {
                question: "Speculative execution helps by:",
                options: [
                  "Deleting slow tasks",
                  "Launching duplicates of slow tasks to finish sooner",
                  "Disabling retries",
                  "Reducing partition count",
                ],
                correct_answer:
                  "Launching duplicates of slow tasks to finish sooner",
              },
              {
                question: "Serialization overhead is about:",
                options: [
                  "UI layout",
                  "Cost to encode/decode data between processes",
                  "Network encryption",
                  "Index maintenance",
                ],
                correct_answer:
                  "Cost to encode/decode data between processes",
              },
            ],
          },
        ],
      },
      {
        week: 4,
        order: 1,
        title: "Reliability & observability",
        assessments: [
          {
            type: "quiz",
            title: "Week 4 quiz · Reliability",
            time_limit_seconds: 300,
            max_questions: 5,
            questions: [
              {
                question: "SLOs define:",
                options: [
                  "A deployment strategy",
                  "Target reliability levels for a service",
                  "A database index",
                  "A UI theme",
                ],
                correct_answer:
                  "Target reliability levels for a service",
              },
              {
                question: "Error budget is:",
                options: [
                  "Money spent on outages",
                  "Allowed unreliability within SLO",
                  "Number of servers",
                  "Disk space usage",
                ],
                correct_answer:
                  "Allowed unreliability within SLO",
              },
              {
                question: "Golden signals include:",
                options: [
                  "Latency, traffic, errors, saturation",
                  "Hashing, compression, encryption, caching",
                  "Clustering, PCA, boosting, bagging",
                  "CPU model names only",
                ],
                correct_answer:
                  "Latency, traffic, errors, saturation",
              },
              {
                question: "Tracing helps you:",
                options: [
                  "Style UI components",
                  "Follow a request across services",
                  "Avoid retries",
                  "Increase compression ratio",
                ],
                correct_answer:
                  "Follow a request across services",
              },
              {
                question: "An incident postmortem should be:",
                options: [
                  "Blame-focused",
                  "Learning-focused and actionable",
                  "Secret and undocumented",
                  "Only about performance",
                ],
                correct_answer:
                  "Learning-focused and actionable",
              },
              {
                question: "Alert fatigue happens when:",
                options: [
                  "There are no alerts",
                  "Too many low-signal alerts desensitize responders",
                  "Dashboards are too pretty",
                  "Logs are stored for too long",
                ],
                correct_answer:
                  "Too many low-signal alerts desensitize responders",
              },
              {
                question: "SLIs are:",
                options: [
                  "Indicators measured to assess service performance",
                  "Only UI metrics",
                  "A feature flag system",
                  "A SQL dialect",
                ],
                correct_answer:
                  "Indicators measured to assess service performance",
              },
              {
                question: "Rate limiting is used to:",
                options: [
                  "Increase traffic",
                  "Protect services from overload/abuse",
                  "Replace authentication",
                  "Remove errors",
                ],
                correct_answer:
                  "Protect services from overload/abuse",
              },
            ],
          },
        ],
      },
    ],
  },
];

