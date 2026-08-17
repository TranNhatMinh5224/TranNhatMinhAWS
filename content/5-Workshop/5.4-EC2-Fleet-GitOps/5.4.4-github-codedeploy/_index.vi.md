---
title: "GitHub OIDC & CodeDeploy GitOps"
date: 2026-07-21
weight: 4
chapter: false
pre: " <b> 5.4.4. </b> "
---

# 5.4.4. GitHub OIDC & AWS CodeDeploy GitOps Pipeline

1. **Thêm GitHub Provider vào AWS IAM (No long-lived access keys)**:
   * Vào **IAM** -> **Identity providers** -> chọn **Add provider**.
   * Chọn **OpenID Connect**, nhập Provider URL: `https://token.actions.githubusercontent.com` và Audience: `sts.amazonaws.com`.

![Thêm GitHub OIDC Provider](/images/5-Workshop/img_B/image7.png)

2. **Cài đặt AWS CodeDeploy Agent trên EC2 Game Server**:
   Thực thi kịch bản cài đặt CodeDeploy Agent trên Ubuntu 24.04 LTS:

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

![Cài đặt thành công CodeDeploy Agent](/images/5-Workshop/img_B/image8.png)

3. **Khởi tạo CodeDeploy Application & Deployment Group**:
   * Truy cập **AWS CodeDeploy** -> **Applications** -> chọn **Create application**.
   * Application name: `FightingGameServerApp`, Compute platform: **EC2/On-premises**.
   * Tạo **Deployment group**, chọn IAM Role cho CodeDeploy và gán với EC2 Spot Fleet.

![Khởi tạo CodeDeploy Deployment Group](/images/5-Workshop/img_B/image9.png)

4. Khi lập trình viên push mã nguồn lên GitHub, GitHub Actions tự động kích hoạt CodeDeploy Job triển khai bản build mới lên Fleet máy chủ game thành công.

![CodeDeploy Job triển khai thành công](/images/5-Workshop/img_B/image10.png)
