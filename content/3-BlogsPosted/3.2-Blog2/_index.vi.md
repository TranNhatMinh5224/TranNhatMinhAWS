---
title: "Blog 2"
date: 2026-07-14
weight: 1
chapter: false
pre: " <b> 3.2. </b> "
---

# CÁCH LITHO LENS CỦA ALS GEOANALYTICS CÁCH MẠNG HÓA QUY TRÌNH GHI LOG MẪU LÕI BẰNG HỌC MÁY VỚI AMAZON EKS

Giải pháp **LithoLens của ALS Geoanalytics** là một hệ thống đột phá trong ngành khai thác địa chất, sử dụng Machine Learning (ML) để số hóa và phân tích hình ảnh mẫu lõi khoan (core logging) tự động. Bằng cách tận dụng các dịch vụ đám mây của AWS, đặc biệt là **Amazon EKS**, giải pháp này giúp tăng tốc độ xử lý từ vài tuần xuống còn vài giờ với độ chính xác cao.

### Các thành phần chính của kiến trúc:

*   **API Layer (Tầng API)**: Sử dụng **API Gateway** và **AWS Lambda** làm cổng giao tiếp bảo mật để nhận các yêu cầu tải ảnh mẫu lõi lên từ phía Client. Mọi kết nối được xác thực an toàn thông qua **Amazon Cognito**.
*   **Compute and Processing Layer (Tầng tính toán & xử lý)**: Sử dụng **Amazon Elastic Kubernetes Service (Amazon EKS)** làm nền tảng chạy các container chứa thuật toán Machine Learning. EKS tự động co giãn số lượng node để đáp ứng nhu cầu xử lý lượng lớn dữ liệu hình ảnh nặng cùng lúc.
*   **Storage Layer (Tầng lưu trữ & giám sát)**:
    *   **Amazon S3**: Lưu trữ hình ảnh mẫu lõi khoan thô và kết quả phân tích sau xử lý.
    *   **Amazon RDS**: Quản lý cơ sở dữ liệu quan hệ chứa thông tin dự án, siêu dữ liệu địa chất và thông tin người dùng.
    *   **Amazon CloudWatch**: Ghi log, theo dõi chỉ số hiệu năng và sức khỏe của toàn bộ hệ thống.

![Kiến trúc LithoLens trên AWS](/images/3-BlogsPosted/blog2.png)

---

*   **Link bài viết**: [Facebook Post](https://www.facebook.com/share/p/1DDNQBrNuD/)
*   **Link tham khảo**: [AWS Architecture Blog - ALS Geoanalytics LithoLens](https://aws.amazon.com/vi/blogs/architecture/how-als-geoanalytics-litholens-revolutionizes-core-logging-through-machine-learning-with-amazon-eks/)