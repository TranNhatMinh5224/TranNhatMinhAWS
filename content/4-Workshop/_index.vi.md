---
title: "Workshop"
date: 2026-08-25
weight: 4
chapter: false
pre: " <b> 4. </b> "
aliases:
  - /5-workshop/
---
# Hướng Dẫn Thực Hành Xây Dựng & Triển Khai Enterprise Knowledge AI RAG Trên AWS

#### Tổng quan bài Thực hành (Hands-on Workshop)

Phần thực hành này hướng dẫn chi tiết từng bước xây dựng, cấu hình và triển khai hệ thống **Enterprise Knowledge AI RAG Assistant** (Trợ lý AI tra cứu văn bản nội bộ chuẩn doanh nghiệp) lên hạ tầng đám mây Amazon Web Services (AWS) theo mô hình kiến trúc Multi-AZ, Zero-Trust và Serverless Containers.

> [!NOTE]
> * **Dự án**: Enterprise Knowledge AI RAG Assistant
> * **Kho mã nguồn (GitHub Repository)**: [https://github.com/TranNhatMinh5224/RAG](https://github.com/TranNhatMinh5224/RAG)
> * **Kiến trúc cốt lõi**: Multi-AZ VPC, Amazon S3 Document Lake, Amazon RDS PostgreSQL, Qdrant Vector Store, Máy chủ tính toán EC2 Container Runtime (Docker Compose), Application Load Balancer (ALB) và tích hợp mô hình ngôn ngữ lớn (Amazon Bedrock / Gemini API).

---

#### Danh sách các chương thực hành:

1. [**4.1. Chuẩn bị Môi trường & Hạ tầng Mạng VPC Zero-Trust**](4.1-vpc-network/)
   * 4.1.1. Khởi tạo Multi-AZ VPC & Phân vùng Subnets (Public, Private App, Isolated DB)
   * 4.1.2. Cấu hình Security Groups & Phân quyền IAM Role (`EC2-S3-RAG`)
   * 4.1.3. Khởi tạo Amazon S3 Document Lake & Cấu hình Block Public Access / Thư mục tiền tố
2. [**4.2. Triển khai Tầng Dữ liệu & Vector Database**](4.2-database-vector/)
   * 4.2.1. Cấu hình AWS Secrets Manager lưu trữ thông tin mật (`DATABASE_URL`, `S3_BUCKET_NAME`...)
   * 4.2.2. Khởi tạo Amazon RDS PostgreSQL trong Isolated Subnet (AWS Graviton `db.t4g.micro`, KMS Encryption)
   * 4.2.3. Triển khai Qdrant Vector Store trên Container Runtime (HNSW, Cosine Metric, `BAAI/bge-m3`)
3. [**4.3. Đóng gói Container & Đẩy Image lên Amazon ECR**](4.3-container-ecr/)
   * 4.3.1. Cấu hình IAM Service User (`github-action`) cho Tự động hóa CI/CD
   * 4.3.2. Khởi tạo Amazon ECR Private Repositories (`enterprise-rag-backend`, `enterprise-rag-frontend`)
   * 4.3.3. Đóng gói Dockerfile & Quy trình Tự động hóa GitHub Actions CI/CD
4. [**4.4. Triển khai Máy chủ Ứng dụng & Cân bằng tải Application Load Balancer (ALB)**](4.4-ecs-fargate-alb/)
   * 4.4.1. Khởi tạo & Cấu hình Máy chủ EC2 RAG Server (`enterprise-rag-server`, Ubuntu 24.04, SSH Key)
   * 4.4.2. Cấu hình Application Load Balancer (`rag-lb`) & 2 Target Groups (`rag-backend-tg`, `rag-frontend-tg`)
   * 4.4.3. Cấu hình Định tuyến Thông minh dựa trên đường dẫn (Path-Based Routing: `/api/*`, `/docs*`, `/*`)
   * 4.4.4. Kiểm chứng Vận hành Toàn diện qua ALB DNS công khai
5. [**4.5. Kiểm thử Toàn trình Pipeline RAG & Security Guardrails**](4.5-testing-rag/)
   * 4.5.1. Kiểm thử End-to-End Ingestion & Tra cứu Tri thức (NexusDoc AI, Grounded Citations)
   * 4.5.2. Kiểm thử 2 Tầng Phòng vệ Bảo mật (Security Guardrails & Chống ảo giác Zero-Hallucination)
6. [**4.6. Giám sát Vận hành & Cảnh báo Sự cố với Amazon CloudWatch**](4.6-cloudwatch-monitoring/)
   * 4.6.1. Giám sát Chỉ số Mạng Application Load Balancer (`RequestCount`, `2XX`, `ResponseTime`)
   * 4.6.2. Thiết lập Bảng điều khiển Giám sát Tập trung (`Dashboard-RAG`)
   * 4.6.3. Cấu hình Cảnh báo Tự động qua Amazon SNS (`RAG-Server-High-CPU-Alarm`)
7. [**4.7. Dọn dẹp Tài nguyên (Resource Cleanup)**](4.7-cleanup/)
   * 4.7.1. Hướng dẫn chi tiết qua AWS Management Console
   * 4.7.2. Kịch bản Dọn dẹp Tự động qua AWS CLI

