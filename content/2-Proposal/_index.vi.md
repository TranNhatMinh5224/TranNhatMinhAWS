---
title: "Bản đề xuất"
date: 2026-08-25
weight: 2
chapter: false
pre: " <b> 2. </b> "
aliases:
  - /2-proposal/
  - /2-Proposal/
---

# Enterprise Knowledge AI RAG — Trợ Lý AI Tra Cứu & Quản Trị Văn Bản Nội Bộ Doanh Nghiệp
## Thiết Kế Kiến Trúc Đám Mây Chuẩn Doanh Nghiệp Trên AWS: Multi-AZ, Zero-Trust, Serverless Containers & Tối Ưu Hóa Chi Phí

---

### 1. Bối Cảnh, Bài Toán Thực Tiễn & Mục Tiêu Đề Xuất

#### 1.1. Thách thức trong quản lý và tra cứu văn bản nội bộ doanh nghiệp
*   **Khối lượng tài liệu nội bộ phân mảnh & phức tạp**: Trong mọi doanh nghiệp, kho tài liệu phục vụ vận hành hàng ngày (Điều lệ công ty, Quy chế tài chính - chi tiêu, Nội quy lao động, Sổ tay nhân viên - Employee Handbook, Quy trình vận hành chuẩn - SOP, Hợp đồng kinh tế & lao động, Báo cáo kỹ thuật) liên tục phình to và phân tán dưới nhiều định dạng tệp (`.pdf`, `.docx`, `.xlsx`, `.pptx`, ảnh scan hóa đơn/chứng từ).
*   **Chi phí thời gian tra cứu lớn**: Nhân viên mới, chuyên viên nghiệp vụ hay cán bộ quản lý thường tiêu tốn hàng giờ mỗi tuần chỉ để tìm kiếm một quy định hoặc hạn mức cụ thể (ví dụ: *"Quy trình phê duyệt mua sắm thiết bị trên 50 triệu VNĐ"*, *"Chính sách làm việc từ xa và chế độ thai sản quy định tại điều khoản nào"*).
*   **Rủi ro rò rỉ dữ liệu mật khi sử dụng AI công cộng**: Doanh nghiệp **tuyệt đối không thể** tải các tài liệu nội bộ nhạy cảm (bí mật kinh doanh, thông tin nhân sự, thỏa thuận bảo mật, hợp đồng mua bán) lên các nền tảng AI công cộng bên ngoài máy chủ nếu không có cơ chế mã hóa đầu cuối và cô lập dữ liệu đa khách hàng (**Multi-Tenancy**).
*   **Hạn chế cố hữu của AI thông thường (Ảo giác - Hallucination)**: Các mô hình ngôn ngữ lớn (LLM) đại trà không có tri thức về chính sách riêng của công ty; khi được hỏi, chúng dễ dàng tự bịa đặt câu trả lời không có căn cứ, gây sai lệch nghiêm trọng trong thực thi quy chế.
*   **Đặc thù văn bản quy định & hợp đồng có cấu trúc điều khoản**: Các văn bản quản trị nội bộ quan trọng luôn được soạn thảo theo cấu trúc phân tầng (`Chương -> Điều -> Khoản`) và chứa dày đặc các tham chiếu nội bộ (*"Theo quy định tại Điều 15 của Quy chế này..."*). Các hệ thống RAG thông thường (Naive RAG) cắt vụn văn bản ngẫu nhiên theo số từ làm đứt gãy hoàn toàn ngữ cảnh cha của điều khoản.

#### 1.2. Mục tiêu đề xuất kiến trúc điện toán đám mây trên AWS
Đề xuất này tập trung vào việc **hiện đại hóa và chuyển đổi** ứng dụng nguyên mẫu (Prototype RAG) từ môi trường chạy thử nghiệm cục bộ lên một **Kiến trúc Điện toán Đám mây Chuẩn Doanh nghiệp trên Amazon Web Services (AWS)** nhằm đạt được:
1.  **Độ sẵn sàng cao (High Availability - Multi-AZ)**: Vận hành bền bỉ trên nhiều Availability Zones, tự phục hồi khi có sự cố phần cứng.
2.  **Bảo mật cấp Doanh nghiệp (Zero-Trust Security)**: Cô lập cơ sở dữ liệu trong Isolated Subnets, phân quyền tối thiểu với IAM Roles, và mã hóa toàn diện dữ liệu tĩnh (At-Rest) bằng AWS KMS.
3.  **Tự động co giãn (Auto-Scaling Serverless Containers)**: Sử dụng Amazon ECS Fargate để tách biệt luồng API tốc độ cao và luồng xử lý nền (Celery Worker) bóc tách tài liệu nặng.
4.  **Tối ưu hóa chi phí (Cost-Optimized TCO)**: Tận dụng vi xử lý **AWS Graviton3 (ARM64)** cho Vector Database và chính sách vòng đời **Amazon S3 Lifecycle** giúp tiết kiệm **65% – 75%** chi phí vận hành hàng tháng so với mô hình máy chủ truyền thống.

---

### 2. Kiến Trúc Ứng Dụng & Ngăn Xếp Công Nghệ Thực Tế (Tech Stack)

Dự án ứng dụng được xây dựng theo mô hình Clean Architecture, đóng gói vi dịch vụ hoàn chỉnh:

*   **Kho mã nguồn dự án (GitHub Repository)**: [https://github.com/TranNhatMinh5224/RAG](https://github.com/TranNhatMinh5224/RAG)
*   **Frontend**: React 18 / Next.js — Giao diện hiện đại, trực quan, hỗ trợ tương tác đa tài liệu theo phong cách *"Google NotebookLM"*.
*   **Backend API**: FastAPI (Python 3.10+) — Xử lý API bất đồng bộ tốc độ cao, quản lý xác thực OAuth2 / JWT (Access Token 30 phút, Refresh Token 7 ngày), Clean Architecture Repository Pattern.
*   **Cơ sở dữ liệu quan hệ**: PostgreSQL — Quản lý thông tin người dùng, danh mục tài liệu, lịch sử chat và metadata văn bản.
*   **Cơ sở dữ liệu Vector**: Qdrant — Lưu trữ và truy vấn vector tương đồng ngữ nghĩa 1024 chiều, hỗ trợ bộ lọc cứng (Hard-Filters) theo từng `user_id` và `document_ids`.
*   **Hàng đợi & Xử lý nền**: Celery Worker + Redis — Đảm nhiệm các tác vụ nặng (bóc tách OCR, phân tích cấu trúc, tạo vector nhúng) chạy ngầm, giữ cho API phản hồi tức thì.
*   **AI Pipeline (LangChain)**:
    *   *Mô hình Nhúng (Embedding)*: `BAAI/bge-m3` — Tối ưu hóa vượt trội cho tiếng Việt, dimension 1024, chạy cục bộ.
    *   *Mô hình Tái xếp hạng (Re-ranker)*: `BAAI/bge-reranker-v2-m3` — Cross-Encoder lọc Top 3 kết quả sát ngữ nghĩa nhất.
    *   *Mô hình Ngôn ngữ (LLM)*: `Google Gemini 2.5 Flash` (kết hợp linh hoạt với Local LLM qua Ollama và Amazon Bedrock).
    *   *Mô hình Nhận diện Chữ (OCR)*: `PaddleOCR PP-OCRv4` — Trích xuất văn bản tiếng Việt từ tài liệu scan và hình ảnh.

---

### 3. Tính Năng Nổi Bật Của Hệ Thống

#### 3.1. Quản trị Định danh & Cô lập Dữ liệu Tuyệt đối (Multi-Tenancy)
*   Xác thực OAuth2 an toàn, mật khẩu băm (bcrypt).
*   **Phân vùng dữ liệu an toàn**: Mọi vector trong Qdrant đều được gắn thẻ `user_id`. Truy vấn của người dùng hoặc phòng ban này hoàn toàn không thể rà quét sang dữ liệu của phòng ban khác.

#### 3.2. Quản lý Đa định dạng & Bóc tách Cấu trúc Thông minh (Hierarchical Parsing)
*   **Hỗ trợ đa dạng định dạng văn phòng**: `.pdf`, `.docx`, `.xlsx`, `.pptx`, `.png`, `.jpg`.
*   **Hierarchical Legal & Regulation Parsing**: Tự động nhận diện văn bản quy chế, điều lệ, hợp đồng theo cấu trúc `Chương -> Điều -> Khoản`. Mỗi đoạn trích xuất đều được gắn metadata ngữ cảnh cha (`[Tên tài liệu] > [Chương X] > [Điều Y]`), loại bỏ tình trạng mất ngữ cảnh.
*   **PaddleOCR Fallback tự động**: Nhận diện chữ tiếng Việt có dấu từ tài liệu scan cũ hoặc ảnh chụp thông báo nội bộ.
*   **Chuyển đổi bảng tính Excel sang Markdown**: Giúp mô hình AI đọc hiểu dữ liệu dạng bảng biểu thống kê dễ dàng.
*   **Đồng bộ vòng đời tài liệu**: Khi xóa tài liệu, hệ thống tự động xóa bản ghi trong PostgreSQL, xóa tệp vật lý và dọn sạch các vector liên quan trong Qdrant.

#### 3.3. Vùng Tri Thức Giới Hạn ("NotebookLM-Style" Knowledge Scope)
*   Mỗi cuộc trò chuyện độc lập có thể được **đính kèm với một danh sách các tài liệu cụ thể** do người dùng lựa chọn (ví dụ: chỉ tra trong *"Quy chế Tài chính 2026"* hoặc *"Hợp đồng Vendor A"*).
*   AI bị giới hạn nghiêm ngặt trong phạm vi tri thức đó, ngăn chặn việc lấy nhầm dữ liệu sang các tài liệu không liên quan.

---

### 4. Phân Tích Pipeline AI RAG Chuyên Sâu

Hệ thống triển khai quy trình xử lý dữ liệu chặt chẽ gồm 3 giai đoạn:

<div style="text-align: center; margin: 30px 0;">
  <img src="/images/2-Proposal/pipeline_rag.png" alt="Sơ đồ Pipeline AI RAG Chuyên sâu 3 Giai đoạn" style="width: 100%; max-width: 1050px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.12); border: 1px solid #E2E8F0; margin: 0 auto; display: block;" />
  <p style="font-style: italic; color: #666; margin-top: 10px; font-size: 0.9em;">Sơ đồ Pipeline AI RAG Chuyên sâu 3 Giai đoạn: Ingestion Pipeline, Agentic Retrieval & Generation</p>
</div>

#### Giai đoạn 1: Ingestion Pipeline (Nạp & Tiền xử lý dữ liệu)
*   **Trích xuất linh hoạt**: Văn bản số xử lý qua PyMuPDF; tài liệu scan/ảnh kích hoạt PaddleOCR.
*   **Hierarchical Parsing**: Nhận diện cấu trúc Chương, Điều, Khoản qua Regex. Với tài liệu tự do, fallback về `SemanticChunker` (ngưỡng phân vị 80%).
*   **Đánh chỉ mục Vector**: Mã hóa các chunk qua mô hình `BAAI/bge-m3` và lưu vào Qdrant cùng metadata (`source`, `page`, `chuong`, `dieu`, `user_id`).

#### Giai đoạn 2: Retrieval Pipeline (Truy xuất Cấp độ Agentic)
*   **Tier 1 Guardrail (Pre-flight Fast Check)**: Quét kiểm duyệt bảo mật ngay tại cửa ngõ người dùng nhập câu hỏi (Input Validation, Regex/Keyword), phát hiện và chặn đứng tức thì Prompt Injection, Jailbreak kịch bản (DAN, System Override) và câu hỏi lệch miền nghiệp vụ trước khi tốn tài nguyên truy xuất.
*   **Self-Query Retriever**: Dùng Pydantic bắt LLM phân tích câu hỏi, vừa chuẩn hóa câu hỏi độc lập, vừa bóc tách metadata (năm ban hành, loại văn bản) thành **Hard-Filters** ép trực tiếp xuống Qdrant.
*   **Hybrid Search**: Kết hợp tìm kiếm ngữ nghĩa (Dense Vector) và từ khóa (BM25) quét Top 25 kết quả thô, lọc bỏ các trang mục lục rác.
*   **Re-ranking (Cross-Encoder)**: Sử dụng `BAAI/bge-reranker-v2-m3` để lọc ra Top 3 kết quả sát với câu hỏi nhất.
*   **Cross-Reference Agent (Truy xuất đệ quy)**: Tự động kiểm tra Top 3 kết quả xem có chứa tham chiếu chéo (Ví dụ: *"Theo quy định tại Điều 12..."*). Nếu thiếu, hệ thống tự động kích hoạt truy xuất lần 2 (second-hop) để bổ sung văn bản Điều 12 vào ngữ cảnh.

#### Giai đoạn 3: Generation Pipeline (Sinh câu trả lời với Tier 2 Guardrail)
*   **Tier 2 Guardrail (Deep Grounding & Prompt Hardening)**: Ép chặt System Prompt triệt tiêu ảo giác (*Anti-Hallucination*), quy định chặt chẽ: chỉ trả lời dựa trên bằng chứng trực tiếp trong ngữ cảnh tìm được, từ chối phỏng đoán nếu tài liệu không đề cập và vô hiệu hóa mọi lệnh Indirect Injection ẩn trong tài liệu.
*   **Format Context & Citations**: Tiêm cấu trúc cây phân cấp vào ngữ cảnh và bắt buộc AI đính kèm trích dẫn số trang, tên tài liệu gốc minh bạch (`[Nguồn: ... - Trang ...]`).
*   **LLM Call**: Sinh câu trả lời hoàn thiện hoặc truyền luồng (Streaming qua SSE) theo thời gian thực.

---

### 5. Hình Ảnh Giao Diện Thực Tế Của Dự Án

Dưới đây là hình ảnh chụp thực tế giao diện ứng dụng trợ lý tra cứu văn bản nội bộ đang vận hành:

<div style="text-align: center; margin: 25px 0;">
  <img src="/images/2-Proposal/1.png" alt="Giao diện Chatbot Tra cứu Văn bản Nội bộ" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 25px;" />
  <p style="font-style: italic; color: #666; margin-top: -15px; margin-bottom: 30px;">Hình 1: Giao diện Chatbot trả lời câu hỏi nghiệp vụ và dẫn chứng trích dẫn điều khoản cụ thể</p>

  <img src="/images/2-Proposal/2.png" alt="Giao diện Tra cứu và Đối soát Nguồn" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 25px;" />
  <p style="font-style: italic; color: #666; margin-top: -15px; margin-bottom: 30px;">Hình 2: Trải nghiệm hỏi đáp thông minh kết hợp đối soát số trang và tên file tài liệu gốc</p>

  <img src="/images/2-Proposal/3.png" alt="Giao diện Quản trị Tài liệu Nội bộ" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 25px;" />
  <p style="font-style: italic; color: #666; margin-top: -15px; margin-bottom: 30px;">Hình 3: Kho quản lý danh mục tài liệu nội bộ và lựa chọn Vùng tri thức (Knowledge Scope)</p>

  <img src="/images/2-Proposal/4.png" alt="Giao diện Quản lý Phiên Hội thoại" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto;" />
  <p style="font-style: italic; color: #666; margin-top: 10px;">Hình 4: Quản lý các phiên hội thoại độc lập theo từng dự án hoặc từng chuyên đề nội bộ</p>
</div>

---

### 6. Thiết Kế Kiến Trúc Điện Toán Đám Mây Chuyên Sâu Trên AWS

Để đưa hệ thống **Enterprise Knowledge AI RAG** từ môi trường Docker cục bộ lên môi trường vận hành đám mây chuẩn doanh nghiệp, kiến trúc đề xuất trên AWS được thiết kế tuân thủ các nguyên tắc High Availability (HA), Zero-Trust và Serverless Containerization:

#### 6.1. Sơ đồ Kiến trúc Tổng thể trên AWS:

<div style="text-align: center; margin: 30px 0;">
  <img src="/images/2-Proposal/enterprise_aws_architecture.png" alt="Sơ đồ Kiến trúc Đám mây Doanh nghiệp trên AWS" style="width: 100%; max-width: 1050px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.12); border: 1px solid #E2E8F0; margin: 0 auto; display: block;" />
  <p style="font-style: italic; color: #666; margin-top: 10px; font-size: 0.9em;">Hình 5: Sơ đồ Kiến trúc Chi tiết Hệ thống Enterprise Knowledge AI RAG trên Nền tảng AWS (Multi-AZ Resilient & Zero-Trust Security)</p>
</div>

---

#### 6.2. Quy hoạch Mạng VPC & Phân vùng Subnets chuẩn Multi-AZ (High Availability)

Hệ thống được triển khai trên dải mạng VPC `10.0.0.0/16` trải dài trên **2 Availability Zones** (`ap-southeast-1a` và `ap-southeast-1b`) thuộc AWS Region Singapore nhằm đảm bảo tính sẵn sàng cao tuyệt đối:

| Vùng Mạng (Subnet Tier) | Phân bố Availability Zone | Dải IP CIDR | Mục đích kỹ thuật & Đối tượng lưu trữ |
| :--- | :--- | :--- | :--- |
| **Public Subnet 1** | `ap-southeast-1a` | `10.0.1.0/24` | Application Load Balancer Node 1, NAT Gateway 1, Internet Gateway kết nối ra ngoài. |
| **Public Subnet 2** | `ap-southeast-1b` | `10.0.2.0/24` | Application Load Balancer Node 2, NAT Gateway 2 (Dự phòng Failover). |
| **Private App Subnet 1** | `ap-southeast-1a` | `10.0.10.0/24` | Container ECS Fargate API, Celery Ingestion Worker Node 1, ElastiCache Redis Primary. |
| **Private App Subnet 2** | `ap-southeast-1b` | `10.0.20.0/24` | Container ECS Fargate API Replica, ElastiCache Redis Read Replica (Auto-failover). |
| **Isolated Data Subnet 1**| `ap-southeast-1a` | `10.0.100.0/24`| RDS PostgreSQL Primary Instance, Qdrant Vector Store trên EC2 Graviton (Không có Internet). |
| **Isolated Data Subnet 2**| `ap-southeast-1b` | `10.0.200.0/24`| RDS PostgreSQL Standby Replica (Multi-AZ Synced), EBS Snapshot backup. |

> [!IMPORTANT]
> **Cơ chế AWS PrivateLink (VPC Endpoints)**:
> Nhằm triệt tiêu nguy cơ rò rỉ dữ liệu khi giao tiếp với các dịch vụ AWS nội bộ, hệ thống cấu hình:
> *   **Gateway Endpoint**: Dành cho **Amazon S3** (miễn phí băng thông, truy xuất trực tiếp từ private subnet).
> *   **Interface Endpoints**: Dành cho **Amazon ECR**, **AWS Secrets Manager**, và **Amazon Bedrock**. Lưu lượng truy vấn mô hình AI không bao giờ đi qua Internet công cộng mà chạy hoàn toàn trên mạng trục của AWS.

---

#### 6.3. Ma trận Tường lửa Bảo mật (Security Groups Least-Privilege Matrix)

Hệ thống thiết lập nguyên tắc **Zero-Trust** — Không có bất kỳ thành phần nào tin cậy thành phần khác nếu không có quy tắc tường lửa xác thực rõ ràng:

| Security Group | Giao thức / Port | Nguồn cho phép (Inbound Source) | Mục đích kỹ thuật |
| :--- | :--- | :--- | :--- |
| **`sg-alb`** | TCP `443` (HTTPS)<br/>TCP `80` (HTTP) | `0.0.0.0/0` (Internet qua CloudFront) | Tiếp nhận lưu lượng từ người dùng, tự động chuyển hướng HTTP sang HTTPS. |
| **`sg-ecs-api`** | TCP `8000` | Chỉ từ `sg-alb` | Chỉ cho phép ALB gửi request vào container FastAPI, từ chối mọi truy cập trực tiếp. |
| **`sg-ecs-worker`** | Không có Inbound | Không mở port Inbound | Worker chỉ chủ động pull task từ Redis và gửi query tới DB/S3 (Outbound only). |
| **`sg-elasticache`**| TCP `6379` | Chỉ từ `sg-ecs-api` & `sg-ecs-worker` | Ngăn chặn truy cập trái phép vào hàng đợi Celery và bộ nhớ đệm session. |
| **`sg-rds`** | TCP `5432` | Chỉ từ `sg-ecs-api` & `sg-ecs-worker` | Khóa chặt cơ sở dữ liệu quan hệ, chỉ chấp nhận truy vấn từ các container được cấp phép. |
| **`sg-qdrant`** | TCP `6333` | Chỉ từ `sg-ecs-api` & `sg-ecs-worker` | Bảo vệ kho dữ liệu vector, không để lộ endpoint Qdrant ra ngoài Internet. |

---

#### 6.4. Bảng Ánh Xạ Toàn Diện Module Ứng Dụng Sang Dịch Vụ AWS:

| Thành phần trong Source Code RAG | Dịch vụ AWS tương ứng | Cấu hình & Vai trò kỹ thuật trong kiến trúc đám mây |
| :--- | :--- | :--- |
| **Giao diện Web (React / Next.js)** | **Amazon S3 + CloudFront** | S3 lưu trữ bản build tĩnh; CloudFront CDN phân phối toàn cầu với chứng chỉ SSL/TLS miễn phí qua AWS Certificate Manager (ACM). |
| **Tường lửa biên & Cân bằng tải** | **AWS WAF + ALB** | WAF kích hoạt `AWSManagedRulesCommonRuleSet`, chống tấn công L7, Rate Limit; ALB cân bằng tải đa vùng (Multi-AZ). |
| **Backend API (FastAPI)** | **Amazon ECS Fargate** | Chạy container không máy chủ (Serverless), cấu hình Target Tracking Auto-Scaling dựa trên CPU Utilization (ngưỡng 70%). |
| **Xử lý nền (Celery Worker)** | **Amazon ECS Fargate Worker** | Container chuyên biệt xử lý bóc tách tài liệu, OCR và tạo vector embeddings khi nhân viên tải tệp mới lên. |
| **Hàng đợi & Bộ nhớ đệm** | **Amazon ElastiCache Redis** | Cluster Redis Multi-AZ với tự động chuyển đổi dự phòng (Automatic Failover), độ trễ truy xuất dưới 1 mili-giây. |
| **Cơ sở dữ liệu (PostgreSQL)** | **Amazon RDS PostgreSQL** | Instance `db.t4g.medium` Multi-AZ, tự động sao lưu hàng ngày (Backup Retention 7 ngày), mã hóa lưu trữ bằng KMS. |
| **CSDL Vector (Qdrant)** | **Qdrant trên EC2 Graviton (ARM64)** | Instance `c7g.xlarge` chạy trên chip AWS Graviton3, ổ cứng `gp3` cấu hình 3000 IOPS & 125 MB/s throughput, tiết kiệm 20% chi phí so với x86. |
| **Kho lưu trữ tệp gốc (Data Lake)** | **Amazon S3 (Standard + Glacier)** | Phân tầng dữ liệu tự động với S3 Lifecycle: sau 90 ngày tự chuyển tài liệu cũ sang S3 Glacier Instant Retrieval; mã hóa SSE-KMS. |
| **Mô hình Ngôn ngữ (LLM)** | **Amazon Bedrock / Google Gemini** | Kết nối Amazon Bedrock (Claude 3.5 Sonnet / Titan) qua VPC Interface Endpoint; Gemini 2.5 Flash qua NAT Gateway. |
| **Bảo mật bí mật & Giám sát** | **AWS Secrets Manager & CloudWatch** | Quản lý chuỗi kết nối DB, API Keys với tính năng xoay vòng khóa tự động (Rotation); CloudWatch thu thập logs và kích hoạt cảnh báo qua SNS. |

---

#### 6.5. Quản Trị Định Danh IAM & Cơ Chế Bảo Mật Zero-Trust

Kiến trúc áp dụng nguyên tắc đặc quyền tối thiểu (**Least Privilege**) thông qua việc tách biệt rõ ràng các IAM Roles:

1.  **ECS Task Execution Role (`ecsTaskExecutionRole`)**:
    *   Cấp quyền cho ECS Agent kéo container image từ **Amazon ECR**.
    *   Cấp quyền tạo log group và ghi log vào **Amazon CloudWatch Logs**.
    *   Cấp quyền đọc các biến môi trường nhạy cảm (DB password, API Key) từ **AWS Secrets Manager** (`secretsmanager:GetSecretValue`).
2.  **ECS Task Role (`ecsLegalRAGTaskRole`)**:
    *   Cấp quyền cho ứng dụng FastAPI đọc/ghi tệp lên **Amazon S3 Document Lake** (`s3:GetObject`, `s3:PutObject`, `s3:DeleteObject`).
    *   Cấp quyền sử dụng khóa mã hóa **AWS KMS Customer Managed Key** (`kms:Decrypt`, `kms:GenerateDataKey`).
    *   Cấp quyền gọi mô hình suy luận trên **Amazon Bedrock** (`bedrock:InvokeModel`, `bedrock:InvokeModelWithResponseStream`).
3.  **Mã hóa dữ liệu toàn diện (End-to-End Encryption)**:
    *   *Dữ liệu đang truyền (In-Transit)*: Bắt buộc TLS 1.3 từ người dùng đến CloudFront, ALB và từ ALB vào container ECS Fargate.
    *   *Dữ liệu tĩnh (At-Rest)*: Toàn bộ S3 Buckets, RDS PostgreSQL Storage, và EBS Volumes của Qdrant đều được mã hóa bằng khóa riêng AWS KMS CMK.

---

#### 6.6. Quy Trình Tự Động Hóa CI/CD & Giám Sát Vận Hành (GitOps & Observability)

<div style="text-align: center; margin: 30px 0;">
  <img src="/images/2-Proposal/cicd_observability.png" alt="Quy trình Tự động hóa CI/CD GitOps và Giám sát Vận hành CloudWatch" style="width: 100%; max-width: 1050px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.12); border: 1px solid #E2E8F0; margin: 0 auto; display: block;" />
  <p style="font-style: italic; color: #666; margin-top: 10px; font-size: 0.9em;">Hình 6: Sơ đồ Quy trình Tự động hóa CI/CD GitOps & Giám sát Vận hành (Telemetry & Observability) trên AWS</p>
</div>

*   **Zero-Downtime Deployment**: Khi cập nhật mã nguồn mới, ECS Fargate khởi tạo các container mới, chờ kiểm tra đường truyền (Health Check qua `/api/health`) thành công trên ALB rồi mới dừng các container cũ, đảm bảo người dùng không bao giờ bị ngắt quãng dịch vụ.
*   **Giám sát vận hành chuyên sâu**:
    *   **CloudWatch Container Insights**: Theo dõi chi tiết mức tiêu hao tài nguyên của từng microservice.
    *   **AWS X-Ray**: Phân tích độ trễ phân tán (Distributed Tracing), bóc tách thời gian xử lý của từng bước (Embedding → Vector Search → LLM Generation) để kịp thời tối ưu điểm nghẽn.

---

### 7. Phân Tích Chi Phí & Tối Ưu Hóa Đầu Tư (AWS Cost Breakdown & TCO)

#### 7.1. Bảng Ước Tính Chi Phí Chi Tiết Từng Dịch Vụ AWS Hàng Tháng:

| Dịch vụ AWS | Cấu hình kỹ thuật lựa chọn | Cách tính chi phí | Chi phí ước tính / tháng |
| :--- | :--- | :--- | :--- |
| **Amazon ECS Fargate (API)** | 2 Tasks thường trực (0.5 vCPU, 1 GB RAM) | ~$0.024/giờ x 730 giờ x 2 | ~$35.00 |
| **Amazon ECS Fargate (Worker)**| 1 Task xử lý nền (1.0 vCPU, 2 GB RAM) | Chạy theo nhu cầu nạp tệp (~120 giờ/tháng) | ~$6.50 |
| **EC2 Qdrant (Graviton3)** | 1x `c7g.xlarge` (4 vCPU, 8 GB RAM) + 100GB gp3 | ~$0.145/giờ x 730 giờ + 100GB gp3 | ~$115.00 |
| **Amazon RDS PostgreSQL** | `db.t4g.medium` (2 vCPU, 4 GB RAM) Multi-AZ | ~$0.068 x 2 x 730 giờ + 50GB storage | ~$58.00 |
| **Amazon ElastiCache Redis** | `cache.t4g.micro` (0.5 GB RAM) Single-node | ~$0.016/giờ x 730 giờ | ~$11.50 |
| **Amazon S3 Document Lake** | 200 GB S3 Standard + 500 GB S3 Glacier Tier | Storage + PUT/GET Requests | ~$12.00 |
| **CloudFront & AWS WAF** | 1TB Egress Data Transfer + WAF Rule Group | 1TB Free Tier + WAF Web ACL ($5/tháng) | ~$6.00 |
| **Networking & Monitoring** | 1x ALB + 1x NAT Gateway + CloudWatch Logs | ALB ($18) + NAT Gateway traffic ($15) | ~$35.00 |
| **TỔNG CHI PHÍ ƯỚC TÍNH** | **Mô hình AWS Serverless & Graviton** | **Hệ thống vận hành đầy đủ, an toàn** | **~$270 – $280 / tháng** |

#### 7.2. So sánh Mô hình Máy chủ Truyền thống vs. Mô hình Đề xuất trên AWS:

| Tiêu chí so sánh | Mô hình Truyền thống (EC2 x86 Chạy 24/7) | Mô hình Đề xuất trên AWS (Serverless & Graviton) | Mức độ Tối ưu |
| :--- | :--- | :--- | :--- |
| **Hiệu quả Compute** | Máy chủ luôn chạy 100% công suất kể cả ban đêm | ECS Fargate co giãn tự động theo giờ làm việc hành chính | **Tiết kiệm ~73%** |
| **Hiệu năng Vector Store** | Chip x86 Intel/AMD đắt đỏ, tốn điện | Vi xử lý AWS Graviton3 ARM64 tối ưu hiệu năng/giá | **Tiết kiệm ~25%** |
| **Lưu trữ tài liệu** | Ổ cứng EBS cố định dung lượng lớn, chi phí cao | S3 Standard kết hợp S3 Glacier Lifecycle tự động | **Tiết kiệm ~80%** |
| **Bảo trì & Vận hành** | Tốn 1 nhân sự DevOps túc trực vá lỗi OS, backup DB | Dịch vụ Managed (RDS, Fargate) tự động hóa hoàn toàn | **Tiết kiệm hàng chục triệu VNĐ nhân sự/tháng** |
| **TỔNG CHI PHÍ VẬN HÀNH** | **~$600 – $800 / tháng** | **~$240 – $280 / tháng** | **Tiết kiệm ~65% – 70%** |

---

### 8. Tuân Thủ Toàn Diện 6 Trụ Cột AWS Well-Architected Framework

Kiến trúc được thiết kế nhằm đáp ứng hoàn hảo cả **6 trụ cột** theo tiêu chuẩn của Amazon Web Services:

1.  **Vận hành xuất sắc (Operational Excellence)**: Toàn bộ cơ sở hạ tầng được mã hóa bằng Infrastructure as Code (IaC); tự động hóa kiểm thử và triển khai với GitHub Actions và Amazon ECR; tích hợp giám sát tập trung qua Amazon CloudWatch và AWS X-Ray.
2.  **Bảo mật (Security - Zero Trust)**: Cô lập hoàn toàn cơ sở dữ liệu và vector store trong Isolated Subnets không có kết nối Internet; thực thi IAM Least-Privilege phân định rõ Task Role và Execution Role; mã hóa dữ liệu tĩnh và dữ liệu động bằng AWS KMS và TLS 1.3.
3.  **Độ tin cậy (Reliability)**: Kiến trúc Multi-AZ phân bố trên 2 Availability Zones; tự động chuyển đổi dự phòng (Automated Failover) với Amazon RDS Multi-AZ và ElastiCache Redis; cơ chế tự phục hồi (Self-healing) của ECS Fargate khi một task gặp lỗi.
4.  **Hiệu năng xuất sắc (Performance Efficiency)**: Tận dụng sức mạnh tính toán ma trận của vi xử lý **AWS Graviton3 ARM64** cho Qdrant Vector DB; lưu cache phản hồi bằng ElastiCache Redis và tăng tốc độ phân phối nội dung tĩnh qua Amazon CloudFront CDN.
5.  **Tối ưu hóa chi phí (Cost Optimization)**: Ứng dụng mô hình Serverless Pay-as-you-go không lãng phí tài nguyên nhàn rỗi; chính sách vòng đời S3 Lifecycle tự động chuyển dữ liệu cũ sang kho lạnh S3 Glacier.
6.  **Tính bền vững (Sustainability - Green Cloud)**: Sử dụng chip **AWS Graviton3** giúp giảm tiêu thụ điện năng tới **60%** so với chip x86 tương đương, đồng thời loại bỏ các máy chủ dư thừa chạy không tải ngoài giờ làm việc, góp phần giảm thiểu dấu chân carbon (Carbon Footprint) cho doanh nghiệp.

---

### 9. Lộ Trình Triển Khai & Tiêu Chí Đo Lường Chất Lượng (KPIs)

*   **Lộ trình 5 giai đoạn triển khai lên AWS**:
    1.  *Giai đoạn 1 (Thiết lập Nền tảng Mạng & An ninh)*: Khởi tạo VPC `10.0.0.0/16`, phân chia Public/Private/Isolated Subnets trên 2 AZs, cấu hình Security Groups và VPC Endpoints.
    2.  *Giai đoạn 2 (Hạ tầng Lưu trữ & Cơ sở dữ liệu)*: Tạo S3 Document Lake với khóa KMS, thiết lập RDS PostgreSQL Multi-AZ và khởi tạo EC2 Graviton cài đặt Qdrant Vector Store.
    3.  *Giai đoạn 3 (Đóng gói & Triển khai Compute Tier)*: Build Docker images cho FastAPI Backend và Celery Worker, push lên Amazon ECR, tạo ECS Task Definitions và cấu hình ECS Fargate Service kết nối ALB.
    4.  *Giai đoạn 4 (Triển khai Frontend & Lớp Biên)*: Upload bản build React lên Amazon S3, cấu hình CloudFront CDN, chứng chỉ SSL qua ACM và kích hoạt AWS WAF bảo vệ cổng vào.
    5.  *Giai đoạn 5 (Kiểm thử Toàn diện & Đo kiểm Hiệu năng)*: Nạp kho tài liệu quy chế nội bộ mẫu, kiểm thử truy xuất đệ quy (Cross-Reference Resolution) và đo lường độ trễ phản hồi dưới tải cao.
*   **Tiêu chí đo lường chất lượng hệ thống (KPIs)**:
    *   **Độ chính xác ngữ cảnh (Context Precision)**: Tỷ lệ trích xuất đúng điều khoản quy chế nội bộ đạt trên **95%**.
    *   **Độ chuẩn xác bộ lọc (Filter Accuracy)**: Khả năng bóc tách metadata phòng ban/loại văn bản đạt trên **98%**.
    *   **Tỷ lệ giải quyết tham chiếu chéo (Cross-Reference Success Rate)**: Tự động phát hiện và bổ sung điều khoản tham chiếu đạt trên **95%**.
    *   **Độ trễ phản hồi (End-to-End Latency)**: Thời gian từ khi nhân viên gửi câu hỏi đến khi bắt đầu nhận phản hồi (Time to First Token) dưới **2.5 giây**.
    *   **Tính sẵn sàng hệ thống (System Uptime SLA)**: Cam kết đạt mức độ sẵn sàng **99.9%** nhờ kiến trúc Multi-AZ.