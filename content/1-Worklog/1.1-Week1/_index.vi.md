---
title: "Worklog Tuần 1"
date: 2026-08-03
weight: 1
chapter: false
pre: " <b> 1.1. </b> "
---

# Worklog Tuần 1: Khởi Tạo Môi Trường, Quản Trị Định Danh IAM & Nền Tảng AWS Cloud

### 1. Thông tin chung & Mục tiêu trọng tâm
* **Thời gian thực hiện:** Từ 03/08/2026 đến 09/08/2026 (Tuần 1).
* **Cán bộ hướng dẫn (CBHD):** Phạm Văn Phóng (Solutions Architect).
* **Người phụ trách ĐVHD:** Nguyễn Gia Hưng (Senior Solutions Architect - AWS Vietnam).
* **Mục tiêu kỹ thuật cốt lõi:**
  1. Thiết lập tài khoản AWS thực hành tuân thủ nghiêm ngặt chuẩn an toàn **AWS Well-Architected Security Pillar**: Bật xác thực đa yếu tố (MFA) cho tài khoản Root, triệt tiêu hoàn toàn Root Access Keys.
  2. Xây dựng mô hình phân quyền quản trị định danh **AWS IAM (Identity and Access Management)** theo nguyên tắc đặc quyền tối thiểu (*Principle of Least Privilege*).
  3. Cài đặt và chuẩn hóa môi trường dòng lệnh **AWS CLI v2** trên môi trường phát triển cục bộ, cấu hình Default Region `ap-southeast-1` (Singapore).
  4. Thiết lập rào chắn kiểm soát chi phí tự động: Cấu hình **AWS Budgets** và **CloudWatch Billing Alarm** tích hợp **Amazon SNS** gửi cảnh báo qua Email khi chi phí vượt ngưỡng $5.
  5. Thấu hiểu mô hình chia sẻ trách nhiệm (**Shared Responsibility Model**) và các mô hình triển khai đám mây (IaaS, PaaS, SaaS) đối chiếu với bài toán triển khai hệ thống RAG thực tế.

---

### 2. Nhật ký triển khai chi tiết từng ngày (Daily Technical Log)

| Ngày | Nội dung công việc & Mục tiêu kỹ thuật | Kết quả & Bằng chứng thực tế |
| :--- | :--- | :--- |
| **Thứ 2 (03/08)** | • Khởi tạo tài khoản AWS thực hành chương trình First Cloud AI Journey (FCAJ).<br>• Kích hoạt Virtual MFA cho Root User thông qua ứng dụng Authenticator.<br>• Kiểm tra và xác nhận không tồn tại Root Access Keys nào được phát hành. | Tài khoản kích hoạt thành công, bảo mật cấp độ 1 hoàn tất theo chuẩn CIS AWS Foundations Benchmark. |
| **Thứ 3 (04/08)** | • Cài đặt AWS CLI v2 trên máy trạm Windows 11.<br>• Tạo IAM User quản trị phát triển `dev-admin`, gán quyền qua IAM Group `CloudDevelopers`.<br>• Cấu hình hồ sơ xác thực cục bộ `~/.aws/credentials` và `~/.aws/config`. | Lệnh `aws sts get-caller-identity` trả về định danh IAM User thành công, Region trỏ về `ap-southeast-1`. |
| **Thứ 4 (05/08)** | • Kích hoạt tính năng *Receive CloudWatch Billing Alerts* trong Billing Preferences.<br>• Thiết lập AWS Budget trần chi phí $10/tháng cho toàn bộ tài khoản.<br>• Tạo CloudWatch Metric Alarm theo dõi metric `EstimatedCharges` ngưỡng $5 USD (Region `us-east-1`). | Cấu hình Amazon SNS Topic `Billing-Alerts-Topic`, xác thực subscription qua email thành công. |
| **Thứ 5 (06/08)** | • Nghiên cứu hạ tầng toàn cầu của AWS: Region, Availability Zones (AZs), Edge Locations.<br>• Đánh giá chỉ số độ trễ (RTT) từ Việt Nam sang các Region lân cận (`ap-southeast-1`, `ap-east-1`).<br>• Nghiên cứu tài liệu *AWS Well-Architected Framework: Security & Cost Optimization Pillars*. | Chọn Singapore (`ap-southeast-1`) làm Region chiến lược cho dự án Capstone với độ trễ mạng thấp nhất (~35ms). |
| **Thứ 6 (07/08)** | • Tham gia buổi họp định hướng kỹ thuật (Orientation Meeting) cùng các Senior Architect AWS.<br>• Trình bày đề xuất ý tưởng Capstone: *Hệ thống Trợ lý AI Quản trị Tri thức & Pháp lý Doanh nghiệp (Enterprise Legal Knowledge RAG)*.<br>• Nhận phản hồi chuyên môn về việc thiết kế phân tầng mạng an toàn cho dữ liệu nhạy cảm. | Đề tài được mentor phê duyệt; định hình kiến trúc kết hợp giữa VPC Multi-AZ, Qdrant Vector DB và FastAPI. |
| **Thứ 7 - CN (08-09/08)** | • Hoàn thành các bài kiểm tra trắc nghiệm chuyên môn trên cổng đào tạo Cloud Journey.<br>• Tự học các khái niệm ảo hóa phần cứng EC2 Nitro System và kiến trúc lưu trữ khối EBS. | Đạt 100% điểm kiểm tra lý thuyết đầu vào chương trình thực tập. |

---

### 3. Thao tác kỹ thuật & Mã lệnh cấu hình thực tế (Hands-on Labs & CLI)

#### 3.1. Cấu hình môi trường dòng lệnh AWS CLI v2:
```bash
# Cấu hình Region mặc định và định dạng đầu ra
aws configure set default.region ap-southeast-1
aws configure set default.output json

# Xác thực định danh hiện tại và quyền hạn thực thi
aws sts get-caller-identity
```
*Output trả về:*
```json
{
    "UserId": "AIDAXAMPLEMINHJOURNEY",
    "Account": "1113719893XX",
    "Arn": "arn:aws:iam::1113719893XX:user/dev-admin"
}
```

#### 3.2. Khởi tạo IAM User và Group theo chuẩn Least Privilege:
```bash
# 1. Tạo nhóm phát triển đám mây
aws iam create-group --group-name CloudDevelopers

# 2. Gán chính sách quyền hạn cần thiết cho công việc phát triển (không dùng quyền Full Root)
aws iam attach-group-policy --group-name CloudDevelopers \
    --policy-arn arn:aws:iam::aws:policy/PowerUserAccess

# 3. Tạo tài khoản người dùng và thêm vào nhóm
aws iam create-user --user-name dev-admin
aws iam add-user-to-group --user-name dev-admin --group-name CloudDevelopers
```

#### 3.3. Thiết lập cảnh báo chi phí tự động qua CloudWatch & SNS:
```bash
# Tạo SNS Topic nhận thông báo chi phí
aws sns create-topic --name Billing-Alerts-Topic --region us-east-1

# Đăng ký nhận thông báo qua Email
aws sns subscribe \
    --topic-arn arn:aws:sns:us-east-1:1113719893XX:Billing-Alerts-Topic \
    --protocol email \
    --notification-endpoint nhatminh5224.forwork@gmail.com \
    --region us-east-1

# Tạo CloudWatch Alarm cảnh báo khi chi phí ước tính vượt quá 5 USD
aws cloudwatch put-metric-alarm \
    --alarm-name "Billing-Threshold-Over-5USD" \
    --metric-name EstimatedCharges \
    --namespace AWS/Billing \
    --statistic Maximum \
    --period 21600 \
    --threshold 5.0 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=Currency,Value=USD \
    --evaluation-periods 1 \
    --alarm-actions arn:aws:sns:us-east-1:1113719893XX:Billing-Alerts-Topic \
    --region us-east-1
```

---

### 4. Thách thức kỹ thuật & Cách giải quyết sự cố (Challenges & Troubleshooting)

* **Sự cố 1: Lỗi `SignatureDoesNotMatch` khi thực thi lệnh trên AWS CLI cục bộ.**
  * *Triệu chứng:* Khi chạy bất kỳ lệnh `aws ec2` hoặc `aws s3`, terminal trả về lỗi: `An error occurred (SignatureDoesNotMatch) when calling the ListBuckets operation: Signature expired: 20260804T071520Z is now earlier than 20260804T072045Z`.
  * *Phân tích nguyên nhân (Root Cause):* Hệ thống bảo mật AWS Signature Version 4 từ chối mọi yêu cầu có tem thời gian (timestamp) lệch quá 15 phút so với AWS NTP Server để phòng chống tấn công phát lại (*Replay Attack*). Đồng hồ máy tính cá nhân bị trôi lệch hơn 5 phút.
  * *Giải pháp khắc phục:* Thực thi đồng bộ lại thời gian Windows Time Service qua PowerShell Admin:
    ```powershell
    net start w32time
    w32tm /resync /force
    ```
    Sau khi đồng bộ, các lệnh CLI hoạt động chính xác 100%.

* **Sự cố 2: Metric `EstimatedCharges` không xuất hiện trong CloudWatch.**
  * *Triệu chứng:* Lệnh tạo Alarm báo lỗi không tìm thấy metric `EstimatedCharges` trong namespace `AWS/Billing`.
  * *Phân tích nguyên nhân:* Mặc định AWS tắt tính năng ghi nhận dữ liệu thanh toán vào CloudWatch. Ngoài ra, dữ liệu hóa đơn toàn cầu của AWS chỉ được tổng hợp duy nhất tại Region `us-east-1` (N. Virginia), không tồn tại ở Region `ap-southeast-1`.
  * *Giải pháp khắc phục:* Đăng nhập Root User vào giao diện Billing Preferences ➔ Bật tùy chọn `Receive CloudWatch Billing Alerts` ➔ Chuyển endpoint của lệnh CloudWatch sang Region `--region us-east-1`. Sau 15 phút, metric hiển thị đầy đủ.

---

### 5. Kết quả đạt được & Sản phẩm bàn giao (Deliverables)
1. **Tài khoản AWS thực hành an toàn tuyệt đối:** Tuân thủ 100% chuẩn CIS Benchmark (MFA Root kích hoạt, không dùng Root Key, quản trị qua IAM User có ranh giới quyền hạn).
2. **Hệ thống giám sát chi phí tự động:** Đảm bảo toàn bộ quá trình thực tập không bao giờ phát sinh chi phí ngoài tầm kiểm soát.
3. **Môi trường phát triển chuẩn hóa:** AWS CLI v2 và SDK sẵn sàng phục vụ việc viết mã và tự động hóa hạ tầng.
4. **Bản đề xuất Capstone sơ bộ:** Được mentor định hướng phát triển bài toán RAG Doanh nghiệp với kiến trúc đám mây Multi-AZ.
