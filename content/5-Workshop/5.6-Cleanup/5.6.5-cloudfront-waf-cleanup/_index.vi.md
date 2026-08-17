---
title: "Xóa CloudFront & AWS WAF"
date: 2026-07-21
weight: 5
chapter: false
pre: " <b> 5.6.5. </b> "
---

# 5.6.5. Dọn dẹp CloudFront & AWS WAF

### 1. Dọn dẹp Amazon CloudFront Distribution

1. Truy cập dịch vụ **Amazon CloudFront** -> chọn **Distributions**.
2. Chọn Distribution đã khởi tạo cho ứng dụng, nhấn **Disable** để vô hiệu hóa phân phối.

![Vô hiệu hóa CloudFront Distribution](/images/5-Workshop/cleanup/image11.png)

![Xác nhận vô hiệu hóa CloudFront Distribution](/images/5-Workshop/cleanup/image12.png)

3. **Lưu ý**: Đợi khoảng 5 - 10 phút để quá trình vô hiệu hóa (Disabled) hoàn tất trên toàn mạng lưới Edge Location của AWS. Sau đó, nút **Delete** sẽ sáng lên và bạn nhấn **Delete** để xóa Distribution.

![Xóa CloudFront Distribution sau khi vô hiệu hóa](/images/5-Workshop/cleanup/image13.png)

---

### 2. Dọn dẹp AWS WAF & Shield

1. Truy cập dịch vụ **AWS WAF & Shield** -> chọn **Web ACLs**.
2. Chọn Web ACL đã tạo (Ví dụ: `CreatedByCloudFront-56a8180e`), nhấn **Actions** -> chọn **Manage resources**.
3. Thực hiện **Disassociate** để hủy liên kết Web ACL khỏi CloudFront Distribution, sau đó nhấn **Delete** để xóa hẳn Web ACL.

![Quản lý liên kết Web ACL](/images/5-Workshop/cleanup/image14.png)

![Xóa Web ACL trong AWS WAF](/images/5-Workshop/cleanup/image15.png)
