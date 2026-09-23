---
title: "Thiết kế Smart Model Router trên Amazon Bedrock"
date: 2026-09-23
weight: 2
chapter: false
pre: " <b> 5.2. </b> "
---

# 5.2. Đừng "All-in" vào một Model AI: Thiết kế Smart Model Router trên Amazon Bedrock để tối ưu 60% độ trễ & 50% chi phí

{{% notice info %}}
* **Tác giả:** Trần Nhật Minh (Solutions Architecture & Cloud Engineering Intern)
* **Kênh xuất bản:** [Cộng đồng AWS Study Group (FCJ) — Facebook](https://web.facebook.com/groups/awsstudygroupfcj/)
* **Chủ đề kỹ thuật:** Dynamic Model Routing, Model Cascading, Amazon Bedrock, Amazon Nova Micro, Anthropic Claude 3.5 Sonnet, Query Classification & FinOps.
{{% /notice %}}

---

### Ảnh Sơ Đồ Kiến Trúc Đính Kèm Bài Đăng:

<div align="center" style="margin: 25px 0;">
  <img src="/images/5-Blogs/smart_model_router_bedrock.png" alt="Sơ đồ Kiến trúc Smart Multi-Model Router trên Amazon Bedrock" style="width: 100%; max-width: 950px; border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.12); border: 1px solid #E2E8F0;" />
  <p><em>Hình 5.2.1: Sơ đồ Cơ chế Smart Multi-Model AI Router trên Amazon Bedrock (Phân luồng Intent & Complexity: Nova Micro vs Claude 3.5 Sonnet)</em></p>
</div>

---

### Toàn Văn Nội Dung Bài Đăng Thực Tế:

> **Đừng "All-in" vào một Model AI: Thiết kế Smart Model Router trên Amazon Bedrock để tối ưu 60% độ trễ & 50% chi phí**
>
> Trong hầu hết các hệ thống Enterprise RAG hiện nay, một sai lầm rất phổ biến là: Bất kỳ câu hỏi nào của người dùng cũng được đẩy thẳng cho mô hình LLM to và đắt nhất (như Claude 3.5 Sonnet).
>
> **Thực tế dữ liệu cho thấy:**
> * Hơn 70% câu hỏi hàng ngày của nhân viên chỉ là tra cứu dữ kiện ngắn gọn: *"Số ngày phép năm là bao nhiêu?", "Hạn mức mua sắm dưới 50 triệu do ai phê duyệt?", "Mẫu biên bản bàn giao nằm ở phụ lục nào?"*
> * Chỉ khoảng 30% câu hỏi thực sự đòi hỏi khả năng lập luận phức tạp: So sánh mâu thuẫn giữa hai hợp đồng, tổng hợp quy chế tài chính đa tài liệu, phân tích rủi ro pháp lý.
>
> Việc dùng "dao mổ trâu để giết gà" khiến hệ thống vừa chậm chạp (Time-to-First-Token cao), vừa lãng phí ngân sách gọi API không đáng có. 
>
> Để giải quyết bài toán này, mình đã thiết kế cơ chế **Smart Multi-Model AI Router** tích hợp trực tiếp vào pipeline trên AWS:
>
> ---
>
> ### 💡 Kiến Trúc Phân Luồng Thông Minh Hoạt Động Thế Nào?
>
> Khi người dùng gửi truy vấn, hệ thống không gọi ngay LLM lớn mà đi qua bộ phân loại **Intent & Complexity Classifier** (phân tích độ dài token, ý định tra cứu và mức độ lập luận cần thiết):
>
> 1️⃣ **Nhánh A — Fast / Factual Queries (Tra cứu dữ kiện đơn lẻ):**
> * **Model điều phối:** **Amazon Nova Micro** hoặc **Mistral 7B** qua Amazon Bedrock.
> * **Đặc điểm:** Tốc độ suy luận siêu tốc (độ trễ phản hồi < 300ms), chi phí token rẻ hơn tới 90% so với mô hình lớn.
> * **Kết quả:** Người dùng nhận câu trả lời trích xuất tức thì với trải nghiệm streaming mượt mà.
>
> 2️⃣ **Nhánh B — Complex / Synthesis Queries (Tổng hợp đa văn bản & Lập luận sâu):**
> * **Model điều phối:** **Anthropic Claude 3.5 Sonnet** (hoặc Amazon Nova Pro).
> * **Đặc điểm:** Khả năng suy luận đa tầng (Multi-hop Reasoning), tự động xâu chuỗi thông tin từ nhiều điều khoản phân mảnh và đối soát tính chính xác.
> * **Kết quả:** Đưa ra báo cáo tổng hợp chi tiết, trích dẫn chuẩn xác số trang và điều khoản nội bộ.
>
> 3️⃣ **Cơ chế Fallback thông minh (Model Cascading):**
> * Nếu mô hình nhỏ ở Nhánh A có điểm tự tin (Confidence Score) thấp hoặc phát hiện câu hỏi vượt ngưỡng ngữ cảnh, hệ thống tự động thăng cấp (Escalate) truy vấn sang Claude 3.5 Sonnet mà người dùng không hề nhận thấy gián đoạn.
>
> ---
>
> ### 📊 Kết Quả Thực Nghiệm Thu Được:
> * ⚡ **Giảm 60% độ trễ khởi tạo phản hồi (TTFT - Time-to-First-Token)** đối với phần lớn câu hỏi tra cứu thông thường.
> * 💵 **Cắt giảm hơn 50% tổng chi phí token hàng tháng** so với mô hình gọi Claude 3.5 Sonnet cho 100% request.
> * 🎯 **Đảm bảo 99.8% độ chuẩn xác dữ liệu (Factual Grounding)** nhờ kết hợp chặt chẽ với kho dữ liệu vector Qdrant và Amazon S3.
>
> ---
> Một kiến trúc GenAI thực thụ trong doanh nghiệp không chỉ nằm ở việc mô hình AI thông minh đến đâu, mà nằm ở sự khéo léo trong điều phối tài nguyên (Resource Orchestration) để vừa tối ưu trải nghiệm người dùng, vừa giải quyết bài toán kinh tế đám mây.
>
> *(Mọi người xem qua và cho mình xin thêm ý kiến đóng góp về giải pháp điều phối này với nhé!)*
>
> #AWS #AmazonBedrock #GenAI #ModelRouting #MultiModel #CloudArchitecture #Claude3Sonnet #AmazonNova #RAG #FinOps #AIEngineering
