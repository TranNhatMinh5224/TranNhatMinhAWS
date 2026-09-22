---
title: "Worklog Tuần 6"
date: 2026-09-07
weight: 6
chapter: false
pre: " <b> 1.6. </b> "
---

### 1. Mục tiêu kỹ thuật tuần 6
* **Kiến trúc Cân bằng tải Lớp 7 (Application Load Balancer - ALB):** Thiết kế và triển khai cụm phân phối lưu lượng Internet-facing đặt tại Public Subnet của 2 Availability Zones (`ap-southeast-1a`, `ap-southeast-1b`), hỗ trợ SSL/TLS Offloading và Path-based Routing.
* **Định tuyến vi dịch vụ đa Target Group:** Tách biệt traffic người dùng giữa tầng Frontend (Next.js - Port 3000) và tầng API Gateway/Backend (FastAPI - Port 8000) dựa trên quy tắc đường dẫn HTTP request path (`/api/*` vs `/*`).
* **Hạ tầng đàn hồi Auto Scaling Group (ASG):** Xây dựng Launch Template chuẩn hóa (Nitro Enclaves, Amazon Linux 2023, IMDSv2, UserData bootstrap) và cấu hình nhóm tự co giãn đa vùng (Multi-AZ ASG) với cơ chế Target Tracking Scaling Policy (ngưỡng 70% CPU).
* **Kiểm thử tải & Đánh giá khả năng chịu lỗi (Resilience & Chaos Testing):** Giả lập lưu lượng tải cao đột biến bằng Apache Bench (`ab`) và `stress-ng` để kiểm chứng vòng đời Instance (Pending -> InService -> Terminating), thời gian Deregistration Delay (Connection Draining) và cơ chế tự phục hồi (Self-healing).

---

### 2. Nhật ký công việc kỹ thuật chi tiết

| Thứ | Nội dung kỹ thuật chuyên sâu | Kết quả chi tiết (Deliverables) |
| :--- | :--- | :--- |
| **Thứ 2<br>(07/09)** | **Nghiên cứu nguyên lý ELB (ALB vs NLB vs GLB) & Thiết kế Health Check**<br>- Phân tích mô hình OSI Layer 7 (HTTP/HTTPS) của ALB vs Layer 4 (TCP/UDP) của NLB.<br>- Xây dựng cơ chế Health Check tiêu chuẩn cho Microservices: Protocol `HTTP`, Path `/health`, Healthy Threshold `3`, Unhealthy Threshold `2`, Timeout `5s`, Interval `15s`.<br>- Thiết lập ma trận bảo mật Security Group Chaining: Chỉ cho phép EC2 nhận traffic HTTP từ Security Group của ALB (`sg-alb`), đóng hoàn toàn cổng direct access từ Internet. | - Tài liệu kiến trúc phân luồng Layer 7 ALB.<br>- Security Group `sg-alb` (mở Inbound 80/443 từ `0.0.0.0/0`) và `sg-ec2-backend` (chỉ mở Inbound 8000 từ `sg-alb`). |
| **Thứ 3<br>(08/09)** | **Triển khai Application Load Balancer & Cấu hình Path-based Routing**<br>- Tạo Internet-facing ALB trên 2 Public Subnet (`subnet-public-1a`, `subnet-public-1b`).<br>- Tạo 2 Target Groups riêng biệt: `tg-nexusdoc-frontend` (Port 3000) và `tg-nexusdoc-backend` (Port 8000).<br>- Cấu hình Listener Rule trên Port 80/443: Forward `/api/*` và `/docs` tới `tg-nexusdoc-backend`; Forward toàn bộ request còn lại `/*` tới `tg-nexusdoc-frontend`. | - ALB ARN hoạt động với DNS Name chuẩn AWS.<br>- Định tuyến thành công request thử nghiệm qua cURL: `/api/v1/health` trả về JSON backend; `/` trả về giao diện frontend. |
| **Thứ 4<br>(09/09)** | **Xây dựng Launch Template & Khởi tạo Auto Scaling Group**<br>- Soạn thảo Launch Template (`lt-nexusdoc-backend-v1`): AMI Amazon Linux 2023, Instance Type `t3.medium`, IAM Instance Profile gắn quyền CloudWatch & S3 Read.<br>- Nhúng UserData Script tự động kéo Docker image từ registry, cấu hình biến môi trường và chạy container FastAPI.<br>- Tạo Auto Scaling Group (`asg-nexusdoc-backend`): Min = 2, Desired = 2, Max = 5, gắn với 2 Private Application Subnets (`subnet-app-1a`, `subnet-app-1b`). | - Launch Template chuẩn hóa hỗ trợ versioning.<br>- Cụm ASG triển khai 2 EC2 Instances song song tại 2 AZ độc lập, tự động đăng ký (Auto-register) vào Target Group. |
| **Thứ 5<br>(10/09)** | **Thiết lập Scaling Policy & CloudWatch Alarms**<br>- Cấu hình Dynamic Scaling Policy kiểu Target Tracking: `ASGAverageCPUUtilization` duy trì ở mức 70%.<br>- Cài đặt Warmup Time: 180s (chờ container backend nạp model embedding trước khi cho phép tính toán CPU co giãn tiếp theo).<br>- Tinh chỉnh Connection Draining (Deregistration Delay): giảm từ 300s mặc định xuống 60s để rút ngắn thời gian giải phóng tài nguyên khi scale-in mà không drop active requests. | - Metric Alarm kích hoạt tự động trên CloudWatch Console.<br>- Cấu hình Scaling Policy hoàn chỉnh sẵn sàng cho stress test. |
| **Thứ 6<br>(11/09)** | **Stress Testing, Đánh giá Co giãn & Cơ chế Self-healing**<br>- Sử dụng Apache Bench trên máy trạm điều khiển: `ab -n 50000 -c 200 http://<alb-dns>/api/v1/health`.<br>- Chạy lệnh `stress-ng --cpu 4 --timeout 300s` trực tiếp trên 1 EC2 instance.<br>- Theo dõi CloudWatch: CPU cụm vọt lên 92% -> CloudWatch Alarm chuyển trạng thái `ALARM` -> ASG tự kích hoạt thêm 2 EC2 instances mới (Scale-out lên 4 instances).<br>- Thử nghiệm Terminate cưỡng bức 1 EC2 Instance: ASG lập tức phát hiện trạng thái Unhealthy và tự spawn 1 instance thay thế trong vòng 90 giây. | - Báo cáo đồ thị co giãn Auto Scaling & biểu đồ phân phối tải ALB đều đặn giữa các AZs.<br>- Xác thực hệ sinh thái đạt chuẩn High Availability 99.9%. |

---

### 3. Cấu hình & Lệnh AWS CLI thực thi

#### Khởi tạo Application Load Balancer và Target Group
```bash
# 1. Tạo Target Group cho tầng Backend API
aws elbv2 create-target-group \
    --name tg-nexusdoc-backend \
    --protocol HTTP \
    --port 8000 \
    --vpc-id vpc-0a1b2c3d4e5f \
    --health-check-protocol HTTP \
    --health-check-path /api/v1/health \
    --health-check-interval-seconds 15 \
    --healthy-threshold-count 2 \
    --unhealthy-threshold-count 2 \
    --target-type instance

# 2. Tạo Internet-facing Application Load Balancer trên 2 Public Subnet
aws elbv2 create-load-balancer \
    --name alb-nexusdoc-enterprise \
    --subnets subnet-0123pub1a subnet-0456pub1b \
    --security-groups sg-0albsecuritygroup \
    --scheme internet-facing \
    --type application \
    --ip-address-type ipv4

# 3. Tạo Listener và gắn Rule định tuyến theo đường dẫn (Path-based Routing)
aws elbv2 create-listener \
    --load-balancer-arn <ALB_ARN> \
    --protocol HTTP --port 80 \
    --default-actions Type=forward,TargetGroupArn=<FRONTEND_TG_ARN>

aws elbv2 create-rule \
    --listener-arn <LISTENER_ARN> \
    --priority 10 \
    --conditions Field=path-pattern,Values='/api/*' \
    --actions Type=forward,TargetGroupArn=<BACKEND_TG_ARN>
```

#### Thiết lập Auto Scaling Group với Target Tracking Scaling Policy
```bash
# Tạo Auto Scaling Group gắn vào Target Group và Private Subnets
aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name asg-nexusdoc-prod \
    --launch-template LaunchTemplateName=lt-nexusdoc-backend,Version='$Latest' \
    --min-size 2 \
    --max-size 5 \
    --desired-capacity 2 \
    --vpc-zone-identifier "subnet-0789app1a,subnet-0abcdefapp1b" \
    --target-group-arns <BACKEND_TG_ARN> \
    --health-check-type ELB \
    --health-check-grace-period 180

# Đính kèm chính sách co giãn tự động theo CPU 70%
aws autoscaling put-scaling-policy \
    --auto-scaling-group-name asg-nexusdoc-prod \
    --policy-name target-tracking-cpu-70 \
    --policy-type TargetTrackingScaling \
    --target-tracking-configuration file://scaling-policy-config.json
```
*Nội dung `scaling-policy-config.json`:*
```json
{
  "TargetValue": 70.0,
  "PredefinedMetricSpecification": {
    "PredefinedMetricType": "ASGAverageCPUUtilization"
  },
  "ScaleOutCooldown": 60,
  "ScaleInCooldown": 180
}
```

---

### 4. Vấn đề kỹ thuật (Troubleshooting & Root Cause Analysis)

#### Sự cố 1: ALB báo lỗi HTTP 502 Bad Gateway khi truy cập Backend API
* **Hiện tượng:** Truy cập qua ALB DNS name tới endpoint `/api/v1/health` nhận về mã lỗi HTTP 502 Bad Gateway từ CloudFront/ALB. Kiểm tra Target Group thấy trạng thái targets chuyển sang `unhealthy` với thông báo `Health checks failed with these codes: [404]`.
* **Nguyên nhân gốc rễ (RCA):** FastAPI triển khai route prefix là `/api/v1/health`, nhưng cấu hình mặc định trong Target Group Health Check lại để đường dẫn là `/`. Khi ALB gửi HTTP GET `/` tới container, FastAPI trả về mã lỗi `404 Not Found`. Do đó ALB coi instance bị chết và không forward traffic người dùng tới.
* **Giải pháp:** Cập nhật lại thuộc tính Health Check Path của Target Group sang `/api/v1/health` bằng lệnh `aws elbv2 modify-target-group --health-check-path /api/v1/health`. Target chuyển sang trạng thái `healthy` trong 30 giây.

#### Sự cố 2: Request rớt đột ngột khi Auto Scaling kích hoạt Scale-in
* **Hiện tượng:** Trong quá trình stress test kết thúc, lượng traffic giảm, ASG tiến hành hạ số lượng máy ảo từ 4 về 2. Khi đó, một số HTTP request đang xử lý RAG inference dở dang bị trả về lỗi `504 Gateway Timeout`.
* **Nguyên nhân gốc rễ (RCA):** Deregistration Delay mặc định của Target Group là 300 giây, nhưng Scale-in Cooldown của ASG lại đóng máy ảo quá đột ngột khi các kết nối TCP dài (Long-lived HTTP keep-alive) chưa kịp kết thúc chu trình trả dữ liệu.
* **Giải pháp:** Cấu hình chuẩn hóa `deregistration_delay.timeout_seconds = 60` trên Target Group, kết hợp cấu hình Lifecycle Hook `autoscaling:EC2_INSTANCE_TERMINATING` cho phép container hoàn tất xử lý các tác vụ RAG embedding dở dang trước khi EC2 chính thức bị terminate.

---

### 5. Kết quả & Đánh giá tuần 6
* Hệ thống đạt kiến trúc phân phối tải High Availability (HA) chuẩn AWS Well-Architected Framework: không tồn tại điểm nghẽn đơn lẻ (Single Point of Failure - SPOF).
* Lưu lượng truy cập được định tuyến thông minh theo giao thức Lớp 7 (Path-based routing), giúp tách bạch hoàn toàn frontend tĩnh và backend API xử lý nặng.
* Khả năng tự động co giãn (Auto Scaling) được kiểm chứng qua tải thực tế: phản hồi co giãn nhanh chóng trong 60 giây khi tải tăng và thu hồi tài nguyên an toàn giúp tối ưu hóa chi phí vận hành đám mây.
