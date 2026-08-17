---
title: "Hàm MatchAnalytic Lambda"
date: 2026-07-21
weight: 2
chapter: false
pre: " <b> 5.5.2. </b> "
---

# 5.5.2. Tạo & Kết nối MatchAnalytic Lambda

1. Truy cập **AWS IAM** -> **Roles** -> chọn **Create role**.
2. Chọn Trusted Entity: **AWS service** -> **Lambda**.
3. Đặt tên Role: `MatchAnalyticLambdaRole`.
4. Tạo Policy đính kèm cho phép Lambda đọc dữ liệu từ DynamoDB Stream:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:DescribeStream",
        "dynamodb:ListStreams"
      ],
      "Resource": "arn:aws:dynamodb:ap-southeast-1:*:table/ActiveMatches/stream/*"
    }
  ]
}
```

5. Truy cập **AWS Lambda** -> **Create function**.
6. Đặt tên hàm: `MatchAnalyticLambda`, chọn IAM Role `MatchAnalyticLambdaRole`.
7. Nhấn **Add trigger**, chọn **DynamoDB**.
8. Chọn DynamoDB table: `ActiveMatches`, Batch size: `100`, Starting position: **Latest**. Bấm **Add**.

![Tạo MatchAnalytic Lambda & DynamoDB Stream Trigger](/images/5-Workshop/img_B/image8.png)

9. Dán mã nguồn xử lý phân tích log và kết quả trận đấu vào tab **Code** và chọn **Deploy**.
10. Khi một trận đấu kết thúc và kết quả được ghi vào DynamoDB, DynamoDB Stream tự động kích hoạt `MatchAnalyticLambda` thu thập và đẩy log sang Data Lake/Analytics Store mà không ảnh hưởng tới độ trễ ghép trận RTT.
