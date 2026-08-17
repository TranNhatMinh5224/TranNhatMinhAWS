---
title: "Khởi tạo Cognito Identity Pool"
date: 2026-07-21
weight: 2
chapter: false
pre: " <b> 5.2.2. </b> "
---

# 5.2.2. Khởi tạo Amazon Cognito Identity Pool

1. Quay lại trang Cognito chính và chuyển sang tab **Identity pools**, chọn **Create identity pool**.

![Tạo Identity Pool](/images/5-Workshop/img_A/image17.png)

2. Chọn **Authenticated access** và chọn nguồn **Amazon Cognito user pool**. Chọn **Next**.

![Cấu hình Authenticated Access](/images/5-Workshop/img_A/image19.png)

3. Tại mục **Configure permissions**, chọn **Create a new IAM Role**, đặt tên IAM role là `FightingGameAuthenticatedRole`. Chọn **Next**.

![Tạo IAM Role cho Identity Pool](/images/5-Workshop/img_A/image20.png)

4. Nhập **User pool ID** và **App Client ID** đã tạo ở Bước 5.2.1 để kết nối Identity Provider. Chọn **Next**.

![Kết nối Identity Provider](/images/5-Workshop/img_A/image21.png)

5. Nhập tên Identity pool: `FightingGameIdentityPool`. Kiểm tra lại cấu hình và nhấn **Create identity pool**.
   * **Identity pool ID**: `ap-southeast-1:a5d743b9-e4a4-45d2-9cb1-9d214cee574c`

![Thông tin Identity Pool ID](/images/5-Workshop/img_A/image24.png)
