---
title: "Worklog Tuần 3"
date: 2026-08-17
weight: 3
chapter: false
pre: " <b> 1.3. </b> "
---

# Worklog Tuần 3: Thiết Kế Kiến Trúc Mạng AWS VPC, Subnetting & Định Tuyến Internet Gateway

### 1. Thông tin chung & Mục tiêu trọng tâm
* **Thời gian thực hiện:** Từ 17/08/2026 đến 23/08/2026 (Tuần 3).
* **Đối chiếu kế hoạch học tập [TTTN-02.docx]:** Mục tiêu Tuần 3 — *Tìm hiểu AWS Networking: VPC, Subnet, Internet Gateway*.
* **Cán bộ hướng dẫn (CBHD):** Phạm Văn Phóng (Solutions Architect).
* **Người phụ trách ĐVHD:** Nguyễn Gia Hưng (Senior Solutions Architect - AWS Vietnam).
* **Mục tiêu kỹ thuật cốt lõi:**
  1. Nắm vững bản chất kiến trúc mạng đám mây ảo **Amazon Virtual Private Cloud (VPC)**, quy hoạch không gian địa chỉ IPv4 theo chuẩn RFC 1918 với dải CIDR `10.0.0.0/16` (cung cấp 65,536 địa chỉ IP).
  2. Thiết kế cấu trúc phân vùng mạng đa vùng khả dụng (**Multi-AZ Subnetting**) trải dài trên 2 Availability Zones (`ap-southeast-1a` và `ap-southeast-1b`) với 3 phân tầng mạng riêng biệt:
     - **Public Subnet Tier:** `10.0.1.0/24` và `10.0.2.0/24` (kết nối Internet Gateway để triển khai Application Load Balancer).
     - **Private App Subnet Tier:** `10.0.10.0/24` và `10.0.20.0/24` (dành riêng cho EC2 Compute Node, Celery Ingestion Worker).
     - **Isolated Database Subnet Tier:** `10.0.100.0/24` và `10.0.200.0/24` (dành cho Amazon RDS PostgreSQL và Qdrant Vector Store, tuyệt đối không có đường ra Internet).
  3. Cấu hình **Internet Gateway (IGW)**, thiết lập bảng định tuyến **Route Table** tách biệt giữa Public Route Table (trỏ `0.0.0.0/0` ➔ `igw-xxxx`) và Private Route Table (chỉ định tuyến nội bộ `10.0.0.0/16 local`).
  4. Phân biệt sâu sắc và thực hành cấu hình chuỗi tường lửa **Security Groups** (Stateful, cấp độ Network Interface) và **Network ACLs** (Stateless, cấp độ Subnet) theo nguyên tắc Zero-Trust.

---

### 2. Kế hoạch triển khai & Nhật ký công việc chi tiết (Work Breakdown & Daily Log)

| Thứ | Nội dung công việc & Mục tiêu kỹ thuật | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu tham khảo | Kết quả & Bằng chứng thực tế |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Thứ 2** | • Nghiên cứu lý thuyết phân chia mạng con CIDR và Subnet Masking (/16, /24, /28).<br>• Phân tích cơ chế AWS dành riêng 5 địa chỉ IP trong mỗi Subnet (`.0` Network, `.1` VPC Router, `.2` DNS, `.3` Future, `.255` Broadcast).<br>• Lập bảng quy hoạch IP tĩnh cho toàn bộ các dịch vụ của dự án RAG Capstone. | 17/08/2026 | 17/08/2026 | • [Amazon VPC IP Addressing & Subnets](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Subnets.html)<br>• [VPC Architecture Design Best Practices](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/welcome.html) | Hoàn thành sơ đồ ma trận mạng (Network CIDR Matrix) cho 6 Subnets trên 2 AZs. |
| **Thứ 3** | • Khởi tạo Custom VPC `Custom-RAG-VPC` với dải CIDR `10.0.0.0/16` qua AWS CLI.<br>• Kích hoạt tính năng `enableDnsHostnames` và `enableDnsSupport` cho VPC.<br>• Tạo 2 Public Subnets và 4 Private/Isolated Subnets tại `ap-southeast-1a` và `ap-southeast-1b`. | 18/08/2026 | 18/08/2026 | • [Creating a VPC using AWS CLI](https://docs.aws.amazon.com/vpc/latest/userguide/create-vpc-cli.html)<br>• [AWS Multi-AZ Subnet Planning Guide](https://docs.aws.amazon.com/whitepapers/latest/real-time-communication-on-aws/high-availability-and-multi-az.html) | 6 Subnets được tạo thành công, gắn thẻ Tagging quy chuẩn theo tiêu chuẩn AWS Well-Architected. |
| **Thứ 4** | • Khởi tạo Internet Gateway `Custom-RAG-IGW` và liên kết (attach) trực tiếp vào Custom VPC.<br>• Tạo Public Route Table `Public-RTB`, tạo route `0.0.0.0/0` trỏ tới Internet Gateway.<br>• Gắn kết (associate) 2 Public Subnet vào `Public-RTB`. | 19/08/2026 | 19/08/2026 | • [Internet Gateways in Amazon VPC](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html)<br>• [Configuring Route Tables](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html) | Các tài nguyên trong Public Subnet sẵn sàng khả năng trao đổi hai chiều với mạng Internet. |
| **Thứ 5** | • Khởi tạo máy ảo EC2 kiểm thử trong Public Subnet và một máy ảo trong Private Subnet.<br>• Kiểm tra bảng định tuyến nội bộ: Kiểm tra khả năng gửi gói tin giữa hai máy ảo khác Subnet qua IP nội bộ `10.0.x.x`.<br>• Xác minh máy ảo Private không thể bị truy cập trực tiếp từ Internet. | 20/08/2026 | 20/08/2026 | • [Amazon VPC Peering & Routing Scenarios](https://docs.aws.amazon.com/vpc/latest/peering/peering-configurations-full-access.html)<br>• [Amazon VPC Network Troubleshooting](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Troubleshooting.html) | Đường truyền mạng nội bộ giữa các AZs ổn định với độ trễ cực thấp (<1ms). |
| **Thứ 6** | • Cấu hình mô hình chuỗi tường lửa an toàn (**Security Group Chaining**):<br>  1. `ALB-SG`: Chỉ mở Inbound cổng 80/443 từ `0.0.0.0/0`.<br>  2. `EC2-App-SG`: Chỉ cho phép Inbound cổng 8000 (Backend) và 3000 (Frontend) xuất phát từ `ALB-SG`.<br>  3. `Database-SG`: Chỉ cho phép Inbound cổng 5432 (PostgreSQL) và 6333 (Qdrant) xuất phát từ `EC2-App-SG`. | 21/08/2026 | 21/08/2026 | • [Security Group Rules Reference](https://docs.aws.amazon.com/vpc/latest/userguide/security-group-rules-reference.html)<br>• [Zero Trust Architecture on AWS](https://aws.amazon.com/security/zero-trust/) | Thiết lập thành công ranh giới Zero-Trust: Database và Compute được bảo vệ hoàn toàn khỏi Internet. |
| **Thứ 7 - CN** | • Đo lường thông lượng và kiểm tra bảng định tuyến bằng các công cụ mạng `traceroute`, `nc` (Netcat).<br>• Tổng hợp sơ đồ kiến trúc mạng VPC và viết báo cáo kỹ thuật Tuần 3. | 22/08/2026 | 23/08/2026 | • [Network ACLs Overview](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)<br>• [Cloud Journey Networking Module](https://cloudjourney.awsstudygroup.com/) | Bàn giao hạ tầng mạng VPC hoàn chỉnh theo đúng kế hoạch TTTN-02. |

---

### 3. Thao tác kỹ thuật & Mã lệnh cấu hình thực tế (Hands-on Labs & CLI)

#### 3.1. Khởi tạo Custom VPC và bật phân giải tên miền DNS:
```bash
# 1. Khởi tạo VPC với CIDR /16
VPC_ID=$(aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --region ap-southeast-1 \
    --query 'Vpc.VpcId' \
    --output text)

# Gắn nhãn tên cho VPC
aws ec2 create-tags --resources $VPC_ID --tags Key=Name,Value=Custom-RAG-VPC

# 2. Kích hoạt phân giải DNS Hostnames
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames "{\"Value\":true}"
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-support "{\"Value\":true}"
```

#### 3.2. Khởi tạo Subnets trên 2 Availability Zones:
```bash
# Tạo Public Subnet 1 tại ap-southeast-1a
PUB_SUB1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.1.0/24 \
    --availability-zone ap-southeast-1a \
    --query 'Subnet.SubnetId' --output text)
aws ec2 create-tags --resources $PUB_SUB1 --tags Key=Name,Value=Public-Subnet-1a
aws ec2 modify-subnet-attribute --subnet-id $PUB_SUB1 --map-public-ip-on-launch

# Tạo Isolated Database Subnet 1 tại ap-southeast-1a
ISO_SUB1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.100.0/24 \
    --availability-zone ap-southeast-1a \
    --query 'Subnet.SubnetId' --output text)
aws ec2 create-tags --resources $ISO_SUB1 --tags Key=Name,Value=Isolated-DB-Subnet-1a
```

#### 3.3. Cấu hình Internet Gateway và Bảng định tuyến (Route Table):
```bash
# 1. Tạo Internet Gateway và gắn vào VPC
IGW_ID=$(aws ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 create-tags --resources $IGW_ID --tags Key=Name,Value=Custom-RAG-IGW
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID

# 2. Tạo Route Table cho Public Subnet và thêm tuyến đường 0.0.0.0/0 trỏ tới IGW
RTB_PUB=$(aws ec2 create-route-table --vpc-id $VPC_ID --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-tags --resources $RTB_PUB --tags Key=Name,Value=Public-RouteTable
aws ec2 create-route --route-table-id $RTB_PUB --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID

# 3. Liên kết Public Subnet vào Route Table
aws ec2 associate-route-table --subnet-id $PUB_SUB1 --route-table-id $RTB_PUB
```

#### 3.4. Cấu hình Security Group Chaining (Zero-Trust Firewall Matrix):
```bash
# Tạo Security Group cho RDS PostgreSQL
DB_SG=$(aws ec2 create-security-group \
    --group-name "RDS-PostgreSQL-SG" \
    --description "Security group for RDS instance isolated" \
    --vpc-id $VPC_ID \
    --query 'GroupId' --output text)

# Chỉ cho phép cổng 5432 đi vào từ Security Group của EC2 App Server (không mở ra dải IP)
aws ec2 authorize-security-group-ingress \
    --group-id $DB_SG \
    --protocol tcp \
    --port 5432 \
    --source-group $EC2_APP_SG
```

---

### 4. Thách thức kỹ thuật & Cách giải quyết sự cố (Challenges & Troubleshooting)

* **Sự cố 1: Máy ảo EC2 trong Public Subnet không nhận được Public IPv4 khi khởi chạy.**
  * *Triệu chứng:* Khi tạo máy ảo EC2 trong `Public-Subnet-1a`, instance chỉ có địa chỉ Private IP (`10.0.1.x`), không có trường Public IPv4, dẫn đến không thể SSH từ Internet.
  * *Phân tích nguyên nhân (Root Cause):* Trong Custom VPC do người dùng tự tạo, cờ `MapPublicIpOnLaunch` của Subnet mặc định ở trạng thái `false` (khác với Default VPC của AWS vốn đặt cờ này là `true`).
  * *Giải pháp khắc phục:* Bật cờ tự động cấp phát IP công cộng cho toàn bộ Public Subnets qua lệnh:
    ```bash
    aws ec2 modify-subnet-attribute --subnet-id $PUB_SUB1 --map-public-ip-on-launch
    ```
    Các instance khởi chạy sau đó đều tự động nhận Public IPv4.

* **Sự cố 2: Không thể kết nối từ máy ảo EC2 sang CSDL trong Isolated Subnet.**
  * *Triệu chứng:* Lệnh kiểm tra kết nối `nc -zv 10.0.100.25 5432` báo timeout liên tục.
  * *Phân tích nguyên nhân:* Người dùng cấu hình nhầm Inbound rule của Database Security Group dựa trên Private IP cố định của EC2 (`10.0.10.15/32`). Khi EC2 stop/start hoặc triển khai lại, IP này thay đổi làm luật tường lửa mất tác dụng.
  * *Giải pháp khắc phục:* Áp dụng giải pháp **Security Group Chaining**: Gán `Source` của Inbound Rule là ID của `EC2-App-SG` thay vì một địa chỉ IP tĩnh. Nhờ cơ chế tham chiếu định danh (Security Group Reference), mọi instance được gắn `EC2-App-SG` đều tự động được phép kết nối an toàn mà không phụ thuộc vào IP thay đổi.

---

### 5. Kết quả đạt được & Sản phẩm bàn giao (Deliverables)
1. **Hạ tầng mạng Custom VPC chuẩn hóa:** Dải mạng `10.0.0.0/16` hoàn thiện với 6 Subnets phân bổ trên 2 Availability Zones, đảm bảo độ sẵn sàng cao (High Availability).
2. **Kiến trúc phân tầng bảo mật Zero-Trust:** Phân định ranh giới rõ ràng giữa Public (ALB), Private (Compute) và Isolated (Data), cô lập hoàn toàn CSDL khỏi các mối đe dọa mạng công cộng.
3. **Cơ chế Security Group Chaining:** Tối ưu hóa chính sách tường lửa động, sẵn sàng làm nền tảng triển khai cho toàn bộ hệ thống RAG Capstone.
