---
title: "Day 1 - Govern"
date: 2026-09-08
weight: 2
chapter: false
pre: " <b> 6.2. </b> "
aliases:
  - /5-competitions/5.2-day1/
---

# 6.2. Day 1: Govern (Agentic Cloud Investigation)

Nội dung thi đấu và thực hành của ngày thi đầu tiên (Day 1) được xây dựng theo chuẩn chuyên môn từ chương trình [Prove It: Agentic Cloud Investigation Series — Day 01 · Govern](https://docs.cloudthinker.io/learn/workshops/prove-it/day-01-govern) do CloudThinker phối hợp cùng FCAJ và AWS Vietnam tổ chức.

---

### 1. Bối cảnh & Mục tiêu Chuyên môn

* **Bài toán thực tế**: Các AI/Coding Agents hiện nay có thể viết mã và vượt qua các bài kiểm thử tự động (unit tests) rất tốt trong một thư mục mã nguồn cục bộ, nhưng khi tương tác với hạ tầng đám mây thực tế (*Live Cloud Environment*), Agent rất dễ đưa ra các kết luận sai lệch, ảo giác (hallucination) hoặc hành động vượt ngoài tầm kiểm soát.
* **Mục tiêu của Day 01**: Hướng dẫn kỹ sư phương pháp thiết lập cơ chế quản trị (Governance), kiểm soát và định hướng AI Agent điều tra hạ tầng AWS một cách an toàn, minh bạch và có bằng chứng xác thực (Evidence-based).

---

### 2. Năm Nguyên lý Nền tảng (The Five Learnings)

Trong phần đào tạo kiến thức (*Learn Block - 35 phút*), đội thi đã tiếp thu và áp dụng 5 nguyên tắc cốt lõi:

1. **Định nghĩa Agent (`Agent = Model + Environment`)**: Năng lực và độ an toàn của Agent không chỉ nằm ở mô hình LLM mà phụ thuộc lớn vào môi trường và công cụ được cấp phát.
2. **Nhận thức ranh giới (`Boundary Awareness`)**: Môi trường Cloud không có một ranh giới thư mục cố định; Agent cần biết rõ phạm vi tài nguyên được phép quét.
3. **Cơ chế Human-in-the-Loop**: Tuyệt đối không để Agent tự động thực thi tùy tiện; mọi thay đổi lên hạ tầng đều bắt buộc phải có sự phê duyệt của con người (*Human Approval*).
4. **Tương tác đa tầng (`Layered Interaction`)**: Mỗi một lệnh gọi công cụ (*tool call*) của Agent phải đi qua nhiều lớp: CLI/SDK, ranh giới mạng (VPC), phân quyền tối thiểu (IAM Policies) và API Endpoints.
5. **Xác thực tuyên bố (`Claim Verification`)**: Mọi kết luận về tài nguyên đám mây đều phải gắn liền với bộ ba: **Nguồn (*Source*) — Phạm vi (*Scope*) — Thời điểm (*Time*)**.

---

### 3. Nhiệm vụ Thực hành của Đội thi (Practice Block - 95 phút)

Đội **WAR (Team 06)** được cấp quyền truy cập vào một tài khoản AWS Demo thực tế ở chế độ chỉ đọc (**Read-only**) và thực hiện chuỗi nhiệm vụ:

* **Xác định Câu hỏi Điều tra (*Investigative Question*)**: Lựa chọn điều tra chuyên sâu vào các trụ cột Well-Architected (Bảo mật - Security, Chi phí - Cost, Độ tin cậy - Reliability, Hiệu năng - Performance).
* **Điều phối AI Agent thu thập bằng chứng**: Sử dụng Agent để truy vấn trạng thái tài nguyên thực tế (EC2, S3, IAM, Security Groups...) mà không làm gián đoạn hệ thống.
* **Xây dựng Báo cáo Điều tra & Tối ưu hóa (*Investigation & Optimization Report*)**:
  * **Gán nhãn xác thực 4 mức độ**: Từng phát hiện của Agent bắt buộc phải được gắn nhãn kiểm định:
    * `[verified]`: Đã được chứng minh bằng dữ liệu và log thực tế.
    * `[inferred]`: Suy luận logic có căn cứ từ cấu hình tài nguyên.
    * `[assumed]`: Giả định của AI khi chưa đủ chứng cứ xác thực.
    * `[blocked]`: Bị chặn bởi chính sách quyền hạn (IAM/Network), Agent không thể xem được.
  * **Loại bỏ phán đoán vô căn cứ (*Drop unsupported claims*)**: Chủ động gạt bỏ các gợi ý chung chung của AI nếu không có bằng chứng từ live environment.
  * **Bảo mật dữ liệu nhạy cảm**: Ẩn danh/che (*Redact*) toàn bộ AWS Account ID, ARN và dữ liệu bí mật trước khi công bố báo cáo.
  * **Phân định quyền phê duyệt**: Chỉ rõ phát hiện ưu tiên số 1 cần khắc phục (*The One Finding to fix first*) và xác định những thao tác nào bắt buộc phải có con người phê duyệt.

---

### 4. Kết quả Đánh giá & Chấm điểm Day 1 (Share Block)

Sau khi hoàn thành báo cáo điều tra và thuyết minh phương pháp luận kiểm soát Agent trước Hội đồng Giám khảo & AWS Mentors, đội **WAR (Team 06)** đã đạt kết quả:

* **Trạng thái**: Đạt chuẩn đánh giá và được Ban Tổ chức tích chọn hoàn thành chỉ tiêu Day 1 (☑️).
* **Điểm số Day 1**: **70.8 điểm** — Minh chứng cho năng lực ứng dụng AI Agent có trách nhiệm, phương pháp thu thập bằng chứng chặt chẽ và báo cáo tối ưu hóa chất lượng cao.

<div style="text-align: center; margin: 25px 0;">
  <img src="/images/5-Competitions/KetQuaDay1_TeamWAR.png" alt="Bảng kết quả chấm điểm Day 1 của Team 06 WAR" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); max-width: 100%; height: auto;" />
  <p style="font-style: italic; color: #666; margin-top: 8px;">Minh chứng kết quả đánh giá và chấm điểm Day 1 của Team 06 (WAR) từ Ban Tổ chức</p>
</div>

---

### 5. Hình ảnh Hoạt động & Recap Day 1

Dưới đây là các khoảnh khắc sinh hoạt, làm việc và trao đổi chuyên môn trực tiếp của đội tại Văn phòng AWS Vietnam (Tầng 7, Grand Terra Tower, 36 Cát Linh, Hà Nội):

<div style="text-align: center; margin: 25px 0;">
  <img src="/images/5-Competitions/RecapDay1.1.JPG" alt="Recap Day 1 - Buổi sinh hoạt tại Văn phòng AWS Grand Terra (Ảnh 1)" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 90%; height: auto; margin-bottom: 20px;" />
  <p style="font-style: italic; color: #666; margin-top: -10px; margin-bottom: 25px;">Hình ảnh sinh hoạt và làm việc Day 1 tại Văn phòng AWS Vietnam (Ảnh 1)</p>
  
  <img src="/images/5-Competitions/RecapDay1.2.JPG" alt="Recap Day 1 - Buổi sinh hoạt tại Văn phòng AWS Grand Terra (Ảnh 2)" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 90%; height: auto;" />
  <p style="font-style: italic; color: #666; margin-top: 8px;">Hình ảnh kỷ niệm buổi sinh hoạt và làm việc Day 1 tại Văn phòng AWS Vietnam (Ảnh 2)</p>
</div>
