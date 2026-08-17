---
title: "Blog 2"
date: 2026-07-14
weight: 1
chapter: false
pre: " <b> 3.2. </b> "
---

# HOW ALS GEOANALYTICS’ LITHOLENS REVOLUTIONIZES CORE LOGGING THROUGH MACHINE LEARNING WITH AMAZON EKS

The **LithoLens** solution by **ALS Geoanalytics** is a breakthrough system in the geological mining industry, leveraging Machine Learning (ML) to digitize and analyze core logging images automatically. By utilizing AWS cloud services, especially **Amazon EKS**, this solution accelerates image processing from weeks to hours with high precision.

### Key components of the architecture:

*   **API Layer**: Utilizes **Amazon API Gateway** and **AWS Lambda** as secure entry points for client image upload requests. Connections are securely authenticated using **Amazon Cognito**.
*   **Compute and Processing Layer**: Employs **Amazon Elastic Kubernetes Service (Amazon EKS)** to run machine learning model containers. EKS handles scaling automatically to process massive volumes of geological image files concurrently.
*   **Storage Layer**:
    *   **Amazon S3**: Stores raw core sample photographs and processed geomechanical data.
    *   **Amazon RDS**: Manages relational databases containing project information, geological metadata, and user records.
    *   **Amazon CloudWatch**: Captures container logs and monitors overall infrastructure health metrics.

![LithoLens Architecture on AWS](/images/3-BlogsPosted/blog2.png)

---

*   **Social Share Link**: [Facebook Post](https://www.facebook.com/share/p/1DDNQBrNuD/)
*   **Reference Blog Link**: [AWS Architecture Blog - ALS Geoanalytics LithoLens on Amazon EKS](https://aws.amazon.com/vi/blogs/architecture/how-als-geoanalytics-litholens-revolutionizes-core-logging-through-machine-learning-with-amazon-eks/)