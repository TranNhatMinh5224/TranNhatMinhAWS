---
title: "Day 2 - Investigate"
date: 2026-09-12
weight: 3
chapter: false
pre: " <b> 5.3. </b> "
aliases:
  - /5-competitions/5.3-day2/
  - /6-competitions/6.3-day2/
  - /5-Competitions/5.3-Day2/
  - /6-Competitions/6.3-Day2/
---

# 5.3. Day 2: Investigate (Agentic Cloud Investigation)

Nội dung đào tạo và thực chiến của ngày thứ hai (Day 2) được xây dựng theo chuẩn chuyên môn từ chương trình [Prove It: Agentic Cloud Investigation Series — Day 02 · Investigate](https://docs.cloudthinker.io/learn/workshops/prove-it/day-02-investigate) do CloudThinker phối hợp cùng FCAJ và AWS Vietnam tổ chức.

---

### 1. Bối cảnh & Mục tiêu Chuyên môn Day 02

* **Bước chuyển biến tư duy**: 
  * Nếu như **Day 01** đặt ra câu hỏi về ranh giới tài nguyên: *"Cái gì đang tồn tại trong tài khoản đám mây?"* (Inventory & Boundaries), thì **Day 02** đặt ra câu hỏi hóc búa và áp lực hơn nhiều trong vận hành thực tế: **"Điều gì đã gây ra sự cố này, ngay lúc này?"** (*What caused this, right now?*).
  * Điều tra trong môi trường Production không bắt đầu bằng một sự cố sạch sẽ, mà bắt đầu bằng một dòng thác cảnh báo hỗn loạn (*alert noise*). Khả năng lọc nhiễu và định tuyến tín hiệu quyết định sự thành bại và chi phí của hệ thống điều tra tự động.
* **Nguyên tắc cốt lõi về quyền hạn (Zero-Change & Read-Only Policy)**:
  * Tiếp tục tuân thủ tuyệt đối nguyên tắc không cấp quyền ghi: Agent điều tra hoạt động ở chế độ **Read-only** trên cụm Kubernetes Demo Cluster.
  * Agent chỉ kiểm tra (*inspect*) logs, pods, deployments, configurations, events và network telemetry; **tuyệt đối không thể** khởi động lại (restart), co giãn (scale), triển khai (deploy), chỉnh sửa tài nguyên hoặc đọc các dữ liệu mật (*secrets*).
  * Kỹ sư không bao giờ phải nhập credentials. Chỉ chọn môi trường demo và bấm *Use demo*.
  * **Agent khuyến nghị, con người quyết định** (*The agent recommends, people decide*): Không có bản vá (fix) nào được tự ý áp dụng trong ngày thi; mọi hành động can thiệp đều đòi hỏi sự phê duyệt của kỹ sư phụ trách.
* **Quy định bảo mật & Ẩn danh (Redaction)**:
  * Mọi thông tin định danh hệ thống thật (Domain nội bộ, Private IP, Cluster ID, ARN, API tokens) bắt buộc phải được che giấu (*Redacted*) trước khi đưa vào báo cáo và trình chiếu.

---

### 2. Quy tắc Phòng thi & Lịch trình (Rules of the Room - 150 phút)

| Khung thời gian | Phân bổ hoạt động | Nội dung và Yêu cầu chuẩn mực |
| :--- | :--- | :--- |
| **00:00 – 00:35** (35 phút) | **Learn Block** | Tiếp thu 8 nguyên tắc giảm nhiễu tín hiệu và phương pháp luận suy luận nguyên nhân sự cố trong môi trường Production. |
| **00:35 – 01:00** (25 phút) | **Keynote** | Bài chia sẻ chuyên sâu: *"The Integration Problem Was a Context Problem"* — Kiến trúc kết nối 100+ nền tảng Cloud & Observability thông qua Code thay vì nhồi Tool Schemas. |
| **01:00 – 01:30** (30 phút) | **Practice Block** | Thực chiến 30 phút liên tục không nghỉ: 1 đội thi, 1 Agent Read-only, giải quyết sự cố Kubernetes Production thực tế. |
| **01:30 – 01:50** (20 phút) | **Share Block** | Thuyết minh 3 phút về cơ chế nguyên nhân + bằng chứng, 2 phút vấn đáp phản biện; đối chiếu kết quả giữa các đội thi. |

> [!NOTE]
> **Tóm lược Keynote (25 phút)**: *"The Integration Problem Was a Context Problem"*.
> Tại sao việc viết mã thực thi cho Agent gọi trực tiếp lại vượt trội hơn hẳn việc nhồi nhét hàng tá JSON Schema công cụ vào context window của LLM. Đây là phương pháp giúp CloudThinker nhanh chóng xây dựng hơn 100 kết nối bảo mật tới các nền tảng AWS, Kubernetes, Datadog và Prometheus mà không gây tràn ngữ cảnh hay suy giảm khả năng suy luận của mô hình.

---

### 3. Tám Bài học Quản trị Tín hiệu & Điều tra Sự cố (The Eight Learnings)

#### 3.1. Không thể điều tra những gì không thể xếp hạng (You cannot investigate what you cannot rank)
Trong một ca trực đêm Production, hệ thống không đưa ra một sự cố đơn lẻ mà xả ra một **dòng thác cảnh báo (Alert Stream)**: 
* Một cảnh báo phân quyền kích hoạt trên một production role lúc 02:14.
* Kéo theo 180 dòng `AccessDenied` trong audit log ngay trong cùng phút đó.
* Ba dịch vụ phụ thuộc đồng loạt gửi alert gần như giống hệt nhau.
* Đến 02:16, kỹ sư trực ca phải mở 5 tab màn hình cho cùng một vấn đề duy nhất.

Trong một workspace điển hình, dòng thác khoảng **13,000 sự kiện thô** qua đêm phải được cô đọng lại thành khoảng **40 cụm (clusters)** thực sự đáng can thiệp. Việc điều tra không phải là phần khó nhất lúc 2 giờ sáng; việc **chọn ra cái gì để điều tra** mới là thử thách sống còn.

Bốn giải pháp truyền thống mà các đội ngũ thường dùng và cái giá đắt đỏ phải trả:

| Giải pháp truyền thống | Cái giá thực tế phải trả |
| :--- | :--- |
| **Thuê thêm người trực on-call** | Kiệt sức (*burnout*), và sang quý sau khối lượng cảnh báo lại phình to như cũ. |
| **Nâng cao ngưỡng kích hoạt (Raise thresholds)** | Cảnh báo critical thực sự quan trọng bị lọt xuống dưới ngưỡng và bị bỏ lỡ hoàn toàn. |
| **Tắt tiếng kênh ồn ào (Mute noisy channel)** | Tạo ra "điểm mù" nguy hiểm mà không ai chịu trách nhiệm và không ai nhớ mình đã tạo ra nó. |
| **Dựng thêm Dashboard mới** | Thêm một màn hình giám sát mà chẳng ai kịp đọc lúc 02:14 sáng. |

Mỗi giải pháp trên đều là một quyết định chấp nhận đánh mất thông tin, thường được đưa ra một cách cảm tính và không được văn bản hóa. Đó chính là lỗ hổng quản trị tín hiệu mà Day 02 giải quyết triệt để.

---

#### 3.2. Giảm nhiễu theo tầng, không phải qua một bộ lọc đơn lẻ (Noise dies in layers)
Quy trình giảm nhiễu là một đường ống (*pipeline*) gồm 4 giai đoạn liên hoàn: **Ingest $\rightarrow$ Suppress $\rightarrow$ Correlate $\rightarrow$ Classify & Route**. 

Trọng tâm nằm ở bước thứ hai (**Suppress**), và nó không phải một bộ lọc đơn lẻ mà bao gồm **8 tầng lọc vận hành theo thứ tự ưu tiên nghiêm ngặt (Priority Order)**. Tầng nào khớp trước sẽ áp dụng ngay:

| Thứ tự | Tầng lọc (Layer) | Chức năng loại bỏ / Xử lý nhiễu |
| :---: | :--- | :--- |
| 1 | **Deduplication** | Khử trùng lặp chính xác các sự kiện phát sinh giống hệt nhau. |
| 2 | **Rate limit** | Giới hạn tần suất bùng nổ vượt quá trần cho phép theo từng khóa định danh. |
| 3 | **Snooze** | Bỏ qua các tín hiệu mà kỹ sư đã chủ động tạm dừng có chủ đích. |
| 4 | **Prior verdict** | Nhận diện các mẫu cảnh báo đã từng được con người kết luận là nhiễu trong quá khứ (*tầng tự học*). |
| 5 | **Noise signature** | Loại bỏ các mẫu cảnh báo tĩnh đã biết chắc chắn là vô hại. |
| 6 | **Flapping** | Khử cảnh báo dao động liên tục qua lại quanh ngưỡng kích hoạt trong thời gian ngắn. |
| 7 | **Cascade** | Bỏ qua các tác động dây chuyền ở tầng dịch vụ hạ lưu xuất phát từ một tín hiệu gốc đã biết. |
| 8 | **Severity normalization** | **Không loại bỏ sự kiện**; thực hiện đánh giá và chuẩn hóa lại mức độ nghiêm trọng mà nhà cung cấp/công cụ giám sát gán sai. |

> [!NOTE]
> * **Cascade** loại bỏ lượng cảnh báo nhiều nhất, nhưng cũng là tầng nguy hiểm nhất có thể che giấu sự cố nếu tín hiệu gốc bị gán sai.
> * **Severity normalization** thừa nhận một sự thật: mức độ nghiêm trọng do công cụ giám sát ban đầu gán chỉ là phỏng đoán, và bạn hoàn toàn có quyền phân loại lại.
> * **Prior verdict** là tầng tự học: một Agent chạy ngầm định kỳ phân tích các sự cố đã được con người đóng, phát hiện các mẫu lặp lại cùng kết luận để nạp vào danh mục tri thức, giúp đường ống ngày càng yên tĩnh hơn theo thời gian sử dụng.

---

#### 3.3. Mọi quy tắc giảm nhiễu đều cần một cửa thoát hiểm (Escape Hatch)
Sự im lặng bắt buộc phải có hạn hết hiệu lực và phải có khả năng bị ghi đè, nếu không nó sẽ trở thành một điểm mù vĩnh viễn:

| Cơ chế thoát hiểm | Quy tắc ứng xử của hệ thống |
| :--- | :--- |
| **Cửa sổ im lặng mở rộng dần (Growing Window)** | Một mẫu xác nhận là nhiễu lần đầu sẽ im lặng trong 6 giờ. Xác nhận lại: 24 giờ. Lặp lại: 7 ngày. |
| **Cơ chế vượt quyền ưu tiên (Bypass)** | Một tín hiệu mức độ High hoặc Critical mới xuất hiện khớp với mẫu này sẽ **ngay lập tức vượt qua tầng chặn** và reset cửa sổ về 0. |
| **Giải phóng chủ động (Release)** | Một kỹ sư chủ động unmute, hoặc một luồng cảnh báo định tuyến vào sự cố thật sẽ hủy bỏ cửa sổ im lặng ngay lập tức. |

> [!IMPORTANT]
> **Bảo toàn dữ liệu**: Sự kiện bị chặn (*suppressed*) được lưu trữ đầy đủ vào kho dữ liệu chứ không bị xóa bỏ. Kỹ sư luôn có thể truy vấn lại để kiểm tra: *"Hệ thống đã ẩn đi những gì trong đêm qua?"*.

---

#### 3.4. Giảm nhiễu là điều kiện tiên quyết để Agent khả thi về kinh tế
Nếu không có bộ giảm nhiễu, chi phí vận hành Agent điều tra sẽ phát nổ:
* Một cảnh báo CloudWatch bị dao động (*Flapping*) 18 lần trong 53 phút. 
* Nếu mỗi lần kích hoạt đều tự động mở một phiên điều tra RCA (Root Cause Analysis), hệ thống sẽ chạy 11 cuộc điều tra độc lập cho cùng 1 vấn đề, đưa ra 11 câu trả lời giống nhau, và nhận về **11 hóa đơn API LLM**.

Để đảm bảo hiệu quả kinh tế, **3 cổng kiểm soát (Gates)** bắt buộc phải thỏa mãn trước khi kích hoạt Agent:
1. **Có ít nhất một tín hiệu khả thi hành động (*At least one actionable signal*)**: Cụm cảnh báo chỉ gồm toàn các tín hiệu đã bị triệt tiêu (*suppressed*) sẽ không bao giờ được chi tiền kích hoạt Agent.
2. **Chữ ký mới, không lặp lại (*A new signature, not a repeat*)**: Khối lượng cảnh báo gia tăng đơn thuần không làm kích hoạt lại Agent; chỉ có yếu tố kỹ thuật mới (*novelty*) mới mở điều tra.
3. **Thời gian hồi chiêu (*No recent run on the same cluster - Cooldown*)**: Khoảng nghỉ tối thiểu giữa hai lần điều tra trên cùng một cụm tài nguyên, được cấu hình theo từng workspace.

---

#### 3.5. Agent phân nhánh câu hỏi, không phân nhánh khối lượng công việc
Quy trình điều tra của Agent tuân theo 4 giai đoạn: **Thu thập ngữ cảnh $\rightarrow$ Điểm kiểm tra quyết định phân nhánh $\rightarrow$ Kiểm chứng giả thuyết song song $\rightarrow$ Ghi nhận một phán quyết duy nhất**.

* **Phân nhánh theo giả thuyết (*Fan-out by hypothesis*)**: Hệ thống khởi tạo từ 2 đến 4 (tối đa 8) sub-investigators chạy song song ở chế độ Read-only. Mỗi sub-investigator kiểm chứng một giả thuyết độc lập trên cùng một tập bằng chứng.
* **Quyền ghi duy nhất**: Các sub-investigators không ghi nhận kết luận riêng lẻ; chỉ có **Lead Agent** tổng hợp và viết một phán quyết duy nhất để người đọc dễ theo dõi.
* **Câu truy vấn phân định (*The Distinguishing Query*)**: Trọng tâm của kỹ năng điều tra là tìm ra **câu truy vấn mà kết quả trả về sẽ khác nhau tùy thuộc vào giả thuyết nào là đúng**. Đó là câu truy vấn loại trừ (*rule out*) giả thuyết sai. Mọi câu truy vấn khác chỉ mang tính củng cố thiên kiến đã có.

---

#### 3.6. Thứ tự thời gian không phải là bằng chứng nguyên nhân (Order in time is not proof of cause)
Ba cạm bẫy tư duy thường gặp khi phân tích dòng thời gian sự cố:

| Cạm bẫy tư duy | Biểu hiện thực tế |
| :--- | :--- |
| **Xảy ra sau không có nghĩa là do (After is not because)** | Triển khai mã lúc 10:02, độ trễ tăng lúc 10:05; nếu không thể vẽ ra đường liên kết nhân quả logic giữa chúng thì đó chỉ là sự trùng hợp ngẫu nhiên. |
| **Cả hai đều chỉ là triệu chứng (Both are symptoms)** | Hai chỉ số cùng tăng vọt do một biến động ở tầng trên; chúng không gây ra nhau mà chia sẻ chung một nguyên nhân gốc. |
| **Yếu tố kích hoạt đã biến mất (The trigger is gone)** | Cơn bùng nổ ban đầu đã kết thúc từ lâu nhưng hệ thống vẫn không thể phục hồi do hiệu ứng quá tải tự duy trì. |

> [!TIP]
> **Nghiên cứu ca điển hình: Cơn bão Retry (Retry Storm)**:
> * `10:00`: Cơ sở dữ liệu chuyển đổi dự phòng (*failover*) sang node dự phòng trong 30 giây (hoàn thành bình thường theo thiết kế).
> * `10:01`: Toàn bộ kết nối đồng loạt bị ngắt, hàng ngàn client cùng thất bại và đồng thời retry cùng một thời điểm.
> * `10:06`: Quá trình failover đã xong, lưu lượng truy cập từ người dùng bên ngoài đã trở lại bình thường.
> * `10:30`: Hệ thống vẫn nghẽn nghiêm trọng vì các chu kỳ timeout lại sinh ra đợt retry mới. Tự thân các client retry đang là nguồn tải chính.
> 
> **Phân định rạch ròi bản chất**:
> * **Trigger (Kích hoạt)**: Sự kiện Failover lúc 10:00 — đã kết thúc, không còn gì để rollback.
> * **Root Cause (Nguyên nhân gốc)**: Chính sách retry của client không có giới hạn trần và thiếu backoff/jitter — đây là cấu hình sai duy nhất và vẫn đang sai ở thời điểm hiện tại.
> * **Contributing Factor (Yếu tố đóng góp)**: Hệ thống thiếu Circuit Breaker — nếu có thì đã ngăn chặn được sự cố, nhưng cấu hình này vốn đã thiếu từ trước chứ không phải thay đổi sáng nay.

---

#### 3.7. Nguyên nhân gốc là tài nguyên có cấu hình bị thay đổi (The root cause is the resource that changed)
Một đồ thị nguyên nhân chuẩn tắc (*Causal Graph*) bao gồm 5 loại nút:

| Loại nút (Node) | Định nghĩa & Ý nghĩa trong phân tích sự cố |
| :--- | :--- |
| **Trigger** | Sự kiện khởi phát sự cố (có thể đã kết thúc và không còn dấu vết). |
| **Root cause** | **Tài nguyên duy nhất có cấu hình bị sai lệch** so với baseline ban đầu, so với phiên bản trước đó hoặc so với các node tương đồng. |
| **Contributing factor** | Một điều kiện nền tảng tồn tại sẵn mà bạn **không thể chứng minh được mốc thời gian thay đổi** của nó. |
| **Impact** | Thiệt hại mà khách hàng gánh chịu, được mô tả bằng chính ngôn ngữ của người dùng. |
| **Recovery** | Hành động hoặc cơ chế đã đưa hệ thống trở lại trạng thái hoạt động bình thường. |

> [!CAUTION]
> Sự sai lệch cấu hình là một khẳng định về mặt thời gian, do đó nó phải được chứng minh bằng cách **xác định niên đại (dating each candidate)**: timestamp khởi tạo, lịch sử revision, cấu hình `last-applied`. Tuyệt đối không xác định nguyên nhân gốc dựa trên tài nguyên đang hiển thị triệu chứng bất thường nhất (vì đó thường chỉ là **nạn nhân**).

---

#### 3.8. Một hệ thống tự chấm điểm không chứng minh được điều gì
Giá trị của một hệ thống điều tra tự trị được đo lường bằng danh sách những điều mà nó **từ chối khẳng định** khi chưa đủ chứng cứ:

| Tuyên bố của hệ thống | Bằng chứng bắt buộc phải có để hậu thuẫn |
| :--- | :--- |
| *"Độ chính xác 92%"* | Phán quyết độc lập do chuyên gia con người đánh giá. Tuyệt đối không chấp nhận Agent tự chấm điểm cho phiên chạy của nó. |
| *"A gây ra B"* | Một đường dẫn logic truy vết liên tục từ thay đổi cấu hình đến tác động của khách hàng. |
| *"Bản vá đã giữ vững"* | Một kết quả tái kiểm tra (*re-check*) thực tế được lập lịch tự động sau 30 phút. |
| *"Tôi tự tin với kết luận"* | Một giả thuyết đối nghịch đã được kiểm chứng song song và bị loại trừ bằng chứng cứ xác thực. |

---

### 4. Thử thách Thực hành của Đội thi (Practice Block - 30 phút)

#### 4.1. Đề bài sự cố thực tế
* **Tên sự cố**: **Hotel Search Degradation After Traffic Recovery** *(Suy giảm hiệu năng tìm kiếm khách sạn sau khi lưu lượng truy cập đã phục hồi)*.
* **Môi trường thử nghiệm**: Cụm Kubernetes Demo Cluster vận hành trên nền tảng CloudThinker.
* **Ranh giới quyền hạn thực tế**:
  * **Được phép**: Đọc deployments, pods, events, logs, configurations và network traffic telemetry.
  * **Bị chặn (`[blocked]`)**: Không thể restart, scale, deploy, edit bất kỳ tài nguyên nào hoặc đọc secrets.

#### 4.2. Quy trình kết nối môi trường Demo (3 bước)
1. Đăng nhập tại [app.cloudthinker.io](https://app.cloudthinker.io/), chọn **Try a demo environment** ("a read-only cloud we run").
2. Mở bảng **Connections** và chọn **Kubernetes**.
3. Bấm **Use demo** trên banner trên cùng (không cần điền bất kỳ form credentials nào).

#### 4.3. Tiến trình xử lý sự cố trong 30 phút
* **T+00**: Kết nối cụm và đọc triệu chứng người dùng (bỏ qua dashboard xanh).
* **T+05**: Định hình **Câu hỏi sự cố (*Incident Question*)**: Cái gì đang hỏng, ảnh hưởng đến ai, từ thời điểm nào.
* **T+10**: Thiết lập tối thiểu **2 giả thuyết độc lập** trong nhật ký điều tra.
* **T+18**: Tìm và thực thi **Câu truy vấn phân định (*Distinguishing Query*)** để loại trừ dứt khoát 1 giả thuyết.
* **T+25**: Viết và nộp Báo cáo sự cố 5 phần hoàn chỉnh trước khi bước sang phần Share.

#### 4.4. Bộ câu lệnh truy vấn mẫu cho Agent (What to ask the agent)
Để tránh bẫy đồng thuận và đào sâu bản chất sự cố, các đội thi sử dụng 4 mẫu câu lệnh truy vấn chiến lược:
1. *"Something is degraded in this cluster. Describe the symptom in terms of what a user would notice, and tell me what your role could not read."*
2. *"Give me at least two different explanations for this symptom that are both consistent with the evidence so far."*
3. *"Which single query would come out differently depending on which of those explanations is true? Run it and show me the raw output."*
4. *"Which resource here can you show actually changed, with a timestamp? Which ones are you only assuming changed?"*

#### 4.5. Xử lý khi bế tắc trong điều tra (Troubleshooting / Stuck?)
* **Dashboard báo hệ thống khỏe mạnh**: Hỏi Agent về những gì người dùng đang thấy thay vì những gì dashboard hiển thị. Dashboard xanh giả tạo là một phần của bài thực hành.
* **Agent đưa ra một nguyên nhân duy nhất quá tự tin**: Yêu cầu Agent tìm ngay một giả thuyết đối nghịch, sau đó tìm câu truy vấn phân định giữa hai giả thuyết.
* **Agent báo không thể đọc một tài nguyên**: Ghi nhận ngay trạng thái này là `[blocked]`. Một kiểm tra bị chặn là một kết quả hợp lệ trong báo cáo.
* **Hết thời gian quy định**: Nộp báo cáo với khoảng trống chưa chứng minh được nêu tên rõ ràng. Đó vẫn là một báo cáo hoàn chỉnh.

---

### 5. Báo Cáo Điều Tra Sự Cố Trực Tiếp (Live Incident Report)

Dưới đây là toàn văn bản Báo cáo Điều tra Sự cố Vận hành Production được nhóm sinh viên hoàn thiện theo chuẩn **Read-Only Live Incident Report** trong thử thách 30 phút thực chiến:

```
TÊN SỰ CỐ: Hotel Search Degradation After Traffic Recovery
LOẠI BÁO CÁO: Read-only live incident report tracing customer-visible search failure 
              to retry-amplified saturation of the rate-service capacity boundary.
```

---

#### 5.1. Tóm Tắt Điều Hành (Executive Summary)

* **Phán quyết hiện trạng (Verdict)**: Sự cố đang tiếp diễn (*The incident is ongoing*).
* **Nguyên nhân gốc đã xác minh (Verified Root Cause)**: Dịch vụ `search` tự động gửi lại (retry) mỗi yêu cầu thất bại tới dịch vụ `rate` (vốn bị giới hạn cứng ở mức tối đa **20 backend QPS**). Tại thời điểm ghi nhận, lưu lượng tìm kiếm thực tế là **7.60 RPS** với hệ số retry trung bình **2.87 lần/request**, đẩy tổng nhu cầu truy vấn xuống backend chạm mốc **21.81 attempts/giây** (vượt **9.1%** trần năng lực cho phép). Hàng đợi 256 vị trí của `rate` đạt tỷ lệ lấp đầy trung bình **88.5%** và nhiều thời điểm chạm ngưỡng **100% (256/256)**, làm bùng phát liên hoàn lỗi `ResourceExhausted` và sau đó là `DeadlineExceeded`. 
* **Hậu quả người dùng**: Khách hàng hoàn toàn **không nhận được bất kỳ kết quả tìm kiếm khách sạn nào (Tỷ lệ thành công = 0.000)** dù Kubernetes vẫn báo cáo 100% Pods và Nodes ở trạng thái hoàn toàn khỏe mạnh (*Healthy*).
* **Phạm vi kiểm tra (Scope)**: Cụm `hotel-prod-apse1`, namespaces `hotel-reservation` và `synthetics`, đường dẫn người dùng `GET /hotels`, thu thập bằng chứng 100% Read-only (không sửa đổi cấu hình hay tải hệ thống).

| Chỉ số Đo lường Trọng yếu | Giá trị Thực tế Ghi nhận | Cửa sổ / Phạm vi Quan sát | Ý nghĩa Vận hành |
| :--- | :---: | :--- | :--- |
| **Customer search success** | **0.000 (0.0%)** | Trung bình 30 phút (Synthetic user journey) | Khách hàng mất hoàn toàn khả năng tìm kiếm |
| **Search p95 latency** | **6.05 giây (6,050.8 ms)** | Dao động 5.41s – 6.33s trên customer path | Độ trễ tăng vọt gấp nhiều lần ngưỡng cho phép |
| **Rate queue utilization** | **88.5% (226.6 / 256 entries)** | Trung bình 226.6; đạt đỉnh chạm trần 256 | Hàng đợi bão hòa triệt để gây timeout hàng loạt |

> [!IMPORTANT]
> **Bài học cốt lõi (Bottom Line)**: Hãy luôn coi **kết quả trải nghiệm thực tế của khách hàng (Customer Outcome)** là thước đo tin cậy duy nhất. Trạng thái sẵn sàng của Kubernetes Pods (*Readiness*) và lưu lượng RPS hoàn thành (*Completed RPS*) là **tín hiệu xanh giả tạo (False-Green Signals)** đối với mô hình lỗi nghẽn tầng sâu này.

---

#### 5.2. Khách Hàng Bị Mất Toàn Bộ Kết Quả Tìm Kiếm (Customer Impact)

Trong cửa sổ quan sát chuẩn 30 phút (`2026-09-12 02:49:49` đến `03:19:34 UTC`), tiến trình người dùng giả lập (*Synthetic User Journey*) liên tục gửi truy vấn tìm kiếm tới URL khách sạn với tốc độ cấu hình 8 RPS. Tiến trình hoàn thành trung bình **7.35 RPS** (đạt 91.9% lưu lượng dự kiến), nhưng **tỷ lệ thành công thực tế giữ nguyên ở mức 0.000**:

| Chỉ số Khách hàng (Metric) | Giá trị Quan sát (Observed) | Cửa sổ / Phạm vi Đo lường | Trạng thái Chứng cứ |
| :--- | :---: | :--- | :---: |
| **Configured traffic** | `8.00 RPS` | 2026-09-12 02:49:49 – 03:19:34 UTC | `[Verified]` |
| **Completed traffic** | `7.35 RPS` (trung bình) | 103 mẫu dữ liệu đo lường | `[Verified]` |
| **Successful outcomes** | **`0.000`** (0% thành công) | 103 mẫu traffic & 176 mẫu observer | `[Verified]` |
| **p95 Latency** | `6,050.8 ms` (trung bình) | Biên độ dao động 5,414.9 ms – 6,332.4 ms | `[Verified]` |
| **Search throughput** | `7.60 RPS` (trung bình) | 2026-09-12 02:49:57 – 03:19:43 UTC | `[Verified]` |

Bản ghi traffic sớm nhất được lưu giữ sau sự kiện phục hồi là lúc `2026-09-11 14:55:02 UTC`. Toàn bộ **2,559 mẫu kiểm thử** xuyên suốt đến `2026-09-12 03:19:34 UTC` đều báo cáo **0% thành công**, xác nhận sự cố gián đoạn dịch vụ liên tục kéo dài ít nhất **12 giờ 24 phút 32 giây**.

---

#### 5.3. Cơ Chế Bão Hòa Năng Lực Do Khuếch Đại Retry (Retry Amplification Mechanism)

* **Gốc rễ sự cố (Fault Origin)**: Xung đột trong hợp đồng dung lượng (*Capacity Contract*) giữa dịch vụ gọi (`search`) và dịch vụ đích (`rate`):
  * Phía caller (`search`): Cấu hình `RATE_RPC_MAX_ATTEMPTS=3`.
  * Phía callee (`rate`): Giới hạn cứng `RATE_BACKEND_QPS_LIMIT=20` và hàng đợi `RATE_QUEUE_CAPACITY=256`.

| Giai đoạn trong Chuỗi Nhân quả | Giá trị Ghi nhận Thực tế | Bản chất Cơ chế Kỹ thuật | Trạng thái |
| :--- | :---: | :--- | :---: |
| **1. Phục hồi lưu lượng (Traffic recovery)** | `8 configured RPS` | Khôi phục từ 2026-09-11 14:55:02 UTC | `[Verified]` |
| **2. Khuếch đại Retry (Amplification)** | `2.87 attempts / request` | Mỗi yêu cầu lỗi kích hoạt gần 3 lượt gọi lại | `[Verified]` |
| **3. Tải thực tế dồn xuống backend** | **`21.81 attempts/giây`** | `7.60 RPS × 2.87 = 21.81` (vượt 9.1% ngưỡng) | `[Derived]` |
| **4. Ranh giới giới hạn cấu hình** | `20 QPS; Queue 256` | Ngưỡng chịu tải tối đa của dịch vụ `rate` | `[Verified]` |
| **5. Áp lực hàng đợi (Queue pressure)** | `226.6 TB; Max 256` | Hàng đợi nghẽn 100%, không còn chỗ đệm | `[Verified]` |
| **6. Lỗi phụ thuộc liên hoàn** | `ResourceExhausted, DeadlineExceeded, Canceled` | Phát sinh mã lỗi gRPC từ `search` sang `rate` | `[Verified]` |
| **7. Triệu chứng khách hàng (Symptom)** | **`0.000 Success; 6.05s p95`** | Toàn bộ phiên tìm kiếm bị treo hoặc lỗi | `[Verified]` |

* **Hệ quả dây chuyền**: Việc hàng đợi đầy nghẽn biến các lỗi từ chối ban đầu thành sự chờ đợi kéo dài và cạn kiệt deadline. Cơ chế retry lúc này **không hấp thụ được tải mà phản tác dụng, biến thành cơn bão Retry (Retry Storm)** bóp nghẹt dịch vụ.
* **Số liệu lỗi thực tế**: Chỉ trong một lát cắt log tìm kiếm 30 phút, dịch vụ ghi nhận **10,850 lỗi `DeadlineExceeded`**, **1,476 lỗi `Canceled`**, và **1,055 lỗi `ResourceExhausted`**. Trong cửa sổ quan sát độc lập, chỉ số timeout tích lũy tăng thêm 34,529 và failure tăng 13,334 lượt.

---

#### 5.4. Bác Bỏ Các Giả Thuyết Đối Nghịch (Competing Hypotheses & Evidence Disposition)

Nhằm đảm bảo tính chính xác khoa học, Agent điều tra đã đồng thời kiểm chứng và loại trừ 4 giả thuyết đối nghịch:

| Giả thuyết Điều tra (Hypothesis) | Bằng chứng Thu thập Thực tế (Evidence) | Phán quyết (Disposition) |
| :--- | :--- | :---: |
| **1. Bão hòa tài nguyên Node (Node saturation)** | Cả 4/4 nodes đều `Ready`; không có node pressure; CPU node đạt **0%**; RAM node cao nhất chỉ **6%**. | **`REJECTED` (Bác bỏ)** |
| **2. Thiếu Endpoints dịch vụ backend** | Cả 3 dịch vụ `frontend`, `search`, và `rate` đều có sẵn 1 endpoint sẵn sàng hoạt động (1/1 ready). | **`REJECTED` (Bác bỏ)** |
| **3. Pods bị Crash Loop hoặc OOMKilled** | Không có Pod nào ở trạng thái `Pending` hoặc `Failed`; toàn bộ deployments đều `Ready`. | **`REJECTED` (Bác bỏ)** |
| **4. Mất kết nối mạng giữa Search và Rate** | `search` vẫn nhận được các mã phản hồi tầng ứng dụng gRPC (`ResourceExhausted`, `DeadlineExceeded`) từ `rate`. | **`REJECTED` (Bác bỏ)** |
| **5. Quá tải dung lượng Rate do Retry Storm** | Tỷ lệ retry dồn tải (21.81 attempts/s) vượt ngưỡng cấu hình (20 QPS), queue đầy 256 và tỷ lệ thành công là 0. | **`CONFIRMED` (Xác nhận)** |

---

#### 5.5. Tại Sao Màn Hình Giám Sát Lại Mâu Thuẫn Với Người Dùng? (False-Green Dashboards)

Hệ thống điều khiển của Kubernetes báo cáo **tính sẵn sàng của hạ tầng (Infrastructure Availability)** chứ không báo cáo **kết quả hữu ích của người dùng (Useful Outcomes)**:
1. `frontend`, `search`, và `rate` đều báo cáo `1/1` bản sao (replicas) ở trạng thái Ready và Available.
2. Cả ba dịch vụ đều có Endpoints khỏe mạnh.
3. Các Pods không định nghĩa **Readiness** hoặc **Liveness Probes**, dẫn đến Kubernetes không thể nhận biết hàng đợi đang bị nghẽn cứng hay đường truyền phụ thuộc đang rơi vào vòng xoáy cạn kiệt deadline.
4. CPU và RAM máy chủ ở mức cực thấp (CPU 0%, RAM 6%).
5. Bộ sinh tải hoàn thành 91.9% lưu lượng gửi đi, nhưng 100% kết quả người dùng nhận về là thất bại.

$\rightarrow$ **Một dashboard chỉ tập trung vào trạng thái Pod, mức sử dụng Node hay Completed RPS sẽ giữ màu XANH trong khi toàn bộ hành trình của khách hàng đã hoàn toàn sụp đổ.**

---

#### 5.6. Bảng Hành Động Khắc Phục Ưu Tiên (Prioritized Recommended Response)

| Mã | Hành động Đề xuất (Action) | Bộ phận Phụ trách | Mức Ưu tiên |
| :---: | :--- | :---: | :---: |
| **R1** | **Biện pháp tình thế (Workaround)**: Cắt giảm ngay hiện tượng khuếch đại retry giữa `search` và `rate`, triển khai bản Canary giảm `RATE_RPC_MAX_ATTEMPTS=1`. | Search Owner | **P0 (Khẩn cấp)** |
| **R2** | **Bản vá gốc (Fix)**: Đánh giá thông lượng thực tế của backend `rate`, sau đó nâng `RATE_BACKEND_QPS_LIMIT` và số lượng Replicas vượt trên mức tải đỉnh dự kiến. | Rate Owner | **P0 (Khẩn cấp)** |
| **R3** | **Rào chắn bảo vệ (Guardrail)**: Áp dụng kỹ thuật Load Shedding (chủ động từ chối tải) trước khi hàng đợi chạm ngưỡng 256; kiểm soát ngân sách retry (retry budget) không vượt quá request deadline ban đầu. | Search + Rate Owners | **P1 (Quan trọng)** |
| **O1** | **Cải tiến phát hiện (Detection)**: Thiết lập cảnh báo trang (paging) dựa trên tỷ lệ thành công của khách hàng (Outcome Success) và độ sâu hàng đợi (Queue Depth), thay vì chỉ dựa vào Completed RPS hay Pod Ready. | SRE Team | **P1 (Quan trọng)** |
| **O2** | **Cơ chế kiểm tra sức khỏe (Health)**: Bổ sung Functional Readiness Probe tự động ngắt traffic khi đường dẫn phụ thuộc vi phạm SLO. | Service Owners | **P1 (Quan trọng)** |

* **Điều kiện xác nhận sự cố đã khắc phục hoàn toàn (Fix Verification Gate)**: Tỷ lệ tìm kiếm thành công của khách hàng trở lại > 0 và ổn định; p95 latency quay về trong ngưỡng SLO; hàng đợi `rate` nằm dưới ngưỡng dung lượng khi duy trì tải 8 RPS; các lỗi gRPC `ResourceExhausted` và `DeadlineExceeded` chấm dứt gia tăng.

---

#### 5.7. Sổ Cái Bằng Chứng & Ranh Giới Quyền Hạn Read-Only (Evidence Ledger)

* **Các lệnh kiểm tra Read-Only đã thực thi hợp lệ**:
  * `discover.sh --max-items 20`: Kiểm tra ngữ cảnh `hotel-prod-apse1`, 4 nodes đều `Ready`.
  * `workload_health.sh --namespace hotel-reservation --max-items 40`: Không có deployments bị xuống cấp.
  * `node_pressure.sh --max-items 20`: Không có áp lực tài nguyên node.
  * Các truy vấn `kubectl get` có giới hạn: Routing, EndpointSlices, tài nguyên và cấu hình probe.
  * Thu thập bounded logs: `search-slo-observer`, `search-traffic`, `search`, và `rate` trong cửa sổ 30 phút.
* **Ranh giới bảo mật nghiêm ngặt (RBAC Limitations)**:
  * Lệnh `pods/exec` bị từ chối bởi RBAC đối với tài khoản `system:serviceaccount:platform:cloudthinkerreadonly`.
  * Quyền `services/proxy` cũng bị từ chối; không thể thực hiện HTTP GET trực tiếp hay cào metrics tùy tiện.
  * **Tuân thủ tuyệt đối**: Không thực hiện bất kỳ thao tác ghi (write), rollout, co giãn (scale), restart hay thay đổi cấu hình nào trên cụm.

---

### 6. Bảng Thuật ngữ Chuyên môn Day 02 (Glossary)

| Thuật ngữ | Định nghĩa chuẩn mực trong Điều tra Sự cố Đám mây |
| :--- | :--- |
| **Signal** | Một sự kiện vận hành đơn lẻ sau khi đã đi qua đầy đủ các tầng lọc và khử nhiễu. |
| **Cluster** | Tập hợp các tín hiệu có liên quan được gom nhóm lại thành một ứng viên sự cố đáng can thiệp. |
| **Suppression** | Việc loại bỏ hoặc tắt tiếng sự kiện theo quy tắc có thứ tự thay vì tắt mù một kênh thông báo. |
| **Flapping** | Hiện tượng một chỉ số dao động liên tục qua lại quanh ngưỡng cảnh báo, phát sinh cảnh báo lặp lại. |
| **Cascade** | Các ảnh hưởng dây chuyền ở tầng dịch vụ phía dưới sinh ra từ một tín hiệu gốc đã được nhận diện. |
| **Trigger** | Sự kiện châm ngòi làm bùng phát sự cố; sự kiện này thường đã kết thúc khi việc điều tra bắt đầu. |
| **Root cause** | Tài nguyên duy nhất có cấu hình bị sai lệch so với baseline, phiên bản trước hoặc các node cùng loại. |
| **Contributing factor** | Một điều kiện môi trường tồn tại sẵn nhưng không thể xác định được mốc thời gian thay đổi. |
| **Hypothesis** | Một lời giải thích sự cố được phát biểu đủ chặt chẽ để một câu truy vấn có thể bác bỏ nó. |
| **Blocked** | Trạng thái Agent bị ngăn chặn bởi ranh giới phân quyền; đây là một kết quả kiểm tra hợp lệ. |

---

### 7. Hướng tới Day 03: Prove It Arena

Kết thúc Day 02, đội thi đã hoàn thiện trọn vẹn bộ công cụ tư duy điều tra sự cố hiện đại: phân định rạch ròi giữa **Trigger**, **Root Cause**, **Contributing Factor**, làm chủ kỹ thuật phân nhánh giả thuyết bằng **Distinguishing Query**, và xây dựng báo cáo sự cố chuẩn mực dựa trên bằng chứng xác thực.

Toàn bộ các năng lực này sẽ được thử lửa tại **Day 03 · Prove It Arena** — một môi trường hạ tầng hoàn toàn xa lạ, một sự cố bất ngờ phát sinh trong thời gian thực, và sự đánh giá trực tiếp từ Hội đồng Ban giám khảo chuyên môn.
