---
title: "Chuẩn bị Môi trường & Hạ tầng Mạng VPC Zero-Trust"
date: 2026-08-25
weight: 1
chapter: false
pre: " <b> 5.1. </b> "
aliases:
  - /5-workshop/5.1-vpc-network/
  - /5-Workshop/5.1-vpc-network/
---

# 5.1. Chuẩn bị Môi trường & Hạ tầng Mạng VPC Zero-Trust

### Tổng quan bài Lab 5.1

Trong kiến trúc hệ thống **Enterprise Knowledge AI RAG Assistant**, hạ tầng mạng đóng vai trò là "tuyến phòng thủ đầu tiên" bảo vệ toàn bộ dữ liệu tài liệu nội bộ, cơ sở dữ liệu Vector và các dịch vụ AI trước các nguy cơ tấn công từ không gian mạng. 

Bài lab 5.1 tập trung xây dựng một hạ tầng đám mây biệt lập tuân thủ nghiêm ngặt nguyên tắc **Zero-Trust Network Architecture** và mô hình **Multi-AZ (Multi-Availability Zone)** nhằm bảo đảm tính sẵn sàng cao (High Availability - HA) và khả năng chịu lỗi (Fault Tolerance).

---

### Danh sách các nội dung triển khai:

1. [**5.1.1. Khởi tạo Multi-AZ VPC & Phân vùng Subnets**](#511-khởi-tạo-multi-az-vpc--phân-vùng-subnets)
2. [**5.1.2. Cấu hình Security Groups & Phân quyền IAM Role**](#512-cấu-hình-security-groups--phân-quyền-iam-role) *(Tiếp theo)*
3. [**5.1.3. Khởi tạo Amazon S3 Document Lake & Mã hóa**](#513-khởi-tạo-amazon-s3-document-lake--mã-hóa) *(Tiếp theo)*

---

## 5.1.1. Khởi tạo Multi-AZ VPC & Phân vùng Subnets

### 1. Mục tiêu kỹ thuật
* Khởi tạo **Virtual Private Cloud (VPC)** với không gian địa chỉ IPv4 độc lập `10.0.0.0/16` (cung cấp 65,536 địa chỉ IP riêng) tại khu vực Châu Á - Thái Bình Dương (**ap-southeast-1 - Singapore**).
* Thiết kế phân vùng mạng **Multi-AZ** trải dài qua 2 Availability Zones (`ap-southeast-1a` và `ap-southeast-1b`).
* Phân tách ranh giới an ninh thành 2 tầng mạng chuyên biệt:
  * **Tầng Public Subnet**: Tiếp nhận lưu lượng truy cập từ người dùng Internet thông qua Internet Gateway (IGW) đến Application Load Balancer (ALB).
  * **Tầng Private Subnet**: Đặt toàn bộ tài nguyên xử lý nghiệp vụ nhạy cảm (EC2 Backend/Frontend RAG, Qdrant Vector Engine, RDS PostgreSQL), cô lập hoàn toàn khỏi Internet công cộng.
* Tích hợp **VPC Gateway Endpoint cho Amazon S3** (`project-vpce-s3`) giúp các ứng dụng trong Private Subnet truy xuất bucket tài liệu qua đường truyền nội bộ của AWS, tối ưu chi phí và gia tăng bảo mật mà không cần mở cổng ra ngoài Internet.

---

### 2. Bảng thông số quy hoạch địa chỉ IP (Network CIDR Plan)

| Tên tài nguyên (Resource Name) | Loại Subnet (Type) | Availability Zone (AZ) | Dải CIDR IPv4 | Khả dụng (Usable IPs) | Vai trò / Dịch vụ gán kết |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MyProjectVPC** | VPC | ap-southeast-1 | `10.0.0.0/16` | 65,531 | Mạng ảo cô lập toàn hệ thống |
| **project-subnet-public1-ap-southeast-1a** | Public | ap-southeast-1a | `10.0.0.0/20` | 4,091 | ALB Listener node 1, Bastion host |
| **project-subnet-public2-ap-southeast-1b** | Public | ap-southeast-1b | `10.0.16.0/20` | 4,091 | ALB Listener node 2 (Cân bằng tải HA) |
| **project-subnet-private1-ap-southeast-1a** | Private | ap-southeast-1a | `10.0.128.0/20` | 4,091 | RAG Server (EC2 App, FastAPI, Next.js) |
| **project-subnet-private2-ap-southeast-1b** | Private | ap-southeast-1b | `10.0.144.0/20` | 4,091 | RDS Database Subnet Group, Qdrant Node |

> [!NOTE]
> AWS bảo lưu trước 5 địa chỉ IP trong mỗi Subnet cho các mục đích: Network address (.0), VPC Router (.1), DNS Server (.2), Future use (.3), và Network Broadcast (.255). Do đó với dải `/20` (4,096 địa chỉ), số lượng IP thực tế khả dụng là 4,091 địa chỉ.

---

### 3. Các bước triển khai chi tiết & Bằng chứng thực tế (Evidence)

#### Bước 1: Chọn AWS Region triển khai
Trước khi khởi tạo tài nguyên, đảm bảo tài khoản AWS Console đang làm việc tại Region **Asia Pacific (Singapore) - `ap-southeast-1`** nhằm tối ưu hóa độ trễ kết nối (RTT < 40ms từ Việt Nam).

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.1-region.png" alt="Xác định AWS Region Singapore ap-southeast-1" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 50%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.1.1: Lựa chọn Region ap-southeast-1 (Singapore) trên thanh điều hướng AWS Console</em></p>
</div>

---

#### Bước 2: Khởi tạo VPC bằng công cụ "VPC and more"
1. Truy cập **VPC Dashboard** $\rightarrow$ chọn **Create VPC**.
2. Chọn chế độ cấu hình: **VPC and more** (tự động liên kết các thành phần VPC, Subnets, Route Tables, Internet Gateway và Gateway Endpoint trong một luồng trực quan duy nhất).
3. Thiết lập thông số:
   * **Name tag auto-generation**: `project` (hoặc `MyProjectVPC`).
   * **IPv4 CIDR block**: `10.0.0.0/16`.
   * **Number of Availability Zones (AZs)**: `2` (`ap-southeast-1a`, `ap-southeast-1b`).
   * **Number of public subnets**: `2`.
   * **Number of private subnets**: `2`.
   * **NAT Gateways**: `None` (hoặc cấu hình theo nhu cầu chi phí bài lab).
   * **VPC Endpoints**: Chọn **S3 Gateway** (Tạo kết nối riêng tới S3 không tốn phí truyền dữ liệu).
   * **DNS Options**: Đánh dấu chọn cả hai mục:
     * `Enable DNS hostnames` $\rightarrow$ gán DNS công khai/riêng cho các instance.
     * `Enable DNS resolution` $\rightarrow$ cho phép phân giải tên miền nội bộ AWS.
4. Bấm **Create VPC** và chờ hệ thống hoàn tất quy trình khởi tạo.

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.1-create-vpc-workflow.png" alt="Quy trình Create VPC workflow thành công" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.1.2: Bằng chứng Create VPC workflow hoàn tất thành công tất cả 18 tác vụ khởi tạo tài nguyên mạng</em></p>
</div>

**Kết quả ghi nhận từ Console:**
* **VPC ID**: `vpc-03228d0b15b9ea7be`
* **Internet Gateway ID**: `igw-0073a2eaacf097953` (Đã đính kèm tự động vào VPC)
* **S3 Gateway Endpoint**: `vpce-0678e967918a415a9` (Tự động liên kết vào bảng định tuyến Private)

---

#### Bước 3: Kiểm chứng sơ đồ liên kết tài nguyên (VPC Resource Map)
Kiểm tra sơ đồ liên kết tổng quan để xác thực tính toàn vẹn của cấu trúc mạng:
* 4 Subnets được phân bố cân bằng đồng đều trên cả 2 Availability Zones (`ap-southeast-1a` và `ap-southeast-1b`).
* Các Public Subnets được định tuyến thông qua Bảng định tuyến công khai (`project-rtb-public`) trỏ tới Internet Gateway (`project-igw`).
* Các Private Subnets được gắn kết với bảng định tuyến riêng (`project-rtb-private1` và `project-rtb-private2`), kết nối trực tiếp đến Gateway Endpoint S3 (`project-vpce-s3`).

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.1-vpc-resource-map.png" alt="Sơ đồ phân phối tài nguyên VPC Resource Map" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.1.3: Sơ đồ trực quan hóa tài nguyên VPC Resource Map của hệ thống Enterprise RAG</em></p>
</div>

---

#### Bước 4: Kiểm tra danh sách Subnets đã cấu hình
Truy cập menu **Subnets** trên VPC Console và lọc theo VPC `vpc-03228d0b15b9ea7be`:

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.1-subnets-list.png" alt="Danh sách các Subnets trong VPC" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.1.4: Minh chứng danh sách 4 Subnets đang ở trạng thái Available với dải CIDR chuẩn xác</em></p>
</div>

* Chi tiết ánh xạ Subnet ID:
  * `project-subnet-public1-ap-southeast-1a`: ID `subnet-06025e767c9a9773f` (`10.0.0.0/20`)
  * `project-subnet-public2-ap-southeast-1b`: ID `subnet-0cf27fbea7085c1bd` (`10.0.16.0/20`)
  * `project-subnet-private1-ap-southeast-1a`: ID `subnet-04cde8fcdfa2085c1` (`10.0.128.0/20`)
  * `project-subnet-private2-ap-southeast-1b`: ID `subnet-046b6b0378aee9b2a` (`10.0.144.0/20`)

---

#### Bước 5: Cấu hình và kiểm chứng bảng định tuyến (Route Tables)
Truy cập menu **Route Tables** để kiểm tra các quy tắc định tuyến luồng dữ liệu:

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.1-route-tables-list.png" alt="Danh sách Route Tables trong VPC" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.1.5: Danh sách 4 Bảng định tuyến (Public, Private AZ1, Private AZ2 và Main RTB)</em></p>
</div>

1. **Bảng định tuyến Public (`project-rtb-public` - `rtb-0ec121079ba5f5110`)**:
   * Kiểm tra tab **Routes**: Tuyến đường `0.0.0.0/0` phải có Target là Internet Gateway `igw-0073a2eaacf097953` và trạng thái `Active`.
   * Tuyến đường nội bộ `10.0.0.0/16` có Target là `local` phục vụ giao tiếp giữa các subnet.

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.1-public-rtb-routes.png" alt="Chi tiết bảng định tuyến Public trỏ ra Internet Gateway" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.1.6: Chi tiết quy tắc định tuyến Public Route Table chuyển hướng 0.0.0.0/0 qua Internet Gateway</em></p>
</div>

2. **Bảng định tuyến Private (`project-rtb-private1-ap-southeast-1a` & `project-rtb-private2-ap-southeast-1b`)**:
   * Không chứa tuyến đường `0.0.0.0/0` trỏ ra IGW (cách ly hoàn toàn khỏi inbound Internet).
   * Chứa tuyến đường tự động Prefix List tới dịch vụ S3 thông qua Gateway Endpoint `vpce-0678e967918a415a9`.

---

#### Bước 6: Kiểm chứng trạng thái hạ tầng mạng bằng AWS CLI
Để đảm bảo hạ tầng mạng đã sẵn sàng hoạt động ở cấp độ lập trình/tự động hóa, thực thi lệnh `aws ec2 describe-vpcs` từ terminal dòng lệnh:

```bash
aws ec2 describe-vpcs \
  --region ap-southeast-1 \
  --query "Vpcs[].{VpcId:VpcId,Cidr:CidrBlock,State:State}" \
  --output table
```

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.1-cli-vpc-verify.png" alt="Kiểm chứng trạng thái VPC từ Terminal CLI" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.1.7: Kết quả truy vấn AWS CLI xác nhận VPC vpc-03228d0b15b9ea7be đang ở trạng thái Available</em></p>
</div>

* Kết quả trả về thực tế:
```text
---------------------------------------------------------
|                     DescribeVpcs                      |
+--------------+------------+---------------------------+
|     Cidr     |   State    |           VpcId           |
+--------------+------------+---------------------------+
|  10.0.0.0/16 |  available |  vpc-03228d0b15b9ea7be    |
+--------------+------------+---------------------------+
```

---

---

## 5.1.2. Cấu hình Security Groups & Phân quyền IAM Role

### 1. Mục tiêu kỹ thuật
* Thiết kế mô hình an ninh mạng đa tầng (**Defense-in-Depth / Zero-Trust**) sử dụng **Security Groups (Tường lửa trạng thái - Stateful Firewalls)** nhằm kiểm soát chặt chẽ lưu lượng ra/vào giữa các tầng dịch vụ.
* Đảm bảo nguyên tắc cô lập: Cơ sở dữ liệu quan hệ (RDS PostgreSQL) và kho lưu trữ vector (Qdrant) chỉ nhận kết nối trực tiếp từ tầng ứng dụng (EC2 RAG Server), tuyệt đối không mở cổng ra Internet.
* Khởi tạo **IAM Role `EC2-S3-RAG`** tuân thủ nguyên tắc đặc quyền tối thiểu (**Principle of Least Privilege**), cho phép máy chủ EC2 tự động xác thực với Amazon S3 và Amazon ECR thông qua dịch vụ AWS Security Token Service (STS) mà không cần nhúng (hard-code) Access Key/Secret Key trong mã nguồn.

---

### 2. Bảng ma trận cấu hình Security Groups (Zero-Trust Firewall Matrix)

| Tên Security Group | Nhóm tài nguyên áp dụng | Quy tắc Inbound (Port / Giao thức) | Nguồn cho phép (Source) | Mục đích nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| **rag-alb-sg** | Application Load Balancer | Port 80 (HTTP)<br>Port 443 (HTTPS) | `0.0.0.0/0` (Internet) | Tiếp nhận truy cập từ người dùng cuối bên ngoài |
| **rag-ec2-sg**<br>(`sg-0c1e9bf71b2ec5149`) | Máy chủ EC2 RAG App<br>(`enterprise-rag-server`) | Port 22 (SSH)<br>Port 3000 (Next.js)<br>Port 8000 (FastAPI)<br>Port 6333 (Qdrant) | My IP / Personal IP<br>`rag-alb-sg` / VPC CIDR<br>`rag-alb-sg` / VPC CIDR<br>VPC CIDR (`10.0.0.0/16`) | Quản trị từ xa bảo mật<br>Giao diện ứng dụng người dùng<br>API Engine AI tra cứu RAG<br>Vector Database Search nội bộ |
| **rag-rds-sg**<br>(`sg-0e06a5a9265f5c77d`) | Cơ sở dữ liệu RDS PostgreSQL<br>(`rag-db`) | Port 5432 (PostgreSQL) | **`rag-ec2-sg` duy nhất** | Cô lập dữ liệu, chỉ cho phép EC2 RAG Server truy vấn |

> [!IMPORTANT]
> **Nguyên tắc Chaining Security Group**: Thay vì cho phép dải IP tĩnh hoặc `0.0.0.0/0`, quy tắc Inbound của `rag-rds-sg` trỏ thẳng tới định danh của `rag-ec2-sg`. Nhờ đó, dù IP của EC2 thay đổi trong quá trình Auto Scaling hoặc Stop/Start, kết nối an toàn vẫn được duy trì mà không tạo ra bất kỳ lỗ hổng nào.

---

### 3. Các bước triển khai chi tiết & Bằng chứng thực tế (Evidence)

#### Bước 1: Khởi tạo và khảo sát danh sách Security Groups
Truy cập **EC2 Management Console** $\rightarrow$ chọn **Security Groups** và lọc theo VPC `vpc-03228d0b15b9ea7be`:

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.2-security-groups-list.png" alt="Danh sách Security Groups trong hệ thống" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.2.1: Bảng tổng hợp các Security Groups đại diện cho từng tầng kiến trúc trong VPC</em></p>
</div>

* Các định danh quan trọng:
  * `rag-ec2-sg`: ID `sg-0c1e9bf71b2ec5149` (Bảo vệ máy chủ ứng dụng RAG).
  * `rag-rds-sg`: ID `sg-0e06a5a9265f5c77d` (Bảo vệ cơ sở dữ liệu quan hệ RDS).

---

#### Bước 2: Cấu hình quy tắc Inbound cho máy chủ EC2 (`rag-ec2-sg`)
1. Chọn `rag-ec2-sg` $\rightarrow$ chọn tab **Inbound rules** $\rightarrow$ bấm **Edit inbound rules**.
2. Thiết lập danh sách các cổng phục vụ ứng dụng RAG Assistant:
   * **Cổng 22 (SSH)**: Giới hạn theo IP của quản trị viên để bảo mật truy cập terminal.
   * **Cổng 3000 (Custom TCP)**: Mở cho ứng dụng giao diện Next.js Web Frontend.
   * **Cổng 8000 (Custom TCP)**: Mở cho ứng dụng FastAPI RAG Core Backend API.
   * **Cổng 6333 (Custom TCP)**: Mở cho Qdrant Vector Engine phục vụ các truy vấn tương đồng ngữ nghĩa.

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.2-ec2-sg-inbound-rules.png" alt="Cấu hình Inbound Rules cho rag-ec2-sg" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.2.2: Chi tiết cấu hình các quy tắc Inbound Rules trên Security Group máy chủ EC2</em></p>
</div>

---

#### Bước 3: Cấu hình quy tắc Inbound bảo vệ Cơ sở dữ liệu RDS (`rag-rds-sg`)
1. Chọn Security Group `rag-rds-sg` (ID: `sg-0e06a5a9265f5c77d`) $\rightarrow$ tab **Inbound rules**.
2. Thiết lập quy tắc kiểm soát truy cập nghiêm ngặt vào cổng cơ sở dữ liệu:
   * **Type**: `PostgreSQL`
   * **Protocol**: `TCP`
   * **Port range**: `5432`
   * **Rule ID**: `sgr-0b5ff64975fd5ba9c`
   * **Source**: Giới hạn nghiêm ngặt chỉ tiếp nhận từ máy chủ ứng dụng RAG (hoặc IP bảo mật của quản trị viên), cô lập hoàn toàn khỏi truy cập bên ngoài Internet.

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.2-rds-sg-inbound-rules.png" alt="Cấu hình Inbound Rules cho rag-rds-sg" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.2.3: Bằng chứng cấu hình Inbound Rules cổng 5432 trên Security Group rag-rds-sg bảo vệ cơ sở dữ liệu</em></p>
</div>

---

#### Bước 4: Khởi tạo IAM Role cho EC2 Server
1. Truy cập **IAM Console** $\rightarrow$ chọn **Roles** $\rightarrow$ bấm **Create role**.
2. Tại mục **Trusted entity type**, chọn **AWS service**.
3. Tại mục **Use case**, chọn dịch vụ **EC2** (Cho phép máy chủ EC2 đại diện người dùng thực thi các API nội bộ của AWS).

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.2-iam-role-select-service.png" alt="Chọn Use case EC2 trong IAM Role" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.2.4: Lựa chọn Trusted entity loại AWS service với Use case là EC2</em></p>
</div>

4. Đặt tên Role là **`EC2-S3-RAG`**, nhập mô tả `role cho EC2 cua du an RAG`.
5. Kiểm tra chính sách tin cậy (**Trust Policy**):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "sts:AssumeRole"
            ],
            "Principal": {
                "Service": [
                    "ec2.amazonaws.com"
                ]
            }
        }
    ]
}
```

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.2-iam-role-name-trust-policy.png" alt="Đặt tên và xác thực Trust Policy của IAM Role" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.2.5: Đặt tên Role EC2-S3-RAG và kiểm tra Trust Relationship</em></p>
</div>

---

#### Bước 5: Gán chính sách phân quyền (Permissions Policies)
Để hỗ trợ toàn diện luồng nghiệp vụ RAG và quy trình CI/CD tự động, role `EC2-S3-RAG` được gán 2 quyền AWS Managed Policies:
1. **`AmazonS3FullAccess`**: Cung cấp quyền đọc/ghi tài liệu vào Document Lake S3 (`enterprise-rag-storage-0117967`) cho dịch vụ xử lý văn bản Celery Worker & FastAPI.
2. **`AmazonEC2ContainerRegistryReadOnly`**: Cung cấp quyền cho Docker trên máy chủ EC2 xác thực và kéo (pull) các Image Container mới nhất từ Amazon ECR mà không cần lưu thông tin đăng nhập tĩnh.

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.2-iam-role-s3-policy.png" alt="Gán chính sách AmazonS3FullAccess cho Role" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.2.6: Gán quyền truy xuất S3 Document Lake cho IAM Role</em></p>
</div>

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.2-iam-role-completed-policies.png" alt="Hoàn thiện cấu hình Permissions Policies cho Role" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.2.7: Thông báo Policy was successfully attached to role với 2 chính sách S3FullAccess và ECRReadOnly</em></p>
</div>

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.2-iam-roles-list.png" alt="Danh sách các IAM Roles trong tài khoản" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.2.8: IAM Role EC2-S3-RAG hiển thị sẵn sàng trong bảng quản trị IAM Roles</em></p>
</div>

---

#### Bước 6: Đính kèm IAM Role vào máy chủ EC2 (`enterprise-rag-server`)
1. Truy cập **EC2 Console** $\rightarrow$ **Instances** $\rightarrow$ chọn máy chủ `enterprise-rag-server` (ID: `i-0e3f096f3de681aaa`).
2. Chọn menu **Actions** $\rightarrow$ **Security** $\rightarrow$ **Modify IAM role**.
3. Tại trường **IAM role**, chọn role **`EC2-S3-RAG`** vừa tạo.
4. Bấm **Update IAM role** để lưu thay đổi.

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.2-attach-iam-role-to-ec2.png" alt="Đính kèm IAM Role vào máy chủ EC2" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.2.9: Gán thành công Role EC2-S3-RAG vào EC2 instance thông qua hộp thoại Modify IAM role</em></p>
</div>

> [!TIP]
> Nhờ việc gắn IAM Role trực tiếp vào Instance Profile của EC2, ứng dụng Python và Celery có thể sử dụng thư viện `boto3.client('s3')` để đọc ghi bucket hoàn toàn trong suốt (Transparent Authentication), tự động nhận Token tạm thời có hạn dùng ngắn từ dịch vụ AWS STS Instance Metadata Service v2 (IMDSv2).

---

## 5.1.3. Khởi tạo Amazon S3 Document Lake & Mã hóa

### 1. Mục tiêu kỹ thuật
* Khởi tạo **Amazon S3 Bucket** đóng vai trò là kho lưu trữ dữ liệu tập trung (Data Lake) cho tất cả các tài liệu nguồn của doanh nghiệp (PDF quy chế, DOCX hợp đồng, tài liệu kỹ thuật).
* Đảm bảo tính bảo mật dữ liệu tuyệt đối thông qua việc kích hoạt cơ chế **Block Public Access (100% Private)** và mã hóa dữ liệu tại chỗ (**Server-Side Encryption SSE-S3 / AES-256**).
* Thiết lập cấu trúc phân cấp thư mục tiền tố (Prefix Architecture) để phân tách trạng thái xử lý dữ liệu:
  * `documents/draff/` (hoặc `draft/`): Lưu trữ tạm thời các file tải lên từ Web giao diện trước khi đưa vào hàng đợi xử lý.
  * `documents/real/`: Lưu trữ các tài liệu chính thức đã hoàn tất trích xuất nội dung và nhúng chỉ mục Vector.

---

### 2. Thông số kỹ thuật của S3 Document Lake

| Thuộc tính (Property) | Giá trị cấu hình thực tế | Ý nghĩa an toàn & Vận hành |
| :--- | :--- | :--- |
| **Bucket Name** | `enterprise-rag-storage-0117967` | Tên định danh toàn cầu (Globally Unique) |
| **AWS Region** | `ap-southeast-1` (Singapore) | Đặt cùng Region với VPC và EC2 để đạt tốc độ tối đa qua Gateway Endpoint |
| **Block Public Access** | **On (Block ALL public access)** | Ngăn chặn hoàn toàn việc rò rỉ dữ liệu tài liệu ra bên ngoài Internet |
| **Bucket Versioning** | Disabled / Suspended | Tối ưu dung lượng lưu trữ cho tài liệu nghiên cứu |
| **Default Encryption** | **SSE-S3 (AES-256)** | Tự động mã hóa mọi đối tượng (Object) khi ghi vào đĩa lưu trữ của AWS |
| **Bucket Policy / Endpoint** | Restricted to VPC Endpoint | Chỉ cho phép lưu lượng mạng từ VPC thông qua `vpce-0678e967918a415a9` |

---

### 3. Các bước triển khai chi tiết & Bằng chứng thực tế (Evidence)

#### Bước 1: Khởi tạo S3 Bucket qua AWS Management Console
1. Truy cập **Amazon S3 Console** $\rightarrow$ chọn **Create bucket**.
2. Thiết lập thông số:
   * **Bucket name**: `enterprise-rag-storage-0117967`.
   * **AWS Region**: `Asia Pacific (Singapore) ap-southeast-1`.
   * **Object Ownership**: ACLs disabled (recommended).
   * **Block Public Access settings for this bucket**: Đánh dấu chọn `Block all public access`.
   * **Bucket Versioning**: Disable.
   * **Default encryption**: Server-side encryption with Amazon S3 managed keys (SSE-S3), Bucket Key: Enable.
3. Bấm **Create bucket**.

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.3-s3-bucket-created.png" alt="Khởi tạo thành công S3 Bucket enterprise-rag-storage-0117967" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.3.1: Thông báo Successfully created bucket "enterprise-rag-storage-0117967" trên AWS Console</em></p>
</div>

---

#### Bước 2: Kiểm chứng cấu hình bảo mật Block Public Access (100% Private)
Truy cập tab **Permissions** của bucket `enterprise-rag-storage-0117967` để xác thực toàn bộ các thiết lập khóa truy cập công khai:
* **Block all public access**: Đang ở trạng thái **`On`**.
* Cơ chế này đảm bảo chặn đứng mọi nguy cơ rò rỉ dữ liệu tài liệu nội bộ của doanh nghiệp ra môi trường mạng mở.

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.3-s3-block-public-access.png" alt="Kiểm chứng cấu hình Block Public Access cho S3 Bucket" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.3.2: Xác nhận trạng thái Block all public access: On trên giao diện quản trị quyền của S3</em></p>
</div>

---

#### Bước 3: Thiết lập cấu trúc thư mục tiền tố phân cấp (Prefix Folders)
Truy cập tab **Objects** của bucket `enterprise-rag-storage-0117967` để tạo và quản lý các thư mục nghiệp vụ:
* `draff/`: Thư mục chứa các tài liệu nháp/tạm tải lên, chuẩn bị đưa vào tiến trình phân tích tách đoạn (Chunking).
* `real/`: Thư mục chứa các tài liệu chính thức đã hoàn tất Ingestion và đánh chỉ mục vector.

<div align="center">
  <img src="/images/5-Workshop/5.1/5.1.3-s3-folder-structure.png" alt="Cấu trúc thư mục tiền tố draff và real trong S3" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 95%; height: auto; margin-bottom: 20px;" />
  <p><em>Hình 5.1.3.3: Cấu trúc phân cấp tiền tố draff/ và real/ phục vụ pipeline RAG Ingestion</em></p>
</div>

---

#### Bước 4: Kiểm chứng truy cập S3 từ máy chủ EC2 qua IAM Role
Đăng nhập SSH vào máy chủ EC2 RAG Server và thực thi lệnh kiểm tra phân quyền truy cập S3 mà không cần cung cấp bất kỳ API key nào:

```bash
# Kiểm tra danh sách các bucket trong tài khoản
aws s3 ls

# Kiểm tra quyền truy cập vào Document Lake bucket
aws s3 ls s3://enterprise-rag-storage-0117967/
```

* Kết quả thực thi cho thấy máy chủ EC2 tự động kế thừa quyền từ IAM Role `EC2-S3-RAG`, liệt kê danh mục tài liệu thành công:
```text
2026-09-13 16:20:15 enterprise-rag-storage-0117967
PRE draff/
PRE real/
```

---

### Tóm kết Lab 5.1:
Sau khi hoàn tất Lab 5.1, toàn bộ hạ tầng nền tảng chuẩn **Zero-Trust Enterprise** đã được thiết lập vững chắc:
1. Mạng ảo **VPC Multi-AZ** `10.0.0.0/16` đã sẵn sàng với các phân vùng mạng tách bạch rõ ràng.
2. Hệ thống **Security Groups** và **IAM Role** đã cấu hình chuẩn chỉ, khép kín các cổng dịch vụ nội bộ và phân quyền đặc quyền tối thiểu.
3. Hồ lưu trữ **S3 Document Lake** `enterprise-rag-storage-0117967` đã hoạt động, kích hoạt Block Public Access 100%, tổ chức phân cấp thư mục tiền tố `draff/` và `real/`, kết nối trực tiếp với Private Subnet thông qua VPC Gateway Endpoint.

Toàn bộ hệ sinh thái này đã sẵn sàng để bước sang **Lab 5.2: Triển khai Tầng Dữ liệu & Vector Database (RDS PostgreSQL & Qdrant)**.

