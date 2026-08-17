---
title: "Blog 1"
date: 2026-07-14
weight: 1
chapter: false
pre: " <b> 3.1. </b> "
---

# INNOVATION SANDBOX TRÊN AWS VỚI BẢNG ĐIỀU KHIỂN PHÂN TÍCH THỜI GIAN THỰC

Giải pháp **Innovation Sandbox trên AWS** cung cấp một môi trường thử nghiệm an toàn, cho phép các nhóm phát triển và người tham gia sự kiện (như hackathon) tự do sáng tạo mà không ảnh hưởng đến tài nguyên production của doanh nghiệp. Điểm nổi bật là việc tích hợp bảng điều khiển phân tích thời gian thực (Real-Time Analytics Dashboard) cùng trợ lý thông minh **Amazon Q Business** để hỗ trợ tự phục vụ (Self-service).

### Các điểm chính của giải pháp:

*   **Tự động cấp phát tài khoản (Automated Account Provisioning)**: Sử dụng AWS Control Tower và AWS Organizations để tạo tài khoản sandbox riêng biệt một cách nhanh chóng dựa trên cấu trúc OU.
*   **Bảng điều khiển tự phục vụ (Self-service Dashboard)**: Được xây dựng bằng HTML/CSS/JS tĩnh lưu trữ trên S3, phân phối qua CloudFront và quản lý hạ tầng bằng AWS CDK.
*   **Amazon Q Business**: Tích hợp trợ lý AI giúp người dùng tìm kiếm tài liệu, giải đáp thắc mắc và tương tác với hệ thống sandbox thông qua giao diện hội thoại (với API Gateway và Lambda).
*   **Phân tích & Giám sát**: Dữ liệu từ các tài khoản sandbox được đồng bộ về tài khoản quản trị (Management Account), hiển thị trực quan các số liệu thống kê thời gian thực.
*   **Đảm bảo an toàn**: Cấu hình chặt chẽ với IAM, Service Control Policies (SCPs) và giám sát tập trung bằng CloudWatch, CloudTrail.

![Kiến trúc Innovation Sandbox](/images/3-BlogsPosted/blog1.png)

---

*   **Link bài viết**: [Facebook Post](https://www.facebook.com/share/p/17mx6WgTf9/)
*   **Link tham khảo**: [AWS Blog - Innovation Sandbox on AWS](https://aws.amazon.com/vi/blogs/mt/innovation-sandbox-on-aws-with-real-time-analytics-dashboard/)