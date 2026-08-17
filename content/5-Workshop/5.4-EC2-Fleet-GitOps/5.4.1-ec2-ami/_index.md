---
title: "Sample EC2 Server & Baking AMI"
date: 2026-07-21
weight: 1
chapter: false
pre: " <b> 5.4.1. </b> "
---

# 5.4.1. Sample EC2 Game Server & Baking AMI

1. Navigate to **Amazon EC2** and click **Launch instance**.
2. Configure settings:
   * **Name**: `FightingGameServer`
   * **AMI**: Ubuntu Server 24.04 LTS (64-bit ARM / x86)
   * **Instance type**: `t3.small` or `t3.medium`
   * **Key pair**: Select or create a key pair
   * **Storage**: 8 GB gp3
   * **Security Group**: Allow SSH (Port 22) and Game Server Ports (Port 3000/UDP/TCP).

![Launch EC2 FightingGameServer](/images/5-Workshop/img_A/image88.png)

3. Click **Launch instance**. Configure Node.js Game Server software on the instance.

![Configure Node.js Game Server](/images/5-Workshop/img_A/image91.png)

4. **Bake Custom AMI**:
   * Select instance `FightingGameServer`, navigate to **Actions** -> **Image and templates** -> **Create image**.
   * Name the image `FightingGameServerAMI` and click **Create image**.

![Bake AMI from Instance](/images/5-Workshop/img_B/image2.png)
