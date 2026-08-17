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

# 5.4. Cấu hình EC2 Spot Fleet, Launch Template & GitOps CodeDeploy

Trong chương này, chúng ta sẽ tạo máy chủ game mẫu trên **Amazon EC2 (Ubuntu 24.04 LTS)**, đóng gói AMI, tạo **Launch Template** cho EC2 Spot Fleet với **ASG Warm Pool**, cấu hình **S3 Bucket Static Website**, và thiết lập luồng **GitOps CI/CD** với **GitHub OIDC** và **AWS CodeDeploy**.

---

### Danh sách các bài học chi tiết:

* **[5.4.1. EC2 Game Server mẫu & Đóng gói AMI](5.4.1-ec2-ami/)**
* **[5.4.2. Launch Template & Auto Scaling Group Warm Pool](5.4.2-spot-launch-template/)**
* **[5.4.3. Amazon S3 Bucket & Static Website Hosting](5.4.3-s3-website/)**
* **[5.4.4. GitHub OIDC & AWS CodeDeploy GitOps Pipeline](5.4.4-github-codedeploy/)**
