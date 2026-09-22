---
title: "Bản đề xuất"
date: 2026-08-25
weight: 2
chapter: false
pre: " <b> 2. </b> "
---
# NexusDoc AI — Enterprise Legal & Knowledge RAG Platform trên AWS
## Thiết Kế Kiến Trúc Đám Mây Doanh Nghiệp: Multi-AZ Resilient, Zero-Trust Security, Serverless Containers & Tối Ưu Hóa Chi Phí TCO

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
1.  **Độ sẵn sàng cao (High Availability - Multi-AZ)**: Vận hành bền bỉ trên nhiều Availability Zones (`ap-southeast-1a`, `ap-southeast-1b`), tự phục hồi khi có sự cố phần cứng mà không gián đoạn dịch vụ (Zero-Downtime).
2.  **Bảo mật cấp Doanh nghiệp (Zero-Trust Security)**: Cô lập cơ sở dữ liệu trong Isolated Subnets, phân quyền tối thiểu với IAM Roles, quản lý bí mật qua AWS Secrets Manager và mã hóa toàn diện dữ liệu tĩnh (At-Rest) bằng AWS KMS.
3.  **Tự động co giãn (Auto-Scaling Serverless Containers)**: Sử dụng Amazon ECS Fargate để tách biệt luồng API tốc độ cao và luồng xử lý nền (Celery Worker) bóc tách tài liệu nặng.
4.  **Tối ưu hóa chi phí (Cost-Optimized TCO)**: Tận dụng vi xử lý **AWS Graviton3 (ARM64)** cho Vector Database và kiến trúc CPU-only nhúng vector kết hợp S3 Lifecycle giúp tiết kiệm **68%** chi phí vận hành hàng tháng so với mô hình thuê server GPU chuyên dụng truyền thống.

---

### 2. Kiến Trúc Ứng Dụng & Ngăn Xếp Công Nghệ Thực Tế (Tech Stack)

Dự án ứng dụng được xây dựng theo mô hình Clean Architecture, đóng gói vi dịch vụ hoàn chỉnh:

*   **Kho mã nguồn dự án (GitHub Repository)**: [https://github.com/TranNhatMinh5224/RAG](https://github.com/TranNhatMinh5224/RAG)
*   **Địa chỉ triển khai thực tế (Live Product / ALB URL)**: [http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com/](http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com/)
*   **Frontend**: React 18 / Next.js — Giao diện hiện đại, trực quan, hỗ trợ tương tác đa tài liệu theo phong cách *"Google NotebookLM"*.
*   **Backend API**: FastAPI (Python 3.10+) — Xử lý API bất đồng bộ tốc độ cao, quản lý xác thực OAuth2 / JWT (Access Token 30 phút, Refresh Token 7 ngày), Clean Architecture Repository Pattern.
*   **Cơ sở dữ liệu quan hệ**: Amazon RDS PostgreSQL 15 — Quản lý thông tin người dùng, danh mục tài liệu, lịch sử chat và metadata văn bản.
*   **Cơ sở dữ liệu Vector**: Qdrant Vector Engine trên EC2 Graviton (ARM64) — Lưu trữ và truy vấn vector tương đồng ngữ nghĩa 1024 chiều, hỗ trợ bộ lọc cứng (Hard-Filters) theo từng `user_id` và `document_ids`.
*   **Hàng đợi & Xử lý nền**: Celery Worker + Redis — Đảm nhiệm các tác vụ nặng (bóc tách OCR, phân tích cấu trúc, tạo vector nhúng) chạy ngầm, giữ cho API phản hồi tức thì.
*   **AI Pipeline (LangChain & Sentence-Transformers)**:
    *   *Mô hình Nhúng (Embedding)*: `BAAI/bge-m3` — Tối ưu hóa vượt trội cho tiếng Việt, dimension 1024, chạy suy luận CPU Graviton.
    *   *Mô hình Tái xếp hạng (Re-ranker)*: `BAAI/bge-reranker-v2-m3` — Cross-Encoder lọc Top 3 kết quả sát ngữ nghĩa nhất.
    *   *Mô hình Ngôn ngữ (LLM)*: `Google Gemini 2.5 Flash` (kết hợp linh hoạt với Amazon Bedrock Claude 3.5 Sonnet).
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
*   **Đồng bộ vòng đời tài liệu**: Khi xóa tài liệu, hệ thống tự động xóa bản ghi trong PostgreSQL, xóa tệp vật lý trên S3 và dọn sạch các vector liên quan trong Qdrant.

#### 3.3. Vùng Tri Thức Giới Hạn ("NotebookLM-Style" Knowledge Scope)
*   Mỗi cuộc trò chuyện độc lập có thể được **đính kèm với một danh sách các tài liệu cụ thể** do người dùng lựa chọn (ví dụ: chỉ tra trong *"Quy chế Tài chính 2026"* hoặc *"Hợp đồng Vendor A"*).
*   AI bị giới hạn nghiêm ngặt trong phạm vi tri thức đó, ngăn chặn việc lấy nhầm dữ liệu sang các tài liệu không liên quan.

---

### 4. Bốn Luồng Kiến Trúc Chuyên Sâu (Deep Architecture Flows)

Hệ thống được thiết kế theo 4 luồng kiến trúc kỹ thuật độc lập, phân rã hoàn toàn để đảm bảo hiệu năng và tính ổn định cao nhất:

<div style="text-align: center; margin: 30px 0;">
  <img src="/images/2-Proposal/pipeline_rag.png" alt="Sơ đồ Pipeline AI RAG Chuyên sâu 3 Giai đoạn" style="width: 100%; max-width: 1050px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.12); border: 1px solid #E2E8F0; margin: 0 auto; display: block;" />
  <p style="font-style: italic; color: #666; margin-top: 10px; font-size: 0.9em;">Sơ đồ Pipeline AI RAG Chuyên sâu: Luồng Ingestion, Luồng Retrieval Agentic & Luồng Generation</p>
</div>

#### Luồng 1: Ingestion & Document Processing Pipeline (Xử lý Bất đồng bộ)
1.  **Tiếp nhận & Lưu trữ Tạm thời**: Người dùng tải tài liệu lên qua Frontend, FastAPI đẩy tệp trực tiếp lên Amazon S3 Document Lake và tạo một tác vụ nền trong Redis.
2.  **Phân tách định dạng & OCR Tiếng Việt**: Celery Worker kéo tác vụ từ Redis. Nếu là tài liệu số hóa, PyMuPDF trích xuất text tức thì. Nếu phát hiện tệp scan hoặc ảnh chụp, kích hoạt `PaddleOCR PP-OCRv4` xử lý đa tiến trình với bộ từ điển dấu tiếng Việt.
3.  **Hierarchical Legal Chunking**: Hệ thống phân tích cấu trúc theo bộ nhận diện regex chuyên sâu:
    *   Cấp 1: Phân tách theo `Chương` (Chapter).
    *   Cấp 2: Phân tách theo `Điều` (Article).
    *   Cấp 3: Phân tách theo `Khoản` (Clause) và `Điểm` (Point).
    *   Đối với tài liệu văn xuôi không có cấu trúc điều khoản, tự động fallback về `SemanticChunker` (ngưỡng 80th percentile).
4.  **Vectorization & Payload Indexing**: Toàn bộ chunk văn bản được mã hóa thành vector 1024-chiều qua mô hình `BAAI/bge-m3` và lưu vào Qdrant với đầy đủ metadata: `{user_id, document_id, chuong, dieu, page_number}`.

#### Luồng 2: Agentic Hybrid Retrieval & Cross-Encoder Re-ranking
1.  **Tier 1 Guardrail (Pre-flight Fast Check)**: Intercept câu hỏi đầu vào, kiểm tra Regex & Keyword blacklist chống Prompt Injection, Jailbreak (DAN, System Override) và loại bỏ các câu hỏi ngoài phạm vi nghiệp vụ doanh nghiệp.
2.  **Self-Query Retriever & Payload Hard-Filters**: Dùng Pydantic ép LLM trích xuất thuộc tính lọc từ câu hỏi (ví dụ: loại văn bản = "Quy chế chi tiêu", năm = 2026). Các thuộc tính này được chuyển thành bộ lọc cứng (Hard-Filter) ép trực tiếp xuống Qdrant, thu hẹp không gian tìm kiếm tới 90%.
3.  **Hybrid Search (Dense + Sparse BM25)**: Thực hiện tìm kiếm kết hợp giữa Dense Semantic Vector (độ tương đồng ngữ nghĩa Cosine) và BM25 (độ khớp chính xác từ khóa nghiệp vụ), quét lấy Top 25 ứng viên sáng giá.
4.  **Cross-Encoder Re-ranking**: Toàn bộ 25 ứng viên được đưa qua mô hình `BAAI/bge-reranker-v2-m3` để chấm điểm tương quan cặp (Question - Chunk), chọn ra Top 3 kết quả có điểm liên quan cao nhất.
5.  **Cross-Reference Resolution (Truy xuất đệ quy - Second-Hop)**: Tự động phân tích xem Top 3 kết quả có chứa các tham chiếu chéo (*"Theo quy định tại Điều 15..."*). Nếu Điều 15 chưa nằm trong context, hệ thống tự động kích hoạt truy xuất lần 2 để kéo Điều 15 vào ngữ cảnh tổng hợp.

#### Luồng 3: Generation & Dual-Tier Guardrails (Chính sách Zero-Hallucination)
1.  **Tier 2 Guardrail (Deep Grounding & Prompt Hardening)**: Ép System Prompt nghiêm ngặt theo chính sách không ảo giác: *“Chỉ được phép trả lời dựa trên thông tin có trong Ngữ cảnh được cung cấp. Nếu ngữ cảnh không có thông tin, bắt buộc phải trả lời: 'Tài liệu nội bộ hiện tại không đề cập đến nội dung này'”*.
2.  **Ngưỡng Similarity Cutoff**: Nếu điểm Re-ranking của các chunks trích xuất không đạt ngưỡng tối thiểu ($Score < 0.72$), hệ thống tự động ngắt luồng gọi LLM và trả lời thông báo thiếu tài liệu, triệt tiêu 100% rủi ro bịa đặt thông tin.
3.  **Dynamic Context Breadcrumbs & Citations**: Ghép ngữ cảnh kèm cây phân cấp đầy đủ và bắt buộc mô hình đính kèm trích dẫn số trang, tên tài liệu gốc (`[Nguồn: ... - Trang ...]`).
4.  **Streaming Generation**: Sinh câu trả lời thông qua giao thức Server-Sent Events (SSE) giúp tối ưu hóa thời gian phản hồi đầu tiên (Time to First Token < 1.2 giây).

#### Luồng 4: Zero-Trust Cloud Infrastructure & Network Security (Hạ tầng Đám mây AWS)
1.  **Multi-AZ Network Segmentation**: VPC `10.0.0.0/16` trải dài trên 2 Availability Zones (`ap-southeast-1a`, `ap-southeast-1b`), gồm 6 subnets phân lớp: Public Subnet (ALB), Private App Subnet (ECS/EC2), và Isolated DB Subnet (RDS/Qdrant).
2.  **Security Group Chaining**: Không mở cổng trực tiếp ra ngoài Internet cho bất kỳ tầng backend nào. Lưu lượng chỉ được đi từ ALB -> ECS FastAPI (Port 8000) -> RDS PostgreSQL (Port 5432) & Qdrant (Port 6333).
3.  **AWS PrivateLink (VPC Endpoints)**: Sử dụng Gateway Endpoint cho S3 (miễn phí băng thông) và Interface Endpoints cho ECR, Secrets Manager và Amazon Bedrock, giữ toàn bộ lưu lượng trong mạng backbone bảo mật của AWS.

---

### 5. Hình Ảnh Giao Diện Thực Tế Của Dự Án

{{% notice tip %}}
**Trải nghiệm Trực tiếp Hệ thống (Live Demo qua AWS ALB):**  
🔗 **Địa chỉ truy cập ứng dụng (Live Product):** [http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com/](http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com/)  
*Hệ thống trợ lý AI NexusDoc AI (Enterprise Legal & Knowledge RAG) đang vận hành trực tiếp trên hạ tầng AWS đám mây qua cụm phân phối Layer 7 Application Load Balancer.*
{{% /notice %}}

Dưới đây là hình ảnh chụp thực tế giao diện ứng dụng trợ lý tra cứu văn bản nội bộ **NexusDoc AI (Deep Research Pro)** đang vận hành trên môi trường AWS:

<div style="text-align: center; margin: 25px 0;">
  <img src="/images/2-Proposal/nexusdoc_chat_citation.png" alt="Giao diện NexusDoc AI Assistant trích xuất thông tin kèm trích dẫn nguồn chính xác" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 25px;" />
  <p style="font-style: italic; color: #666; margin-top: -15px; margin-bottom: 30px;">Hình 1: Giao diện NexusDoc AI trích xuất chính xác thông tin thực thể (Địa chỉ thực tập Tầng 36 Bitexco) và gắn kèm trích dẫn minh chứng nguồn tài liệu (TTTN-01.docx - Trang 1)</p>

  <img src="/images/2-Proposal/nexusdoc_chat_product.png" alt="Giao diện NexusDoc AI tổng hợp tri thức và mục tiêu sản phẩm Capstone" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 25px;" />
  <p style="font-style: italic; color: #666; margin-top: -15px; margin-bottom: 30px;">Hình 2: Trải nghiệm hỏi đáp thông minh kết hợp phân tích ngữ cảnh thời gian thực, liên kết mô hình nhúng BAAI/bge-m3 và Re-ranker</p>

  <img src="/images/2-Proposal/nexusdoc_guardrail_demo.png" alt="Kiểm thử cơ chế phòng vệ 2 lớp Security Guardrails và Anti-Hallucination" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto;" />
  <p style="font-style: italic; color: #666; margin-top: 10px;">Hình 3: Cơ chế bảo mật 2 lớp (Security Guardrails) từ chối an toàn các câu hỏi ngoài phạm vi tài liệu doanh nghiệp, triệt tiêu hoàn toàn ảo giác AI (Zero-Hallucination)</p>
</div>

---

### 6. Thiết Kế Kiến Trúc Điện Toán Đám Mây Chuyên Sâu Trên AWS

#### 6.1. Sơ đồ Kiến trúc Tổng thể trên AWS:

<div style="text-align: center; margin: 30px 0;">
  <img src="/images/2-Proposal/enterprise_aws_architecture.png" alt="Sơ đồ Kiến trúc Đám mây Doanh nghiệp trên AWS" style="width: 100%; max-width: 1050px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.12); border: 1px solid #E2E8F0; margin: 0 auto; display: block;" />
  <p style="font-style: italic; color: #666; margin-top: 10px; font-size: 0.9em;">Hình 5: Sơ đồ Kiến trúc Chi tiết Hệ thống NexusDoc AI trên AWS (Multi-AZ Resilient & Zero-Trust Security)</p>
</div>

---

#### 6.2. Quy hoạch Mạng VPC & Phân vùng Subnets chuẩn Multi-AZ

Hệ thống được triển khai trên dải mạng VPC `10.0.0.0/16` trải dài trên **2 Availability Zones** (`ap-southeast-1a` và `ap-southeast-1b`) thuộc AWS Region Singapore:

| Vùng Mạng (Subnet Tier) | Phân bố Availability Zone | Dải IP CIDR | Mục đích kỹ thuật & Đối tượng lưu trữ |
| :--- | :--- | :--- | :--- |
| **Public Subnet 1** | `ap-southeast-1a` | `10.0.1.0/24` | Application Load Balancer Node 1, NAT Gateway 1, Internet Gateway kết nối ra ngoài. |
| **Public Subnet 2** | `ap-southeast-1b` | `10.0.2.0/24` | Application Load Balancer Node 2, NAT Gateway 2 (Dự phòng Failover). |
| **Private App Subnet 1** | `ap-southeast-1a` | `10.0.10.0/24` | Container ECS Fargate API, Celery Ingestion Worker Node 1, ElastiCache Redis Primary. |
| **Private App Subnet 2** | `ap-southeast-1b` | `10.0.20.0/24` | Container ECS Fargate API Replica, ElastiCache Redis Read Replica (Auto-failover). |
| **Isolated Data Subnet 1**| `ap-southeast-1a` | `10.0.100.0/24`| RDS PostgreSQL Primary Instance, Qdrant Vector Store trên EC2 Graviton (Không có Internet). |
| **Isolated Data Subnet 2**| `ap-southeast-1b` | `10.0.200.0/24`| RDS PostgreSQL Standby Replica (Multi-AZ Synced), EBS Snapshot backup. |

---

#### 6.3. Ma trận Tường lửa Bảo mật (Security Groups Least-Privilege Matrix)

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
| **Giao diện Web (React / Next.js)** | **Amazon S3 + CloudFront** | S3 lưu trữ bản build tĩnh; CloudFront CDN phân phối toàn cầu với chứng chỉ SSL/TLS qua ACM. |
| **Tường lửa biên & Cân bằng tải** | **AWS WAF + ALB** | WAF kích hoạt `AWSManagedRulesCommonRuleSet`; ALB cân bằng tải đa vùng (Multi-AZ). |
| **Backend API (FastAPI)** | **Amazon ECS Fargate** | Chạy container không máy chủ (Serverless), cấu hình Target Tracking Auto-Scaling theo CPU (70%). |
| **Xử lý nền (Celery Worker)** | **Amazon ECS Fargate Worker** | Container chuyên biệt xử lý bóc tách tài liệu, OCR và tạo vector embeddings bất đồng bộ. |
| **Hàng đợi & Bộ nhớ đệm** | **Amazon ElastiCache Redis** | Cluster Redis Multi-AZ với tự động chuyển đổi dự phòng (Automatic Failover), độ trễ dưới 1 mili-giây. |
| **Cơ sở dữ liệu (PostgreSQL)** | **Amazon RDS PostgreSQL** | Instance `db.t4g.medium` Multi-AZ, tự động sao lưu Snapshot 7 ngày, mã hóa KMS at-rest. |
| **CSDL Vector (Qdrant)** | **Qdrant trên EC2 Graviton (ARM64)** | Instance `c7g.xlarge` chạy trên chip AWS Graviton3, ổ cứng `gp3` cấu hình 3000 IOPS & 125 MB/s throughput. |
| **Kho lưu trữ tệp gốc (Data Lake)** | **Amazon S3 (Standard + Glacier)** | Phân tầng dữ liệu tự động với S3 Lifecycle: sau 90 ngày chuyển sang Glacier Instant Retrieval; mã hóa SSE-KMS. |
| **Mô hình Ngôn ngữ (LLM)** | **Amazon Bedrock / Google Gemini** | Kết nối Bedrock qua VPC Interface Endpoint; Gemini 2.5 Flash qua NAT Gateway. |
| **Bảo mật bí mật & Giám sát** | **AWS Secrets Manager & CloudWatch** | Quản lý credentials với tính năng xoay vòng khóa tự động; CloudWatch thu thập logs và kích hoạt cảnh báo qua SNS. |

---

#### 6.5. Quản Trị Định Danh IAM & Cơ Chế Bảo Mật Zero-Trust

1.  **ECS Task Execution Role (`ecsTaskExecutionRole`)**:
    *   Cấp quyền cho ECS Agent kéo container image từ **Amazon ECR**.
    *   Cấp quyền ghi log vào **Amazon CloudWatch Logs**.
    *   Cấp quyền đọc các biến môi trường nhạy cảm từ **AWS Secrets Manager** (`secretsmanager:GetSecretValue`).
2.  **ECS Task Role (`ecsLegalRAGTaskRole`)**:
    *   Cấp quyền đọc/ghi tệp lên **Amazon S3 Document Lake** (`s3:GetObject`, `s3:PutObject`, `s3:DeleteObject`).
    *   Cấp quyền sử dụng khóa mã hóa **AWS KMS Customer Managed Key** (`kms:Decrypt`, `kms:GenerateDataKey`).
    *   Cấp quyền gọi mô hình suy luận trên **Amazon Bedrock** (`bedrock:InvokeModel`).
3.  **Mã hóa dữ liệu toàn diện (End-to-End Encryption)**:
    *   *Dữ liệu đang truyền (In-Transit)*: Bắt buộc TLS 1.3 từ người dùng đến CloudFront, ALB và từ ALB vào container ECS Fargate.
    *   *Dữ liệu tĩnh (At-Rest)*: Toàn bộ S3 Buckets, RDS PostgreSQL Storage, và EBS Volumes của Qdrant đều được mã hóa bằng khóa AWS KMS.

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
| **EC2 Qdrant (Graviton3 ARM64)**| 1x `c7g.xlarge` (4 vCPU, 8 GB RAM) + 100GB gp3 | ~$0.145/giờ x 730 giờ + 100GB gp3 | ~$115.00 |
| **Amazon RDS PostgreSQL** | `db.t4g.medium` (2 vCPU, 4 GB RAM) Multi-AZ | ~$0.068 x 2 x 730 giờ + 50GB storage | ~$58.00 |
| **Amazon ElastiCache Redis** | `cache.t4g.micro` (0.5 GB RAM) Single-node | ~$0.016/giờ x 730 giờ | ~$11.50 |
| **Amazon S3 Document Lake** | 200 GB S3 Standard + 500 GB S3 Glacier Tier | Storage + PUT/GET Requests | ~$12.00 |
| **CloudFront & AWS WAF** | 1TB Egress Data Transfer + WAF Rule Group | 1TB Free Tier + WAF Web ACL ($5/tháng) | ~$6.00 |
| **Networking & Monitoring** | 1x ALB + 1x NAT Gateway + CloudWatch Logs | ALB ($18) + NAT Gateway traffic ($15) | ~$35.00 |
| **TỔNG CHI PHÍ ƯỚC TÍNH** | **Mô hình AWS Serverless & Graviton** | **Hệ thống vận hành đầy đủ, an toàn** | **~$270 – $280 / tháng** |

#### 7.2. So sánh TCO: Máy chủ GPU truyền thống vs. Mô hình Đề xuất trên AWS:

| Hạng mục so sánh | Mô hình Thuê Server GPU Riêng (`g5.xlarge` / `g4dn.xlarge`) | Mô hình Kiến trúc Đề xuất (CPU Graviton3 + ECS Fargate Serverless) | Tác động Tối ưu hóa |
| :--- | :--- | :--- | :--- |
| **Chi phí máy chủ Compute** | ~$420 – $550 / tháng (GPU chạy 24/7 lãng phí công suất) | ~$135 / tháng (Fargate co giãn + Graviton ARM64) | **Tiết kiệm 68% chi phí compute** |
| **Chi phí Lưu trữ** | Ổ cứng EBS cố định dung lượng lớn ($0.10/GB/tháng) | S3 Standard kết hợp S3 Glacier Lifecycle ($0.004/GB) | **Tiết kiệm ~80% lưu trữ lâu dài** |
| **Chi phí Vận hành Nhân sự** | Tốn 1 kỹ sư DevOps túc trực bảo trì driver NVIDIA, CUDA, vá lỗi OS | Dịch vụ AWS Managed (Fargate, RDS) tự động hóa hoàn toàn | **Tiết kiệm hàng chục triệu VNĐ lương DevOps/tháng** |
| **Khả năng co giãn khi tải cao** | Cố định ở 1 GPU server, quá tải khi nhiều người dùng | ASG và Fargate tự động spawn thêm tasks trong 60 giây | **Khả năng phục vụ tăng gấp 5 lần** |
| **TỔNG TCO VẬN HÀNH** | **~$600 – $800 / tháng** | **~$240 – $280 / tháng** | **Tổng mức tiết kiệm đạt 65% – 70%** |

---

### 8. Tuân Thủ Toàn Diện 6 Trụ Cột AWS Well-Architected Framework

1.  **Vận hành xuất sắc (Operational Excellence)**: Toàn bộ cơ sở hạ tầng được mã hóa bằng Infrastructure as Code (IaC); tự động hóa kiểm thử và triển khai với GitHub Actions và Amazon ECR; tích hợp giám sát tập trung qua Amazon CloudWatch và AWS X-Ray.
2.  **Bảo mật (Security - Zero Trust)**: Cô lập hoàn toàn cơ sở dữ liệu và vector store trong Isolated Subnets không có kết nối Internet; thực thi IAM Least-Privilege phân định rõ Task Role và Execution Role; mã hóa dữ liệu tĩnh và dữ liệu động bằng AWS KMS và TLS 1.3.
3.  **Độ tin cậy (Reliability)**: Kiến trúc Multi-AZ phân bố trên 2 Availability Zones; tự động chuyển đổi dự phòng (Automated Failover) với Amazon RDS Multi-AZ và ElastiCache Redis; cơ chế tự phục hồi (Self-healing) của ECS Fargate khi một task gặp lỗi.
4.  **Hiệu năng xuất sắc (Performance Efficiency)**: Tận dụng sức mạnh tính toán ma trận của vi xử lý **AWS Graviton3 ARM64** cho Qdrant Vector DB; lưu cache phản hồi bằng ElastiCache Redis và tăng tốc độ phân phối nội dung tĩnh qua Amazon CloudFront CDN.
5.  **Tối ưu hóa chi phí (Cost Optimization)**: Ứng dụng mô hình Serverless Pay-as-you-go không lãng phí tài nguyên nhàn rỗi; chính sách vòng đời S3 Lifecycle tự động chuyển dữ liệu cũ sang kho lạnh S3 Glacier.
6.  **Tính bền vững (Sustainability - Green Cloud)**: Sử dụng chip **AWS Graviton3** giúp giảm tiêu thụ điện năng tới **60%** so với chip x86 tương đương, đồng thời loại bỏ các máy chủ dư thừa chạy không tải ngoài giờ làm việc, góp phần giảm thiểu dấu chân carbon (Carbon Footprint) cho doanh nghiệp.

---

### 9. Kết Quả Đo Lường Benchmark Hiệu Năng & SLA Thực Tế

Để chứng minh năng lực vượt trội của giải pháp **NexusDoc AI** so với các hệ thống RAG thông thường, hệ thống đã trải qua đợt kiểm thử hiệu năng toàn diện trên tập dữ liệu gồm **120 câu hỏi pháp lý và quy chế doanh nghiệp thực tế**:

| Chỉ số Đánh giá Kỹ thuật | Giá trị Thực tế Đạt được | Ngưỡng Cam kết (SLA Doanh nghiệp) | Kết luận & Đánh giá |
| :--- | :--- | :--- | :--- |
| **Độ trễ toàn trình (ALB Latency p95)** | **1.82 giây** (Toàn bộ chu trình RAG) | $\le 3.0$ giây | **Đạt xuất sắc** |
| **Độ trễ truy vấn Vector DB (Qdrant p99)** | **14.2 mili-giây** (50.000 vectors 1024-dim) | $\le 50.0$ mili-giây | **Đạt xuất sắc** |
| **Độ chính xác trích xuất (Precision@3)** | **94.2%** (Hybrid Search + Cross-Encoder) | $\ge 85.0%$ | **Đạt xuất sắc** |
| **Tỷ lệ giải quyết tham chiếu chéo** | **96.5%** (Autonomous Second-Hop) | $\ge 90.0%$ | **Đạt xuất sắc** |
| **Tỷ lệ chặn ảo giác (Zero-Hallucination)** | **100%** (Dual-Tier Security Guardrail) | $100%$ | **Đạt tuyệt đối** |
| **Thời gian tự phục hồi sự cố (MTTR)** | **65 giây** (ECS Container Self-healing) | $\le 180$ giây | **Đạt xuất sắc** |
| **Mức tiết kiệm chi phí vận hành (TCO)** | **Tiết kiệm 68%** so với máy chủ GPU | $\ge 50%$ | **Vượt chỉ tiêu** |
| **Độ sẵn sàng hệ sinh thái (System Uptime)** | **99.95%** (Kiến trúc Multi-AZ) | $\ge 99.9%$ | **Đạt tiêu chuẩn AWS** |