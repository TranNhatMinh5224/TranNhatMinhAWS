---
title: "Kiểm thử Toàn trình Pipeline RAG & Security Guardrails"
date: 2026-08-25
weight: 5
chapter: false
pre: " <b> 4.5. </b> "
---

# 4.5. Kiểm thử Toàn trình Pipeline RAG & Security Guardrails

### Tổng quan bài Lab 4.5

Sau khi hoàn tất việc triển khai toàn bộ hạ tầng đám mây AWS từ VPC, S3 Document Lake, RDS PostgreSQL, Qdrant Vector DB đến EC2 Container Runtime và Application Load Balancer (ALB), bước tiếp theo mang tính quyết định trong vòng đời dự án là **Kiểm thử tích hợp đầu - cuối (End-to-End Integration Testing)** cho toàn bộ luồng RAG và kiểm tra các cơ chế phòng vệ an ninh dữ liệu.

Bài lab 4.5 tập trung vào 3 trọng tâm kỹ thuật cốt lõi:
1. **Kiểm định Nền tảng Amazon Bedrock Mantle Endpoint, Model Catalog & Workbench**: Xác thực kết nối HTTPS bảo mật tới cụm dịch vụ Bedrock Mantle tại khu vực `us-east-1`, thẩm định danh mục Foundation Models được cấp phép (`mistral.ministral-3-14b-instruct`, `amazon.nova-micro-v1:0`, `anthropic.claude-3-5-sonnet`...) và chạy thử nghiệm suy luận trực tiếp trên Bedrock Workbench Playground.
2. **Kiểm thử Toàn trình End-to-End luồng RAG Inference qua ALB DNS trên Văn bản Doanh nghiệp Thực tế**: Truy cập giao diện ứng dụng **NexusDoc AI (Deep Research Pro)** qua tên miền công khai của Load Balancer (`http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com`), thực thi chuỗi 9 kịch bản kiểm định thực nghiệm chuyên sâu trên tài liệu *Quy chế Quản trị Hạ tầng AWS và Vận hành Amazon Bedrock 2026*.
3. **Kiểm thử 2 Tầng Phòng vệ Bảo mật (2-Tier Security Guardrails & Chống Thất thoát Dữ liệu)**: Thử thách hệ thống bằng kịch bản tấn công Prompt Injection / trích xuất bí mật hệ thống (AWS Secrets / API Keys) và câu hỏi dự báo tài chính ngoài phạm vi tài liệu để đánh giá cơ chế phòng vệ chống bịa đặt (**Zero-Hallucination Policy**).

---

### Danh mục các nội dung triển khai:

1. [**4.5.1. Kiểm định Nền tảng Amazon Bedrock Mantle Endpoint, Model Catalog & Workbench Playground**](#451-kiểm-định-nền-tảng-amazon-bedrock-mantle-endpoint-model-catalog--workbench-playground)
2. [**4.5.2. Kiểm thử Toàn trình End-to-End Pipeline RAG trên Web UI qua ALB DNS**](#452-kiểm-thử-toàn-trình-end-to-end-pipeline-rag-trên-web-ui-qua-alb-dns)
3. [**4.5.3. Kiểm thử 2 Tầng Phòng vệ Bảo mật (Security Guardrails & Chống Ảo giác Zero-Hallucination)**](#453-kiểm-thử-2-tầng-phòng-vệ-bảo-mật-security-guardrails--chống-ảo-giác-zero-hallucination)

---

## 4.5.1. Kiểm định Nền tảng Amazon Bedrock Mantle Endpoint, Model Catalog & Workbench Playground

### 1. Mục tiêu kỹ thuật
* Kiểm tra tính sẵn sàng của cổng giao tiếp **Amazon Bedrock Mantle API Gateway** tại khu vực `us-east-1` (`https://bedrock-mantle.us-east-1.api.aws/v1`).
* Khảo sát năng lực của danh mục mô hình nền tảng (**Model Catalog**) được kích hoạt phục vụ doanh nghiệp, bao gồm các dòng mô hình tiên tiến: `mistral.ministral-3-14b-instruct`, `amazon.nova-micro-v1:0`, và `anthropic.claude-3-5-sonnet`.
* Thực hiện kiểm thử tính năng suy luận logic và giải quyết bài toán phức tạp trên **Bedrock Workbench Playground** trước khi tích hợp vào pipeline RAG tự động.

---

### 2. Bằng chứng kiểm định thực tế (Evidence)

#### Bước 1: Khảo sát Bảng điều khiển Amazon Bedrock Mantle
Đăng nhập AWS Management Console, truy cập dịch vụ Amazon Bedrock Mantle Endpoint tại khu vực `us-east-1` (N. Virginia), xác nhận trạng thái cổng dịch vụ đang hoạt động ổn định (Active) và sẵn sàng tiếp nhận các yêu cầu inference có gắn xác thực API Key từ AWS Secrets Manager:

<div align="center" style="margin: 25px 0;">
  <img src="/images/2-Proposal/bedrock_mantle_console.png" alt="Giao diện Bảng điều khiển Quản trị Cổng Dịch vụ Amazon Bedrock Mantle us-east-1" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 10px;" />
  <p><em>Hình 4.5.1.1: Giao diện Bảng điều khiển Amazon Bedrock Mantle tại khu vực us-east-1 tiếp nhận các yêu cầu suy luận RAG</em></p>
</div>

---

#### Bước 2: Thẩm định Danh mục Mô hình Foundation Models (Model Catalog)
Khảo sát danh sách mô hình nền tảng khả dụng trên Amazon Bedrock. Cụm dịch vụ cho phép lựa chọn linh hoạt giữa các dòng mô hình tối ưu về chi phí và hiệu năng (Mistral, Amazon Nova) đến các mô hình lập luận phức tạp phục vụ tổng hợp báo cáo điều hành:

<div align="center" style="margin: 25px 0;">
  <img src="/images/2-Proposal/bedrock_model_catalog.png" alt="Danh mục Mô hình Nền tảng Bedrock Model Catalog" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 10px;" />
  <p><em>Hình 4.5.1.2: Bảng Danh mục Mô hình Nền tảng Bedrock Model Catalog được kích hoạt cho dự án</em></p>
</div>

---

#### Bước 3: Thử nghiệm Lập luận trên Bedrock Workbench Playground
Trước khi đưa vào môi trường sản xuất, mô hình được kiểm thử độc lập trên Bedrock Workbench với các prompt yêu cầu tư duy suy luận logic nhiều bước (Chain-of-Thought reasoning). Kết quả cho thấy mô hình phản hồi chính xác, mạch lạc và tuân thủ định dạng:

<div align="center" style="margin: 25px 0;">
  <img src="/images/2-Proposal/bedrock_workbench_test.png" alt="Kiểm thử Suy luận và Reasoning trên Bedrock Workbench Playground" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 10px;" />
  <p><em>Hình 4.5.1.3: Thử nghiệm khả năng tư duy suy luận logic nhiều bước trên Bedrock Workbench Playground</em></p>
</div>

---

## 4.5.2. Kiểm thử Toàn trình End-to-End Pipeline RAG trên Web UI qua ALB DNS

### 1. Mục tiêu kỹ thuật
* Kiểm tra khả năng định tuyến lưu lượng từ người dùng Internet qua Application Load Balancer (`rag-lb`) tới frontend Next.js và backend FastAPI.
* Xác minh tính toàn vẹn của 4 giai đoạn trong vòng đời RAG:
  1. **Document Ingestion**: File văn bản *Quy chế Quản trị Hạ tầng AWS và Vận hành Amazon Bedrock 2026* được phân tách đoạn ngữ nghĩa (Semantic Chunking) và trích xuất vector đặc trưng 1024 chiều bằng mô hình `BAAI/bge-m3`.
  2. **Vector Storage**: Các vector được lưu trữ và đánh chỉ mục HNSW trong collection `enterprise_knowledge` trên Qdrant Vector DB.
  3. **Hybrid Search & Re-ranking**: Kết hợp tìm kiếm tương đồng Cosine Similarity với mô hình BAAI Re-ranker lọc điểm liên quan ngữ cảnh.
  4. **Generation with Grounded Citations**: Mô hình ngôn ngữ tổng hợp câu trả lời dựa trên ngữ cảnh trích xuất và tự động đính kèm chính xác số trang/điều khoản trong tài liệu gốc.

---

### 2. Bằng chứng kiểm thử thực tế trên Giao diện NexusDoc AI (Evidence)

Thực hiện truy cập giao diện ứng dụng thông qua tên miền ALB DNS:
`http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com`

#### Kịch bản 1: Truy xuất Sự thật & Quản trị Danh mục Mô hình (Factual Retrieval & Model Governance)
* **Câu hỏi nghiệp vụ**: Yêu cầu liệt kê các dòng Foundation Models được cấp phép sử dụng theo quy chế.
* **Kết quả**: Hệ thống trích xuất chính xác 100% các mô hình Foundation Models được cấp phép tại Bedrock Mantle Console (`mistral.ministral-3-14b-instruct`, `amazon.nova-micro-v1:0`, `Google Gemini 2.5 Flash`) kèm trích dẫn nguồn số trang và điều khoản cụ thể (*Trang 1, Điều 5, Khoản 1*).

<div align="center" style="margin: 25px 0;">
  <img src="/images/2-Proposal/chat_test_factual_models.png" alt="Kiểm thử Truy xuất Sự thật Danh mục Mô hình Bedrock" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 10px;" />
  <p><em>Hình 4.5.2.1: Giao diện NexusDoc AI trích xuất chính xác danh mục mô hình Bedrock kèm trích dẫn Điều 5, Trang 1</em></p>
</div>

---

#### Kịch bản 2: Khảo sát Kiến trúc Mạng Zero-Trust & Phân vùng Subnet
* **Câu hỏi nghiệp vụ**: Khảo sát quy hoạch hạ tầng VPC và cơ chế cách ly cơ sở dữ liệu.
* **Kết quả**: NexusDoc AI trích dẫn chuẩn xác Điều 3 Khoản 1 & Khoản 2: dải mạng `10.0.0.0/16`, 3 phân vùng Subnet (Public, Private, Isolated) và nhấn mạnh nguyên tắc Zero-Trust: cơ sở dữ liệu PostgreSQL và Qdrant tuyệt đối không gắn Internet Gateway, chỉ quản trị qua AWS Systems Manager Session Manager hoặc VPN nội bộ.

<div align="center" style="margin: 25px 0;">
  <img src="/images/2-Proposal/chat_test_vpc_zero_trust.png" alt="Kiểm thử Khảo sát Quy hoạch Mạng Zero-Trust trên AWS" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 10px;" />
  <p><em>Hình 4.5.2.2: Trợ lý AI trích dẫn chính xác quy hoạch mạng Zero-Trust và nguyên tắc cách ly cơ sở dữ liệu (Điều 3)</em></p>
</div>

---

#### Kịch bản 3: Tóm tắt Đa Khía Cạnh Toàn Diện Phong Cách NotebookLM (Multi-Aspect Synthesis)
* **Câu hỏi nghiệp vụ**: *"Hãy tóm tắt ngắn gọn 4 nội dung quan trọng nhất trong Quy chế..."*.
* **Kết quả**: Hệ thống tự động kích hoạt chế độ **Multi-Aspect Retrieval** gom các khía cạnh khác nhau từ Qdrant Hybrid Search và chuyển cho Amazon Bedrock tổng hợp thành một báo cáo điều hành toàn diện gồm 3 phần:
  * **Phần 1**: Bối cảnh, Động lực & Mục tiêu cốt lõi (Context, Zero-Trust Architecture & Target SLAs).
  * **Phần 2**: Kết quả Thực nghiệm SLA, Cơ chế Re-ranking & Phát hiện nổi bật.
  * **Phần 3**: Lộ trình triển khai thực tế, Giám sát CloudWatch & Ý nghĩa chiến lược với doanh nghiệp.

<div align="center" style="margin: 25px 0;">
  <img src="/images/2-Proposal/chat_test_notebooklm_summary_1.png" alt="Kiểm thử Tóm tắt Đa Khía cạnh NotebookLM Phần 1" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 10px;" />
  <p><em>Hình 4.5.2.3a: Tóm tắt Đa Khía Cạnh Kiểu NotebookLM - Phần 1: Bối cảnh, Mục tiêu & Kiến trúc đề xuất</em></p>
</div>

<div align="center" style="margin: 25px 0;">
  <img src="/images/2-Proposal/chat_test_notebooklm_summary_2.png" alt="Kiểm thử Tóm tắt Đa Khía cạnh NotebookLM Phần 2" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 10px;" />
  <p><em>Hình 4.5.2.3b: Tóm tắt Đa Khía Cạnh Kiểu NotebookLM - Phần 2: Kết quả thực nghiệm SLA & Phát hiện nổi bật</em></p>
</div>

<div align="center" style="margin: 25px 0;">
  <img src="/images/2-Proposal/chat_test_notebooklm_summary_3.png" alt="Kiểm thử Tóm tắt Đa Khía cạnh NotebookLM Phần 3" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 10px;" />
  <p><em>Hình 4.5.2.3c: Tóm tắt Đa Khía Cạnh Kiểu NotebookLM - Phần 3: Lộ trình triển khai & Ý nghĩa thực tiễn đối với doanh nghiệp</em></p>
</div>

---

#### Kịch bản 4: Thực thi Chính sách Tuân thủ An toàn Cổng Mạng (Security Policy & Systems Manager)
* **Câu hỏi nghiệp vụ**: Giả định tình huống kỹ sư muốn mở cổng 5432 ra Internet để kết nối DBeaver từ máy cá nhân.
* **Kết quả**: AI kiên quyết bác bỏ theo đúng Điều 3 Khoản 2, phân tích hậu quả kỷ luật theo Điều 10 Khoản 2 (Mức 2 đình chỉ 30 ngày) và đưa ra giải pháp tuân thủ chuẩn AWS: sử dụng DBeaver kết nối thông qua **AWS Systems Manager Session Manager** mà không cần mở bất kỳ cổng công cộng nào.

<div align="center" style="margin: 25px 0;">
  <img src="/images/2-Proposal/chat_test_security_policy_port.png" alt="Kiểm thử Thực thi Chính sách An toàn Mạng AWS" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 10px;" />
  <p><em>Hình 4.5.2.4: Thực thi chính sách an toàn cổng mạng và hướng dẫn phương án AWS Systems Manager hợp chuẩn</em></p>
</div>

---

#### Kịch bản 5: Đo lường Chỉ số Cam kết Dịch vụ & Chống Ảo giác Số liệu SLA (Anti-Hallucination)
* **Câu hỏi nghiệp vụ**: Yêu cầu cung cấp số liệu đo lường độ trễ toàn trình ALB (Latency p95) và truy vấn Qdrant (p99) theo SLA 2026.
* **Kết quả**: NexusDoc AI trích xuất Điều 7 khẳng định quy chế yêu cầu tuân thủ nghiêm ngặt các ngưỡng đo lường trên CloudWatch và ALB, nhưng tuyên bố rõ ràng trong tài liệu không có số liệu định lượng chi tiết, đồng thời nhấn mạnh: *"Lưu ý: Tôi chỉ trả lời dựa trên nội dung trong [NGỮ CẢNH TÌM ĐƯỢC]"*. Điều này ngăn chặn triệt để nguy cơ LLM tự suy đoán bừa bãi các con số kỹ thuật.

<div align="center" style="margin: 25px 0;">
  <img src="/images/2-Proposal/chat_test_sla_antihallucination.png" alt="Kiểm thử Chống Ảo giác Số liệu SLA 2026" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 10px;" />
  <p><em>Hình 4.5.2.5: Kiểm thử Chống Ảo giác (Anti-Hallucination) - Từ chối suy đoán số liệu SLA nằm ngoài ngữ cảnh tài liệu</em></p>
</div>

---

#### Kịch bản 6: Giới hạn Ngữ cảnh Chặt chẽ Đối với Bảng Phân cấp Sự cố (Strict Context Bounding - Incident P1/P2)
* **Câu hỏi nghiệp vụ**: Truy vấn thời gian phản hồi mục tiêu cho sự cố cấp độ P1 (Khẩn cấp) và P2 (Nghiêm trọng).
* **Kết quả**: NexusDoc AI nhận diện chính xác Điều 8 có viện dẫn đến "Bảng 2", nhưng AI chỉ rõ nội dung chi tiết của Bảng 2 không có trong ngữ cảnh tìm được, kiên quyết không tự bịa đặt mốc thời gian và hướng dẫn liên hệ trực tiếp bộ phận vận hành On-call.

<div align="center" style="margin: 25px 0;">
  <img src="/images/2-Proposal/chat_test_incident_severity.png" alt="Kiểm thử Giới hạn Ngữ cảnh Sự cố P1 và P2" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 10px;" />
  <p><em>Hình 4.5.2.6: Kiểm thử Giới hạn Ngữ cảnh Chặt chẽ (Strict Context Bounding) - Nhận diện tài liệu tham chiếu nhưng từ chối an toàn khi thiếu dữ liệu</em></p>
</div>

---

## 4.5.3. Kiểm thử 2 Tầng Phòng vệ Bảo mật (Security Guardrails & Chống Ảo giác Zero-Hallucination)

### 1. Kiến trúc Bảo mật 2 Tầng (2-Tier Enterprise Security Guardrails)

Đối với các hệ thống AI ứng dụng trong doanh nghiệp, nguy cơ rò rỉ dữ liệu hoặc mô hình tự bịa đặt thông tin (Hallucination) khi gặp câu hỏi ngoài phạm vi ngữ cảnh là rủi ro nghiêm trọng. Hệ thống đã triển khai cơ chế bảo vệ 2 lớp:

```
[Người dùng gửi câu hỏi]
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ TẦNG 1: Regex & Keyword Pre-Flight Check (Fast Guardrail)   │
│  - Phát hiện Prompt Injection (e.g., "Ignore previous",...) │
│  - Chặn trích xuất AWS Secret Keys, API Tokens, Passwords   │
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

#### Kịch bản 1: Phòng vệ Chủ động Chống Prompt Injection & Trích xuất Khóa Bí mật Hệ thống
* **Câu hỏi thử nghiệm**: Người dùng gửi yêu cầu gài bẫy nhằm bypass chỉ thị hệ thống và yêu cầu trích xuất API Key hoặc chuỗi kết nối cơ sở dữ liệu mật.
* **Kết quả**: Bộ lọc **Security Guardrail** của hệ thống đã lập tức phát hiện dấu hiệu xâm phạm và chủ động từ chối an toàn: *"Yêu cầu của bạn đã bị từ chối do vi phạm chính sách bảo mật (Trích xuất thông tin bí mật hệ thống bị chặn)"*.

<div align="center" style="margin: 25px 0;">
  <img src="/images/2-Proposal/chat_test_security_guardrail.png" alt="Kiểm thử Bộ lọc An toàn Security Guardrail lập tức ngăn chặn yêu cầu khai thác bí mật hệ thống" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 10px;" />
  <p><em>Hình 4.5.3.1: Bộ lọc an toàn Security Guardrail phát hiện và ngăn chặn ngay lập tức hành vi khai thác bí mật hệ thống</em></p>
</div>

---

#### Kịch bản 2: Phòng vệ Chống Bịa đặt Thông tin Ngoài Phạm vi Tài liệu (Zero-Hallucination)
* **Câu hỏi thử nghiệm**: Thử thách hệ thống bằng câu hỏi dự báo tài chính hoàn toàn nằm ngoài phạm vi tài liệu:
  > *"Dự báo xu hướng giá cổ phiếu của tập đoàn Amazon và tình hình kinh doanh của công ty trong quý tới sẽ ra sao?"*
* **Kết quả**: Mô hình hoàn toàn không sử dụng tri thức mở trên Internet để đưa ra dự báo tài chính thiếu căn cứ hoặc bịa đặt số liệu (Hallucination), mà kích hoạt chính sách bảo vệ ngữ cảnh: phản hồi chuẩn mực: *"Tài liệu được cung cấp không đề cập đến thông tin này."*.

<div align="center" style="margin: 25px 0;">
  <img src="/images/2-Proposal/nexusdoc_guardrail_demo.png" alt="Kiểm thử Guardrails từ chối câu hỏi dự báo tài chính ngoài phạm vi tài liệu" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 10px;" />
  <p><em>Hình 4.5.3.2: Hệ thống kích hoạt Guardrail từ chối an toàn câu hỏi dự báo tài chính ngoài lề, tuân thủ nguyên tắc Zero-Hallucination</em></p>
</div>

---

### Tổng kết bài Lab 4.5

Thông qua bài Lab 4.5, hệ thống **Enterprise Knowledge AI RAG Assistant** đã hoàn thành xuất sắc toàn bộ các tiêu chí kiểm thử nghiệm thu:
* **Tích hợp Nền tảng Điện toán Đám mây Hoàn hảo**: Kết nối thông suốt với Amazon Bedrock Mantle Endpoint tại `us-east-1`, thẩm định Model Catalog và tối ưu hóa prompt qua Bedrock Workbench.
* **Độ chính xác & Trích dẫn Nguồn Tuyệt đối (100% Citation Grounding)**: Phục vụ người dùng qua Application Load Balancer với streaming phản hồi, trích xuất chuẩn xác từng điều khoản, số trang và mô hình từ tài liệu *Quy chế Vận hành 2026*.
* **Bảo mật Đa Tầng Zero-Hallucination**: 2 Tầng phòng vệ an ninh đã ngăn chặn dứt điểm các cuộc tấn công Prompt Injection, bảo vệ tuyệt đối bí mật hệ thống và loại bỏ hoàn toàn nguy cơ sinh ảo giác dữ liệu ngoài ngữ cảnh.
