---
title: "Worklog Tuần 7"
date: 2026-09-14
weight: 7
chapter: false
pre: " <b> 1.7. </b> "
---

### 1. Mục tiêu kỹ thuật tuần 7
* **Đóng gói ứng dụng Container chuẩn hóa (Multi-stage Docker Builds):** Thiết kế Dockerfile tối ưu hóa dung lượng cho các thành phần cốt lõi của NexusDoc AI (FastAPI API Service, Celery Ingestion Worker, và Next.js Frontend Standalone).
* **Quản trị kho ảnh Amazon Elastic Container Registry (ECR):** Thiết lập ECR Private Repositories, phân quyền IAM Pull/Push qua token xác thực, cấu hình quét bảo mật tự động khi đẩy ảnh (Scan on Push) và Lifecycle Policy tự động dọn dẹp images cũ.
* **Điều phối dịch vụ vùng chứa trên AWS ECS (Elastic Container Service):** So sánh Fargate (Serverless Container) vs EC2 Launch Type; xây dựng Task Definitions chi tiết cấu hình tài nguyên CPU/RAM, Mount volumes, Logging (`awslogs`) gửi trực tiếp về CloudWatch.
* **Kiến trúc phân tách dịch vụ (Decoupled Worker Architecture):** Thiết kế pipeline xử lý bất đồng bộ giữa FastAPI Web API và Celery Background Worker thông qua Redis Message Broker để giải quyết triệt để các tác vụ OCR/Embedding tài liệu pháp lý kéo dài.

---

### 2. Nhật ký công việc kỹ thuật chi tiết

| Thứ | Nội dung kỹ thuật chuyên sâu | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu tham khảo | Kết quả chi tiết (Deliverables) |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Thứ 2** | **Nghiên cứu nguyên lý Containerization & Kiến trúc AWS ECS**<br>- Phân tích kiến trúc Docker Engine: cgroups, namespaces, union file systems (overlay2).<br>- So sánh AWS ECS Task Definition, Task, Service và Cluster.<br>- Lựa chọn mô hình tính toán: Phân tầng Fargate cho API/Frontend để tự động co giãn không cần quản lý máy chủ, và EC2 launch type chuyên dụng cho Worker nạp model AI nặng. | 14/09/2026 | 14/09/2026 | • [Amazon ECS Concepts & Architecture](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html)<br>• [AWS Fargate vs EC2 Launch Type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html) | - Tài liệu thiết kế phân rã Container Microservices cho NexusDoc AI.<br>- Ma trận phân bổ tài nguyên CPU/RAM cho từng Container Service. |
| **Thứ 3** | **Viết Multi-Stage Dockerfile & Tối ưu hóa kích thước Image**<br>- Tầng Backend/Worker: Sử dụng `python:3.11-slim`, phân tầng Builder để biên dịch wheels cho `paddleocr`, `opencv-python-headless` và `sentence-transformers`, loại bỏ triệt để build tools (`gcc`, `g++`) ở runner image cuối.<br>- Tầng Frontend: Áp dụng Next.js standalone build, giảm dung lượng image từ 1.2GB xuống còn 145MB.<br>- Kiểm tra lỗ hổng bảo mật bằng Trivy trước khi đẩy ảnh lên kho. | 15/09/2026 | 15/09/2026 | • [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)<br>• [Next.js Output Standalone Mode](https://nextjs.org/docs/advanced-features/output-file-tracing) | - `Dockerfile.backend` (1.1GB, tối ưu từ 4.8GB ban đầu).<br>- `Dockerfile.frontend` (145MB).<br>- `docker-compose.local.yml` chạy kiểm thử tích hợp tại trạm làm việc. |
| **Thứ 4** | **Cấu hình Amazon ECR & Tự động hóa đẩy ảnh (CI/CD push)**<br>- Tạo 2 private repositories trên Amazon ECR: `nexusdoc-backend` và `nexusdoc-frontend`.<br>- Cấu hình ECR Lifecycle Policy: Chỉ lưu giữ 5 bản image gần nhất được gắn tag `release-*`, tự động expire các bản `untagged` sau 7 ngày để tiết kiệm chi phí lưu trữ S3 ngầm định.<br>- Bật tính năng Enhanced Scanning (quét CVE tự động qua AWS Inspector). | 16/09/2026 | 16/09/2026 | • [Amazon ECR User Guide](https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html)<br>• [Amazon ECR Lifecycle Policies](https://docs.aws.amazon.com/AmazonECR/latest/userguide/LifecyclePolicies.html) | - 2 Private ECR Repositories sẵn sàng với quyền IAM push.<br>- Kịch bản shell script tự động authenticate Docker CLI với AWS ECR token. |
| **Thứ 5** | **Xây dựng ECS Task Definition & Cấu hình CloudWatch Logs**<br>- Soạn thảo Task Definition JSON cho Backend Service: 1 vCPU, 4GB RAM (đảm bảo đủ bộ nhớ cho model BAAI/bge-m3).<br>- Thiết lập Container Definitions: Environment Variables được inject an toàn từ AWS Secrets Manager (database URL, API Keys).<br>- Cấu hình log driver `awslogs` với log group `/ecs/nexusdoc-backend`, stream prefix `ecs`, tự động tạo stream log theo container instance. | 17/09/2026 | 17/09/2026 | • [Amazon ECS Task Definitions](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html)<br>• [Using AWS Secrets in ECS Task Definitions](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data-secrets.html) | - File cấu hình `task-definition-backend.json` & `task-definition-frontend.json`.<br>- ECS Task Execution Role (`ecsTaskExecutionRole`) gắn policy `AmazonECSTaskExecutionRolePolicy`. |
| **Thứ 6** | **Khởi tạo ECS Cluster, Triển khai ECS Service & Health Checks**<br>- Tạo ECS Cluster `nexusdoc-cluster-prod` hỗ trợ AWS Fargate & EC2 Capacity Provider.<br>- Tạo ECS Service `nexusdoc-backend-service` gắn trực tiếp vào Target Group của ALB đã dựng ở Tuần 6.<br>- Cấu hình Rolling Update: Minimum healthy percent 100%, Maximum percent 200% (Zero-Downtime Deployment).<br>- Xác thực luồng chạy: Container khởi động thành công, vượt qua ALB Health Check và tiếp nhận requests trơn tru. | 18/09/2026 | 18/09/2026 | • [Creating Amazon ECS Services](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs_services.html)<br>• [Cloud Journey Containers Module](https://cloudjourney.awsstudygroup.com/) | - ECS Service vận hành ổn định trên 2 AZs.<br>- Endpoint ALB `/api/v1/health` trả về HTTP 200 OK từ ECS tasks.<br>- CloudWatch Logs thu thập toàn bộ log truy cập của FastAPI. |

---

### 3. Cấu hình & Lệnh AWS CLI thực thi

#### Quản trị Amazon ECR & Đẩy Docker Image
```bash
# 1. Đăng nhập Docker CLI vào Amazon ECR Registry
aws ecr get-login-password --region ap-southeast-1 | \
    docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com

# 2. Tạo Private Repository trên ECR
aws ecr create-repository \
    --repository-name nexusdoc-backend \
    --image-scanning-configuration scanOnPush=true \
    --region ap-southeast-1

# 3. Gắn Tag và đẩy Image lên ECR
docker tag nexusdoc-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/nexusdoc-backend:v1.0.0
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/nexusdoc-backend:v1.0.0
```

#### Đăng ký ECS Task Definition & Triển khai ECS Service
```bash
# 1. Đăng ký Task Definition vào ECS Cluster
aws ecs register-task-definition \
    --cli-input-json file://task-definition-backend.json

# 2. Tạo ECS Service kết nối trực tiếp vào Target Group của ALB
aws ecs create-service \
    --cluster nexusdoc-cluster-prod \
    --service-name nexusdoc-backend-service \
    --task-definition nexusdoc-backend:1 \
    --desired-count 2 \
    --launch-type FARGATE \
    --platform-version LATEST \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-0789app1a,subnet-0abcdefapp1b],securityGroups=[sg-0ec2backend],assignPublicIp=DISABLED}" \
    --load-balancers targetGroupArn=<BACKEND_TG_ARN>,containerName=fastapi-backend,containerPort=8000 \
    --health-check-grace-period-seconds 120
```
*Trích đoạn cấu hình Container trong `task-definition-backend.json`:*
```json
{
  "name": "fastapi-backend",
  "image": "<AWS_ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/nexusdoc-backend:v1.0.0",
  "cpu": 1024,
  "memory": 4096,
  "portMappings": [{ "containerPort": 8000, "protocol": "tcp" }],
  "essential": true,
  "logConfiguration": {
    "logDriver": "awslogs",
    "options": {
      "awslogs-group": "/ecs/nexusdoc-backend",
      "awslogs-region": "ap-southeast-1",
      "awslogs-stream-prefix": "ecs"
    }
  }
}
```

---

### 4. Vấn đề kỹ thuật (Troubleshooting & Root Cause Analysis)

#### Sự cố 1: Container bị tắt đột ngột với mã lỗi Exit Code 137 (OOMKilled)
* **Hiện tượng:** ECS Service liên tục báo trạng thái `STOPPED (OutOfMemoryException: Container killed due to memory usage)` ngay sau khi Task khởi động khoảng 20 giây.
* **Nguyên nhân gốc rễ (RCA):** Trong Task Definition ban đầu, cấu hình container memory được gán cứng là `1024MB` (1GB). Khi ứng dụng FastAPI khởi tạo worker và nạp mô hình nhúng `BAAI/bge-m3` vào RAM, dung lượng bộ nhớ tiêu thụ vọt lên xấp xỉ 2.4GB, khiến kernel Linux kích hoạt cơ chế OOM Killer (mã tín hiệu 137).
* **Giải pháp:** Điều chỉnh thông số Task Definition: nâng `cpu` lên `1024` (1 vCPU) và `memory` lên `4096` (4GB RAM). Tạo revision mới `nexusdoc-backend:2` và cập nhật ECS Service. Hệ thống khởi động ổn định, mức sử dụng RAM thực tế duy trì ở mức 58% (khoảng 2.3GB).

#### Sự cố 2: Docker Build quá chậm và kích thước image phình to (4.8GB)
* **Hiện tượng:** Quá trình `docker build` trên trạm làm việc mất hơn 18 phút do phải biên dịch lại thư viện `paddleocr` và `torch`, sinh ra image có dung lượng lên đến 4.8GB, gây chậm trễ nghiêm trọng khi đẩy và kéo từ ECR.
* **Nguyên nhân gốc rễ (RCA):** Sử dụng Single-stage Dockerfile với base image `python:3.11` chứa đầy đủ package cache, gcc, và các file header tạm (`.whl`, build caches).
* **Giải pháp:** Viết lại theo kỹ thuật Multi-stage Build: Tầng Builder biên dịch và tải wheels vào `/wheels`, tầng Runner sử dụng `python:3.11-slim` chỉ sao chép wheels thành phẩm và cài đặt với cờ `--no-cache-dir`. Kích thước image giảm 77% (xuống còn 1.1GB), thời gian build lại giảm xuống dưới 3 phút nhờ Docker BuildKit layer caching.

---

### 5. Kết quả & Đánh giá tuần 7
* Hoàn thiện quy trình container hóa ứng dụng cấp doanh nghiệp với các Dockerfile tối ưu đa tầng (Multi-stage builds) và bảo mật ECR.
* Triển khai thành công cụm AWS ECS Fargate kết hợp EC2 Capacity Provider, đảm bảo kiến trúc vi dịch vụ phân tán không phụ thuộc vào hạ tầng vật lý cụ thể.
* Tích hợp sâu rộng hệ thống logging tập trung với CloudWatch Container Insights, hỗ trợ việc giám sát và chẩn đoán lỗi ở cấp độ từng container instance.
