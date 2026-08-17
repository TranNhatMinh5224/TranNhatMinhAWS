---
title: "GitHub OIDC & CodeDeploy GitOps"
date: 2026-07-21
weight: 4
chapter: false
pre: " <b> 5.4.4. </b> "
---

# 5.4.4. GitHub OIDC & AWS CodeDeploy GitOps Pipeline

1. **Add GitHub Provider to AWS IAM (No long-lived access keys)**:
   * Navigate to **IAM** -> **Identity providers** -> **Add provider**.
   * Select **OpenID Connect**, enter Provider URL: `https://token.actions.githubusercontent.com` and Audience: `sts.amazonaws.com`.

![Add GitHub OIDC Provider](/images/5-Workshop/img_B/image7.png)

2. **Install AWS CodeDeploy Agent on EC2 Game Server**:
   Execute the CodeDeploy installation script on Ubuntu 24.04 LTS:

```bash
# 1. Install prerequisites
sudo apt-get update && sudo apt-get install -y ruby-full ruby-webrick wget gdebi-core

# 2. Download raw .deb package directly
cd /tmp
wget https://aws-codedeploy-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/releases/codedeploy-agent_1.8.1-26_all.deb

# 3. Unpack, fix Ruby dependency declaration, and repack
dpkg-deb -R codedeploy-agent_1.8.1-26_all.deb /tmp/codedeploy-extracted
sed -i "s/ruby3.2/ruby3.3/g" /tmp/codedeploy-extracted/DEBIAN/control
dpkg-deb -b /tmp/codedeploy-extracted /tmp/codedeploy-agent_fixed.deb

# 4. Install patched package and start service
sudo dpkg -i /tmp/codedeploy-agent_fixed.deb
sudo systemctl enable codedeploy-agent
sudo systemctl start codedeploy-agent
sudo systemctl status codedeploy-agent
```

![CodeDeploy Agent Installation Success](/images/5-Workshop/img_B/image8.png)

3. **Provision CodeDeploy Application & Deployment Group**:
   * Navigate to **AWS CodeDeploy** -> **Applications** -> **Create application**.
   * Application name: `FightingGameServerApp`, Compute platform: **EC2/On-premises**.
   * Create **Deployment group**, attach CodeDeploy IAM role, and map to the EC2 Spot Fleet.

![Create CodeDeploy Deployment Group](/images/5-Workshop/img_B/image9.png)

4. Pushing code to GitHub triggers GitHub Actions to execute CodeDeploy jobs, deploying new builds to the game fleet with zero downtime.

![Successful CodeDeploy Job](/images/5-Workshop/img_B/image10.png)
