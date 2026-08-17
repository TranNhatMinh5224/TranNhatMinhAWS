---
title: "EC2 Spot Fleet & GitOps CodeDeploy"
date: 2026-07-21
weight: 4
chapter: false
pre: " <b> 5.4. </b> "
aliases:
  - /5-workshop/5.1-serverless-game-backend/5.1.4-ec2-fleet-gitops/
  - /5-workshop/5.1-Serverless-Game-Backend/5.1.4-ec2-fleet-gitops/
---

# 5.4. Provisioning EC2 Spot Fleet, Launch Template & GitOps CodeDeploy

In this section, we will create a sample **Amazon EC2 (Ubuntu 24.04 LTS)** Game Server, bake a custom AMI, set up a **Launch Template** for an EC2 Spot Fleet with an **ASG Warm Pool**, configure **S3 Static Website Hosting**, and implement a **GitOps CI/CD pipeline** using **GitHub OIDC** and **AWS CodeDeploy**.

---

### Detailed Modules:

* **[5.4.1. Sample EC2 Game Server & Baking AMI](5.4.1-ec2-ami/)**
* **[5.4.2. Launch Template & Auto Scaling Group Warm Pool](5.4.2-spot-launch-template/)**
* **[5.4.3. Amazon S3 Bucket & Static Website Hosting](5.4.3-s3-website/)**
* **[5.4.4. GitHub OIDC & AWS CodeDeploy GitOps Pipeline](5.4.4-github-codedeploy/)**
