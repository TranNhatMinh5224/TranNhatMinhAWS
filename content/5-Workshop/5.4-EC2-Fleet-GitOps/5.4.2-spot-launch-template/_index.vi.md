---
title: "Launch Template & ASG Warm Pool"
date: 2026-07-21
weight: 2
chapter: false
pre: " <b> 5.4.2. </b> "
---

# 5.4.2. Launch Template & Auto Scaling Group Warm Pool

1. Vào **Launch Templates** -> chọn **Create launch template**.
2. Chọn AMI `FightingGameServerAMI`, chọn **Spot Instance**, cấu hình IAM Instance Profile `FightingGameServerInstanceRole` để cho phép EC2 gọi S3 pull server bundle lúc boot.

![Tạo Launch Template Spot](/images/5-Workshop/img_B/image3.png)

3. Tạo **Auto Scaling Group (ASG)** từ Launch Template vừa tạo và bật tính năng **Warm Pool** để giữ các máy chủ game ở trạng thái sẵn sàng spin-up ngay lập tức khi Matchmaker yêu cầu.

![Cấu hình ASG Warm Pool](/images/5-Workshop/img_B/image4.png)
