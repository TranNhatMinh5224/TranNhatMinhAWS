---
title: "Đóng gói Container & Đẩy Image lên Amazon ECR"
date: 2026-08-25
weight: 3
chapter: false
pre: " <b> 5.3. </b> "
aliases:
  - /5-workshop/5.3-container-ecr/
  - /5-Workshop/5.3-container-ecr/
---

# 5.3. Đóng gói Container & Đẩy Image lên Amazon ECR

### Tổng quan bài Lab 5.3

Để đảm bảo hệ thống **Enterprise Knowledge AI RAG Assistant** có khả năng vận hành ổn định, đồng nhất và sẵn sàng cho việc mở rộng (Scalability), việc container hóa toàn bộ các dịch vụ bằng **Docker** là tiêu chuẩn bắt buộc. 

Bài lab 5.3 tập trung vào quy trình tự động hóa chu trình DevOps:
1. Thiết lập **IAM User `github-action`** với thông tin đăng nhập tự động hóa an toàn.
2. Khởi tạo kho lưu trữ container riêng tư **Amazon Elastic Container Registry (Amazon ECR)** cho cả Backend và Frontend.
3. Thiết lập đường ống **CI/CD tự động với GitHub Actions** để đóng gói Dockerfile, gắn thẻ phiên bản và đẩy image lên Cloud Registry.

---

### Danh sách các nội dung triển khai:

1. [**5.3.1. Cấu hình IAM User cho Tự động hóa CI/CD**](#531-cấu-hình-iam-user-cho-tự-động-hóa-cicd)
2. [**5.3.2. Khởi tạo Amazon ECR Private Repositories**](#532-khởi-tạo-amazon-ecr-private-repositories)
3. [**5.3.3. Đóng gói Dockerfile & Quy trình Tự động hóa GitHub Actions**](#533-đóng-gói-dockerfile--quy-trình-tự-động-hóa-github-actions)

---

## 5.3.1. Cấu hình IAM User cho Tự động hóa CI/CD

### 1. Mục tiêu kỹ thuật
* Khởi tạo tài khoản người dùng IAM độc lập (**IAM Service User**) chuyên dụng mang tên **`github-action`**.
* Tách biệt tài khoản tự động hóa khỏi người dùng thật, cấp quyền truy cập theo cơ chế Programmatic Access (Access Key ID & Secret Access Key).
* Lưu trữ an toàn các khóa bảo mật vào **GitHub Repository Secrets**, ngăn chặn nguy cơ rò rỉ mã nguồn hoặc thông tin nhạy cảm lên Internet.

---

### 2. Các bước triển khai chi tiết & Bằng chứng thực tế (Evidence)

#### Bước 1: Điều hướng đến giao diện quản trị IAM Users
Đăng nhập **AWS Management Console** → chọn dịch vụ **Identity and Access Management (IAM)** → chọn mục **IAM users** trên thanh điều hướng bên trái.

<div align="center">
  <img src="/images/5-Workshop/5.3/5.3.1-iam-users-nav.png" alt="Điều hướng đến mục IAM Users trên AWS Console" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 40%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.3.1.1: Thanh điều hướng Access Management - lựa chọn IAM users</em></p>
</div>

---

#### Bước 2: Khởi tạo User `github-action`
1. Bấm nút **Create user**.
2. Tại mục **User details**, nhập tên: **`github-action`**.
3. Bỏ qua tùy chọn truy cập AWS Management Console (chỉ kích hoạt quyền Programmatic API).

<div align="center">
  <img src="/images/5-Workshop/5.3/5.3.1-create-github-action-user.png" alt="Đặt tên người dùng github-action" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.3.1.2: Thiết lập thông tin User name github-action phục vụ CI/CD</em></p>
</div>

---

#### Bước 3: Phân quyền trực tiếp cho User
1. Tại bước **Set permissions**, chọn phương thức: **Attach policies directly**.
2. Tìm kiếm và chọn chính sách **`AdministratorAccess`** (hoặc gán chính sách giới hạn `AmazonEC2ContainerRegistryPowerUser` và `AmazonECS_FullAccess`).

<div align="center">
  <img src="/images/5-Workshop/5.3/5.3.1-github-action-set-permission.png" alt="Lựa chọn Attach policies directly" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.3.1.3: Chọn chế độ gán quyền trực tiếp Attach policies directly cho CI/CD user</em></p>
</div>

<div align="center">
  <img src="/images/5-Workshop/5.3/5.3.1-github-action-admin-policy.png" alt="Gán quyền AdministratorAccess cho github-action user" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.3.1.4: Lựa chọn chính sách quyền hạn đảm bảo pipeline có thể xác thực và đẩy image lên ECR</em></p>
</div>

---

#### Bước 4: Hoàn tất khởi tạo User & Tạo Access Key
1. Bấm **Create user**. Màn hình thông báo màu xanh `User created successfully` xác nhận hoàn thành.
2. Truy cập vào user `github-action` → chọn tab **Security credentials** → chọn **Create access key**.
3. Chọn Use case: **Third-party service (GitHub Actions)**.
4. Tải file CSV chứa **Access Key ID** và **Secret Access Key**.

<div align="center">
  <img src="/images/5-Workshop/5.3/5.3.1-github-action-user-created.png" alt="Thông báo khởi tạo User thành công" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.3.1.5: Thông báo User created successfully xác nhận người dùng github-action đã sẵn sàng</em></p>
</div>

5. Cấu hình cặp khóa bí mật này vào GitHub Repo tại: **Settings** → **Secrets and variables** → **Actions**:
   * `AWS_ACCESS_KEY_ID`: `AKIA...`
   * `AWS_SECRET_ACCESS_KEY`: `wJalr...`
   * `AWS_REGION`: `ap-southeast-1`

---

## 5.3.2. Khởi tạo Amazon ECR Private Repositories

### 1. Mục tiêu kỹ thuật
* Khởi tạo 2 kho lưu trữ Container riêng tư (**Private Repositories**) trên **Amazon Elastic Container Registry (ECR)** tại Region Singapore (`ap-southeast-1`).
* Quản lý vòng đời ảnh (Image Tag Immutability: `Mutable` phục vụ tag `latest` và SHA commit).
* Kích hoạt cơ chế mã hóa tiêu chuẩn **AES-256** bảo vệ toàn vẹn các lớp image (layers) lưu trữ trên đám mây.

---

### 2. Thông số kỹ thuật ECR Repositories

| Tên Repository (Name) | Phân hệ (Role) | Toàn vẹn URI (Full Repository URI) | Tag Mutability | Mã hóa (Encryption) |
| :--- | :--- | :--- | :--- | :--- |
| **`enterprise-rag-backend`** | FastAPI RAG Core & Celery Worker | `305068201208.dkr.ecr.ap-southeast-1.amazonaws.com/enterprise-rag-backend` | Mutable | AES-256 |
| **`enterprise-rag-frontend`** | Next.js Modern Web Interface | `305068201208.dkr.ecr.ap-southeast-1.amazonaws.com/enterprise-rag-frontend` | Mutable | AES-256 |

---

### 3. Các bước triển khai chi tiết & Bằng chứng thực tế (Evidence)

#### Bước 1: Khởi tạo ECR Repository cho Backend
1. Truy cập **Amazon ECR Console** → chọn **Repositories** → bấm **Create repository**.
2. **General settings**:
   * Visibility settings: **Private**.
   * Repository name: **`enterprise-rag-backend`**.
3. **Image tag settings**:
   * Image tag mutability: **Mutable** (Cho phép ghi đè tag `latest` khi triển khai bản cập nhật).
4. **Encryption settings**:
   * Encryption configuration: **AES-256**.
5. Bấm **Create repository**.

<div align="center">
  <img src="/images/5-Workshop/5.3/5.3.2-create-ecr-repository.png" alt="Khởi tạo Private Repository enterprise-rag-backend" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.3.2.1: Giao diện cấu hình tham số khởi tạo ECR Repository enterprise-rag-backend</em></p>
</div>

---

#### Bước 2: Khởi tạo ECR Repository cho Frontend & Xác nhận hoàn tất
Thực hiện tương tự để khởi tạo repository **`enterprise-rag-frontend`**. Kết quả xác thực hiển thị trên màn hình quản trị ECR:

<div align="center">
  <img src="/images/5-Workshop/5.3/5.3.2-ecr-repositories-list.png" alt="Danh sách các ECR Repositories đã tạo thành công" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.3.2.2: Minh chứng 2 kho lưu trữ Container riêng tư enterprise-rag-backend và enterprise-rag-frontend đã được tạo thành công</em></p>
</div>

---

## 5.3.3. Đóng gói Dockerfile & Quy trình Tự động hóa GitHub Actions

### 1. Cấu trúc Dockerfile Backend chuẩn tối ưu
File `Dockerfile` của Backend được thiết kế nhằm tối ưu dung lượng và tốc độ build:

```dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "src.backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### 2. Đường ống CI/CD tự động (`.github/workflows/deploy.yml`)
Quy trình tự động hóa kích hoạt mỗi khi có mã nguồn mới được push lên nhánh `main`:

```yaml
name: Deploy to Amazon ECR & EC2

on:
  push:
    branches: [ "main" ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Configure AWS Credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ap-southeast-1

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2

    - name: Build, Tag, and Push Backend Image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: enterprise-rag-backend
        IMAGE_TAG: latest
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG -f src/backend/Dockerfile .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

    - name: Trigger EC2 Rolling Deployment
      uses: appleboy/ssh-action@v1.0.3
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ubuntu
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 305068201208.dkr.ecr.ap-southeast-1.amazonaws.com
          cd /home/ubuntu/RAG
          docker compose pull
          docker compose up -d
```

---

### Tóm kết Lab 5.3:
Sau khi hoàn tất Lab 5.3:
1. **IAM User `github-action`** đã được cấu hình với quyền hạn chính xác, kết nối an toàn với GitHub Secrets.
2. Hai kho lưu trữ **Amazon ECR** (`enterprise-rag-backend`, `enterprise-rag-frontend`) đã sẵn sàng quản lý các phiên bản Container.
3. Pipeline **CI/CD tự động** đảm bảo mọi thay đổi mã nguồn đều được tự động đóng gói, gắn thẻ và đẩy lên đám mây AWS mà không cần can thiệp thủ công.

Hệ thống đã sẵn sàng bước vào **Lab 5.4: Triển khai Máy chủ & Cân bằng tải Application Load Balancer (ALB)**.
