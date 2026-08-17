---
title: "Khởi tạo Cognito User Pool"
date: 2026-07-21
weight: 1
chapter: false
pre: " <b> 5.2.1. </b> "
---

# 5.2.1. Khởi tạo Amazon Cognito User Pool

1. Tại thanh tìm kiếm trên AWS Console, gõ **Cognito** và chọn **Amazon Cognito**.

![Tìm kiếm Cognito](/images/5-Workshop/img_A/image3.png)

![Trang Amazon Cognito](/images/5-Workshop/img_A/image4.png)

2. Chọn **Single-page application (SPA)** và đổi tên ứng dụng thành `FightingGame`.

![Cấu hình ứng dụng SPA](/images/5-Workshop/img_A/image7.png)

3. Tại mục **Username**, tích chọn **Enable Self-registration** để cho phép người dùng tự tạo tài khoản.
4. Tại mục **Required attributes for sign-up**, chọn **email** (Email thích hợp cho mô hình demo và phục hồi mật khẩu).

![Cấu hình thuộc tính đăng ký](/images/5-Workshop/img_A/image8.png)

5. Chọn **Create user directory**. Sau khi khởi tạo thành công:
   * **User pool ID**: `ap-southeast-1_phYoaMUPC`
   * Trong **App clients**, chọn `FightingGame` để xem **Client ID** (Ví dụ: `73ipqvvo7h3u0j3elfqlj23jo3`).

![Thông tin User Pool ID](/images/5-Workshop/img_A/image11.png)

![Xem App Client ID](/images/5-Workshop/img_A/image12.png)

6. Nhấn **Edit** tại App client `FightingGame` và tích chọn phương thức xác thực: `ALLOW_USER_PASSWORD_AUTH`. Sau đó chọn **Save changes**.

![Cấu hình ALLOW_USER_PASSWORD_AUTH](/images/5-Workshop/img_A/image14.png)
