---
title: "EC2 Server Mẫu & Đóng gói AMI"
date: 2026-07-21
weight: 1
chapter: false
pre: " <b> 5.4.1. </b> "
---

# 5.4.1. EC2 Game Server Mẫu & Đóng gói AMI

1. Truy cập dịch vụ **Amazon EC2** và chọn **Launch instance**.
2. Nhập các thông tin khởi tạo:
   * **Name**: `FightingGameServer`
   * **AMI**: Ubuntu Server 24.04 LTS (64-bit ARM / x86)
   * **Instance type**: `t3.small` hoặc `t3.medium`
   * **Key pair**: Tạo mới hoặc dùng Key Pair có sẵn
   * **Storage**: 8 GB gp3
   * **Security Group**: Tạo mới Security Group cho phép SSH (Port 22) và Cổng kết nối Game (Port 3000/UDP/TCP).

![Khởi tạo EC2 FightingGameServer](/images/5-Workshop/img_A/image88.png)

3. Nhấn **Launch instance**. Cấu hình Node.js Game Server trên Ubuntu instance.

![Cấu hình Node.js Game Server](/images/5-Workshop/img_A/image91.png)

4. **Đóng gói AMI từ Instance**:
   * Chọn instance `FightingGameServer`, vào **Actions** -> **Image and templates** -> chọn **Create image**.
   * Nhập Image name: `FightingGameServerAMI` và bấm **Create image**.

![Bake AMI từ EC2 Instance](/images/5-Workshop/img_B/image2.png)
