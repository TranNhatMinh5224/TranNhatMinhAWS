---
title: "Workshop"
date: 2026-08-25
weight: 5
chapter: false
pre: " <b> 5. </b> "
aliases:
  - /5-workshop/
  - /5-Workshop/
---

# Hướng Dẫn Thực Hành Xây Dựng & Triển Khai Enterprise Knowledge AI RAG Trên AWS

#### Tổng quan bài Thực hành (Hands-on Workshop)

Phần thực hành này hướng dẫn chi tiết từng bước xây dựng, cấu hình và triển khai hệ thống **Enterprise Knowledge AI RAG Assistant** (Trợ lý AI tra cứu văn bản nội bộ chuẩn doanh nghiệp) lên hạ tầng đám mây Amazon Web Services (AWS) theo mô hình kiến trúc Multi-AZ, Zero-Trust và Serverless Containers.

> [!NOTE]
> * **Dự án**: Enterprise Knowledge AI RAG Assistant
> * **Kho mã nguồn (GitHub Repository)**: [https://github.com/TranNhatMinh5224/RAG](https://github.com/TranNhatMinh5224/RAG)
> * **Kiến trúc cốt lõi**: Multi-AZ VPC, Amazon S3 Document Lake, Amazon RDS PostgreSQL, Qdrant Vector Store trên EC2 Graviton (ARM64), Amazon ECS Fargate Serverless, Application Load Balancer (ALB) và tích hợp mô hình ngôn ngữ lớn (Amazon Bedrock / Gemini API).

---

#### Danh sách các chương thực hành:

1. [**5.1. Chuẩn bị Môi trường & Hạ tầng Mạng VPC Zero-Trust**](5.1-vpc-network/)
   * 5.1.1. Khởi tạo Multi-AZ VPC & Phân vùng Subnets (Public, Private App, Isolated DB)
   * 5.1.2. Cấu hình Security Groups & Phân quyền IAM Role (`EC2-S3-RAG`)
   * 5.1.3. Khởi tạo Amazon S3 Document Lake & Cấu hình Block Public Access / Thư mục tiền tố
2. [**5.2. Triển khai Tầng Dữ liệu & Vector Database**](5.2-database-vector/)
   * 5.2.1. Cấu hình AWS Secrets Manager lưu trữ thông tin mật (`DATABASE_URL`, `S3_BUCKET_NAME`...)
   * 5.2.2. Khởi tạo Amazon RDS PostgreSQL trong Isolated Subnet (AWS Graviton `db.t4g.micro`, KMS Encryption)
   * 5.2.3. Triển khai Qdrant Vector Store trên Container Runtime (HNSW, Cosine Metric, `BAAI/bge-m3`)
3. [**5.3. Đóng gói Container & Đẩy Image lên Amazon ECR**](5.3-container-ecr/)
   * 5.3.1. Cấu hình IAM Service User (`github-action`) cho Tự động hóa CI/CD
   * 5.3.2. Khởi tạo Amazon ECR Private Repositories (`enterprise-rag-backend`, `enterprise-rag-frontend`)
   * 5.3.3. Đóng gói Dockerfile & Quy trình Tự động hóa GitHub Actions CI/CD
4. [**5.4. Triển khai Máy chủ Ứng dụng & Cân bằng tải Application Load Balancer (ALB)**](5.4-ecs-fargate-alb/)
   * 5.4.1. Khởi tạo & Cấu hình Máy chủ EC2 RAG Server (`enterprise-rag-server`, Ubuntu 24.04, SSH Key)
   * 5.4.2. Cấu hình Application Load Balancer (`rag-lb`) & 2 Target Groups (`rag-backend-tg`, `rag-frontend-tg`)
   * 5.4.3. Cấu hình Định tuyến Thông minh dựa trên đường dẫn (Path-Based Routing: `/api/*`, `/docs*`, `/*`)
   * 5.4.4. Kiểm chứng Vận hành Toàn diện qua ALB DNS công khai
5. [**5.5. Kiểm thử Toàn trình Pipeline RAG & Security Guardrails**](5.5-testing-rag/)
   * 5.5.1. Kiểm thử End-to-End Ingestion & Tra cứu Tri thức (NexusDoc AI, Grounded Citations)
   * 5.5.2. Kiểm thử 2 Tầng Phòng vệ Bảo mật (Security Guardrails & Chống ảo giác Zero-Hallucination)
6. [**5.6. Giám sát Vận hành & Cảnh báo Sự cố với Amazon CloudWatch**](5.6-cloudwatch-monitoring/)
   * 5.6.1. Giám sát Chỉ số Mạng Application Load Balancer (`RequestCount`, `2XX`, `ResponseTime`)
   * 5.6.2. Thiết lập Bảng điều khiển Giám sát Tập trung (`Dashboard-RAG`)
   * 5.6.3. Cấu hình Cảnh báo Tự động qua Amazon SNS (`RAG-Server-High-CPU-Alarm`)
7. [**5.7. Dọn dẹp Tài nguyên (Resource Cleanup)**](5.7-cleanup/)
   * 5.7.1. Hướng dẫn chi tiết qua AWS Management Console
   * 5.7.2. Kịch bản Dọn dẹp Tự động qua AWS CLI

