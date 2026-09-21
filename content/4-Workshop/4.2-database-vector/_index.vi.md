---
title: "Triển khai Tầng Dữ liệu & Vector Database"
date: 2026-08-25
weight: 2
chapter: false
pre: " <b> 4.2. </b> "
---

# 4.2. Triển khai Tầng Dữ liệu & Vector Database

### Tổng quan bài Lab 4.2

Trong một hệ sinh thái **Enterprise Knowledge AI RAG Assistant**, tầng lưu trữ dữ liệu (Data Tier) đòi hỏi sự kết hợp hài hòa giữa **Cơ sở dữ liệu quan hệ (Relational Database)** để lưu trữ metadata có cấu trúc và **Cơ sở dữ liệu Vector (Vector Database)** để đánh chỉ mục ngữ nghĩa không gian nhiều chiều.

Bài lab 4.2 hướng dẫn chi tiết quy trình thiết lập tầng dữ liệu bảo mật cao:
1. Quản lý tập trung các thông tin mật và cấu hình hệ thống với **AWS Secrets Manager**, loại bỏ triệt để việc lưu file `.env` lộ lọt trên máy chủ.
2. Khởi tạo cơ sở dữ liệu quan hệ **Amazon RDS PostgreSQL** chạy trên chip **AWS Graviton (`db.t4g.micro`)** trong Private Subnet, kích hoạt mã hóa KMS at-rest.
3. Triển khai và cấu hình **Qdrant Vector Database** tối ưu hóa bộ nhớ RAM và không gian đĩa cho việc lưu trữ hàng trăm nghìn vector nhúng từ mô hình nhúng đa ngôn ngữ `BAAI/bge-m3`.

---

### Danh sách các nội dung triển khai:

1. [**4.2.1. Cấu hình AWS Secrets Manager lưu trữ thông tin mật**](#421-cấu-hình-aws-secrets-manager-lưu-trữ-thông-tin-mật)
2. [**4.2.2. Khởi tạo Amazon RDS PostgreSQL trong Isolated Subnet**](#422-khởi-tạo-amazon-rds-postgresql-trong-isolated-subnet)
3. [**4.2.3. Triển khai Qdrant Vector Store trên Container Runtime**](#423-triển-khai-qdrant-vector-store-trên-container-runtime)

---

## 4.2.1. Cấu hình AWS Secrets Manager lưu trữ thông tin mật

### 1. Mục tiêu kỹ thuật
* Loại bỏ việc lưu trữ mật khẩu, API keys và chuỗi kết nối nhạy cảm dưới dạng bản rõ (plaintext) trong các file `.env` trên máy chủ hoặc trong mã nguồn Git.
* Quản lý tập trung toàn bộ cấu hình môi trường sản xuất dưới dạng JSON Key/Value an toàn, tự động mã hóa bằng **AWS KMS (Key Management Service)**.
* Cho phép ứng dụng FastAPI RAG Backend tự động nạp cấu hình khi khởi động (Runtime Configuration Injection) thông qua IAM Role `EC2-S3-RAG`.

---

### 2. Danh mục các khóa cấu hình bảo mật (Secret Key/Value Matrix)

| Tên khóa (Key) | Giá trị cấu hình thực tế | Mục đích kỹ thuật trong hệ thống |
| :--- | :--- | :--- |
| **`DATABASE_URL`** | `postgresql+asyncpg://postgres:******@rag-db...:5432/rag_db` | Chuỗi kết nối bất đồng bộ AsyncPG đến Amazon RDS PostgreSQL |
| **`USE_LOCAL_LLM`** | `False` | Chế độ tích hợp LLM đám mây (Gemini 2.5 / Bedrock) |
| **`AWS_REGION`** | `ap-southeast-1` | Khu vực Singapore xử lý các API AWS S3, Secrets Manager |
| **`S3_BUCKET_NAME`** | `enterprise-rag-storage-0117967` | Tên Document Lake S3 lưu trữ file văn bản |
| **`DOCUMENTS_DRAFT_PREFIX`** | `documents/draft/` | Đường dẫn tiền tố S3 chứa văn bản tải lên tạm thời |
| **`DOCUMENTS_REAL_PREFIX`** | `documents/real/` | Đường dẫn tiền tố S3 chứa văn bản đã hoàn tất Ingestion |
| **`QDRANT_URL`** | `http://rag_qdrant:6333` | Endpoint mạng nội bộ kết nối đến dịch vụ Vector Search |
| **`REDIS_URL`** | `redis://rag_redis:6379/0` | Hàng đợi tác vụ bất đồng bộ (Celery Broker / Result Backend) |
| **`ALLOWED_ORIGINS`** | `*` (hoặc domain ALB) | Cấu hình CORS cho phép Next.js Frontend gọi API |

---

### 3. Các bước triển khai chi tiết & Bằng chứng thực tế (Evidence)

#### Bước 1: Khởi tạo Secret trên AWS Secrets Manager
1. Truy cập **AWS Secrets Manager Console** → bấm **Store a new secret**.
2. Chọn **Secret type**: **Other type of secret**.
3. Tại phần **Key/value pairs**, nhập các cặp tham số cấu hình cơ sở dữ liệu và hệ sinh thái RAG.
4. Đặt tên Secret: `rag/production/credentials`.

<div align="center">
  <img src="/images/4-Workshop/4.2/4.2.1-secrets-manager-database-url.png" alt="Cấu hình chuỗi kết nối DATABASE_URL trong Secrets Manager" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 4.2.1.1: Cấu hình an toàn chuỗi kết nối DATABASE_URL trỏ tới RDS Endpoint trên AWS Secrets Manager</em></p>
</div>

<div align="center">
  <img src="/images/4-Workshop/4.2/4.2.1-secrets-manager-config-keys.png" alt="Danh mục các khóa cấu hình hệ thống RAG trong Secrets Manager" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 4.2.1.2: Danh sách các tham số vận hành S3, Qdrant, Redis và AWS Region được lưu trữ bảo mật tập trung</em></p>
</div>

---

#### Bước 2: Tích hợp đọc Secret tự động từ mã nguồn Python Backend
Trong mã nguồn FastAPI (`src/backend/core/config.py`), phương thức nạp secret được triển khai tự động qua AWS SDK `boto3`:

```python
import json
import boto3
from botocore.exceptions import ClientError

def load_secrets_from_aws(secret_name="rag/production/credentials", region_name="ap-southeast-1"):
    client = boto3.client("secretsmanager", region_name=region_name)
    try:
        response = client.get_secret_value(SecretId=secret_name)
        if "SecretString" in response:
            return json.loads(response["SecretString"])
    except ClientError as e:
        print(f"Warning: Could not fetch secrets from AWS Secrets Manager: {e}")
        return {}
```

---

## 4.2.2. Khởi tạo Amazon RDS PostgreSQL trong Isolated Subnet

### 1. Mục tiêu kỹ thuật
* Khởi tạo cơ sở dữ liệu quan hệ **Amazon RDS PostgreSQL** (phiên bản 18.3) đảm bảo tính toàn vẹn (ACID) cho dữ liệu nghiệp vụ: quản lý tài khoản người dùng, phân quyền vai trò (Role-based access), lưu trữ lược đồ tài liệu và lịch sử các phiên đối thoại RAG.
* Đặt cơ sở dữ liệu trong **Private Subnet** (`project-subnet-private2-ap-southeast-1b`), ngăn chặn mọi truy cập trực tiếp từ Internet công cộng.
* Sử dụng kiến trúc vi xử lý **AWS Graviton (`db.t4g.micro`)** giúp tiết kiệm tới 20% chi phí vận hành và nâng cao 40% hiệu năng tính toán so với các dòng vi xử lý x86 tương đương.
* Kích hoạt cơ chế mã hóa dữ liệu tại chỗ (**Encryption at Rest**) với khóa **AWS KMS** chuyên dụng (`aws/rds`).

---

### 2. Thông số kỹ thuật của Amazon RDS PostgreSQL

| Thuộc tính (Property) | Giá trị cấu hình thực tế | Ý nghĩa an toàn & Hiệu năng |
| :--- | :--- | :--- |
| **DB Identifier** | `rag-db` | Tên định danh thực thể cơ sở dữ liệu trên AWS |
| **Database Engine** | **PostgreSQL (v18.3)** | Hỗ trợ chuẩn SQL hiện đại, tương thích ORM SQLAlchemy |
| **DB Instance Class** | **`db.t4g.micro`** (2 vCPU, 1 GB RAM) | Vi xử lý AWS Graviton thế hệ mới, tối ưu chi phí |
| **Region & AZ** | `ap-southeast-1b` (Singapore) | Nằm trong phân vùng Private Subnet của VPC `vpc-03228d0b15b9ea7be` |
| **Database Name** | `rag_db` | Tên cơ sở dữ liệu logic lưu trữ schema RAG |
| **Master Username** | `postgres` | Tài khoản quản trị cơ sở dữ liệu |
| **Storage Specifications** | 20 GiB General Purpose SSD (`gp2`) | Bật tự động mở rộng dung lượng đĩa (Storage Autoscaling) |
| **Encryption** | **Enabled (KMS `aws/rds`)** | Mã hóa 100% dữ liệu file và snapshot sao lưu tự động |
| **Network Security** | Gán `rag-rds-sg` (`sg-0e06a5a9265f5c77d`) | Chỉ cho phép kết nối cổng 5432 duy nhất từ `rag-ec2-sg` |

---

### 3. Các bước triển khai chi tiết & Bằng chứng thực tế (Evidence)

#### Bước 1: Khởi tạo RDS PostgreSQL Instance
1. Truy cập **Amazon RDS Console** → chọn **Databases** → bấm **Create database**.
2. Chọn phương thức khởi tạo: **Standard create**.
3. **Engine options**: Chọn **PostgreSQL** (phiên bản `18.3`).
4. **Templates**: Chọn **Free tier** hoặc **Dev/Test**.
5. **Settings**:
   * DB instance identifier: `rag-db`.
   * Master username: `postgres`.
   * Master password: Nhập mật khẩu bảo mật (và lưu đồng bộ vào Secrets Manager).
6. **Instance configuration**:
   * DB instance class: **Burstable classes (includes t classes)** → chọn `db.t4g.micro`.
7. **Connectivity**:
   * Virtual private cloud (VPC): Chọn `vpc-03228d0b15b9ea7be`.
   * DB Subnet group: Chọn subnet group chứa các Private Subnets.
   * Public access: Chọn **No** (Bảo đảm an toàn tuyệt đối).
   * Existing VPC security groups: Chọn `rag-rds-sg`.
8. **Database authentication**: Chọn **Password authentication**.
9. **Additional configuration**:
   * Initial database name: `rag_db`.
   * Enable encryption: Chọn **Enable encryption** với AWS KMS Key mặc định `aws/rds`.
10. Bấm **Create database**.

<div align="center">
  <img src="/images/4-Workshop/4.2/4.2.2-rds-postgresql-configuration.png" alt="Cấu hình chi tiết RDS PostgreSQL rag-db trên AWS Console" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 4.2.2.1: Chi tiết bảng thông số cấu hình cơ sở dữ liệu rag-db (PostgreSQL 18.3, db.t4g.micro, KMS Encryption Enabled)</em></p>
</div>

---

#### Bước 2: Khởi tạo Lược đồ Cơ sở dữ liệu (Database Schema Migration)
Khi máy chủ ứng dụng EC2 kết nối lần đầu tiên tới RDS PostgreSQL, hệ thống tự động thực thi các script khởi tạo bảng (hoặc qua công cụ `alembic upgrade head`):
* Bảng `users`: Lưu trữ thông tin tài khoản nhân viên, mật khẩu băm bcrypt và vai trò (Admin/Staff).
* Bảng `documents`: Quản lý danh mục tài liệu, metadata, trạng thái Ingestion (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`) và S3 Key tương ứng.
* Bảng `conversations` & `messages`: Lưu trữ lịch sử hỏi đáp, câu truy vấn và câu trả lời sinh bởi mô hình ngôn ngữ lớn (LLM).

---

## 4.2.3. Triển khai Qdrant Vector Store trên Container Runtime

### 1. Mục tiêu kỹ thuật
* Triển khai công cụ **Vector Database Qdrant** chuyên dụng cho việc đánh chỉ mục và truy vấn tương đồng ngữ nghĩa vector không gian nhiều chiều.
* Lưu trữ các vector biểu diễn ngữ nghĩa (1024 chiều) tạo ra từ mô hình nhúng tiên tiến đa ngôn ngữ **`BAAI/bge-m3`**.
* Cấu hình cấu trúc đồ thị **HNSW (Hierarchical Navigable Small World)** kết hợp khoảng cách **Cosine Similarity** nhằm đạt tốc độ truy xuất vector dưới 15 mili-giây (sub-15ms) trên tập dữ liệu hàng nghìn tài liệu.

---

### 2. Cấu hình triển khai Qdrant qua Docker Compose
Dịch vụ Qdrant được triển khai dưới dạng container độc lập trên cùng hạ tầng máy chủ EC2 RAG Server, liên kết dữ liệu bền vững (Persistent Volume) vào ổ đĩa EBS:

```yaml
  qdrant:
    image: qdrant/qdrant:v1.9.0
    container_name: rag_qdrant
    restart: always
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - ./data/qdrant_storage:/qdrant/storage
    environment:
      - QDRANT__SERVICE__HTTP_PORT=6333
      - QDRANT__SERVICE__GRPC_PORT=6334
```

---

### 3. Khởi tạo và Xác thực Vector Collection
Ứng dụng RAG tự động khởi tạo Collection `enterprise_knowledge` với cấu hình tham số:
* **Vector Size**: `1024` (Khớp chính xác với kích thước vector đầu ra của `bge-m3`).
* **Distance Metric**: `Cosine`.
* **On-Disk Payload**: `True` (Tối ưu hóa bộ nhớ RAM bằng cách lưu payload văn bản gốc trên ổ đĩa SSD).

Lệnh kiểm tra trạng thái hoạt động của Qdrant Engine từ terminal nội bộ:
```bash
curl -X GET http://localhost:6333/collections
```

* Phản hồi trả về xác nhận trạng thái sẵn sàng:
```json
{
  "result": {
    "collections": [
      {
        "name": "enterprise_knowledge"
      }
    ]
  },
  "status": "ok",
  "time": 0.0012
}
```

---

### Tóm kết Lab 4.2:
Kết thúc Lab 4.2, toàn bộ hệ thống lưu trữ dữ liệu chuyên sâu cho nền tảng AI RAG đã được vận hành trơn tru:
1. **AWS Secrets Manager** bảo vệ tập trung và tự động phân phối toàn bộ thông tin đăng nhập nhạy cảm.
2. **Amazon RDS PostgreSQL** hoạt động ổn định trên phần cứng Graviton, cô lập trong Private Subnet và mã hóa an toàn qua KMS.
3. **Qdrant Vector Database** sẵn sàng tiếp nhận hàng triệu vector nhúng tài liệu phục vụ việc tra cứu tương đồng ngữ nghĩa.

Hệ thống đã hoàn toàn sẵn sàng cho **Lab 4.3: Đóng gói Container Docker & Thiết lập CI/CD với Amazon ECR**.
