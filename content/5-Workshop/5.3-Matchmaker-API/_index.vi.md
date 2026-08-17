---
title: "Lambda Matchmaker & API Gateway"
date: 2026-07-21
weight: 3
chapter: false
pre: " <b> 5.3. </b> "
aliases:
  - /5-workshop/5.1-serverless-game-backend/5.1.3-matchmaker-api/
  - /5-workshop/5.1-Serverless-Game-Backend/5.1.3-matchmaker-api/
---

# 5.3. Xây dựng Lambda Matchmaker & API Gateway REST API

Trong chương này, chúng ta sẽ tạo hàm **AWS Lambda Matchmaker** (`FightingGameMatchmaker`) chứa logic xử lý hàng đợi ghép trận (`POST /join` và `GET /check`), phân quyền IAM Policy cho Lambda truy cập DynamoDB, và exposed API thông qua **Amazon API Gateway** với **Cognito Authorizer** và **CORS**.

---

### Danh sách các bài học chi tiết:

* **[5.3.1. Khởi tạo hàm AWS Lambda Matchmaker](5.3.1-lambda-matchmaker/)**
* **[5.3.2. Cấu hình Amazon API Gateway REST API](5.3.2-api-gateway/)**
