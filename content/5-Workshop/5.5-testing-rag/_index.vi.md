---
title: "Kiểm thử Toàn trình Pipeline RAG & Security Guardrails"
date: 2026-08-25
weight: 5
chapter: false
pre: " <b> 5.5. </b> "
aliases:
  - /5-workshop/5.5-testing-rag/
  - /5-Workshop/5.5-testing-rag/
  - /5-workshop/5.5-testing-cloudwatch/
  - /5-Workshop/5.5-testing-cloudwatch/
---

# 5.5. Kiểm thử Toàn trình Pipeline RAG & Security Guardrails

### Tổng quan bài Lab 5.5

Sau khi hoàn tất việc triển khai toàn bộ hạ tầng đám mây AWS từ VPC, S3, RDS PostgreSQL, Qdrant Vector DB đến EC2 và Application Load Balancer (ALB), bước tiếp theo mang tính quyết định trong vòng đời dự án là **Kiểm thử tích hợp đầu - cuối (End-to-End Integration Testing)** cho toàn bộ luồng RAG và kiểm tra các cơ chế phòng vệ an ninh dữ liệu.

Bài lab 5.5 tập trung vào 2 trọng tâm kỹ thuật cốt lõi:
1. **Kiểm thử End-to-End luồng RAG Inference qua ALB DNS**: Truy cập giao diện ứng dụng **NexusDoc AI (Deep Research Pro)** qua tên miền công khai của Load Balancer, kiểm tra tính năng tra cứu ngữ nghĩa, trích xuất chính xác thông tin thực thể (địa chỉ thực tập, sản phẩm dự kiến) và đối chiếu trích dẫn nguồn tài liệu (`TTTN-01.docx`).
2. **Kiểm thử 2 lớp phòng thủ bảo mật (2-Tier Security Guardrails & Anti-Hallucination)**: Thử thách hệ thống bằng câu hỏi dự báo tài chính ngoài phạm vi tài liệu để đánh giá cơ chế phòng vệ chống bịa đặt (**Zero-Hallucination Policy**), ép buộc mô hình từ chối lịch sự và tuân thủ tuyệt đối ngữ cảnh nội bộ (**Grounded in Context**).

---

### Danh mục các nội dung triển khai:

1. [**5.5.1. Kiểm thử Toàn trình End-to-End Pipeline RAG trên Web UI qua ALB**](#551-kiểm-thử-toàn-trình-end-to-end-pipeline-rag-trên-web-ui-qua-alb)
2. [**5.5.2. Kiểm thử 2 Tầng Phòng vệ Bảo mật (Security Guardrails & Chống ảo giác)**](#552-kiểm-thử-2-tầng-phòng-vệ-bảo-mật-security-guardrails--chống-ảo-giác)

---

## 5.5.1. Kiểm thử Toàn trình End-to-End Pipeline RAG trên Web UI qua ALB

### 1. Mục tiêu kỹ thuật
* Kiểm tra khả năng định tuyến lưu lượng từ người dùng Internet qua Application Load Balancer (`rag-lb`) tới frontend container (Next.js) và backend container (FastAPI).
* Xác minh tính toàn vẹn của quy trình RAG:
  1. **Document Ingestion**: File tài liệu được phân tách đoạn (Chunking) và trích xuất đặc trưng vector nhúng bằng mô hình `BAAI/bge-m3`.
  2. **Vector Storage**: Các vector 1024 chiều được nạp vào collection `enterprise_knowledge` trong Qdrant.
  3. **Hybrid Search & Re-ranking**: Tìm kiếm ngữ nghĩa kết hợp mô hình BAAI Re-ranker lọc điểm tương đồng Cosine Similarity.
  4. **Generation with Grounded Citations**: Mô hình ngôn ngữ tổng hợp câu trả lời dựa trên ngữ cảnh trích xuất và đính kèm chính xác số trang/tên file nguồn.

---

### 2. Bằng chứng kiểm thử thực tế (Evidence)

Thực hiện truy cập giao diện ứng dụng thông qua tên miền ALB DNS:
`http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com`

#### Kịch bản 1: Kiểm thử tra cứu địa chỉ cơ quan thực tập kèm đối chiếu nguồn
* Chọn tài liệu tri thức doanh nghiệp: **`TTTN-01.docx`** (Báo cáo thực tập tốt nghiệp).
* Đặt câu hỏi: **"địa chỉ thực tập là ở đâu"**.
* Hệ thống NexusDoc AI phân tích ngữ cảnh và trả về câu trả lời chuẩn xác kèm trích dẫn nguồn:

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.1-nexusdoc-chat-citation.png" alt="Kiểm thử NexusDoc AI trích xuất thông tin kèm trích dẫn nguồn chính xác" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.5.1.1: Giao diện NexusDoc AI Assistant trích xuất chính xác địa chỉ thực tập tại Tầng 36 Bitexco và đính kèm nguồn TTTN-01.docx - Trang 1</em></p>
</div>

---

#### Kịch bản 2: Kiểm thử tra cứu mục tiêu và sản phẩm dự kiến của đề tài
* Trong cùng phiên nghiên cứu tài liệu `TTTN-01.docx`, tiếp tục gửi câu hỏi nghiệp vụ:
* Đặt câu hỏi: **"sản phẩm dự kiến là"**.
* Hệ thống phân tích văn bản và phản hồi súc tích:

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.1-nexusdoc-chat-product.png" alt="Kiểm thử tra cứu sản phẩm dự kiến của đề tài" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.5.1.2: Trợ lý AI trích xuất đúng sản phẩm dự kiến là "Dự án Capstone Project xây dựng ứng dụng thực tế trên AWS Free Tier" từ Trang 1 tài liệu</em></p>
</div>

---

#### Phân tích kết quả kiểm thử luồng RAG Ingestion & Inference:
* **Trích xuất thông tin chính xác**: Hệ thống phản hồi chính xác tuyệt đối các thực thể thông tin được ghi nhận trong văn bản `TTTN-01.docx`:
  * Địa chỉ thực tập: *Tầng 36 Tòa nhà Bitexco Financial Tower, Số 2 đường Hải Triều, Phường Sài Gòn, Thành phố Hồ Chí Minh, Việt Nam*.
  * Sản phẩm dự kiến: *Dự án Capstone Project xây dựng ứng dụng thực tế trên AWS Free Tier*.
* **Trích dẫn nguồn rõ ràng (Grounded Citation)**: Tự động gắn nhãn badge *`Nguồn: TTTN-01.docx - Trang 1`*, giúp người dùng kiểm chứng tài liệu gốc minh bạch.
* **Thời gian phản hồi nhanh chóng**: Quá trình phân tích và đối chiếu tri thức diễn ra nhanh chóng, phản hồi chuẩn xác ngữ cảnh văn bản.

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

Thử thách hệ thống bằng câu hỏi dự báo tài chính hoàn toàn nằm ngoài phạm vi tài liệu:

* **Câu hỏi thử nghiệm**: 
  > *"Dự báo xu hướng giá cổ phiếu của tập đoàn Amazon và tình hình kinh doanh của công ty trong quý tới sẽ ra sao?"*
* **Kỳ vọng an toàn**: Mô hình không được sử dụng tri thức mở trên Internet để đưa ra dự báo tài chính thiếu căn cứ hoặc bịa đặt số liệu (Hallucination), mà phải kích hoạt chính sách bảo vệ ngữ cảnh:

<div align="center">
  <img src="/images/5-Workshop/5.5/5.5.2-nexusdoc-guardrail-amazon-stocks.png" alt="Kiểm thử Guardrails từ chối câu hỏi dự báo tài chính ngoài phạm vi tài liệu" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.5.2.1: Hệ thống kích hoạt Guardrail từ chối câu hỏi dự báo tài chính ngoài lề: "Tài liệu được cung cấp không đề cập đến thông tin này."</em></p>
</div>

#### Kết quả đánh giá tính an toàn thông tin:
* **Tính tuân thủ nguyên tắc Zero-Hallucination**: Hệ thống phản hồi dứt khoát và chuẩn mực: *"Tài liệu được cung cấp không đề cập đến thông tin này."*.
* **Bảo đảm an toàn doanh nghiệp**: Mô hình hoàn toàn không sinh ảo giác, không tự suy diễn thông tin tài chính nhạy cảm, bảo vệ tuyệt đối tính tin cậy của kho tri thức nội bộ.

---

### Tổng kết bài Lab 5.5

Thông qua bài Lab 5.5, hệ thống **Enterprise Knowledge AI RAG Assistant** đã hoàn thành xuất sắc các tiêu chí kiểm thử nghiệm thu:
* **Tính sẵn sàng & Độ chính xác**: Phục vụ người dùng qua Application Load Balancer với streaming phản hồi, trích xuất chính xác địa chỉ thực tập và sản phẩm dự kiến từ tài liệu `TTTN-01.docx`.
* **Tính bảo mật Zero-Hallucination**: Cơ chế Security Guardrails từ chối dứt khoát các câu hỏi dự báo tài chính ngoài lề, loại bỏ hoàn toàn nguy cơ bịa đặt thông tin.
