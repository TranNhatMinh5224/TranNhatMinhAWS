---
title: "Blog 3"
date: 2026-07-14
weight: 1
chapter: false
pre: " <b> 3.3. </b> "
---

# CẤP PHÁT TÀI NGUYÊN ORACLE DATABASE@AWS BẰNG TERRAFORM

Giải pháp **Oracle Database@AWS** cho phép doanh nghiệp vận hành cơ sở dữ liệu doanh nghiệp Oracle Enterprise Database trực tiếp trên hạ tầng Exadata được đồng vị trí (co-located) bên trong các trung tâm dữ liệu của AWS. Nhờ đó, các ứng dụng chạy trên Amazon EC2 có thể truy xuất dữ liệu với độ trễ cực thấp. Để quản lý và tự động hóa quy trình này, **Terraform** được sử dụng như một công cụ IaC (Infrastructure as Code) đắc lực.

### Các thành phần chính của giải pháp:

*   **Customer VPC (AWS Cloud)**: Nơi chạy các máy chủ ứng dụng Amazon EC2. Các máy chủ này giao tiếp trực tiếp với cơ sở dữ liệu Oracle thông qua đường truyền **ODB peering** độ trễ thấp.
*   **ODB Network**: Phân vùng mạng trung gian kết nối giữa AWS VPC và mạng OCI Child site, chứa Client Subnet và Backup Subnet để phân tách lưu lượng.
*   **OCI Child Site**: Đặt ngay trong trung tâm dữ liệu AWS, chạy hạ tầng chuyên dụng **Exadata Infrastructure** nằm trong mạng ảo OCI Virtual Cloud Network (VCN).
*   **OCI Parent Region & Automation**: Quản lý điều khiển OCI Child site thông qua **OCI Control Plane** để tự động hóa cấu hình và cập nhật.
*   **Triển khai bằng Terraform**: Sử dụng Terraform providers để tự động hóa toàn bộ việc khởi tạo VPC Peering, cấu hình route table, định cấu hình hạ tầng Exadata VM Cluster và các cơ sở dữ liệu một cách nhất quán.

![Kiến trúc Oracle Database@AWS](/images/3-BlogsPosted/blog3.png)

---

*   **Link bài viết**: [Facebook Post](https://www.facebook.com/share/p/1DZnVk6ZYL/)
*   **Link tham khảo**: [AWS Database Blog - Provision Oracle Database@AWS with Terraform](https://aws.amazon.com/vi/blogs/database/provision-oracle-databaseaws-resources-using-terraform/)