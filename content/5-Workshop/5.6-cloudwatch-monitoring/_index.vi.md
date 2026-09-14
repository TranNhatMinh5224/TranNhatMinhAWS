---
title: "Giám sát Vận hành & Cảnh báo Sự cố với Amazon CloudWatch"
date: 2026-08-25
weight: 6
chapter: false
pre: " <b> 5.6. </b> "
aliases:
  - /5-workshop/5.6-cloudwatch-monitoring/
  - /5-Workshop/5.6-cloudwatch-monitoring/
---

# 5.6. Giám sát Vận hành & Cảnh báo Sự cố với Amazon CloudWatch

### Tổng quan bài Lab 5.6

Sau khi kiểm thử toàn diện quy trình xử lý dữ liệu và cơ chế bảo vệ an toàn của mô hình RAG, bước tiếp theo là xây dựng hệ thống **Giám sát khả năng quan sát (Observability)** và **Cảnh báo sự cố tự động (Automated Incident Alerting)** nhằm đảm bảo tính ổn định và sẵn sàng cao của hệ thống trong môi trường sản xuất.

Bài lab 5.6 tập trung vào 3 trọng tâm kỹ thuật:
1. **Phân tích chỉ số mạng của Application Load Balancer**: Theo dõi các số liệu viễn trắc mạng thời gian thực (`RequestCount`, `HTTPCode_Target_2XX_Count`, `TargetResponseTime`, `CapacityUtilization`).
2. **Xây dựng bảng điều khiển tập trung (CloudWatch Dashboard `Dashboard-RAG`)**: Trực quan hóa đa chiều các tài nguyên tính toán EC2, lưu lượng mạng ALB, tần suất gọi API và hiệu năng đọc/ghi ổ đĩa EBS.
3. **Cấu hình cảnh báo tự động qua Amazon SNS (CloudWatch Metric Alarm)**: Thiết lập ngưỡng cảnh báo quá tải CPU máy chủ (`RAG-Server-High-CPU-Alarm`) và tự động gửi email thông báo khẩn cấp tới kỹ sư vận hành.

---

### Danh mục các nội dung triển khai:

1. [**5.6.1. Giám sát Chỉ số Mạng của Application Load Balancer**](#561-giám-sát-chỉ-số-mạng-của-application-load-balancer)
2. [**5.6.2. Thiết lập Bảng điều khiển Giám sát Tập trung (CloudWatch Dashboard `Dashboard-RAG`)**](#562-thiết-lập-bảng-điều-khiển-giám-sát-tập-trung-cloudwatch-dashboard-dashboard-rag)
3. [**5.6.3. Cấu hình Cảnh báo Tự động qua Amazon SNS (CloudWatch Metric Alarm)**](#563-cấu-hình-cảnh-báo-tự-động-qua-amazon-sns-cloudwatch-metric-alarm)

---

## 5.6.1. Giám sát Chỉ số Mạng của Application Load Balancer

### 1. Mục tiêu kỹ thuật
* **Amazon CloudWatch** là dịch vụ giám sát và quan sát (Observability) tích hợp sẵn của AWS, thu thập và hiển thị các số liệu vận hành theo thời gian thực từ mọi tài nguyên đám mây.
* Đối với cụm **Application Load Balancer (`rag-lb`)**, ba chỉ số quan trọng nhất cần theo dõi liên tục bao gồm:
  1. **`RequestCount`**: Tổng số lượng yêu cầu HTTP/HTTPS được xử lý qua Load Balancer trong mỗi chu kỳ thời gian.
  2. **`HTTPCode_Target_2XX_Count`**: Số lượng yêu cầu nhận được mã phản hồi thành công (200 OK, 201 Created) từ máy chủ backend/frontend.
  3. **`TargetResponseTime`**: Thời gian phản hồi trung bình (tính bằng giây) từ lúc Target nhận yêu cầu đến khi gửi toàn bộ dữ liệu trả về cho ALB.

---

### 2. Bằng chứng giám sát thực tế trên AWS Console (Evidence)

Truy cập **CloudWatch Management Console** $\rightarrow$ chọn **Metrics** $\rightarrow$ mục **All metrics** $\rightarrow$ chọn namespace **`ApplicationELB`** $\rightarrow$ **`Per AppELB Metrics`** $\rightarrow$ chọn Load Balancer **`app/rag-lb/dd9f64ed734dab43`**.

<div align="center">
  <img src="/images/5-Workshop/5.6/5.6.1-cloudwatch-per-appelb-metrics.png" alt="Danh sách metrics của Load Balancer rag-lb trên CloudWatch" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.6.1: Giao diện CloudWatch Metrics theo dõi chi tiết tài nguyên Load Balancer app/rag-lb/dd9f64ed734dab43</em></p>
</div>

<div align="center">
  <img src="/images/5-Workshop/5.6/5.6.1-cloudwatch-alb-metrics.png" alt="Đồ thị CloudWatch Metrics cho Application Load Balancer" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.6.2: Đồ thị giám sát chi tiết RequestCount, HTTPCode_Target_2XX_Count và TargetResponseTime</em></p>
</div>

#### Chi tiết các thông số đo lường từ đồ thị CloudWatch:

| Tham số / Metric | Namespace / Chi tiết | Thống kê (Statistic) | Chu kỳ (Period) | Nhận xét vận hành |
| :--- | :--- | :--- | :--- | :--- |
| **RequestCount** | `ApplicationELB • RequestCount • LoadBalancer` | Average / Sum | 15 minutes | Ghi nhận lưu lượng tăng rõ rệt vào khung giờ kiểm thử (11:00 - 12:00 và 12:30 - 13:00) tương ứng với các truy vấn RAG streaming. |
| **HTTPCode_Target_2XX_Count** | `ApplicationELB • HTTPCode_Target_2XX_Count • LoadBalancer` | Average | 15 minutes | Trùng khớp 100% với số lượng Request, chứng minh toàn bộ các yêu cầu HTTP đều được xử lý thành công (Zero 5XX / Zero 4XX lỗi hệ thống). |
| **TargetResponseTime** | `ApplicationELB • TargetResponseTime • LoadBalancer` | Average | 15 minutes | Dao động ở mức rất thấp (~0.05s đến 0.12s), chứng minh năng lực xử lý ổn định của máy chủ EC2 `enterprise-rag-server` và thuật toán tìm kiếm vector Qdrant. |

---

## 5.6.2. Thiết lập Bảng điều khiển Giám sát Tập trung (CloudWatch Dashboard `Dashboard-RAG`)

### 1. Mục tiêu kỹ thuật
Để đội ngũ kỹ sư vận hành có cái nhìn tổng thể toàn diện về tình trạng sức khỏe của hệ thống RAG trong thời gian thực, một Dashboard tùy biến mang tên **`Dashboard-RAG`** đã được khởi tạo:

1. Tại **CloudWatch Console** $\rightarrow$ chọn **Dashboards** $\rightarrow$ bấm **Create dashboard** $\rightarrow$ đặt tên là **`Dashboard-RAG`**.
2. Thêm các widget trực quan hóa đa chiều:
   * **Widget 1 (CPUUtilization)**: Giám sát phần trăm sử dụng CPU của máy chủ tính toán EC2.
   * **Widget 2 (HTTPCode_Target_2XX_Count, RequestCount, TargetResponseTime)**: Theo dõi lưu lượng và độ trễ của ALB.
   * **Widget 3 (CallCount, ErrorCount)**: Theo dõi số lượng lệnh gọi API và phát hiện lỗi phát sinh.
   * **Widget 4 (VolumeAvgIOPS, VolumeAvgReadLatency, VolumeAvgThroughput)**: Theo dõi tốc độ đọc/ghi và thông lượng I/O của ổ đĩa lưu trữ EBS.

<div align="center">
  <img src="/images/5-Workshop/5.6/5.6.2-cloudwatch-dashboard-rag.png" alt="Bảng điều khiển trực quan hóa CloudWatch Dashboard-RAG" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.6.3: Bảng điều khiển CloudWatch Dashboard-RAG tổng hợp trực quan các chỉ số CPU, ALB, Call/Error Count và EBS IOPS</em></p>
</div>

---

## 5.6.3. Cấu hình Cảnh báo Tự động qua Amazon SNS (CloudWatch Metric Alarm)

Hệ thống thiết lập một cảnh báo giám sát chủ động (**Proactive Metric Alarm**) để kịp thời phát hiện trường hợp máy chủ EC2 bị quá tải CPU do các tác vụ tính toán nhúng vector hoặc lượng truy vấn RAG tăng đột biến:

#### Bước 1: Chọn Metric và điều kiện kích hoạt
* **Namespace**: `AWS/EC2`
* **Metric name**: `CPUUtilization`
* **InstanceId**: Máy chủ RAG server (`enterprise-rag-server` / `i-0f7f40a8245434328`)
* **Statistic**: `Average`, **Period**: `5 minutes`
* **Threshold type**: `Static` $\rightarrow$ Điều kiện: `Greater > threshold` (vượt ngưỡng cho phép).

<div align="center">
  <img src="/images/5-Workshop/5.6/5.6.3-cloudwatch-alarm-cpu-metric.png" alt="Cấu hình chỉ số CPUUtilization cho CloudWatch Alarm" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.6.4: Thiết lập điều kiện giám sát CPUUtilization cho máy chủ EC2 trong 5 phút</em></p>
</div>

#### Bước 2: Cấu hình Hành động Thông báo qua Amazon SNS
* **Alarm state trigger**: `In alarm` (Kích hoạt khi trạng thái rơi vào ngưỡng báo động).
* **Send a notification to**: Chọn topic SNS có sẵn: **`Default_CloudWatch_Alarms_Topic`**.
* **Email endpoint**: `nhatminh5224.forwork@gmail.com` (Email kỹ sư phụ trách vận hành nhận thông báo khẩn cấp).

<div align="center">
  <img src="/images/5-Workshop/5.6/5.6.3-cloudwatch-alarm-sns-action.png" alt="Cấu hình gửi thông báo qua Amazon SNS Topic" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.6.5: Cấu hình hành động gửi thông báo qua SNS Topic tới email nhatminh5224.forwork@gmail.com khi có cảnh báo</em></p>
</div>

#### Bước 3: Đặt tên và Khởi tạo Cảnh báo thành công
* Đặt tên cảnh báo: **`RAG-Server-High-CPU-Alarm`**.
* Bấm **Create alarm**. Hệ thống CloudWatch xác nhận khởi tạo thành công với trạng thái sẵn sàng lắng nghe (`Actions enabled`).

<div align="center">
  <img src="/images/5-Workshop/5.6/5.6.3-cloudwatch-alarm-created-success.png" alt="Khởi tạo thành công CloudWatch Alarm RAG-Server-High-CPU-Alarm" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.6.6: CloudWatch Alarm RAG-Server-High-CPU-Alarm được khởi tạo thành công và kích hoạt tính năng gửi cảnh báo tự động</em></p>
</div>

---

### Tổng kết bài Lab 5.6

Thông qua bài Lab 5.6, hệ thống đã hoàn thiện toàn diện năng lực quan sát và tự động hóa ứng cứu sự cố:
* **Khả năng quan sát (Observability)**: Số liệu đo lường từ Amazon CloudWatch Metrics minh chứng hệ thống hoạt động ổn định với tỷ lệ phản hồi 2XX đạt 100% và độ trễ xử lý mục tiêu cực thấp.
* **Tập trung hóa dữ liệu**: Bảng điều khiển **Dashboard-RAG** cung cấp góc nhìn toàn cảnh về hạ tầng tính toán, lưu trữ và mạng.
* **Chủ động ứng cứu**: Cơ chế cảnh báo **CloudWatch Alarm kết hợp Amazon SNS** đảm bảo mọi sự cố quá tải đều được phát hiện và thông báo tức thì tới đội ngũ quản trị.
