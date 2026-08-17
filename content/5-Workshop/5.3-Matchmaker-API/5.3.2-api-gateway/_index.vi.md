---
title: "API Gateway REST API"
date: 2026-07-21
weight: 2
chapter: false
pre: " <b> 5.3.2. </b> "
---

# 5.3.2. Cấu hình Amazon API Gateway REST API

1. Truy cập dịch vụ **Amazon API Gateway** và chọn **Create API**.
2. Chọn **REST API** và nhấn **Build**.

![Tạo REST API](/images/5-Workshop/img_A/image55.png)

3. Điền thông tin API Name: `FightingGameAPI`, Endpoint Type: **Regional** và chọn **Create API**.

![Tạo REST API thành công](/images/5-Workshop/img_A/image58.png)

4. **Tạo Resource `/join`**:
   * Nhấn **Create resource**, nhập Resource Name: `join`.
   * Tạo method **POST** tại resource `/join`, chọn **Lambda Function** và liên kết với hàm `FightingGameMatchmaker`.

![Tạo Resource /join](/images/5-Workshop/img_A/image60.png)

![Liên kết Method POST với Lambda](/images/5-Workshop/img_A/image65.png)

5. **Tạo Resource `/check`**:
   * Chọn đường dẫn gốc `/`, chọn **Create resource**, nhập Resource Name: `check`.
   * Tạo method **GET** tại resource `/check`, liên kết với hàm `FightingGameMatchmaker`.

![Tạo Method GET /check thành công](/images/5-Workshop/img_A/image70.png)

6. **Tạo Cognito Authorizer**:
   * Trên thanh điều hướng bên trái, chọn **Authorizers** -> chọn **Create authorizer**.
   * Đặt tên: `FightinggameCognitoAuthorizer`, chọn Type: **Cognito**, chọn User Pool `ap-southeast-1_phYoaMUPC` đã tạo ở Bước 5.2.1, nhập Token Source: `Authorization`. Nhấn **Create authorizer**.

![Tạo Cognito Authorizer](/images/5-Workshop/img_A/image71.png)

7. **Gắn Authorizer vào các Method**:
   * Chọn Method **POST** tại `/join`, nhấn **Edit**, mục **Authorization** chọn `FightinggameCognitoAuthorizer` và bấm **Save**.
   * Thực hiện tương tự cho Method **GET** tại `/check`.

![Gắn Cognito Authorizer vào API](/images/5-Workshop/img_A/image74.png)

8. **Bật CORS (Enable CORS)**:
   * Chọn resource `/join`, chọn **Enable CORS**, tích chọn **Default 4xx, 5xx** và **POST**.
   * Thực hiện tương tự cho resource `/check` với method **GET**. Chọn **Save**.

![Bật CORS thành công](/images/5-Workshop/img_A/image81.png)

9. **Deploy API**:
   * Chọn đường dẫn gốc `/` của cây Resource, chọn **Deploy API**.
   * Stage name: `prod`. Nhấn **Deploy**.
   * Lưu lại địa chỉ **Invoke URL** (Ví dụ: `https://6whg1d5qca.execute-api.ap-southeast-1.amazonaws.com/prod`).

![Deploy API thành công](/images/5-Workshop/img_A/image85.png)
