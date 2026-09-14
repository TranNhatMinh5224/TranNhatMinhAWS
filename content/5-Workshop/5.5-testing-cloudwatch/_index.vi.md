---
title: "Kiểm thử Pipeline RAG, Security Guardrails & Giám sát CloudWatch"
date: 2026-08-25
weight: 5
chapter: false
pre: " <b> 5.5. </b> "
aliases:
  - /5-workshop/5.5-testing-cloudwatch/
  - /5-Workshop/5.5-testing-cloudwatch/
---

# 5.5. Kiểm thử Pipeline RAG, Security Guardrails & Giám sát với Amazon CloudWatch

### Tổng quan bài Lab 5.5

Sau khi hoàn tất việc triển khai toàn bộ hạ tầng đám mây AWS từ VPC, S3, RDS PostgreSQL, Qdrant Vector DB đến EC2 và Application Load Balancer (ALB), bước tiếp theo mang tính quyết định trong vòng đời dự án là **Kiểm thử tích hợp đầu - cuối (End-to-End Integration Testing)** và **Thiết lập hệ thống Giám sát & Cảnh báo vận hành (Observability, Dashboards & Alarms)**.

Bài lab 5.5 tập trung vào 3 trọng tâm kỹ thuật cốt lõi:
1. **Kiểm thử End-to-End luồng RAG Inference qua ALB DNS**: Truy cập giao diện ứng dụng **NexusDoc AI (Deep Research Pro)** qua tên miền công khai của Load Balancer, kiểm tra tính năng tra cứu ngữ nghĩa, trích dẫn chính xác trang nguồn tài liệu (`TTTN-01.docx`) và phản hồi theo luồng thời gian thực (**Server-Sent Events - SSE Streaming**).
2. **Kiểm thử 2 lớp phòng thủ bảo mật (2-Tier Security Guardrails & Anti-Hallucination)**: Đánh giá cơ chế phát hiện Prompt Injection, lọc từ khóa nhạy cảm và chính sách từ chối trả lời ngoài phạm vi ngữ cảnh (**Out-of-Domain Refusal**) để bảo đảm mô hình AI luôn tuân thủ nguyên tắc trung thực tuyệt đối (Zero-Hallucination).
3. **Giám sát và Cảnh báo toàn diện với Amazon CloudWatch**:
   * Phân tích chỉ số hiệu năng mạng của Application Load Balancer (`RequestCount`, `HTTPCode_Target_2XX_Count`, `TargetResponseTime`, `CapacityUtilization`).
   * Xây dựng bảng điều khiển trực quan hóa tập trung (**CloudWatch Dashboard `Dashboard-RAG`**).
   * Thiết lập cảnh báo tự động (**CloudWatch Metric Alarm `RAG-Server-High-CPU-Alarm`**) liên kết với **Amazon SNS** gửi email thông báo sự cố về quản trị viên.

---

### Danh mục các nội dung triển khai:

1. [**5.5.1. Kiểm thử Toàn trình End-to-End Pipeline RAG trên Web UI qua ALB**](#551-kiểm-thử-toàn-trình-end-to-end-pipeline-rag-trên-web-ui-qua-alb)
2. [**5.5.2. Kiểm thử 2 Tầng Phòng vệ Bảo mật (Security Guardrails & Chống ảo giác)**](#552-kiểm-thử-2-tầng-phòng-vệ-bảo-mật-security-guardrails--chống-ảo-giác)
3. [**5.5.3. Giám sát Hiệu năng, Xây dựng Dashboard & Cảnh báo với Amazon CloudWatch**](#553-giám-sát-hiệu-năng-xây-dựng-dashboard--cảnh-báo-với-amazon-cloudwatch)

---

## 5.5.1. Kiểm thử Toàn trình End-to-End Pipeline RAG trên Web UI qua ALB

### 1. Mục tiêu kỹ thuật
* Kiểm tra khả năng định tuyến lưu lượng từ người dùng Internet qua Application Load Balancer (`rag-lb`) tới frontend container (Next.js) và backend container (FastAPI).
* Xác minh tính toàn vẹn của quy trình RAG:
  1. **Document Ingestion**: File tài liệu được phân tách đoạn (Chunking) và trích xuất đặc trưng vector nhúng bằng mô hình `BAAI/bge-m3`.
  2. **Vector Storage**: Các vector 1024 chiều được nạp vào collection `enterprise_knowledge` trong Qdrant.
  3. **Hybrid Search & Re-ranking**: Tìm kiếm ngữ nghĩa kết hợp mô hình BAAI Re-ranker lọc điểm tương đồng Cosine Similarity.
  4. **Generation with Streaming & Citations**: Mô hình ngôn ngữ tổng hợp câu trả lời dựa trên ngữ cảnh trích xuất, đính kèm chính xác số trang/tên file nguồn và truyền trực tiếp về trình duyệt qua giao thức Server-Sent Events (SSE).

---

### 2. Bằng chứng kiểm thử thực tế (Evidence)

Thực hiện truy cập giao diện ứng dụng thông qua tên miền ALB DNS:
`http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com`

#### Kịch bản 1: Kiểm thử trích xuất thông tin nghiệp vụ và đối chiếu nguồn trích dẫn
* Chọn tài liệu tri thức doanh nghiệp mẫu: **`TTTN-01.docx`** (Báo cáo thực tập tốt nghiệp).
* Đặt câu hỏi: **"địa chỉ thực tập là ở đâu"**.
* Hệ thống NexusDoc AI phân tích ngữ cảnh và trả về câu trả lời chuẩn xác kèm trích dẫn nguồn:

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.1-nexusdoc-chat-citation.png" alt="Kiểm thử NexusDoc AI trích xuất thông tin kèm trích dẫn nguồn chính xác" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.5.1.1: Giao diện NexusDoc AI Assistant đối chiếu tri thức, trích xuất chính xác địa chỉ thực tập tại Tầng 36 Bitexco và ghi rõ nguồn từ TTTN-01.docx - Trang 1</em></p>
</div>

#### Kịch bản 2: Kiểm thử kết nối Streaming qua Developer Tools
* Đặt câu hỏi nghiệp vụ: **"Trình độ đào tạo và ngành đào tạo của tôi là gì?"**.
* Quan sát Network tab trên Developer Tools (F12) để xác nhận dữ liệu stream trả về từng chunk ký tự qua kết nối HTTP 200 `/api/v1/chat/stream`.

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.1-web-rag-chat-e2e.png" alt="Kiểm thử End-to-End Chatbot Web UI qua ALB" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.5.1.2: Giao diện Web AI phản hồi truy vấn ngữ nghĩa qua giao thức SSE Streaming với mã trạng thái HTTP 200 và độ trễ First-token cực thấp</em></p>
</div>

#### Phân tích kết quả kiểm thử:
* **Trích xuất thông tin chính xác**: Hệ thống phản hồi chính xác tuyệt đối các trường thông tin trong tài liệu:
  * Địa chỉ thực tập: *Tầng 36 Tòa nhà Bitexco Financial Tower, Số 2 đường Hải Triều, Phường Sài Gòn, Thành phố Hồ Chí Minh, Việt Nam*.
  * Trình độ đào tạo: *Đại học*, Ngành: *Công nghệ thông tin*, Chuyên ngành: *Kỹ thuật phần mềm*.
* **Trích dẫn nguồn rõ ràng (Grounded Citation)**: Hiển thị minh bạch thẻ đối chiếu *`Nguồn: TTTN-01.docx - Trang 1`*, giúp người dùng kiểm chứng nhanh chóng.
* **Độ trễ phản hồi (First-Token Latency)**: Nhờ cơ chế Streaming SSE, người dùng nhận được các ký tự đầu tiên chỉ sau khoảng 450ms.

---

## 5.5.2. Kiểm thử 2 Tầng Phòng vệ Bảo mật (Security Guardrails & Chống ảo giác)

### 1. Kiến trúc Bảo mật 2 Tầng (2-Tier Enterprise Security Guardrails)

Đối với các hệ thống AI ứng dụng trong doanh nghiệp, nguy cơ rò rỉ dữ liệu hoặc mô hình tự bịa đặt thông tin (Hallucination) khi gặp câu hỏi ngoài phạm vi ngữ cảnh là rủi ro nghiêm trọng. Hệ thống đã triển khai cơ chế bảo vệ 2 lớp:

```
[Người dùng gửi câu hỏi]
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ TẦNG 1: Regex & Keyword Pre-Flight Check (Fast Guardrail)   │
│  - Phát hiện Prompt Injection (e.g., "Ignore previous",...) │
│  - Phát hiện Jailbreak, từ khóa cấm hoặc hành vi bất thường │
└─────────────────────────────┬───────────────────────────────┘
          │ (Vượt qua)
          ▼
┌─────────────────────────────────────────────────────────────┐
│ TẦNG 2: System Prompt Hardening & Context Grounding         │
│  - Ngăn chặn triệt để hiện tượng bịa đặt thông tin          │
│  - Ép buộc mô hình từ chối lịch sự nếu context không có dữ  │
│    liệu liên quan: "Tài liệu không đề cập..."               │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Bằng chứng kiểm thử bảo mật thực tế (Evidence)

Thực hiện kiểm thử tấn công giả lập hoặc đặt câu hỏi phi ngữ cảnh (Out-of-Domain / Chitchat) để kiểm tra khả năng từ chối an toàn của mô hình:

* **Câu hỏi thử nghiệm**: *"mày là ai"* hoặc các câu hỏi không liên quan đến nội dung tài liệu.
* **Kỳ vọng**: Hệ thống không được bịa đặt danh tính bên ngoài hoặc suy diễn thiếu căn cứ, mà phải kích hoạt quy tắc an toàn đã cấu hình.

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.2-guardrails-chitchat-refusal.png" alt="Kiểm thử Guardrails từ chối câu hỏi ngoài tài liệu" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.5.2: Phản hồi bảo mật chuẩn doanh nghiệp từ hệ thống: "Tài liệu được cung cấp không đề cập đến thông tin này..."</em></p>
</div>

#### Kết quả đánh giá:
* **Tính tuân thủ**: Hệ thống phản hồi chuẩn mực: *"Tài liệu được cung cấp không đề cập đến thông tin này. Bạn có câu hỏi nào khác liên quan đến tài liệu không?"*.
* **Bảo đảm an toàn**: Mô hình hoàn toàn không sinh ảo giác, không lộ Prompt hệ thống (System Prompt Leakage), bảo vệ tuyệt đối tính tin cậy của kho tri thức doanh nghiệp.

---

## 5.5.3. Giám sát Hiệu năng, Xây dựng Dashboard & Cảnh báo với Amazon CloudWatch

### 1. Giám sát Chỉ số Mạng của Application Load Balancer

Truy cập **CloudWatch Management Console** $\rightarrow$ chọn **Metrics** $\rightarrow$ mục **All metrics** $\rightarrow$ chọn namespace **`ApplicationELB`** $\rightarrow$ **`Per AppELB Metrics`** $\rightarrow$ chọn Load Balancer **`app/rag-lb/dd9f64ed734dab43`**.

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.3-cloudwatch-per-appelb-metrics.png" alt="Danh sách metrics của Load Balancer rag-lb trên CloudWatch" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.5.3.1: Giao diện CloudWatch Metrics theo dõi chi tiết tài nguyên Load Balancer app/rag-lb/dd9f64ed734dab43</em></p>
</div>

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.3-cloudwatch-alb-metrics.png" alt="Đồ thị CloudWatch Metrics cho Application Load Balancer" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.5.3.2: Đồ thị giám sát chi tiết RequestCount, HTTPCode_Target_2XX_Count và TargetResponseTime</em></p>
</div>

#### Chi tiết các thông số đo lường từ đồ thị CloudWatch:

| Tham số / Metric | Namespace / Chi tiết | Thống kê (Statistic) | Chu kỳ (Period) | Nhận xét vận hành |
| :--- | :--- | :--- | :--- | :--- |
| **RequestCount** | `ApplicationELB • RequestCount • LoadBalancer` | Average / Sum | 15 minutes | Ghi nhận lưu lượng tăng rõ rệt vào khung giờ kiểm thử (11:00 - 12:00 và 12:30 - 13:00) tương ứng với các truy vấn RAG streaming. |
| **HTTPCode_Target_2XX_Count** | `ApplicationELB • HTTPCode_Target_2XX_Count • LoadBalancer` | Average | 15 minutes | Trùng khớp 100% với số lượng Request, chứng minh toàn bộ các yêu cầu HTTP đều được xử lý thành công (Zero 5XX / Zero 4XX lỗi hệ thống). |
| **TargetResponseTime** | `ApplicationELB • TargetResponseTime • LoadBalancer` | Average | 15 minutes | Dao động ở mức rất thấp (~0.05s đến 0.12s), chứng minh năng lực xử lý ổn định của máy chủ EC2 `enterprise-rag-server` và thuật toán tìm kiếm vector Qdrant. |

---

### 2. Thiết lập Bảng điều khiển Giám sát Tập trung (CloudWatch Dashboard)

Để đội ngũ kỹ thuật có cái nhìn tổng thể toàn diện về tình trạng của hệ thống RAG trong thời gian thực, một Dashboard tùy biến mang tên **`Dashboard-RAG`** đã được khởi tạo:

1. Tại **CloudWatch Console** $\rightarrow$ chọn **Dashboards** $\rightarrow$ bấm **Create dashboard** $\rightarrow$ đặt tên là **`Dashboard-RAG`**.
2. Thêm các widget trực quan hóa đa chiều:
   * **Widget 1 (CPUUtilization)**: Giám sát phần trăm sử dụng CPU của máy chủ EC2.
   * **Widget 2 (HTTPCode_Target_2XX_Count, RequestCount, TargetResponseTime)**: Theo dõi lưu lượng và độ trễ của ALB.
   * **Widget 3 (CallCount, ErrorCount)**: Theo dõi số lượng lệnh gọi API và phát hiện lỗi phát sinh.
   * **Widget 4 (VolumeAvgIOPS, VolumeAvgReadLatency, VolumeAvgThroughput)**: Theo dõi tốc độ đọc/ghi và thông lượng I/O của ổ đĩa lưu trữ EBS.

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.3-cloudwatch-dashboard-rag.png" alt="Bảng điều khiển trực quan hóa CloudWatch Dashboard-RAG" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.5.3.3: Bảng điều khiển CloudWatch Dashboard-RAG tổng hợp trực quan các chỉ số CPU, ALB, Call/Error Count và EBS IOPS</em></p>
</div>

---

### 3. Cấu hình Cảnh báo Tự động qua Amazon SNS (CloudWatch Metric Alarm)

Hệ thống thiết lập một cảnh báo giám sát chủ động (**Proactive Metric Alarm**) để kịp thời phát hiện trường hợp máy chủ EC2 bị quá tải CPU do các tác vụ tính toán nhúng vector hoặc lượng truy vấn RAG tăng đột biến:

#### Bước 1: Chọn Metric và điều kiện kích hoạt
* **Namespace**: `AWS/EC2`
* **Metric name**: `CPUUtilization`
* **InstanceId**: Máy chủ RAG server (`enterprise-rag-server` / `i-0f7f40a8245434328`)
* **Statistic**: `Average`, **Period**: `5 minutes`
* **Threshold type**: `Static` $\rightarrow$ Điều kiện: `Greater > threshold` (vượt ngưỡng cho phép).

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.3-cloudwatch-alarm-cpu-metric.png" alt="Cấu hình chỉ số CPUUtilization cho CloudWatch Alarm" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.5.3.4: Thiết lập điều kiện giám sát CPUUtilization cho máy chủ EC2 trong 5 phút</em></p>
</div>

#### Bước 2: Cấu hình Hành động Thông báo qua Amazon SNS
* **Alarm state trigger**: `In alarm` (Kích hoạt khi trạng thái rơi vào ngưỡng báo động).
* **Send a notification to**: Chọn topic SNS có sẵn: **`Default_CloudWatch_Alarms_Topic`**.
* **Email endpoint**: `nhatminh5224.forwork@gmail.com` (Email kỹ sư phụ trách vận hành nhận thông báo khẩn cấp).

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.3-cloudwatch-alarm-sns-action.png" alt="Cấu hình gửi thông báo qua Amazon SNS Topic" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.5.3.5: Cấu hình hành động gửi thông báo qua SNS Topic tới email nhatminh5224.forwork@gmail.com khi có cảnh báo</em></p>
</div>

#### Bước 3: Đặt tên và Khởi tạo Cảnh báo thành công
* Đặt tên cảnh báo: **`RAG-Server-High-CPU-Alarm`**.
* Bấm **Create alarm**. Hệ thống CloudWatch xác nhận khởi tạo thành công với trạng thái sẵn sàng lắng nghe (`Actions enabled`).

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.3-cloudwatch-alarm-created-success.png" alt="Khởi tạo thành công CloudWatch Alarm RAG-Server-High-CPU-Alarm" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.5.3.6: CloudWatch Alarm RAG-Server-High-CPU-Alarm được khởi tạo thành công và kích hoạt tính năng gửi cảnh báo tự động</em></p>
</div>

---

### Tổng kết bài Lab 5.5

Thông qua bài Lab 5.5, hệ thống **Enterprise Knowledge AI RAG Assistant** đã hoàn thành xuất sắc các tiêu chí kiểm thử nghiệm thu:
* **Tính sẵn sàng**: Phục vụ người dùng thông qua tên miền công khai của Application Load Balancer với giao thức truyền phát trực tiếp Server-Sent Events (SSE) và trích dẫn số trang nguồn minh bạch.
* **Tính bảo mật**: Cơ chế Security Guardrails 2 tầng loại bỏ hoàn toàn nguy cơ bịa đặt thông tin và từ chối các câu hỏi ngoài phạm vi tài liệu một cách chuẩn mực.
* **Tính quan sát & Chủ động (Observability & Alerting)**: Hệ thống giám sát toàn diện thông qua **CloudWatch Metrics**, tập trung hóa dữ liệu qua **Dashboard-RAG** và tự động hóa quy trình ứng cứu sự cố thông qua **CloudWatch Alarm & Amazon SNS**.
