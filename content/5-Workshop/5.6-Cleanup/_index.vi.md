---
title: "Dọn dẹp Tài nguyên (Resource Cleanup)"
date: 2026-08-25
weight: 6
chapter: false
pre: " <b> 5.6. </b> "
aliases:
  - /5-workshop/5.6-cleanup/
  - /5-Workshop/5.6-cleanup/
---

# 5.6. Dọn dẹp Tài nguyên (Resource Cleanup & Cost Optimization)

### Tổng quan bài Lab 5.6

Sau khi hoàn thành toàn bộ chuỗi thực hành và kiểm thử nghiệm thu dự án **Enterprise Knowledge AI RAG Assistant** trên AWS, việc giải phóng tài nguyên là bước vô cùng quan trọng nhằm:
* **Tối ưu hóa chi phí (Cost Optimization)**: Ngăn chặn việc tiếp tục phát sinh cước phí ngoài ý muốn đối with các tài nguyên tính phí theo thời gian chạy (EC2 Instances, Application Load Balancer, RDS Multi-AZ/Single-AZ, v.v.).
* **Bảo đảm tính an toàn hạ tầng**: Tuân thủ đúng thứ tự phụ thuộc (Dependency Order) khi xóa tài nguyên để tránh lỗi xung đột liên kết mạng (Network Interface In-Use).

---

### Thứ tự giải phóng tài nguyên chuẩn (Standard Teardown Order):

```
[1. Load Balancer & Target Groups]
               │
               ▼
[2. Compute EC2 Instance]
               │
               ▼
[3. Amazon RDS PostgreSQL & Subnet Group]
               │
               ▼
[4. AWS Secrets Manager & Amazon ECR]
               │
               ▼
[5. Amazon S3 Data Lake & IAM Roles/Users]
               │
               ▼
[6. Security Groups & VPC Networking (IGW, Subnets, VPC)]
```

---

## 5.6.1. Hướng dẫn chi tiết qua AWS Management Console

### Bước 1: Xóa Application Load Balancer & Target Groups
1. Mở **EC2 Management Console** $\rightarrow$ mục **Load Balancers** ở menu bên trái.
2. Chọn Load Balancer **`rag-lb`** $\rightarrow$ bấm **Actions** $\rightarrow$ chọn **Delete load balancer** $\rightarrow$ xác nhận xóa.
3. Chuyển sang mục **Target Groups** $\rightarrow$ chọn lần lượt **`rag-backend-tg`** và **`rag-frontend-tg`** $\rightarrow$ bấm **Actions** $\rightarrow$ chọn **Delete**.

> [!NOTE]
> Cần xóa Load Balancer trước để giải phóng các Elastic Network Interfaces (ENI) mà ALB đang chiếm dụng trong các Public Subnet.

---

### Bước 2: Hủy máy chủ tính toán Amazon EC2
1. Tại **EC2 Management Console** $\rightarrow$ chọn **Instances**.
2. Chọn máy chủ **`enterprise-rag-server`** (`i-0e3f096f3de681aaa`).
3. Bấm **Instance state** $\rightarrow$ chọn **Terminate instance** $\rightarrow$ xác nhận **Terminate**.
4. Ổ đĩa EBS Root Volume gắn kèm máy chủ sẽ tự động được xóa theo thiết lập `Delete on Termination`.

---

### Bước 3: Xóa Cơ sở dữ liệu Amazon RDS PostgreSQL
1. Truy cập **RDS Management Console** $\rightarrow$ chọn **Databases**.
2. Chọn cơ sở dữ liệu **`rag-db`**.
3. Bấm **Actions** $\rightarrow$ chọn **Delete**.
4. Trong cửa sổ xác nhận:
   * Bỏ chọn (Uncheck) mục **Create final snapshot** (để tránh lưu trữ snapshot tính phí nếu không cần giữ lại dữ liệu).
   * Bỏ chọn mục **Retain automated backups**.
   * Nhập cụm từ xác nhận `delete me` $\rightarrow$ bấm **Delete**.
5. Sau khi DB Instance bị xóa hoàn tất, chuyển sang mục **Subnet groups** $\rightarrow$ chọn **`rag-db-subnet-group`** $\rightarrow$ bấm **Delete**.

---

### Bước 4: Xóa Secrets Manager & Kho chứa Amazon ECR
1. **AWS Secrets Manager**:
   * Truy cập **Secrets Manager Console** $\rightarrow$ chọn secret **`rag/production/credentials`**.
   * Bấm **Actions** $\rightarrow$ chọn **Delete secret** $\rightarrow$ chọn thời gian chờ hoặc đánh dấu **Delete immediately without recovery** (nếu không cần khôi phục) $\rightarrow$ bấm **Delete**.
2. **Amazon ECR (Elastic Container Registry)**:
   * Mở **Amazon ECR Console** $\rightarrow$ mục **Private registry** $\rightarrow$ **Repositories**.
   * Chọn kho chứa **`enterprise-rag-backend`** $\rightarrow$ bấm **Delete** $\rightarrow$ nhập `delete` để xác nhận xóa toàn bộ image tags.
   * Thực hiện tương tự cho kho chứa **`enterprise-rag-frontend`**.

---

### Bước 5: Xóa dữ liệu & Bucket Amazon S3
1. Truy cập **Amazon S3 Console** $\rightarrow$ chọn bucket **`enterprise-rag-storage-0117967`**.
2. Bấm nút **Empty** (Làm rỗng) $\rightarrow$ nhập `permanently delete` để xóa sạch toàn bộ các đối tượng và tiền tố (`draff/`, `real/`).
3. Sau khi bucket rỗng, bấm nút **Delete** $\rightarrow$ nhập tên bucket `enterprise-rag-storage-0117967` để xác nhận xóa vĩnh viễn.

---

### Bước 6: Xóa Security Groups & Tài nguyên Mạng VPC
1. **Security Groups**:
   * Truy cập **VPC Console** $\rightarrow$ mục **Security Groups**.
   * Chọn và xóa lần lượt: **`rag-rds-sg`**, **`rag-ec2-sg`**, **`rag-alb-sg`** (chú ý xóa SG tham chiếu trước, hoặc xóa đồng thời).
2. **VPC Endpoints**:
   * Vào mục **Endpoints** $\rightarrow$ chọn S3 Gateway Endpoint liên kết với VPC $\rightarrow$ bấm **Actions** $\rightarrow$ **Delete VPC endpoint**.
3. **Internet Gateway**:
   * Vào mục **Internet Gateways** $\rightarrow$ chọn **`rag-igw`** $\rightarrow$ chọn **Actions** $\rightarrow$ **Detach from VPC** $\rightarrow$ chọn **Actions** $\rightarrow$ **Delete internet gateway**.
4. **VPC**:
   * Vào mục **Your VPCs** $\rightarrow$ chọn **`rag-vpc`** (`vpc-03228d0b15b9ea7be`).
   * Bấm **Actions** $\rightarrow$ chọn **Delete VPC**. Hệ thống AWS sẽ tự động giải phóng toàn bộ 4 Subnets và Route Tables liên kết.

---

## 5.6.2. Kịch bản Dọn dẹp Tự động qua AWS CLI

Nếu bạn muốn dọn dẹp nhanh chóng toàn bộ môi trường thông qua terminal AWS CLI, có thể sử dụng chuỗi lệnh tuần tự dưới đây:

```bash
# 1. Xóa Application Load Balancer
ALB_ARN=$(aws elbv2 describe-load-balancers --names "rag-lb" --query "LoadBalancers[0].LoadBalancerArn" --output text)
aws elbv2 delete-load-balancer --load-balancer-arn $ALB_ARN

# 2. Xóa Target Groups
TG_BACKEND=$(aws elbv2 describe-target-groups --names "rag-backend-tg" --query "TargetGroups[0].TargetGroupArn" --output text)
TG_FRONTEND=$(aws elbv2 describe-target-groups --names "rag-frontend-tg" --query "TargetGroups[0].TargetGroupArn" --output text)
aws elbv2 delete-target-group --target-group-arn $TG_BACKEND
aws elbv2 delete-target-group --target-group-arn $TG_FRONTEND

# 3. Terminate máy chủ EC2 RAG Server
aws ec2 terminate-instances --instance-ids "i-0e3f096f3de681aaa"

# 4. Xóa RDS PostgreSQL (không lưu final snapshot)
aws rds delete-db-instance \
  --db-instance-identifier "rag-db" \
  --skip-final-snapshot \
  --delete-automated-backups

# 5. Xóa Secret trong Secrets Manager
aws secretsmanager delete-secret \
  --secret-id "rag/production/credentials" \
  --force-delete-without-recovery

# 6. Xóa ECR Repositories kèm tất cả Docker Images
aws ecr delete-repository --repository-name "enterprise-rag-backend" --force
aws ecr delete-repository --repository-name "enterprise-rag-frontend" --force

# 7. Xóa sạch dữ liệu trong S3 và xóa Bucket
aws s3 rm s3://enterprise-rag-storage-0117967 --recursive
aws s3api delete-bucket --bucket enterprise-rag-storage-0117967 --region ap-southeast-1
```

---

### Lời kết Workshop 5

Chúc mừng bạn đã hoàn thành xuất sắc toàn bộ **Chương 5: Thực hành Workshop Triển khai Hệ thống RAG Doanh nghiệp trên AWS**! 

Thông qua các bài lab từ **5.1** đến **5.6**, bạn đã nắm vững quy trình kiến trúc và vận hành hệ thống đám mây chuẩn Enterprise:
* Thiết kế phân vùng mạng **Multi-AZ VPC**, phân chia Public/Private Subnets và cấu hình Security Groups theo nguyên tắc đặc quyền tối thiểu.
* Quản lý dữ liệu hỗn hợp: Dữ liệu phi cấu trúc trên **Amazon S3**, siêu dữ liệu trên **Amazon RDS PostgreSQL** mã hóa KMS, và dữ liệu vector nhúng trên **Qdrant Vector Database**.
* Tự động hóa vòng đời ứng dụng qua **Amazon ECR** và **GitHub Actions CI/CD Pipeline**.
* Vận hành hệ thống tính toán với **Amazon EC2**, định tuyến thông minh qua **Application Load Balancer (ALB)**, và kiểm thử bảo mật chống ảo giác (Anti-Hallucination).
* Giám sát hệ thống toàn diện với **Amazon CloudWatch Metrics**.
