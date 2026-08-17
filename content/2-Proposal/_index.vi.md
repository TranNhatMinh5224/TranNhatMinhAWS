---
title: "Bản đề xuất"
date: 2026-07-21
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# Serverless & Event-Driven Game Backend trên AWS
## Kiến trúc Backend tối ưu chi phí và mở rộng linh hoạt cho Game Live-Service

### 1. Tóm tắt điều hành
Đề xuất này trình bày giải pháp kiến trúc **Backend cho Game Live-Service** chạy trên hạ tầng đám mây AWS. Thay vì duy trì một cụm máy chủ game (Game Server) hoạt động 24/7 gây lãng phí chi phí lớn trong những khoảng thời gian không có người chơi, hệ thống áp dụng nguyên tắc **chỉ bật tài nguyên tính toán (Compute) khi thực sự cần thiết**: bao gồm luồng đăng nhập, ghép trận (Matchmaking), và trong suốt thời gian diễn ra trận đấu thực tế.

Toàn bộ phần **Metagame** (xác thực người chơi, phân phối tài nguyên game, ghép trận, lưu trữ kết quả) được xây dựng hoàn toàn dựa trên kiến trúc **Serverless**. Phần phiên chơi game thực tế (Live Game Session) yêu cầu máy chủ vật lý được quản lý trong fleet **EC2 Spot (kiến trúc Graviton ARM64)** và chỉ được kích hoạt (spin up) tự động theo yêu cầu của luồng ghép trận. Toàn bộ quy trình triển khai và cập nhật mã nguồn được tự động hóa qua mô hình **GitOps (CI/CD Pipeline)**, đảm bảo không có sự can thiệp thủ công lên môi trường Production.

---

### 2. Tuyên bố vấn đề

#### Vấn đề hiện tại
*   **Chi phí lãng phí lớn (Idle Cost)**: Các hệ thống Game Server truyền thống phải duy trì các máy chủ ảo EC2/Virtual Machine chạy liên tục 24/7 để sẵn sàng phục vụ người chơi, dẫn đến chi phí hạ tầng rất cao ngay cả khi số lượng người chơi giảm mạnh vào các khung giờ thấp điểm.
*   **Chi phí băng thông & Egress cao**: Việc sử dụng NAT Gateway hoặc Load Balancer thường trực để định tuyến lưu lượng internet làm phát sinh chi phí duy trì và chi phí truyền dữ liệu (data transfer) không đáng có.
*   **Phức tạp trong cập nhật & Phát hành (Deployment Overhead)**: Mỗi lần phát hành bản vá nhỏ (small patch) hoặc cập nhật game server bundle thường đòi hỏi phải đóng gói lại toàn bộ ảnh đĩa (Rebake AMI), làm chậm chu kỳ phát hành tính năng và tiềm ẩn rủi ro gián đoạn dịch vụ đang chạy.
*   **Nguy cơ bảo mật mạng**: Việc mở sẵn các cổng mạng (standing security group rules) trên máy chủ game tạo ra nguy cơ bị tấn công DDoS hoặc thâm nhập trái phép từ bên ngoài.

#### Giải pháp đề xuất
Hệ thống được thiết kế theo nguyên tắc cốt lõi: **Serverless cho mọi thành phần trừ phiên chơi game thực tế**. Phần phiên chơi game nằm sau ranh giới mạng riêng (Network Boundary) thuộc VPC, tách biệt hoàn toàn khỏi luồng matchmaking và xác thực.

Kiến trúc chia làm 4 luồng xử lý độc lập, mỗi luồng có cơ chế kích hoạt (Trigger) và ranh giới tin cậy (Trust Boundary) riêng:
1.  **Flow C (GitOps Deployment Loop)**: Quản lý CI/CD tự động hóa, build artifact, cập nhật Lambda Version Alias, đẩy asset/patch/server bundle lên S3 và cập nhật Launch Template cho fleet EC2 Spot mà không làm gián đoạn các trận đấu đang diễn ra.
2.  **Flow A (Player Auth & Asset Distribution)**: Xác thực người chơi qua Amazon Cognito User Pool và phân phối quyền truy cập tải asset/patch từ S3 bằng Cognito Identity Pool (Temporary IAM Credentials scoped theo prefix).
3.  **Flow R (Synchronous Matchmaking & EC2 Control Plane)**: Luồng ghép trận đồng bộ qua CloudFront + WAF, API Gateway và Matchmaker Lambda (trong Private Subnet). Lambda gọi EC2 Control Plane qua VPC Interface Endpoint để yêu cầu warm instance từ ASG Spot fleet, mở Security Group rule theo từng người chơi/trận đấu và trả về IP/Port để client kết nối trực tiếp qua Internet Gateway.
4.  **Flow E (Asynchronous Post-Match Processing & Analytics)**: Luồng bất đồng bộ xử lý kết quả sau trận đấu thông qua DynamoDB Streams và Async Lambda, tách biệt hoàn toàn để không ảnh hưởng đến độ trễ ghép trận.

#### Lợi ích và Hoàn vốn đầu tư (ROI)
*   **Tối ưu chi phí tối đa (lên đến 70 - 80%)**: Nhờ kết hợp EC2 Spot Instance trên vi xử lý Graviton ARM64 (rẻ hơn 20% so với x86) và cơ chế chỉ bật EC2 khi có trận đấu. Loại bỏ hoàn toàn chi phí duy trì NAT Gateway và Load Balancer thường trực.
*   **Tăng cường độ an toàn bảo mật**: Mọi request đều được xác thực JWT trước khi chạm vào mã ứng dụng. Cổng game server chỉ mở Security Group rule động cho đúng IP người chơi trong thời gian diễn ra trận đấu và thu hồi ngay sau khi kết thúc.
*   **Chu kỳ phát hành linh hoạt (Zero-Downtime Rollout)**: Nhờ lưu trữ tập trung server bundle trên S3, khi có bản vá nhỏ, EC2 UserData tự động pull bản mới nhất lúc khởi động mà không cần rebake lại AMI.

---

### 3. Kiến trúc giải pháp

#### Sơ đồ kiến trúc tổng thể
![Serverless & Event-Driven Game Backend Architecture](/images/2-Proposal/serverless_game_backend_architecture.png)

#### Chi tiết 4 luồng xử lý chính trong kiến trúc:

##### 1. Flow C — GitOps Deployment Loop (Quản lý triển khai)
*   **C1 - C2**: Lập trình viên push mã nguồn và IaC (Infrastructure as Code) lên Git Repository. GitHub Actions kích hoạt pipeline xây dựng các gói phần mềm (Artifacts).
*   **C3**: Pipeline gọi AWS CodeDeploy để thực hiện chuyển lưu lượng (Traffic Shift) sang phiên bản Lambda Alias mới và cập nhật AMI/Launch Template cho fleet EC2.
*   **C4**: Đồng thời, pipeline upload các bản build client, patch và server bundle lên Amazon S3. Bucket này đóng vai trò là nguồn lưu trữ tập trung cho cả client và game server. Nếu có lỗi phát sinh, hệ thống thực hiện rollback tự động mà không làm ảnh hưởng đến luồng ghép trận đang chạy.

##### 2. Flow A — Player Auth & Security (Xác thực & Phân phối Asset)
*   **A1 - A2**: Người chơi đăng nhập qua ứng dụng client, Amazon Cognito User Pool xác thực và trả về JWT Token.
*   **A3 - A4**: Client mang JWT đổi lấy IAM Temporary Credentials tại Amazon Cognito Identity Pool. Các credential này được phân quyền (scoped) theo prefix cụ thể trên S3, cho phép client tải trực tiếp các gói asset, patch và launcher file cần thiết.
*   **A5**: JWT Token được gửi kèm trong header của các request ở Flow R để API Gateway Cognito Authorizer kiểm tra trước khi cho phép gọi tới Matchmaker Lambda.

##### 3. Flow R — Request & Matchmaking (Luồng ghép trận đồng bộ)
*   **R1 - R2**: Client gửi yêu cầu ghép trận qua Amazon CloudFront (gắn AWS WAF) tới Amazon API Gateway.
*   **R3 - R4**: Sau khi xác thực JWT thành công, Matchmaker Lambda nằm trong Private Subnet ghi trạng thái trận đấu (Match State) vào Amazon DynamoDB qua VPC Gateway Endpoint.
*   **G1 - G2**: Matchmaker Lambda gọi EC2 Control Plane qua VPC Interface Endpoint riêng để yêu cầu warm instance từ Auto Scaling Group (ASG) Spot fleet, đồng thời mở một Security Group rule động cho IP của người chơi trong phòng.
*   **G3 - G4**: EC2 Spot instance được khởi tạo trong Public Subnet. UserData script lúc boot sử dụng IAM Instance Profile để gọi S3 (Flow G4) tải server binary, config và patch mới nhất.
*   **R5**: Lambda trả về địa chỉ IP công khai và Port của phòng game cho client. Client kết nối trực tiếp UDP/TCP tới Game Instance qua Internet Gateway mà không thông qua bất kỳ proxy hay load balancer trung gian nào.

##### 4. Flow E — Asynchronous Processing (Xử lý bất đồng bộ sau trận)
*   **E1 - E3**: Khi trận đấu kết thúc, kết quả được ghi vào DynamoDB Single Table. DynamoDB Stream tự động kích hoạt Async Lambda nền để thu thập log post-match, xử lý dữ liệu và đẩy sang hệ thống phân tích (Analytics Store). Luồng này hoàn toàn bất đồng bộ, không ảnh hưởng tới độ trễ của luồng ghép trận.

#### Dịch vụ AWS sử dụng
-   **Amazon Cognito**: Quản lý đăng nhập (User Pool) và cấp phát IAM temporary credentials (Identity Pool).
-   **Amazon API Gateway & CloudFront + AWS WAF**: Điểm tiếp nhận request ghép trận, bảo vệ hạ tầng biên chống tấn công DDoS và ứng dụng web.
-   **AWS Lambda**: Thực hiện logic ghép trận (Matchmaker), triển khai phiên bản (Alias Versioning) và xử lý dữ liệu sau trận (Async Lambda).
-   **Amazon EC2 Spot Fleet (Graviton ARM64)**: Chạy máy chủ game phiên thực tế với chi phí tối ưu nhất.
-   **Amazon DynamoDB**: Lưu trữ trạng thái ghép trận (Single Table Design) và phát sự kiện qua DynamoDB Streams.
-   **Amazon S3**: Data Lake lưu trữ tập trung client build, patch file và game server bundle.
-   **VPC Endpoints**: Gateway Endpoint (cho DynamoDB) và Interface Endpoint (cho EC2 API) giúp Matchmaker Lambda trong Private Subnet giao tiếp hoàn toàn nội bộ với các dịch vụ AWS.
-   **AWS CodeDeploy & GitHub Actions**: Pipeline GitOps triển khai tự động hóa.
-   **AWS KMS & Amazon CloudWatch**: Mã hóa dữ liệu lưu trữ và giám sát toàn bộ hạ tầng.

---

### 4. Triển khai kỹ thuật

#### Các giai đoạn triển khai
1.  **Giai đoạn 1: Nghiên cứu & Thiết kế kiến trúc (Tháng 1)**
    *   Phân tích yêu cầu về độ trễ, lưu lượng băng thông và thiết kế mô hình Single Table DynamoDB.
    *   Xây dựng mô hình phân vùng mạng VPC (Public Subnet cho EC2 Game Fleet, Private Subnet cho Matchmaker Lambda và VPC Endpoints).
2.  **Giai đoạn 2: Xây dựng hạ tầng bằng mã IaC & GitOps Pipeline (Tháng 1 - Tháng 2)**
    *   Đóng gói hạ tầng AWS bằng Terraform / AWS CDK.
    *   Thiết lập GitHub Actions pipeline cho Flow C: tự động build, test và đẩy artifact lên S3 cũng như cấu hình CodeDeploy.
3.  **Giai đoạn 3: Triển khai luồng Auth & Matchmaking (Tháng 2)**
    *   Cấu hình Amazon Cognito User Pool & Identity Pool (Flow A).
    *   Phát triển Matchmaker Lambda, cấu hình API Gateway Cognito Authorizer và thiết lập CloudFront + WAF (Flow R).
4.  **Giai đoạn 4: Cấu hình Fleet EC2 Spot & VPC Endpoints (Tháng 2 - Tháng 3)**
    *   Tạo Launch Template cho EC2 Spot Fleet trên kiến trúc Graviton ARM64 với UserData tự động pull server bundle từ S3.
    *   Thiết lập VPC Gateway Endpoint cho DynamoDB và VPC Interface Endpoint cho EC2 API.
    *   Phát triển cơ chế cấp phát và thu hồi Security Group rule động cho người chơi.
5.  **Giai đoạn 5: Xử lý Asynchronous Analytics & Kiểm thử toàn diện (Tháng 3)**
    *   Kích hoạt DynamoDB Streams và phát triển Async Lambda xử lý dữ liệu sau trận (Flow E).
    *   Tiến hành kiểm thử tải (Load Testing), giả lập kịch bản người chơi tăng vọt và kiểm thử gián đoạn Spot Instance.

#### Yêu cầu kỹ thuật & Bảo mật
-   **Xác thực đa lớp**: Mọi request matchmaking đều yêu cầu JWT hợp lệ trước khi chạm tới ứng dụng.
-   **Bảo mật cổng động (Dynamic Port Security)**: Không mở sẵn cổng mạng công khai. Security Group rule chỉ được cấp phát theo IP người chơi trong thời gian diễn ra trận đấu và được thu hồi tự động ngay khi phiên chơi kết thúc.
-   **Giao tiếp nội bộ qua VPC Endpoint**: Matchmaker Lambda đặt hoàn toàn trong Private Subnet, kết nối DynamoDB và EC2 API qua đường ống riêng của AWS, không route dữ liệu ra Internet.
-   **Mã hóa dữ liệu**: Mã hóa dữ liệu lưu trữ (Data at rest) bằng AWS KMS và mã hóa dữ liệu truyền tải (Data in transit) bằng TLS 1.3.

---

### 5. Lộ trình & Mốc triển khai

```
+-----------------------------------------------------------------------------------+
| Tháng 1: Nghiên cứu & Thiết kế hạ tầng IaC                                        |
|   - Thiết kế mô hình VPC, Subnet, Security Groups                                 |
|   - Định nghĩa bài toán Single Table DynamoDB & kiến trúc Serverless               |
+-----------------------------------------------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------------------+
| Tháng 2: Triển khai Auth, Matchmaking & Fleet EC2 Spot                            |
|   - Cấu hình Cognito User Pool / Identity Pool & S3 Scoped Credentials            |
|   - Phát triển API Gateway, Matchmaker Lambda & VPC Endpoints                     |
|   - Xây dựng Launch Template cho EC2 Spot Fleet (Graviton ARM64)                  |
+-----------------------------------------------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------------------+
| Tháng 3: Tự động hóa GitOps, Async Processing & Kiểm thử                          |
|   - Xây dựng GitHub Actions + CodeDeploy Pipeline                                 |
|   - Triển khai DynamoDB Streams + Async Lambda thu thập Analytics                 |
|   - Kiểm thử tải (Load test), tối ưu chi phí & đóng gói báo cáo                   |
+-----------------------------------------------------------------------------------+
```

---

### 6. Ước tính ngân sách

Nhờ thiết kế loại bỏ NAT Gateway, loại bỏ Load Balancer thường trực và tận dụng EC2 Spot trên nền tảng Graviton ARM64, chi phí hạ tầng được giảm thiểu tối đa:

| Dịch vụ AWS | Cấu hình / Quy mô ước tính | Chi phí ước tính / Tháng (USD) |
| :--- | :--- | :--- |
| **AWS Lambda** (Matchmaker & Async) | 1,000,000 requests/tháng, 512MB RAM | ~$0.20 |
| **Amazon API Gateway** | 1,000,000 HTTP requests/tháng | ~$1.00 |
| **Amazon DynamoDB** | On-Demand Mode (Write/Read capacity units) | ~$2.50 |
| **Amazon Cognito** | < 10,000 MAU (Monthly Active Users) | **Miễn phí** (Free Tier) |
| **Amazon S3** | 20GB lưu trữ Asset, Client Build, Patch & Server Bundle | ~$0.46 |
| **Amazon CloudFront & AWS WAF** | 50GB Egress, WAF Basic Rules | ~$3.50 |
| **Amazon EC2 Spot Fleet** (Graviton ARM64) | `c6g.large` Spot Instance (~0.02 USD/giờ), chạy trung bình 100 giờ trận đấu/tháng | ~$2.00 |
| **VPC Endpoints** | Gateway Endpoint (Miễn phí) + Interface Endpoint | ~$7.20 |
| **Tổng chi phí ước tính** | **Hạ tầng Serverless & Event-Driven Game Backend** | **~$16.86 USD / Tháng** |

> [!TIP]
> **Điểm tối ưu chi phí vượt trội**:
> 1. Không dùng NAT Gateway (tiết kiệm ~32 USD/tháng).
> 2. Không dùng Application Load Balancer thường trực (tiết kiệm ~20 USD/tháng).
> 3. EC2 Spot Graviton ARM64 giảm 70-80% so với EC2 On-Demand x86.
> 4. Server bundle lưu tập trung trên S3 giúp giữ AMI mỏng, không tốn chi phí lưu trữ snapshot AMI lớn.

---

### 7. Đánh giá rủi ro

#### Ma trận rủi ro & Chiến lược giảm thiểu

| Rủi ro tiềm ẩn | Mức độ ảnh hưởng | Xác suất | Chiến lược giảm thiểu |
| :--- | :---: | :---: | :--- |
| **Thu hồi EC2 Spot Instance** (Spot Interruption) | Cao | Trung bình | Sử dụng Auto Scaling Group với nhiều Spot pools (Multi-AZ / Multi-Instance types). Khi nhận thông báo thu hồi trước 2 phút, ASG tự động bổ sung instance mới. |
| **Lượng truy cập tăng vọt** (Traffic Spike) | Trung bình | Trung bình | Các thành phần Metagame (Cognito, API Gateway, Lambda, DynamoDB) là Serverless thuần túy, tự động mở rộng (auto-scale) tức thì theo lượng request. |
| **Rủi ro rò rỉ hoặc tấn công mạng** | Cao | Thấp | Kiểm tra JWT token tại API Gateway. Thu hồi Security Group rule ngay khi hết trận. Matchmaker Lambda và kết nối DB nằm hoàn toàn trong Private Subnet qua VPC Endpoints. |
| **Lỗi bản build trong quá trình Cập nhật** | Trung bình | Thấp | GitOps Pipeline hỗ trợ rollback tự động phiên bản Lambda Alias và Launch Template mà không làm gián đoạn các luồng đang chạy. |

---

### 8. Kết quả kỳ vọng

*   **Cải tiến kỹ thuật đột phá**: Xây dựng thành công hệ thống Game Backend kiến trúc Serverless & Event-Driven có khả năng mở rộng quy mô tức thì, độ trễ ghép trận cực thấp, đáp ứng tiêu chuẩn vận hành sản xuất (Production-Ready).
*   **Tối ưu hóa chi phí triệt để**: Chứng minh mô hình chỉ chi trả cho thời gian dùng thực tế (Pay-as-you-go), giúp tiết kiệm hơn 75% chi phí vận hành so với mô hình server 24/7 truyền thống.
*   **Giá trị dài hạn**: Cung cấp một **Mẫu kiến trúc chuẩn (Architectural Blueprint)** cho các dự án phát triển Game Live-Service trên AWS, có thể tái sử dụng và mở rộng cho nhiều thể loại game khác nhau trong tương lai.