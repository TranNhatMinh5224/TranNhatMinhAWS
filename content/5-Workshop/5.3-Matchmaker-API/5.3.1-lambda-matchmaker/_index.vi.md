---
title: "Hàm Lambda Matchmaker"
date: 2026-07-21
weight: 1
chapter: false
pre: " <b> 5.3.1. </b> "
---

# 5.3.1. Khởi tạo Hàm AWS Lambda Matchmaker

1. Truy cập dịch vụ **AWS Lambda** và chọn **Create a function**.
2. Chọn **Author from scratch**, nhập tên hàm: `FightingGameMatchmaker` và chọn Runtime Node.js.

![Tạo hàm Lambda Matchmaker](/images/5-Workshop/img_A/image31.png)

3. Tại tab **Configuration** -> chọn **Permissions** -> nhấn vào liên kết IAM Role Name để mở giao diện IAM Management Console.

![Cấu hình Role cho Lambda](/images/5-Workshop/img_A/image33.png)

4. Chọn **Add permissions** -> chọn **Create inline policy**.
5. Nhập JSON Policy cấp quyền đọc/ghi trên các bảng DynamoDB `MatchmakingQueue` và `ActiveMatches`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-southeast-1:*:table/MatchmakingQueue",
        "arn:aws:dynamodb:ap-southeast-1:*:table/ActiveMatches"
      ]
    }
  ]
}
```

6. Đặt tên Policy và nhấn **Create policy**. Kiểm tra lại IAM Role đã gắn thành công Policy.

![Policy đã gắn vào Lambda](/images/5-Workshop/img_A/image40.png)

7. Quay lại giao diện Lambda, chọn tab **Configuration** -> **Environment variables** -> chọn **Edit** để thêm các biến môi trường:
   * `QUEUE_TABLE`: `MatchmakingQueue`
   * `MATCH_TABLE`: `ActiveMatches`

![Thêm biến môi trường Environment Variables](/images/5-Workshop/img_A/image41.png)

8. Chọn tab **Code**, dán mã nguồn xử lý logic ghép trận và chọn **Deploy**.
9. Tiến hành kiểm thử (Test) hàm Lambda với dữ liệu mẫu cho Player 1 và Player 2. Kết quả trả về `200 OK` và người chơi được đưa vào hàng đợi thành công.

![Kiểm thử thành công Player 1](/images/5-Workshop/img_A/image46.png)

![Kiểm thử thành công Player 2 và ghép phòng thành công](/images/5-Workshop/img_A/image50.png)
