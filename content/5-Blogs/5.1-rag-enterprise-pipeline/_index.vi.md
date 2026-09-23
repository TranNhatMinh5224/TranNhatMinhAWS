---
title: "Xây dựng RAG Pipeline cho Enterprise"
date: 2026-09-23
weight: 1
chapter: false
pre: " <b> 5.1. </b> "
---

# 5.1. Xây dựng RAG Pipeline cho Enterprise: Từ Web Client đến Amazon Bedrock & Tối ưu 68% Chi phí trên AWS

{{% notice info %}}
* **Tác giả:** Trần Nhật Minh (Solutions Architecture & Cloud Engineering Intern)
* **Kênh xuất bản:** [Cộng đồng AWS Study Group (FCJ) — Facebook](https://web.facebook.com/groups/awsstudygroupfcj/?multi_permalinks=2284725838959042&notif_id=1790147738731057&notif_t=feedback_reaction_generic&ref=notif)
* **Link bài đăng trực tiếp (Live Post):** [https://web.facebook.com/groups/awsstudygroupfcj/permalink/2284725838959042/](https://web.facebook.com/groups/awsstudygroupfcj/?multi_permalinks=2284725838959042&notif_id=1790147738731057&notif_t=feedback_reaction_generic&ref=notif)
{{% /notice %}}

---

### Ảnh Sơ Đồ Kiến Trúc Đính Kèm Bài Đăng:

<div align="center" style="margin: 25px 0;">
  <img src="/images/enterprise_rag_full_architecture.png" alt="Sơ đồ Kiến trúc Đám mây AWS Toàn diện Enterprise RAG" style="width: 100%; max-width: 950px; border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.12); border: 1px solid #E2E8F0;" />
  <p><em>Hình 5.1.1: Sơ đồ Kiến trúc Toàn diện NexusDoc AI: Mạng Amazon VPC phân tầng chuẩn xác, Máy chủ EC2 (enterprise-rag-server) vận hành Docker Compose (Next.js, FastAPI, Qdrant, Redis) trong Application Subnet, Amazon RDS PostgreSQL (AWS Graviton db.t4g.micro) trong Isolated Subnet, kết nối bảo mật tới các dịch vụ AWS Managed Services (S3, Secrets Manager, Bedrock Mantle)</em></p>
</div>

---

### Toàn Văn Nội Dung Bài Đăng Thực Tế:

> **Xây dựng RAG Pipeline cho Enterprise: Từ Web Client đến Amazon Bedrock & Tối ưu 68% Chi phí trên AWS**
>
> Mình vừa hoàn thiện một kiến trúc Enterprise RAG (Retrieval-Augmented Generation) kết hợp giữa mô hình mạng Zero-Trust, hạ tầng Container hóa Docker trên máy chủ Amazon EC2 và Amazon RDS PostgreSQL chạy trên vi xử lý AWS Graviton, tối ưu hóa cả về độ an toàn dữ liệu lẫn bài toán chi phí vận hành cho doanh nghiệp.
>
> **Vì sao kiến trúc này phù hợp với Enterprise?**
>
> ✅ **Dữ liệu nhạy cảm không rời khỏi AWS Cloud:**  
> Sử dụng kiến trúc Amazon VPC phân tầng mạng cô lập chuẩn chỉnh:
> * Toàn bộ cụm dịch vụ **Next.js Frontend, FastAPI RAG Backend, Redis và Qdrant Vector DB** được tối ưu hóa đóng gói gọn gàng qua **Docker Compose** trên một máy chủ **Amazon EC2** duy nhất nằm trong **Application Subnet**, giúp tối ưu hóa hiệu năng giao tiếp nội bộ qua loopback/bridge network và tiết kiệm chi phí tối đa.
> * Riêng cơ sở dữ liệu quan hệ **Amazon RDS PostgreSQL** (chạy trên vi xử lý **AWS Graviton `db.t4g.micro`**, Port 5432) được đặt biệt lập hoàn toàn trong **Isolated Database Subnet** không gắn Internet Gateway, triệt tiêu triệt để nguy cơ lộ cổng DB ra Internet. Đội ngũ vận hành truy cập quản trị an toàn thông qua AWS Systems Manager (SSM) Session Manager thay vì mở port SSH truyền thống.
>
> ✅ **Hàng rào phòng thủ 2 lớp (2-Tier Security Guardrails):**  
> Kiểm soát chặt chẽ an toàn dữ liệu và giảm thiểu tối đa hiện tượng ảo giác (Hallucination):
> * **Tier 1 (Pre-flight):** Bộ lọc quét và chặn đứng các đòn tấn công Prompt Injection, Jailbreak, đồng thời ngăn chặn ý đồ trích xuất API Key/thông tin nhạy cảm (PII).
> * **Tier 2 (Context Grounding):** Ràng buộc mô hình suy luận nghiêm ngặt dựa trên ngữ cảnh được trích xuất (Retrieval Context), tự động dẫn nguồn trích dẫn (số trang/điều khoản) và dứt khoát từ chối khi thông tin nằm ngoài phạm vi tài liệu.
>
> ✅ **Tối ưu hóa 68% chi phí vận hành (TCO):**  
> Thay vì duy trì các cụm máy chủ GPU đắt đỏ ($600 – $800/tháng chạy 24/7), hệ thống kết hợp vi xử lý AWS Graviton3 ARM64 (db.t4g.micro) cho cơ sở dữ liệu RDS, chạy Docker Compose tối ưu trên EC2 cho backend & Qdrant vector search, kết hợp Foundation Models qua Amazon Bedrock theo cơ chế Pay-as-you-go, đưa chi phí toàn hệ thống xuống chỉ còn ~$270/tháng.
>
> ✅ **Bảo mật tập trung với AWS Secrets Manager & KMS:**  
> Loại bỏ hoàn toàn nguy cơ từ file .env tĩnh, toàn bộ tham số môi trường sản xuất được mã hóa với KMS và tự động nạp động (Runtime Injection) thông qua IAM Role.
>
> ✅ **Khả năng ứng dụng thực tế:**  
> Phù hợp tra cứu quy chế quản trị nội bộ, chính sách bảo mật, hợp đồng pháp lý và tài liệu kỹ thuật — người dùng truy vấn trực tiếp qua Web UI nhận phản hồi streaming mượt mà kèm trích dẫn số trang chính xác để đối chiếu ngay lập tức.
>
> ---
> Một kiến trúc hướng tới việc xây dựng Trợ lý Tri thức Doanh nghiệp (Enterprise Knowledge Assistant) thực thụ: an toàn dữ liệu, phản hồi chuẩn xác và bài toán kinh tế đám mây tối ưu.  
> *(Mong mng xem qua và chỉ em qua và đóng góp để em hoàn thiện bản thân hơn ạ)*
>
> 🔗 **Link bài đăng trực tiếp:** [AWS Study Group FCJ Facebook](https://web.facebook.com/groups/awsstudygroupfcj/?multi_permalinks=2284725838959042&notif_id=1790147738731057&notif_t=feedback_reaction_generic&ref=notif)
