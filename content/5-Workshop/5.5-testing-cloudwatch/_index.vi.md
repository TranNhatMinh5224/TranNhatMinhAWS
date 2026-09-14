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

Sau khi hoàn tất việc triển khai toàn bộ hạ tầng đám mây AWS từ VPC, S3, RDS PostgreSQL, Qdrant Vector DB đến EC2 và Application Load Balancer (ALB), bước tiếp theo mang tính quyết định trong vòng đời dự án là **Kiểm thử tích hợp đầu - cuối (End-to-End Integration Testing)** và **Thiết lập hệ thống Giám sát vận hành (Observability & Monitoring)**.

Bài lab 5.5 tập trung vào 3 trọng tâm kỹ thuật cốt lõi:
1. **Kiểm thử End-to-End luồng RAG Inference qua ALB DNS**: Truy cập trực tiếp giao diện Web UI thông qua tên miền công khai của Load Balancer, tải tài liệu tri thức doanh nghiệp (`TTTN-01.docx`), và thực hiện hỏi đáp ngữ nghĩa với cơ chế phản hồi theo luồng thời gian thực (**Server-Sent Events - SSE Streaming**).
2. **Kiểm thử 2 lớp phòng thủ bảo mật (2-Tier Security Guardrails & Anti-Hallucination)**: Đánh giá cơ chế phát hiện Prompt Injection, lọc từ khóa nhạy cảm và chính sách từ chối trả lời ngoài phạm vi ngữ cảnh (**Out-of-Domain Refusal**) để bảo đảm mô hình AI luôn tuân thủ nguyên tắc trung thực tuyệt đối (Zero-Hallucination).
3. **Giám sát hiệu năng hạ tầng với Amazon CloudWatch Metrics**: Theo dõi các chỉ số đo lường dịch vụ mạng của Application Load Balancer (`RequestCount`, `HTTPCode_Target_2XX_Count`, `TargetResponseTime`) để nắm bắt lưu lượng truy cập thực tế, tỷ lệ thành công của các yêu cầu HTTP và độ trễ phản hồi của hệ thống.

---

### Danh mục các nội dung triển khai:

1. [**5.5.1. Kiểm thử Toàn trình End-to-End Pipeline RAG trên Web UI qua ALB**](#551-kiểm-thử-toàn-trình-end-to-end-pipeline-rag-trên-web-ui-qua-alb)
2. [**5.5.2. Kiểm thử 2 Tầng Phòng vệ Bảo mật (Security Guardrails & Chống ảo giác)**](#552-kiểm-thử-2-tầng-phòng-vệ-bảo-mật-security-guardrails--chống-ảo-giác)
3. [**5.5.3. Giám sát Hiệu năng Hệ thống với Amazon CloudWatch Metrics**](#553-giám-sát-hiệu-năng-hệ-thống-với-amazon-cloudwatch-metrics)

---

## 5.5.1. Kiểm thử Toàn trình End-to-End Pipeline RAG trên Web UI qua ALB

### 1. Mục tiêu kỹ thuật
* Kiểm tra khả năng định tuyến lưu lượng từ người dùng Internet qua Application Load Balancer (`rag-lb`) tới frontend container (Next.js) và backend container (FastAPI).
* Xác minh tính toàn vẹn của quy trình RAG:
  1. **Document Ingestion**: File tài liệu được phân tách đoạn (Chunking) và trích xuất đặc trưng vector nhúng bằng mô hình `BAAI/bge-m3`.
  2. **Vector Storage**: Các vector 1024 chiều được nạp vào collection `enterprise_knowledge` trong Qdrant.
  3. **Hybrid Search & Re-ranking**: Tìm kiếm ngữ nghĩa kết hợp lọc điểm tương đồng Cosine Similarity.
  4. **Generation with Streaming**: Mô hình ngôn ngữ lớn tổng hợp câu trả lời dựa trên ngữ cảnh trích xuất và truyền trực tiếp về trình duyệt qua giao thức Server-Sent Events (SSE).

---

### 2. Bằng chứng kiểm thử thực tế (Evidence)

Thực hiện truy cập giao diện ứng dụng thông qua tên miền ALB DNS:
`http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com`

* Chọn tài liệu tri thức doanh nghiệp mẫu: **`TTTN-01.docx`** (Báo cáo thực tập tốt nghiệp).
* Đặt câu hỏi nghiệp vụ: **"Trình độ đào tạo và ngành đào tạo của tôi là gì?"**.
* Quan sát Network tab trên Developer Tools (F12) để xác nhận dữ liệu stream trả về từng chunk ký tự qua kết nối HTTP 200 `/api/v1/chat/stream`.

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.1-web-rag-chat-e2e.png" alt="Kiểm thử End-to-End Chatbot Web UI qua ALB" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.5.1: Giao diện Web AI Assistant phản hồi truy vấn ngữ nghĩa từ tài liệu TTTN-01.docx qua giao thức SSE Streaming với mã trạng thái HTTP 200</em></p>
</div>

#### Phân tích kết quả kiểm thử:
* **Trích xuất thông tin chính xác**: Hệ thống phản hồi chính xác tuyệt đối các trường thông tin trong tài liệu:
  * Trình độ đào tạo: *Đại học*
  * Ngành đào tạo: *Công nghệ thông tin*
  * Chuyên ngành: *Kỹ thuật phần mềm*
* **Độ trễ phản hồi (First-Token Latency)**: Nhờ cơ chế Streaming SSE, người dùng nhận được các ký tự đầu tiên chỉ sau khoảng 450ms, cải thiện đáng kể trải nghiệm người dùng so với cơ chế HTTP Request/Response truyền thống phải đợi toàn bộ câu trả lời hoàn tất.

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

## 5.5.3. Giám sát Hiệu năng Hệ thống với Amazon CloudWatch Metrics

### 1. Mục tiêu giám sát kỹ thuật
* **Amazon CloudWatch** là dịch vụ giám sát và quan sát (Observability) tích hợp sẵn của AWS, thu thập và hiển thị các số liệu vận hành theo thời gian thực từ mọi tài nguyên đám mây.
* Đối với cụm **Application Load Balancer (`rag-lb`)**, ba chỉ số quan trọng nhất cần theo dõi liên tục bao gồm:
  1. **`RequestCount`**: Tổng số lượng yêu cầu HTTP/HTTPS được xử lý qua Load Balancer trong mỗi chu kỳ thời gian.
  2. **`HTTPCode_Target_2XX_Count`**: Số lượng yêu cầu nhận được mã phản hồi thành công (200 OK, 201 Created) từ máy chủ backend/frontend.
  3. **`TargetResponseTime`**: Thời gian phản hồi trung bình (tính bằng giây) từ lúc Target nhận yêu cầu đến khi gửi toàn bộ dữ liệu trả về cho ALB.

---

### 2. Bằng chứng giám sát thực tế trên AWS Console (Evidence)

Truy cập **CloudWatch Management Console** $\rightarrow$ chọn **Metrics** $\rightarrow$ mục **All metrics** $\rightarrow$ chọn namespace **`AWS/ApplicationELB`** $\rightarrow$ chọn Load Balancer **`rag-lb`** và đồ thị hóa các chỉ số đo lường.

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.3-cloudwatch-alb-metrics.png" alt="Giám sát CloudWatch Metrics cho Application Load Balancer" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.5.3: Đồ thị giám sát Amazon CloudWatch Metrics thể hiện RequestCount, HTTPCode_Target_2XX_Count và TargetResponseTime của Application Load Balancer rag-lb</em></p>
</div>

#### Chi tiết các thông số đo lường từ đồ thị CloudWatch:

| Tham số / Metric | Namespace / Chi tiết | Thống kê (Statistic) | Chu kỳ (Period) | Nhận xét vận hành |
| :--- | :--- | :--- | :--- | :--- |
| **RequestCount** | `ApplicationELB • RequestCount • LoadBalancer` | Average / Sum | 15 minutes | Ghi nhận lưu lượng tăng rõ rệt vào khung giờ kiểm thử (11:00 - 12:00 và 12:30 - 13:00) tương ứng với các truy vấn RAG streaming. |
| **HTTPCode_Target_2XX_Count** | `ApplicationELB • HTTPCode_Target_2XX_Count • LoadBalancer` | Average | 15 minutes | Trùng khớp 100% với số lượng Request, chứng minh toàn bộ các yêu cầu HTTP đều được xử lý thành công (Zero 5XX / Zero 4XX lỗi hệ thống). |
| **TargetResponseTime** | `ApplicationELB • TargetResponseTime • LoadBalancer` | Average | 15 minutes | Dao động ở mức rất thấp (~0.05s đến 0.12s), chứng minh năng lực xử lý ổn định của máy chủ EC2 `enterprise-rag-server` và thuật toán tìm kiếm vector Qdrant. |

---

### Tổng kết bài Lab 5.5

Thông qua bài Lab 5.5, hệ thống **Enterprise Knowledge AI RAG Assistant** đã hoàn thành xuất sắc các tiêu chí kiểm thử nghiệm thu:
* **Tính sẵn sàng**: Phục vụ người dùng thông qua tên miền công khai của Application Load Balancer với giao thức truyền phát trực tiếp Server-Sent Events (SSE).
* **Tính bảo mật**: Cơ chế Security Guardrails 2 tầng loại bỏ hoàn toàn nguy cơ bịa đặt thông tin và từ chối các câu hỏi ngoài phạm vi tài liệu một cách chuẩn mực.
* **Tính quan sát (Observability)**: Số liệu đo lường từ Amazon CloudWatch Metrics minh chứng hệ thống hoạt động ổn định với tỷ lệ phản hồi 2XX đạt 100% và độ trễ xử lý mục tiêu cực thấp.
