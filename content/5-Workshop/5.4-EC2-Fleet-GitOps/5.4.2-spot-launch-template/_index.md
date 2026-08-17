---
title: "Launch Template & ASG Warm Pool"
date: 2026-07-21
weight: 2
chapter: false
pre: " <b> 5.4.2. </b> "
---

# 5.4.2. Launch Template & Auto Scaling Group Warm Pool

1. Navigate to **Launch Templates** -> **Create launch template**.
2. Select AMI `FightingGameServerAMI`, enable **Spot Instance**, and attach IAM Instance Profile `FightingGameServerInstanceRole` allowing S3 asset fetching on boot.

![Create Spot Launch Template](/images/5-Workshop/img_B/image3.png)

3. Create an **Auto Scaling Group (ASG)** using the Launch Template and enable the **Warm Pool** feature to maintain pre-initialized, warm instances ready for instant spin-up upon matchmaking requests.

![Configure ASG Warm Pool](/images/5-Workshop/img_B/image4.png)
