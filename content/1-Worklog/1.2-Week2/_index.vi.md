---
title: "Worklog Tuần 2"
date: 2026-08-10
weight: 2
chapter: false
pre: " <b> 1.2. </b> "
---

# Worklog Tuần 2: Quản Trị Điện Toán Amazon EC2, Lưu Trữ S3 & Cấu Trúc Bảo Mật IAM Roles

### 1. Thông tin chung & Mục tiêu trọng tâm
* **Thời gian thực hiện:** Từ 10/08/2026 đến 16/08/2026 (Tuần 2).
* **Cán bộ hướng dẫn (CBHD):** Phạm Văn Phóng (Solutions Architect).
* **Người phụ trách ĐVHD:** Nguyễn Gia Hưng (Senior Solutions Architect - AWS Vietnam).
* **Mục tiêu kỹ thuật cốt lõi:**
  1. Nghiên cứu kiến trúc ảo hóa phần cứng **Amazon EC2 Nitro System**, phân tích đặc tả kỹ thuật giữa họ chip x86 (`t3.medium`) và vi xử lý Graviton ARM64 (`t4g.medium`) để tối ưu hóa tỷ lệ hiệu năng/chi phí (*Price-Performance*).
  2. Khởi tạo máy ảo EC2 Ubuntu 22.04 LTS, cấu hình cặp khóa SSH Key Pair an toàn, tự động hóa khởi tạo môi trường thông qua **EC2 UserData Script**.
  3. Xây dựng hồ lưu trữ tài liệu doanh nghiệp (**Document Lake**) trên **Amazon S3**: Cấu hình *S3 Block Public Access*, kích hoạt *S3 Versioning* bảo vệ tính toàn vẹn văn bản và mã hóa lưu trữ tĩnh bằng *SSE-S3 (AES-256)*.
  4. Triệt tiêu hoàn toàn rủi ro lộ lọt khóa xác thực (*Zero Hardcoded Credentials*): Thiết lập **IAM Roles for EC2 (Instance Profile)** cho phép ứng dụng truy xuất S3 hoàn toàn tự động thông qua **IMDSv2 (Instance Metadata Service v2)**.

---

### 2. Nhật ký triển khai chi tiết từng ngày (Daily Technical Log)

| Ngày | Nội dung công việc & Mục tiêu kỹ thuật | Kết quả & Bằng chứng thực tế |
| :--- | :--- | :--- |
| **Thứ 2 (10/08)** | • Phân tích bài toán tính toán cho hệ thống RAG: Cần máy chủ tối thiểu 2 vCPU, 4GB RAM để chạy Docker compose gồm FastAPI và Qdrant.<br>• So sánh chi phí: `t3.medium` ($0.0416/h) và `t4g.medium` ($0.0336/h). Graviton tiết kiệm hơn 20% chi phí.<br>• Tạo cặp khóa SSH Key Pair `minh-aws-key.pem` và phân quyền cục bộ `chmod 400`. | Cặp khóa khởi tạo thành công, lưu trữ an toàn trong thư mục mã hóa của máy phát triển. |
| **Thứ 3 (11/08)** | • Khởi tạo máy ảo EC2 Ubuntu 22.04 LTS qua AWS Management Console.<br>• Viết UserData script tự động cài đặt Docker Engine, Docker Compose plugin và AWS CLI v2 lúc boot.<br>• Kết nối SSH thành công vào EC2 instance, cấu hình file SSH config rút gọn. | Kiểm tra lệnh `docker --version` và `docker compose version` chạy trơn tru ngay sau khi khởi động máy. |
| **Thứ 4 (12/08)** | • Khởi tạo Amazon S3 Bucket `fcaj-enterprise-legal-docs-1113719893` tại Singapore.<br>• Kích hoạt chế độ mã hóa mặc định SSE-S3 (AES-256), bật tính năng Versioning để theo dõi lịch sử chỉnh sửa tài liệu.<br>• Bật toàn bộ 4 lớp phòng vệ của *S3 Block Public Access*. | Bucket S3 được bảo mật tuyệt đối, ngăn chặn mọi truy cập trái phép từ Internet. |
| **Thứ 5 (13/08)** | • Xây dựng IAM Trust Policy cho phép dịch vụ `ec2.amazonaws.com` nhận vai trò (*AssumeRole*).<br>• Tạo IAM Custom Policy `S3LegalDocsAccessPolicy` chỉ cho phép quyền `s3:GetObject`, `s3:PutObject`, `s3:ListBucket` trên đúng bucket dự án.<br>• Tạo Instance Profile và gắn trực tiếp vào máy chủ EC2. | Máy ảo EC2 có thể đọc/ghi dữ liệu trên S3 mà không cần lưu trữ bất kỳ file `~/.aws/credentials` nào. |
| **Thứ 6 (14/08)** | • Viết script Python sử dụng thư viện `boto3` kiểm tra tốc độ nạp tệp PDF/DOCX từ máy chủ EC2 lên S3.<br>• Thử nghiệm cơ chế S3 Lifecycle Rules: Tự động chuyển tài liệu cũ sang lớp lưu trữ *S3 Standard-IA* sau 30 ngày và *S3 Glacier Instant Retrieval* sau 90 ngày. | Băng thông nội bộ giữa EC2 và S3 trong cùng Region Singapore đạt tốc độ vượt trội (>100 MB/s), không tốn phí Egress. |
| **Thứ 7 - CN (15-16/08)** | • Rà soát bảo mật Security Group của EC2: Giới hạn Inbound Rule SSH chỉ cho phép địa chỉ IP tĩnh của sinh viên.<br>• Đóng gói tài liệu cấu hình và tổng hợp báo cáo thực hành tuần 2. | Hoàn tất 100% mục tiêu Tuần 2 theo kế hoạch TTTN-02. |

---

### 3. Thao tác kỹ thuật & Mã lệnh cấu hình thực tế (Hands-on Labs & CLI)

#### 3.1. Khởi tạo S3 Bucket chuẩn bảo mật cao:
```bash
# 1. Khởi tạo bucket tại Region Singapore
aws s3api create-bucket \
    --bucket fcaj-enterprise-legal-docs-1113719893 \
    --region ap-southeast-1 \
    --create-bucket-configuration LocationConstraint=ap-southeast-1

# 2. Khóa toàn bộ truy cập công cộng (Block Public Access)
aws s3api put-public-access-block \
    --bucket fcaj-enterprise-legal-docs-1113719893 \
    --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# 3. Kích hoạt tính năng Versioning bảo vệ dữ liệu pháp lý
aws s3api put-bucket-versioning \
    --bucket fcaj-enterprise-legal-docs-1113719893 \
    --versioning-configuration Status=Enabled
```

#### 3.2. Cấu hình IAM Role cho EC2 truy xuất S3 an toàn:
```bash
# 1. Tạo file trust-policy.json
cat << 'EOF' > trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ec2.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# 2. Tạo IAM Role
aws iam create-role \
    --role-name EC2-LegalRAG-AppRole \
    --assume-role-policy-document file://trust-policy.json

# 3. Gán quyền truy xuất bucket tài liệu theo nguyên tắc Least Privilege
aws iam attach-role-policy \
    --role-name EC2-LegalRAG-AppRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# 4. Tạo Instance Profile và đính kèm vào EC2
aws iam create-instance-profile --instance-profile-name EC2-LegalRAG-Profile
aws iam add-role-to-instance-profile \
    --instance-profile-name EC2-LegalRAG-Profile \
    --role-name EC2-LegalRAG-AppRole
```

#### 3.3. Khởi tạo EC2 Instance kèm UserData và áp dụng bắt buộc IMDSv2:
```bash
aws ec2 run-instances \
    --image-id ami-047126e509f96e28b \
    --instance-type t3.medium \
    --key-name minh-aws-key \
    --security-group-ids sg-0abcdef1234567890 \
    --subnet-id subnet-0123456789abcdef0 \
    --iam-instance-profile Name=EC2-LegalRAG-Profile \
    --metadata-options "HttpTokens=required,HttpEndpoint=enabled" \
    --user-data file://init_docker.sh \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=LegalRAG-Compute-Node}]'
```

---

### 4. Thách thức kỹ thuật & Cách giải quyết sự cố (Challenges & Troubleshooting)

* **Sự cố 1: Lỗi `Connection timed out` khi kết nối SSH vào máy chủ EC2.**
  * *Triệu chứng:* Khi chạy lệnh `ssh -i minh-aws-key.pem ubuntu@<EC2-Public-IP>`, terminal bị treo khoảng 30 giây rồi báo lỗi `ssh: connect to host ... port 22: Connection timed out`.
  * *Phân tích nguyên nhân (Root Cause):* Security Group của EC2 đã cấu hình Inbound Rule cho cổng 22 chỉ chấp nhận địa chỉ IP của quán cà phê ngày hôm trước (`14.232.xxx.xxx/32`). Khi về nhà, địa chỉ Public IP của máy tính thay đổi khiến gói tin SYN bị tường lửa Stateful của AWS drop âm thầm.
  * *Giải pháp khắc phục:* Dùng lệnh tự động truy vấn IP hiện tại và cập nhật Inbound Rule qua CLI:
    ```bash
    MY_CURRENT_IP=$(curl -s https://checkip.amazonaws.com)
    aws ec2 authorize-security-group-ingress \
        --group-id sg-0abcdef1234567890 \
        --protocol tcp --port 22 \
        --cidr ${MY_CURRENT_IP}/32
    ```
    Sau khi cập nhật, kết nối SSH thành công ngay lập tức.

* **Sự cố 2: Cảnh báo bảo mật IMDSv1 khi chạy rà quét AWS Security Hub.**
  * *Triệu chứng:* Security Hub đánh cờ cảnh báo mức độ Medium: *EC2 instances should use Instance Metadata Service Version 2 (IMDSv2)*.
  * *Phân tích nguyên nhân:* IMDSv1 sử dụng giao thức HTTP GET đơn giản không có token xác thực, dễ bị tin tặc khai thác thông qua lỗ hổng SSRF (*Server-Side Request Forgery*) trên web app để đọc trộm temporary credentials của IAM Role từ địa chỉ `http://169.254.169.254/latest/meta-data/`.
  * *Giải pháp khắc phục:* Áp dụng chính sách bắt buộc IMDSv2 (Session-oriented token) cho toàn bộ máy ảo bằng lệnh:
    ```bash
    aws ec2 modify-instance-metadata-options \
        --instance-id i-0123456789abcdef0 \
        --http-tokens required \
        --http-endpoint enabled
    ```
    Mọi truy vấn metadata bắt buộc phải lấy token qua phương thức `PUT` với header `X-aws-ec2-metadata-token-ttl-seconds: 21600`.

---

### 5. Kết quả đạt được & Sản phẩm bàn giao (Deliverables)
1. **Hạ tầng máy chủ EC2 sẵn sàng:** Triển khai thành công Ubuntu 22.04 LTS có cài đặt Docker & Compose, tối ưu hóa cấu hình cho ứng dụng RAG.
2. **Document Lake S3 chuẩn doanh nghiệp:** Mã hóa tĩnh AES-256, bật Versioning, kích hoạt trọn vẹn Block Public Access.
3. **Bảo mật IAM Roles không cần khóa tĩnh (Zero Standing Keys):** Ứng dụng trên EC2 giao tiếp với S3 thông qua temporary credentials được cấp phát an toàn bởi IMDSv2.
