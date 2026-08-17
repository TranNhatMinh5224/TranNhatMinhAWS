---
title: "Khởi tạo Bảng DynamoDB"
date: 2026-07-21
weight: 3
chapter: false
pre: " <b> 5.2.3. </b> "
---

# 5.2.3. Khởi tạo các Bảng Amazon DynamoDB

Chúng ta sẽ tạo 2 bảng DynamoDB để quản lý trạng thái ghép trận:

#### Bảng 1: `MatchmakingQueue` (Hàng đợi ghép trận)
1. Truy cập dịch vụ **DynamoDB** và chọn **Create table**.
2. Nhập các thông tin:
   * **Table name**: `MatchmakingQueue`
   * **Partition key**: `playerId` (Kiểu dữ liệu: **String**)
   * **Sort key**: Để trống
   * **Table settings**: Giữ nguyên **Default settings**
3. Kéo xuống cuối trang và nhấn **Create table**.

![Tạo bảng MatchmakingQueue](/images/5-Workshop/img_A/image27.png)

#### Bảng 2: `ActiveMatches` (Các trận đấu đang diễn ra)
1. Tiếp tục chọn **Create table**.
2. Nhập các thông tin:
   * **Table name**: `ActiveMatches`
   * **Partition key**: `playerId` (Kiểu dữ liệu: **String**)
   * **Sort key**: Để trống
   * **Table settings**: Giữ nguyên **Default settings**
3. Nhấn **Create table**.

![Tạo bảng ActiveMatches](/images/5-Workshop/img_A/image28.png)

4. Kiểm tra trang danh sách bảng: Cả 2 bảng `MatchmakingQueue` và `ActiveMatches` hiển thị trạng thái **Active**.

![Danh sách 2 bảng DynamoDB Active](/images/5-Workshop/img_A/image29.png)
