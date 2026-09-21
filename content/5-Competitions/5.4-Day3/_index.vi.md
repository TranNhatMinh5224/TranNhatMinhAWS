---
title: "Day 3 - Prove It Arena"
date: 2026-09-19
weight: 4
chapter: false
pre: " <b> 5.4. </b> "
---
# 5.4. Day 3: Prove It Arena (Đấu Trường Chung Kết Cloud & AI)

Ngày thi đấu thứ ba (**Day 03 · Prove It Arena**) là vòng chung kết khép lại chuỗi sự kiện chuyên sâu [Prove It: Agentic Cloud Investigation Series](https://docs.cloudthinker.io/learn/workshops/prove-it/overview) do CloudThinker phối hợp cùng cộng đồng First Cloud Journey (FCAJ) và AWS Vietnam tổ chức.

Khác với Day 01 (học lý thuyết quản trị và rà quét tài nguyên) và Day 02 (phương pháp lọc nhiễu cảnh báo và điều tra sự cố đơn lẻ), **Day 03 là một đấu trường thực chiến trọn vẹn (Arena)**: không có bài giảng lý thuyết, không có Keynote, mà bước thẳng vào Briefing, 2 vòng thi tính điểm căng thẳng với Giám khảo AI (**AI Judge**), và phiên công bố kết quả chung cuộc (**Reveal & Close**).

---

### 1. Quy tắc Phòng thi & Lịch trình Đấu trường (Rules of the Room — 150 phút, 7 Blocks)

Cuộc thi diễn ra trong đúng **150 phút** với đồng hồ đếm ngược trên bảng điện tử trung tâm tại [arena.cloudthinker.io](https://arena.cloudthinker.io/):

| Khối (#) | Nội dung hoạt động (Block) | Thời lượng | Mô tả chi tiết |
| :---: | :--- | :---: | :--- |
| **1** | **Leadership Intro** | 10 phút | Phát biểu khai mạc ngày thi chung kết từ đại diện AWS và Ban tổ chức. |
| **2** | **Briefing** | 10 phút | Phổ biến quy chế đấu trường, thể thức nộp bài, cơ chế chấm điểm và đồng hồ thời gian. |
| **3** | **Community Share** | 30 phút | 3 đội thi tiêu biểu từ 3 thành phố trình bày báo cáo mẫu xuất sắc từ Day 01 & Day 02 (10 phút/đội). |
| **4** | **Round 1 · Find the Gaps** | 25 phút | Rà soát môi trường Cloud chỉ đọc (Read-only review). **30 điểm**, bảng điểm hiển thị công khai trực tiếp. |
| **5** | **Break** | 10 phút | Khép lại Vòng 1, chốt điểm tạm thời, các đội nghỉ ngơi và chuẩn bị chiến thuật Vòng 2. |
| **6** | **Round 2 · Find the Cause** | 45 phút | Điều tra sự cố gián đoạn dịch vụ thực tế. **70 điểm**, bảng điểm bị khóa ẩn danh (Hidden Board). |
| **7** | **Reveal and Close** | 20 phút | Mở khóa toàn bộ bảng xếp hạng, giải mã nguyên nhân cốt lõi của 2 môi trường và trao giải thưởng. |

#### Các nguyên tắc bất di bất dịch của Đấu trường:
* **Chỉ đọc (Read-only)**: AI Agent chỉ được phép thanh tra (*inspect*) hạ tầng. Agent **tuyệt đối không thể** chỉnh sửa cấu hình, không thể can thiệp tài nguyên, và không thể đọc các dữ liệu mật (*secrets*).
* **Không nhập Credentials**: Kỹ sư tham gia đấu trường bằng mã định danh đội thi (*Team Code*); môi trường được cấp phát và vận hành tự động.
* **Đội đề xuất, con người quyết định**: Mọi giải pháp trong báo cáo chỉ là phương án đề xuất (*proposal*) và bắt buộc phải gắn liền với một cá nhân chịu trách nhiệm (*Named Owner*). Không có thao tác nào được tự động thực thi lên môi trường thi.
* **Cơ cấu đội thi**: Mỗi đội từ 1 đến 4 thành viên. Chỉ cần 1 máy tính xách tay; toàn đội cùng theo dõi chung một báo cáo và cùng quan sát bảng xếp hạng trực tiếp.
* **Bảo mật & Ẩn danh (Redact)**: Toàn bộ AWS Account ID, endpoint dịch vụ, IP nội bộ và bất kỳ thông tin nào có thể định danh hệ thống thật bắt buộc phải được che giấu (*redacted*) trước khi chia sẻ.

---

### 2. Cơ chế Chấm điểm & "Nền kinh tế Lượt nộp" (Scoring & The Attempt Economy)

Hội đồng Giám khảo chấm điểm của Đấu trường là một **Giám khảo AI (AI Agent Judge)** hoạt động hoàn toàn khách quan, tự động và nghiêm ngặt:

| Quy tắc chấm điểm | Cách thức vận hành kỹ thuật |
| :--- | :--- |
| **Một báo cáo cho mỗi vòng** | Soạn thảo định dạng Markdown (`.md`). Có thể tải file `.md` lên hoặc nhập trực tiếp trong trình soạn thảo của Arena. |
| **Lưu bản nháp miễn phí** | Lưu bao nhiêu phiên bản (*versions*) tùy ý. Mỗi bản lưu đều ghi lại chính xác timestamp và hash nội dung. |
| **Một bản chính thức (*Final*)** | Bấm **"Mark final & grade"** để gửi phiên bản đó tới Giám khảo AI. Điểm của bản final cuối cùng được đánh dấu sẽ là điểm chính thức của đội. |
| **Giới hạn 3 lượt chấm (*Three Graded Attempts*)** | Mỗi vòng thi chỉ có tối đa **3 lượt chấm có điểm**. Mỗi lần bấm "Mark final" sẽ tiêu tốn 1 lượt chấm. |
| **Thời gian làm nguội 3 phút (*Cooldown*)** | Giữa 2 lần nộp liên tiếp bắt buộc phải cách nhau tối thiểu 3 phút để ngăn chặn việc spam đoán mò kết quả. |
| **Bắt buộc đánh dấu Final** | Nếu hết giờ mà đội chưa bấm "Mark final" cho bất kỳ bản nào, hệ thống không chấm điểm và vòng thi đó nhận **0 điểm**. *(Chiến thuật: Cần chốt một bản final sớm)*. |
| **Phân định hòa điểm (*Tie-break*)** | Đội nào đánh dấu bản final sớm hơn trên đồng hồ sẽ giành thứ hạng cao hơn. |
| **Không có gợi ý (*No Hints*)** | Hệ thống không cung cấp cơ chế xin gợi ý. Không có khoản trừ điểm nào khác ngoài việc sử dụng lượt chấm. |

> [!IMPORTANT]
> **Cơ chế hoạt động của Giám khảo AI (AI Judge)**:
> * Giám khảo AI sẽ đọc bản báo cáo đúng như những gì đội viết: **thực hiện 3 lượt chấm độc lập (three runs) và lấy điểm trung vị (Median Score)** làm kết quả cuối cùng của lượt nộp đó.
> * Mỗi lượt nộp trả về tổng điểm và **một đoạn ghi chú định hướng ngắn**, giúp đội thi định vị được điểm yếu cần khắc phục cho lượt nộp tiếp theo.
> * Giám khảo **tuyệt đối không bao giờ tiết lộ đáp án, lỗ hổng hay nguyên nhân gốc**, và cũng không xem màn hình hay môi trường thi thay cho đội thi. Báo cáo phải được viết rõ ràng, đủ bằng chứng thuyết phục người đọc không thấy được màn hình của bạn.
> * **Trong Vòng 2, bảng điểm bị khóa kín**: Đội thi chỉ thấy thông báo đã nộp thành công, điểm số được niêm phong cho đến phiên Reveal cuối ngày.

---

### 3. Tiêu chuẩn Xây dựng Báo cáo Đạt Điểm Cao (What a Report Needs to Score)

Giám khảo AI đánh giá báo cáo dựa trên độ vững chắc của các bằng chứng. Với mỗi dòng kết luận trong báo cáo, đội thi phải trả lời được 3 câu hỏi cốt lõi:

| Câu hỏi kiểm chứng | Tiêu chí kỹ thuật | Nhãn xác thực chuẩn hóa |
| :--- | :--- | :---: |
| **Nguồn (*Source*)** | Lệnh gọi nào/API nào đã tạo ra kết quả này? | `[verified]` — Nếu có raw output chứng minh trực tiếp |
| **Phạm vi (*Scope*)** | Được kiểm tra trên môi trường và IAM role nào? | `[inferred]` — Nếu suy luận logic từ sự thật đã xác minh |
| **Thời điểm (*Time*)** | Kết luận này đúng vào thời điểm nào (giờ:phút)? | `[assumed]` — Nếu nhận định chưa đủ chứng cứ<br/>`[blocked]` — Nếu quyền hạn bị chặn không thể xem |

> [!TIP]
> **Chất lượng vượt trội số lượng**: Số lượng phát hiện không bị giới hạn, nhưng Giám khảo AI tưởng thưởng cho **chất lượng bằng chứng** thay vì khối lượng liệt kê. **Một phát hiện được chứng minh bằng chứng thực tế có giá trị cao hơn năm phát hiện phỏng đoán mò**, và một báo cáo dám thẳng thắn nêu rõ ranh giới quyền hạn bị chặn (`[blocked]`) sẽ nhận điểm đánh giá cao hơn báo cáo cố tình che giấu lỗ hổng.

---

### 4. Vòng 1: Tìm Kiếm Lỗ Hổng (Round 1 · Find the Gaps — 25 phút, 30 điểm)

* **Thách thức**: Đội thi đối mặt với một môi trường Cloud xa lạ, chưa từng biết trước. Trong 25 phút, phải xác định những điểm đáng khắc phục và chứng minh chúng bằng bằng chứng thực tế trên bảng điểm công khai.
* **Thang đo**: Đánh giá dựa trên **5 lăng kính AWS Well-Architected Framework**: Chi phí (*Cost*), Bảo mật (*Security*), Hiệu năng (*Performance*), Độ tin cậy (*Reliability*) và Vận hành xuất sắc (*Operations*).

#### Cấu trúc 3 khối bắt buộc của Báo cáo Vòng 1:
1. **Khối 01 · Phạm vi khảo sát (*What you looked at*)**: Khái quát môi trường, các tài nguyên đã tiếp cận, và những vùng phạm vi bị chặn quyền hạn (`[blocked]`).
2. **Khối 02 · Các phát hiện cần khắc phục (*What you would fix*)**: Từng phát hiện đi kèm bằng chứng raw output và nhãn xác thực. Sắp xếp phát hiện có tác động lớn nhất lên đầu; mỗi phát hiện gắn với tối đa 1 lăng kính Well-Architected.
3. **Khối 03 · Yêu cầu phê duyệt con người (*What needs a person*)**: Nêu rõ thay đổi nào bắt buộc phải có sự phê duyệt trước khi can thiệp, và những đề xuất nào mà đội chủ động gạt bỏ vì không đủ bằng chứng.

#### Kịch bản quản lý thời gian Vòng 1 (Timeline):
* `T+00`: Khảo sát toàn diện môi trường qua Agent trước khi bắt đầu viết.
* `T+05`: Thống nhất danh sách phát hiện ưu tiên (5 lăng kính là khung định hướng, không phải hạn ngạch bắt buộc).
* `T+10`: **Nộp bản đầu tiên và bấm Mark Final**. *(Ghi chú phản hồi của Giám khảo AI giá trị hơn 10 phút ngồi viết thêm)*.
* `T+18`: Hoàn thiện bản nộp thứ hai, nhắm thẳng vào những điểm mà lượt nộp đầu tiên còn thiếu sót.
* `T+23`: Dừng viết và chuẩn bị chốt nộp. Vòng thi đóng theo đồng hồ thời gian, không chờ lưu nháp.

---

### 5. Vòng 2: Truy Tìm Nguyên Nhân Gốc (Round 2 · Find the Cause — 45 phút, 70 điểm)

* **Thách thức**: Một sự cố nghiêm trọng đang ảnh hưởng trực tiếp tới khách hàng (*Customer affected*). Bảng xếp hạng bị khóa kín hoàn toàn.
* **Mục tiêu**: Xây dựng **Chuỗi nhân quả (*Causal Chain*)** xuyên suốt từ triệu chứng người dùng phản ánh (*Symptom*) đến đúng tài nguyên có cấu hình bị thay đổi (*Root Cause Resource*), đồng thời đưa ra phương án phản ứng kỹ thuật chuẩn xác.

#### Cấu trúc 5 khối bắt buộc của Báo cáo Vòng 2:
1. **Khối 01 · Câu hỏi sự cố & Phạm vi (*Question and scope*)**: Sự cố gì đang hỏng, ảnh hưởng tới ai, từ thời điểm nào, và những dữ liệu nào mà quyền hạn của Agent không tiếp cận được.
2. **Khối 02 · Giả thuyết & Loại trừ (*Hypotheses, one ruled out*)**: Nêu ít nhất **2 giả thuyết độc lập**, và chỉ rõ chỉ số/bằng chứng nào đã giúp loại trừ giả thuyết sai.
3. **Khối 03 · Bằng chứng thực nghiệm (*Evidence*)**: Nguồn gọi, phạm vi và mốc thời gian, bảo toàn nguyên vẹn log thô (*Raw logs*).
4. **Khối 04 · Cơ chế lan truyền sự cố (*The Mechanism*)**: Điều gì đã kích hoạt điều gì, và chỉ rõ mắt xích nào trong chuỗi mà đội chưa thể chứng minh trọn vẹn.
5. **Khối 05 · Nguyên nhân gốc & Phương án ứng phó (*Root cause and response*)**: Chỉ đích danh tài nguyên có cấu hình thực sự bị thay đổi (tách biệt rõ với các điều kiện môi trường có sẵn), kèm phương án khuyến nghị có tên người phê duyệt và tiêu chí kiểm chứng sau sửa đổi.

#### Kịch bản quản lý thời gian Vòng 2 (Timeline):
* `T+00`: Đọc kỹ mô tả triệu chứng theo đúng ngôn từ của khách hàng trước khi mở bất kỳ dashboard nào.
* `T+05`: Viết rõ câu hỏi sự cố: *Cái gì hỏng? Ai bị ảnh hưởng? Bắt đầu từ khi nào?*
* `T+12`: Thiết lập ít nhất 2 giả thuyết đối trọng và xác định điểm dữ liệu để bác bỏ 1 trong 2.
* `T+25`: **Nộp bản đầu tiên và bấm Mark Final** để ghi nhận điểm an toàn.
* `T+40`: Nộp bản nâng cấp thứ hai, tập trung củng cố khối nội dung yếu nhất trong chuỗi nhân quả.

---

### 6. Bảng Thuật Ngữ Đấu Trường Day 03 (Glossary)

| Thuật ngữ | Ý nghĩa kỹ thuật trong Đấu trường Day 03 |
| :--- | :--- |
| **Board (Bảng điểm)** | Bảng tổng sắp điểm và thứ hạng của tất cả các đội. Mở công khai ở Vòng 1, khóa ẩn danh ở Vòng 2. |
| **Version (Bản lưu)** | Một phiên bản báo cáo được lưu lại trong hệ thống. Việc lưu bản nháp là hoàn toàn miễn phí. |
| **Final (Bản chính thức)** | Phiên bản duy nhất trong mỗi vòng được gửi tới Giám khảo AI để chấm điểm khi bấm "Mark final & grade". |
| **Graded attempt (Lượt chấm)** | Ba lượt chạy chấm điểm độc lập của Giám khảo AI trên một bản final. Mỗi đội có tối đa 3 lượt/vòng. |
| **Median score (Điểm trung vị)** | Điểm số ở giữa trong 3 lượt chạy của Giám khảo AI; là điểm số chính thức của lượt nộp đó. |
| **Lens (Lăng kính)** | Một trong 5 góc nhìn đánh giá Well-Architected ở Vòng 1: Chi phí, Bảo mật, Hiệu năng, Độ tin cậy, Vận hành. |
| **Causal chain (Chuỗi nhân quả)** | Đường dẫn logic nối từ triệu chứng người dùng phản ánh quay ngược về tài nguyên bị thay đổi cấu hình. |
| **Trigger, Root Cause, Contributing Factor** | *Trigger*: Sự kiện kích hoạt sự cố; *Root Cause*: Cấu hình tài nguyên cốt lõi bị sai lệch; *Contributing Factor*: Điều kiện nền hỗ trợ sự cố xảy ra. |
| **Blocked (Bị chặn)** | Trạng thái Agent không có quyền truy cập dữ liệu. Đây là một kết quả hợp lệ và cần được ghi nhận vào báo cáo. |

---

### 7. Ý Nghĩa & Bước Tiếp Theo Sau Chuỗi Hoạt Động (What Comes Next)

Hoàn thành trọn vẹn cả 3 ngày của chuỗi **Prove It: Agentic Cloud Investigation Series** mang lại những giá trị lớn:
* **3 Portfolio Artifacts thực chiến**: Bộ 3 báo cáo chuyên môn (Quản trị Agent, Điều tra sự cố Kubernetes, và Báo cáo đấu trường Arena) minh chứng cho năng lực vận hành Cloud và AI theo tiêu chuẩn doanh nghiệp.
* **Chứng nhận Năng lực Kỹ năng (Series Skill Certificates)**: Chứng chỉ chính thức xác nhận năng lực điều tra và giám sát đám mây có sự hỗ trợ của AI.
* **Cơ hội CloudThinker Ambassador**: Các đội thi và cá nhân xuất sắc có cơ hội được lựa chọn tham gia chương trình **CloudThinker Ambassador Program** kéo dài 3 tháng, đồng hành cùng các chuyên gia quốc tế phát triển công nghệ Agentic Cloud.
