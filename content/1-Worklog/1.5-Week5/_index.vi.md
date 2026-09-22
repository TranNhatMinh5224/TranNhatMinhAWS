---
title: "Worklog Tuần 5"
date: 2026-08-31
weight: 5
chapter: false
pre: " <b> 1.5. </b> "
---

# Worklog Tuần 5: Giám Sát Toàn Diện Với AWS CloudWatch & Kiểm Vết Hoạt Động CloudTrail

### 1. Thông tin chung & Mục tiêu trọng tâm
* **Thời gian thực hiện:** Từ 31/08/2026 đến 06/09/2026 (Tuần 5).
* **Đối chiếu kế hoạch học tập [TTTN-02.docx]:** Mục tiêu Tuần 5 — *Tìm hiểu về AWS CloudWatch (giám sát) và CloudTrail (kiểm vết hoạt động)*.
* **Cán bộ hướng dẫn (CBHD):** Phạm Văn Phóng (Solutions Architect).
* **Người phụ trách ĐVHD:** Nguyễn Gia Hưng (Senior Solutions Architect - AWS Vietnam).
* **Mục tiêu kỹ thuật cốt lõi:**
  1. Làm chủ bộ công cụ quan sát (**Observability**) và kiểm định an toàn vận hành (**Operational Auditing**) cốt lõi trên đám mây AWS:
     - **Amazon CloudWatch:** Giám sát chỉ số hiệu năng (Metrics), tập trung hóa nhật ký ghi chép (Logs), xây dựng cảnh báo ngưỡng vi phạm (Alarms) và bảng điều khiển trực quan (Dashboards).
     - **AWS CloudTrail:** Ghi vết liên tục toàn bộ các hoạt động quản trị và lời gọi API của tài khoản (xác định rõ: ai gọi API, lúc nào, từ IP nào, qua quyền hạn gì).
  2. Phân biệt ranh giới kiến trúc: CloudWatch phục vụ theo dõi sức khỏe và hiệu năng hệ thống (*Health & Performance*); CloudTrail phục vụ điều tra sự cố bảo mật và tuân thủ pháp lý (*Security & Compliance Audit*).
  3. Cài đặt và cấu hình **CloudWatch Unified Agent** trên hệ điều hành Ubuntu để thu thập các chỉ số sâu của Guest OS mà Hypervisor không thể nhìn thấy: Tỷ lệ sử dụng bộ nhớ RAM (`mem_used_percent`) và dung lượng đĩa cứng (`disk_used_percent`).
  4. Thiết lập quy trình phản ứng sự cố tự động: Cấu hình **CloudWatch Alarm** kết hợp **Amazon SNS** gửi email cảnh báo trực tiếp cho kỹ sư trực ca khi tài nguyên EC2 vượt ngưỡng 80%.

---

### 2. Nhật ký triển khai chi tiết từng ngày (Daily Technical Log)

| Ngày | Nội dung công việc & Mục tiêu kỹ thuật | Kết quả & Bằng chứng thực tế |
| :--- | :--- | :--- |
| **Thứ 2 (31/08)** | • Kích hoạt AWS CloudTrail đa vùng (**Multi-Region Trail**) `Enterprise-Audit-Trail`.<br>• Cấu hình CloudTrail ghi toàn bộ Management Events (Read/Write) xuất về S3 bucket riêng được bảo vệ bằng mã hóa SSE-KMS.<br>• Bật tính năng kiểm tra tính toàn vẹn của tệp nhật ký (*Log File Integrity Validation*) bằng mã băm SHA-256. | Mọi thao tác tạo/sửa/xóa tài nguyên trên toàn bộ các Region đều được ghi vết minh bạch, chống can thiệp. |
| **Thứ 3 (01/09)** | • Cài đặt gói phần mềm **Amazon CloudWatch Unified Agent** trên máy ảo EC2.<br>• Viết file cấu hình `amazon-cloudwatch-agent.json` để định kỳ 60 giây đẩy chỉ số RAM, Disk và Swap về CloudWatch Custom Metrics.<br>• Gán chính sách `CloudWatchAgentServerPolicy` vào IAM Role của máy chủ EC2. | Namespace `CWAgent` xuất hiện trên CloudWatch Console, hiển thị đồ thị RAM thực tế của máy chủ. |
| **Thứ 4 (02/09)** | • Tự học & Nghiên cứu nâng cao (Nghỉ lễ Quốc khánh 2/9):<br>• Thực hành ngôn ngữ truy vấn **CloudWatch Logs Insights**: Viết các câu lệnh truy vấn lọc log lỗi HTTP 5xx từ web server và đếm tần suất truy cập theo từng IP.<br>• Nghiên cứu cơ chế cấu hình cảnh báo tổng hợp (Composite Alarms). | Làm chủ kỹ năng điều tra log sự cố nhanh chóng mà không cần tải file log thô về máy cục bộ. |
| **Thứ 5 (03/09)** | • Thiết lập CloudWatch Metric Alarm `EC2-CPU-High-Utilization` theo dõi metric `CPUUtilization` (ngưỡng >80% trong 2 chu kỳ 5 phút liên tiếp).<br>• Thiết lập Alarm thứ hai `EC2-Memory-High-Utilization` theo dõi `mem_used_percent` (ngưỡng >85%).<br>• Liên kết cả hai Alarm vào Amazon SNS Topic `System-Critical-Alerts`. | Hệ thống cảnh báo tự động sẵn sàng giám sát sức khỏe cụm máy chủ Capstone. |
| **Thứ 6 (04/09)** | • Thực hành giả lập quá tải (Stress Testing): Cài đặt tiện ích `stress-ng` trên máy chủ EC2, chạy lệnh giả lập tải CPU 95% trong 15 phút.<br>• Quan sát đồ thị CloudWatch: Trạng thái chuyển từ `OK` sang `ALARM` sau đúng 10 phút.<br>• Kiểm tra hộp thư: Nhận được email cảnh báo thời gian thực chứa đầy đủ thông số vi phạm. | Xác minh quy trình phát hiện và thông báo sự cố vận hành chuẩn xác 100%. |
| **Thứ 7 - CN (05-06/09)** | • Thiết kế bảng điều khiển trung tâm **CloudWatch Operational Dashboard** gồm 4 Widget: CPU Usage, RAM Usage, Disk Free Space, và Network In/Out.<br>• Tổng hợp tài liệu hướng dẫn và hoàn thành báo cáo thực hành Tuần 5. | Bàn giao hệ thống giám sát và kiểm vết đạt chuẩn SLA vận hành theo TTTN-02. |

---

### 3. Thao tác kỹ thuật & Mã lệnh cấu hình thực tế (Hands-on Labs & CLI)

#### 3.1. Cấu hình CloudWatch Unified Agent trên EC2 (`amazon-cloudwatch-agent.json`):
```json
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "root"
  },
  "metrics": {
    "namespace": "CWAgent",
    "metrics_collected": {
      "mem": {
        "measurement": [
          "mem_used_percent",
          "mem_total",
          "mem_used"
        ]
      },
      "disk": {
        "measurement": [
          "used_percent",
          "free"
        ],
        "resources": [
          "/"
        ]
      }
    }
  }
}
```

#### 3.2. Khởi chạy CloudWatch Agent bằng lệnh CLI:
```bash
# Tải và cài đặt Agent trên Ubuntu
wget https://s3.ap-southeast-1.amazonaws.com/amazoncloudwatch-agent-ap-southeast-1/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

# Khởi chạy Agent cùng file cấu hình
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

# Kiểm tra trạng thái hoạt động của Agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a status
```

#### 3.3. Truy vấn phân tích log với CloudWatch Logs Insights:
```sql
fields @timestamp, @message
| filter @message like /ERROR/ or @message like /500/
| parse @message "* [*] * *" as timestamp, log_level, module, error_detail
| stats count(*) by bin(5m)
| sort @timestamp desc
| limit 50
```

#### 3.4. Giả lập tải kiểm thử CloudWatch Alarm:
```bash
# Cài đặt công cụ tạo tải
sudo apt-get update && sudo apt-get install -y stress-ng

# Đẩy tải 2 luồng CPU liên tục 100% trong 15 phút (900 giây)
stress-ng --cpu 2 --timeout 900s --metrics-brief
```

---

### 4. Thách thức kỹ thuật & Cách giải quyết sự cố (Challenges & Troubleshooting)

* **Sự cố 1: CloudWatch mặc định không hiển thị chỉ số RAM và Dung lượng đĩa cứng.**
  * *Triệu chứng:* Khi vào CloudWatch Metrics của EC2, chỉ tìm thấy các metric như `CPUUtilization`, `NetworkIn`, `DiskReadBytes`, nhưng hoàn toàn không có thông tin RAM hay dung lượng ổ đĩa còn trống.
  * *Phân tích nguyên nhân (Root Cause):* AWS Hypervisor (Nitro System) hoạt động ở tầng ngoài của phần cứng ảo hóa. Để tôn trọng quyền riêng tư dữ liệu và bảo mật hệ điều hành khách (*Guest OS Boundary*), Hypervisor tuyệt đối không thâm nhập vào bộ nhớ RAM hay cấu trúc tệp tin nội bộ của máy chủ.
  * *Giải pháp khắc phục:* Bắt buộc phải cài đặt **Amazon CloudWatch Unified Agent** chạy trực tiếp bên trong hệ điều hành khách và cấp quyền `CloudWatchAgentServerPolicy` cho IAM Role của instance để định kỳ xuất dữ liệu ra ngoài.

* **Sự cố 2: Trạng thái SNS Subscription bị kẹt ở `PendingConfirmation`.**
  * *Triệu chứng:* Đã cấu hình Alarm bắn sự kiện sang SNS Topic, nhưng khi máy chủ quá tải và Alarm chuyển sang màu đỏ (`ALARM`), kỹ sư vẫn không nhận được email thông báo.
  * *Phân tích nguyên nhân:* Người dùng sau khi chạy lệnh tạo subscription chưa truy cập vào hòm thư cá nhân để nhấn vào liên kết xác nhận quyền sở hữu (*Opt-in Confirmation Link*) do AWS tự động gửi. Khi ở trạng thái chờ duyệt (`PendingConfirmation`), SNS sẽ không chuyển tiếp bất kỳ thông điệp nào.
  * *Giải pháp khắc phục:* Truy cập hòm thư, tìm email từ `no-reply@sns.amazonaws.com` với tiêu đề *AWS Notification - Subscription Confirmation*, bấm **Confirm subscription**. Kiểm tra lại trên giao diện SNS thấy trạng thái chuyển sang mã định danh Subscription ID hợp lệ.

---

### 5. Kết quả đạt được & Sản phẩm bàn giao (Deliverables)
1. **Kiến trúc quan sát (Observability Architecture) toàn diện:** Nắm vững và làm chủ CloudWatch Metrics, CloudWatch Logs và CloudWatch Dashboards.
2. **Hệ thống cảnh báo thời gian thực:** Cấu hình thành công 2 Alarm giám sát tải CPU và RAM tích hợp thông báo tự động qua Amazon SNS.
3. **Kiểm vết kiểm toán CloudTrail hoàn chỉnh:** Bật Multi-Region Trail ghi vết 100% các hành động API, bảo vệ dữ liệu bằng mã hóa KMS và khóa tính toàn vẹn tệp log.
