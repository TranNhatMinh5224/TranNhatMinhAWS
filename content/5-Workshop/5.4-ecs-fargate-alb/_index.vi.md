---
title: "Triển khai Máy chủ Ứng dụng & Cân bằng tải Application Load Balancer (ALB)"
date: 2026-08-25
weight: 4
chapter: false
pre: " <b> 5.4. </b> "
aliases:
  - /5-workshop/5.4-ecs-fargate-alb/
  - /5-Workshop/5.4-ecs-fargate-alb/
---

# 5.4. Triển khai Máy chủ Ứng dụng & Cân bằng tải Application Load Balancer (ALB)

### Tổng quan bài Lab 5.4

Trong mô hình kiến trúc chuẩn doanh nghiệp, các dịch vụ xử lý ứng dụng (FastAPI RAG Core, Next.js Web Interface) cần được bảo vệ sau một tầng điều phối lưu lượng mạng duy nhất. **Application Load Balancer (ALB)** đóng vai trò là "cổng ngõ duy nhất" (Single Entrypoint) tiếp nhận toàn bộ các yêu cầu HTTP/HTTPS từ người dùng Internet, thực hiện cân bằng tải phân tán và điều hướng lưu lượng thông minh dựa trên đường dẫn URL (Path-Based Routing).

Bài lab 5.4 hướng dẫn chi tiết quy trình:
1. Khởi tạo máy chủ ứng dụng **Amazon EC2 (`enterprise-rag-server`)**, cấu hình mạng VPC bảo mật và kiểm tra kết nối quản trị từ xa qua SSH.
2. Thiết lập **Application Load Balancer (`rag-lb`)** trải dài trên 2 Availability Zones (`ap-southeast-1a`, `ap-southeast-1b`) đảm bảo tính sẵn sàng cao (High Availability).
3. Cấu hình 2 **Target Groups** riêng biệt với cơ chế Health Check tự động giám sát sức khỏe dịch vụ.
4. Xây dựng quy tắc định tuyến phân nhánh (**Path-Based Routing Rules**): phân tách rành mạch lưu lượng `/api/*`, `/docs*` về Backend và lưu lượng mặc định `/*` về Frontend.
5. Kiểm chứng hoạt động thực tế qua tên miền DNS công khai của Load Balancer.

---

### Danh sách các nội dung triển khai:

1. [**5.4.1. Khởi tạo & Cấu hình Máy chủ EC2 RAG Server**](#541-khởi-tạo--cấu-hình-máy-chủ-ec2-rag-server)
2. [**5.4.2. Cấu hình Application Load Balancer & Target Groups**](#542-cấu-hình-application-load-balancer--target-groups)
3. [**5.4.3. Cấu hình Định tuyến Thông minh dựa trên đường dẫn (Path-Based Routing)**](#543-cấu-hình-định-tuyến-thông-minh-dựa-trên-đường-dẫn-path-based-routing)
4. [**5.4.4. Kiểm chứng Vận hành Toàn diện qua ALB DNS**](#544-kiểm-chứng-vận-hành-toàn-diện-qua-alb-dns)

---

## 5.4.1. Khởi tạo & Cấu hình Máy chủ EC2 RAG Server

### 1. Mục tiêu kỹ thuật
* Khởi tạo máy chủ tính toán **Amazon EC2** làm môi trường Container Runtime cho toàn bộ hệ sinh thái RAG (FastAPI, Next.js, Qdrant, Celery Worker).
* Sử dụng hệ điều hành **Ubuntu Server 24.04 LTS (64-bit x86)** đảm bảo tính ổn định và tương thích cao nhất với các thư viện AI/PyTorch.
* Kết nối máy chủ với phân vùng mạng **VPC `vpc-03228d0b15b9ea7be`** và bảo vệ bởi **Security Group `rag-ec2-sg`**.
* Xác thực kết nối bảo mật từ xa bằng cặp khóa SSH **`Key_RAG-AWS.pem`**.

---

### 2. Các bước triển khai chi tiết & Bằng chứng thực tế (Evidence)

#### Bước 1: Khởi tạo Máy chủ & Cấu hình Thiết lập Mạng (Network Settings)
1. Truy cập **EC2 Management Console** → chọn **Instances** → bấm **Launch instances**.
2. **Name and tags**: Đặt tên máy chủ là **`enterprise-rag-server`**.
3. **Application and OS Images**: Chọn **Ubuntu Server 24.04 LTS (HVM), SSD Volume Type** (64-bit x86).
4. **Instance type**: Chọn **`t3.small`** (2 vCPU, 2 GiB RAM) để đảm bảo năng lực tính toán và bộ nhớ RAM.
5. **Key pair (login)**: Chọn cặp khóa **`Key_RAG-AWS`**.
6. **Network settings**: Bấm **Edit**:
   * **VPC**: Chọn VPC của dự án **`vpc-03228d0b15b9ea7be`** (`MyProjectRAGVPC`).
   * **Subnet**: Chọn subnet công khai **`project-subnet-public2-ap-southeast-1b`**.
   * **Auto-assign public IP**: Chọn **Enable** để máy chủ nhận địa chỉ IPv4 công khai.
   * **Firewall (security groups)**: Chọn **Select existing security group** → gán **`rag-ec2-sg`** (`sg-0c1e9bf71b2ec5149`).
7. **Configure storage**: Cấu hình ổ đĩa gốc dung lượng 30 GiB gp3 General Purpose SSD.

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.1-ec2-network-settings.png" alt="Cấu hình Network Settings cho EC2 Instance" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.4.1.1: Thiết lập mạng liên kết máy chủ với VPC dự án và gán Security Group rag-ec2-sg</em></p>
</div>

---

#### Bước 2: Xác thực trạng thái hoạt động của máy chủ
Bấm **Launch instance**. Khi quá trình khởi động hoàn tất, instance chuyển sang trạng thái **Running** với đầy đủ các định danh:
* **Instance ID**: `i-0e3f096f3de681aaa` (`enterprise-rag-server`)
* **Instance State**: `Running`
* **Instance Type**: `t3.small`
* **Availability Zone**: `ap-southeast-1b`
* **IPv4 công khai**: `13.250.121.137`
* **IPv4 nội bộ (Private IP)**: `10.0.24.186`

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.1-ec2-instances-list.png" alt="Danh sách EC2 Instances xác nhận enterprise-rag-server đang chạy" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.4.1.2: Bảng danh sách EC2 Instances xác thực enterprise-rag-server (i-0e3f096f3de681aaa) ở trạng thái Running với IP 13.250.121.137</em></p>
</div>

---

#### Bước 3: Kiểm tra kết nối quản trị SSH Terminal
Mở terminal trên máy cá nhân và thực thi lệnh SSH xác thực qua private key:

```bash
ssh -i "Key_RAG-AWS.pem" ubuntu@13.250.121.137
```

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.1-ssh-terminal-ec2.png" alt="Kết nối SSH Terminal thành công vào máy chủ EC2" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.4.1.3: Minh chứng đăng nhập SSH thành công vào máy chủ EC2 với Private IP nội bộ ip-10-0-24-186</em></p>
</div>

> [!NOTE]
> * **Giải pháp tối ưu hóa chi phí thực nghiệm**: Máy chủ EC2 được đặt tại `project-subnet-public2-ap-southeast-1b` (IP nội bộ `10.0.24.186`) có gán IPv4 công khai nhằm tiết kiệm chi phí vận hành dịch vụ NAT Gateway (~$32/tháng trên tài khoản AWS Free Tier). Tuy nhiên, toàn bộ các cổng nghiệp vụ vẫn được bảo vệ nghiêm ngặt qua Security Group `rag-ec2-sg`.
> * Do cơ chế Dynamic IPv4 của AWS, địa chỉ IP công khai có thể thay đổi sau mỗi chu kỳ Stop/Start instance (như `13.215.207.214` và `13.250.121.137`), nhưng IP nội bộ cố định `10.0.24.186` luôn được giữ nguyên vẹn trong VPC.

---

## 5.4.2. Cấu hình Application Load Balancer & Target Groups

### 1. Mục tiêu kỹ thuật
* Khởi tạo **Application Load Balancer (ALB)** tên **`rag-lb`** công khai trên Internet (**Internet-facing Scheme**) tại Region Singapore.
* Cấu hình phân phối lưu lượng trải rộng trên **2 Availability Zones** (`ap-southeast-1a` và `ap-southeast-1b`) qua các Public Subnets, đảm bảo hệ thống tự động duy trì hoạt động ngay cả khi 1 Data Center của AWS gặp sự cố.
* Khởi tạo 2 **Target Groups** độc lập:
  * **`rag-backend-tg`**: Định tuyến lưu lượng API tới cổng `8000` của EC2.
  * **`rag-frontend-tg`**: Định tuyến lưu lượng giao diện tới cổng `3000` của EC2.
* Thiết lập **Health Checks** định kỳ mỗi 30 giây gửi HTTP GET request đến đường dẫn `/` để kiểm tra độ sẵn sàng của ứng dụng.

---

### 2. Các bước triển khai chi tiết & Bằng chứng thực tế (Evidence)

#### Bước 1: Khởi tạo Application Load Balancer
1. Truy cập **EC2 Console** → **Load Balancers** → bấm **Create load balancer**.
2. Chọn loại: **Application Load Balancer (ALB)** (cân bằng tải Layer 7 thông minh).
3. **Basic configuration**:
   * Load balancer name: **`rag-lb`**.
   * Scheme: **Internet-facing**.
   * IP address type: **IPv4**.
4. **Network mapping**:
   * VPC: Chọn `vpc-03228d0b15b9ea7be`.
   * Mappings: Chọn cả 2 Availability Zones:
     * `ap-southeast-1a`: Chọn subnet `project-subnet-public1-ap-southeast-1a` (`subnet-06025e767c9a9773f`).
     * `ap-southeast-1b`: Chọn subnet `project-subnet-public2-ap-southeast-1b` (`subnet-0cf27fbea7085c1bd`).
5. **Security groups**: Gán security group của ALB cho phép cổng 80 (HTTP).

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.2-create-alb-wizard.png" alt="Khởi tạo Application Load Balancer rag-lb" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.4.2.1: Giao diện lựa chọn loại Application Load Balancer (ALB) trên AWS Management Console</em></p>
</div>

---

#### Bước 2: Khởi tạo 2 Target Groups
Truy cập **Target Groups** → chọn **Create target group** để cấu hình 2 nhóm đích:
1. **Target Group Backend (`rag-backend-tg`)**:
   * Target type: `Instances`.
   * Protocol: `HTTP`, Port: `8000`.
   * VPC: `vpc-03228d0b15b9ea7be`.
   * Health check path: `GET /` (Success code 200).
   * Register targets: Chọn `enterprise-rag-server` (`i-0e3f096f3de681aaa`) tại cổng 8000.
2. **Target Group Frontend (`rag-frontend-tg`)**:
   * Target type: `Instances`.
   * Protocol: `HTTP`, Port: `3000`.
   * VPC: `vpc-03228d0b15b9ea7be`.
   * Health check path: `GET /` (Success code 200).
   * Register targets: Chọn `enterprise-rag-server` (`i-0e3f096f3de681aaa`) tại cổng 3000.

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.2-target-groups-list.png" alt="Danh sách 2 Target Groups trong hệ thống" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.4.2.2: Bảng quản trị 2 Target Groups rag-backend-tg (cổng 8000) và rag-frontend-tg (cổng 3000)</em></p>
</div>

---

#### Bước 3: Xác thực trạng thái Active của Load Balancer
Bấm **Create load balancer**. Chờ vài phút để hệ thống AWS phân phối tài nguyên mạng. Load balancer chuyển sang trạng thái **Active**:
* **Load balancer name**: `rag-lb`
* **Status**: `Active`
* **DNS name**: `rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com`
* **Hosted zone**: `Z1LMS91P8CMLE5`

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.2-alb-details-active.png" alt="Chi tiết Load Balancer rag-lb ở trạng thái Active" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.4.2.3: Trang tổng quan quản trị của rag-lb xác nhận trạng thái phân phối Active và tên miền DNS khả dụng</em></p>
</div>

---

#### Bước 4: Kiểm chứng Health Check trạng thái Healthy của các Targets
Truy cập tab **Resource map** của `rag-lb` để kiểm tra đồ thị phân phối lưu lượng:
* Cả 2 target `enterprise-rag-server` trên cổng `8000` (Backend) và cổng `3000` (Frontend) đều hiển thị màu xanh lá cây với trạng thái **Healthy (1/1)**.
* Điều này xác nhận ứng dụng FastAPI và Next.js đã phản hồi HTTP 200 ổn định và sẵn sàng tiếp nhận người dùng.

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.2-alb-targets-healthy-map.png" alt="Resource Map xác nhận tất cả các Target đều Healthy" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.4.2.4: Đồ thị Resource map xác nhận cả 2 Target Groups đều có Target ở trạng thái Healthy (1 Healthy)</em></p>
</div>

---

## 5.4.3. Cấu hình Định tuyến Thông minh dựa trên đường dẫn (Path-Based Routing)

### 1. Mục tiêu kỹ thuật
* Thay vì phải cấu hình nhiều Load Balancer tốn kém hoặc quản lý nhiều domain phụ phức tạp, hệ thống sử dụng cơ chế **Path-Based Routing (Định tuyến theo đường dẫn URI)** tại tầng Application (Layer 7).
* Tất cả lưu lượng bắt đầu bằng `/api/*` hoặc tài liệu tương tác `/docs*` được tự động chuyển hướng về dịch vụ Backend FastAPI.
* Tất cả các lưu lượng còn lại (`/*`) mặc định chuyển hướng về giao diện Next.js Web Interface.

---

### 2. Bảng quy tắc định tuyến (Routing Rules Matrix)

| Thứ tự ưu tiên (Priority) | Điều kiện đường dẫn (Path Condition) | Hành động thực thi (Action) | Target Group đích |
| :--- | :--- | :--- | :--- |
| **Rule 1** (Ưu tiên cao nhất) | **`Path is /api/* or /docs*`** | **Forward to** | `rag-backend-tg` (Cổng 8000) |
| **Default Rule** | Bất kỳ request nào khác (`/*`) | **Forward to** | `rag-frontend-tg` (Cổng 3000) |

---

### 3. Các bước triển khai chi tiết & Bằng chứng thực tế (Evidence)

#### Bước 1: Khảo sát Listener HTTP:80
Tại trang chi tiết `rag-lb`, chọn tab **Listeners and rules**. Listener cổng `HTTP:80` đang lắng nghe toàn bộ các request gửi đến.

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.3-alb-listener-overview.png" alt="Tổng quan Listener HTTP:80 trên ALB" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.4.3.1: Giao diện quản trị Listener HTTP:80 chuẩn bị cấu hình quy tắc định tuyến nâng cao</em></p>
</div>

---

#### Bước 2: Thêm quy tắc điều kiện đường dẫn (Path Conditions)
1. Bấm **Manage rules** → chọn **Add rule**.
2. **Step 1: Add rule conditions**:
   * Chọn loại điều kiện: **Path**.
   * Nhập giá trị: `/api/*` và `/docs*`.

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.3-alb-rule-path-condition.png" alt="Thiết lập điều kiện Path là /api/* hoặc /docs*" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.4.3.2: Thiết lập điều kiện lọc đường dẫn Path condition /api/* hoặc /docs*</em></p>
</div>

---

#### Bước 3: Định cấu hình hành động chuyển tiếp (Forward Action)
1. **Step 2: Define actions**:
   * Action type: **Forward to target groups**.
   * Target group: Chọn **`rag-backend-tg`** (Trọng số 100%).

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.3-alb-rule-forward-action.png" alt="Cấu hình hành động Forward tới rag-backend-tg" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.4.3.3: Thiết lập hành động Forward lưu lượng API đến nhóm đích rag-backend-tg</em></p>
</div>

---

#### Bước 4: Thiết lập độ ưu tiên của Rule (Rule Priority)
1. **Step 3: Set rule priority**:
   * Đặt giá trị ưu tiên là **`1`** (Quy tắc có priority nhỏ hơn sẽ được kiểm tra và khớp trước quy tắc mặc định).

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.3-alb-rule-priority.png" alt="Thiết lập độ ưu tiên Priority 1 cho API rule" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.4.3.4: Gán Priority 1 đảm bảo quy tắc API được ưu tiên kiểm tra trước tiên</em></p>
</div>

---

#### Bước 5: Kiểm tra danh sách quy tắc hoàn chỉnh
Bấm **Create**. Bảng tổng hợp các quy tắc định tuyến của Listener HTTP:80 hiển thị đầy đủ và chuẩn xác:

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.3-alb-rules-completed-list.png" alt="Danh sách quy tắc định tuyến hoàn chỉnh trên Listener HTTP:80" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.4.3.5: Bảng quy tắc định tuyến hoàn chỉnh phân tách rạch ròi giữa lưu lượng API và Frontend</em></p>
</div>

---

## 5.4.4. Kiểm chứng Vận hành Toàn diện qua ALB DNS

Sau khi hoàn tất cấu hình, thực hiện kiểm tra hoạt động trực tiếp của hệ thống thông qua tên miền DNS công khai của Application Load Balancer trên trình duyệt web:

$$\text{URL: } \texttt{http://rag-lb-1113719893.ap-southeast-1.elb.amazonaws.com}$$

<div align="center">
  <img src="/images/5-Workshop/5.4/5.4.4-alb-dns-browser-verify.png" alt="Kiểm chứng truy cập ALB DNS qua trình duyệt web" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.4.4.1: Kết quả kiểm thử trên trình duyệt web phản hồi JSON hợp lệ từ Backend qua Application Load Balancer</em></p>
</div>

* Kết quả phản hồi HTTP 200 JSON từ dịch vụ FastAPI RAG Backend:
```json
{"message":"Hệ thống RAG Backend đang hoạt động trơn tru!"}
```

Minh chứng này xác nhận chuỗi kết nối từ **Người dùng Internet → ALB → Target Group → Docker Container trên EC2** đã thông suốt hoàn toàn với độ trễ cực thấp.

> [!TIP]
> Phản hồi JSON trên xác thực kết nối Layer 7 trực tiếp tới Backend Target Group thành công. Khi người dùng truy cập giao diện ứng dụng hoàn chỉnh ở **Lab 5.5**, toàn bộ giao diện Web Next.js (NexusDoc AI) sẽ được tải về mượt mà qua tên miền ALB DNS này.

---

### Tóm kết Lab 5.4:
Hoàn thành Lab 5.4 đánh dấu việc đưa toàn bộ hệ thống ứng dụng RAG Assistant vào trạng thái sẵn sàng phục vụ sản xuất:
1. **Máy chủ EC2 RAG Server** vận hành ổn định trong mạng VPC bảo mật, quản trị an toàn qua SSH.
2. **Application Load Balancer (`rag-lb`)** Multi-AZ làm điểm truy cập thống nhất với tính sẵn sàng cao.
3. Cơ chế **Path-Based Routing** hoạt động mượt mà, phân luồng chính xác giữa API Backend và giao diện người dùng Frontend.
4. **Health Check** tự động đảm bảo lưu lượng luôn chỉ được gửi đến các container khỏe mạnh.

Tiếp theo: [**Lab 5.5: Kiểm thử Toàn trình Pipeline RAG & Security Guardrails**](../5.5-testing-rag/).
