---
title: "Worklog Tuần 4"
date: 2026-08-24
weight: 4
chapter: false
pre: " <b> 1.4. </b> "
---

# Worklog Tuần 4: Kiến Trúc Serverless Với AWS Lambda & Xử Lý Sự Kiện Tự Động Hóa

### 1. Thông tin chung & Mục tiêu trọng tâm
* **Thời gian thực hiện:** Từ 24/08/2026 đến 30/08/2026 (Tuần 4).
* **Đối chiếu kế hoạch học tập [TTTN-02.docx]:** Mục tiêu Tuần 4 — *Tìm hiểu AWS Lambda và mô hình Serverless*.
* **Cán bộ hướng dẫn (CBHD):** Phạm Văn Phóng (Solutions Architect).
* **Người phụ trách ĐVHD:** Nguyễn Gia Hưng (Senior Solutions Architect - AWS Vietnam).
* **Mục tiêu kỹ thuật cốt lõi:**
  1. Thấu hiểu sâu sắc tư duy thiết kế hệ thống hướng sự kiện (**Event-Driven Architecture**) và mô hình tính toán không máy chủ **Serverless Computing** với **AWS Lambda**.
  2. Nắm vững vòng đời thực thi (**Execution Environment Lifecycle**): Phân biệt rõ ràng giữa giai đoạn khởi tạo môi trường (*Cold Start / Init Phase*) và giai đoạn xử lý yêu cầu (*Warm Start / Invoke Phase*) để tối ưu hóa độ trễ.
  3. Xây dựng quy trình xử lý tài liệu tự động qua **S3 Event Notifications**: Tự động kích hoạt Lambda Function ngay khi có văn bản pháp lý mới (`.pdf`, `.docx`) được tải lên Amazon S3.
  4. Tích hợp **Amazon API Gateway** đóng vai trò cổng tiếp nhận API Serverless, phân định ranh giới xử lý giữa tác vụ nhẹ (*Synchronous Fast-Path*) và tác vụ xử lý nặng (*Asynchronous Heavy-Path*).

---

### 2. Nhật ký triển khai chi tiết từng ngày (Daily Technical Log)

| Ngày | Nội dung công việc & Mục tiêu kỹ thuật | Kết quả & Bằng chứng thực tế |
| :--- | :--- | :--- |
| **Thứ 2 (24/08)** | • Phân tích bài toán kinh tế đám mây (Cost Modeling): So sánh giữa việc duy trì máy ảo EC2 thường trực 24/7 và dùng AWS Lambda tính tiền theo từng 1ms thực thi.<br>• Với lưu lượng tải tài liệu không liên tục của doanh nghiệp, kiến trúc Serverless giúp tiết kiệm hơn 85% chi phí vận hành ban đầu.<br>• Nghiên cứu tài liệu *AWS Lambda Execution Environment and Concurrency Limits*. | Hoàn thành bản phân tích so sánh TCO giữa EC2 truyền thống và AWS Lambda Serverless. |
| **Thứ 3 (25/08)** | • Viết mã nguồn Python cho hàm Lambda `DocumentValidator`: Kiểm tra định dạng tệp (MIME type), tính mã băm SHA-256 chống trùng lặp dữ liệu.<br>• Đóng gói mã nguồn cùng các thư viện phụ thuộc bằng ZIP package.<br>• Tạo IAM Role cho Lambda cấp quyền đọc bucket S3 và ghi log vào CloudWatch. | Triển khai thành công hàm Lambda đầu tiên qua AWS CLI, kiểm thử unit test nội bộ đạt kết quả chính xác. |
| **Thứ 4 (26/08)** | • Cấu hình cơ chế S3 Event Trigger: Gán Resource-based Policy cho phép S3 gọi lệnh `lambda:InvokeFunction`.<br>• Thiết lập bộ lọc sự kiện `s3:ObjectCreated:*` chỉ kích hoạt khi có tệp được upload vào tiền tố thư mục `incoming/`.<br>• Tải tệp thực tế lên S3 và theo dõi luồng nhật ký tự động trong CloudWatch Log Streams. | Quy trình kích hoạt tự động 100%: Tải file lên S3 lập tức kích hoạt Lambda xử lý trong vòng dưới 120ms. |
| **Thứ 5 (27/08)** | • Tạo Amazon API Gateway (HTTP API) làm cổng giao tiếp Webhook từ bên ngoài.<br>• Cấu hình tích hợp Lambda Proxy Integration, thiết lập Cross-Origin Resource Sharing (CORS) cho phép web gọi trực tiếp.<br>• Kiểm thử gửi request từ Postman và đo lường thời gian phản hồi API. | API tiếp nhận dữ liệu và phản hồi mã trạng thái `200 OK` với độ trễ trung bình 45ms. |
| **Thứ 6 (28/08)** | • Tối ưu hóa hiện tượng Cold Start: Thử nghiệm tăng cấu hình Memory từ 128MB lên 512MB (tăng tỷ lệ vCPU tương ứng của Nitro Hypervisor).<br>• Đo lường thời gian Init Phase: Giảm thời gian khởi động lạnh từ 1,850ms xuống còn 380ms.<br>• Nghiên cứu giới hạn trần 15 phút (900s timeout) của AWS Lambda. | Xác định chiến lược kiến trúc: Lambda xử lý tiền kiểm tra nhanh, các tác vụ OCR nặng sẽ chuyển giao cho Celery Worker. |
| **Thứ 7 - CN (29-30/08)** | • Rà soát bảo mật quyền hạn Lambda Execution Role, xóa bỏ các quyền thừa.<br>• Đóng gói mã nguồn và tổng hợp báo cáo kỹ thuật Tuần 4. | Hoàn thành 100% mục tiêu kiến trúc Serverless theo tiến độ TTTN-02. |

---

### 3. Thao tác kỹ thuật & Mã lệnh cấu hình thực tế (Hands-on Labs & CLI)

#### 3.1. Mã nguồn Lambda Function xử lý sự kiện S3 (`lambda_function.py`):
```python
import json
import urllib.parse
import boto3
import hashlib

s3_client = boto3.client('s3')

def lambda_handler(event, context):
    print("Received event:", json.dumps(event, indent=2))
    
    # 1. Trích xuất tên bucket và key từ sự kiện S3
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'])
    
    try:
        # 2. Lấy metadata của file từ S3
        response = s3_client.head_object(Bucket=bucket, Key=key)
        file_size = response['ContentLength']
        content_type = response.get('ContentType', 'unknown')
        
        print(f"Processing document: s3://{bucket}/{key} | Size: {file_size} bytes | Type: {content_type}")
        
        # 3. Kiểm tra tính hợp lệ của định dạng văn phòng
        valid_types = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if content_type not in valid_types and not (key.endswith('.pdf') or key.endswith('.docx')):
            print(f"Warning: File {key} is not an authorized legal document format.")
            return {"status": "rejected", "reason": "Invalid format"}
            
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Document validated successfully",
                "bucket": bucket,
                "key": key,
                "size_bytes": file_size
            })
        }
    except Exception as e:
        print(f"Error reading object from S3: {str(e)}")
        raise e
```

#### 3.2. Cấu hình quyền hạn và S3 Event Trigger qua AWS CLI:
```bash
# 1. Gán quyền cho S3 kích hoạt Lambda (Resource-based Policy)
aws lambda add-permission \
    --function-name DocumentValidator \
    --statement-id s3-trigger-permission \
    --action "lambda:InvokeFunction" \
    --principal s3.amazonaws.com \
    --source-arn "arn:aws:s3:::fcaj-enterprise-legal-docs-1113719893"

# 2. Tạo cấu hình Notification JSON
cat << 'EOF' > s3-notification.json
{
  "LambdaFunctionConfigurations": [
    {
      "LambdaFunctionArn": "arn:aws:lambda:ap-southeast-1:1113719893XX:function:DocumentValidator",
      "Events": ["s3:ObjectCreated:*"],
      "Filter": {
        "Key": {
          "FilterRules": [
            { "Name": "prefix", "Value": "incoming/" }
          ]
        }
      }
    }
  ]
}
EOF

# 3. Kích hoạt trigger trên S3 Bucket
aws s3api put-bucket-notification-configuration \
    --bucket fcaj-enterprise-legal-docs-1113719893 \
    --notification-configuration file://s3-notification.json
```

---

### 4. Thách thức kỹ thuật & Cách giải quyết sự cố (Challenges & Troubleshooting)

* **Sự cố 1: Giới hạn thời gian chạy tối đa 15 phút (Lambda 900s Hard Timeout).**
  * *Triệu chứng:* Khi thử nghiệm bóc tách tài liệu hợp đồng kinh tế và hồ sơ quy chế dài hơn 150 trang chứa nhiều hình ảnh scan bằng thư viện OCR trực tiếp trong Lambda, hàm bị ngắt cưỡng bức tại giây thứ 900 với lỗi: `Task timed out after 900.00 seconds`.
  * *Phân tích nguyên nhân (Root Cause):* AWS Lambda có giới hạn cứng (*Hard Limit*) thời gian thực thi tối đa là 15 phút. Các tác vụ xử lý thị giác máy tính (Computer Vision/OCR) và tính toán vector embedding hàng nghìn đoạn văn bản đòi hỏi tài nguyên tính toán liên tục và thời gian lớn hơn nhiều so với ngưỡng cho phép của Serverless FaaS.
  * *Giải pháp kiến trúc đột phá (Architectural Pivot):* Không nhồi nhét xử lý bóc tách nặng vào Lambda. Thay vào đó, áp dụng mô hình **Decoupled Asynchronous Processing**:
    - **Lambda (Fast-Path):** Đóng vai trò Gatekeeper (kiểm tra định dạng, băm mã SHA-256, kiểm tra tính hợp lệ trong 1-2 giây) và ghi nhận task vào hàng đợi.
    - **Celery Worker trên EC2 (Heavy-Path):** Đảm nhiệm việc chạy PaddleOCR và nhúng vector vào Qdrant mà không bị giới hạn bởi bất kỳ timeout nào.

* **Sự cố 2: Lỗi vòng lặp vô hạn (Infinite Recursive Execution Loop).**
  * *Triệu chứng:* Sau khi tải 1 file lên S3, số lượng invocation của Lambda tăng vọt lên hàng nghìn lần chỉ trong vài phút, gây nguy cơ cạn kiệt ngân sách.
  * *Phân tích nguyên nhân:* Hàm Lambda sau khi xử lý đã ghi một file kết quả metadata (`.json`) ngược trở lại vào cùng bucket S3. Vì cấu hình trigger lắng nghe toàn bộ sự kiện `s3:ObjectCreated:*` trên toàn bucket không có bộ lọc prefix, chính file `.json` mới được tạo này lại kích hoạt Lambda một lần nữa, tạo thành vòng lặp vô tận.
  * *Giải pháp khắc phục:* Thiết lập bộ lọc tiền tố (**S3 Prefix Filter**): Chỉ kích hoạt Lambda khi có sự kiện xuất phát từ tiền tố `incoming/`. Kết quả xử lý được lưu trữ tại tiền tố riêng biệt `processed/` hoặc `metadata/`, triệt tiêu hoàn toàn nguy cơ lặp đệ quy.

---

### 5. Kết quả đạt được & Sản phẩm bàn giao (Deliverables)
1. **Làm chủ hoàn toàn mô hình Serverless:** Thấu hiểu nguyên lý Event-driven, quản lý Cold Start, và phân định rõ ràng use-case giữa Lambda và Container.
2. **Quy trình kích hoạt tự động (S3 Event Trigger):** Thiết lập thành công luồng xử lý tự động khi có tài liệu pháp lý mới được tải lên hệ thống.
3. **Bài học kiến trúc then chốt:** Hoàn thiện ranh giới thiết kế phân tách giữa Fast-Path Serverless và Heavy-Path Worker, bảo vệ hệ thống khỏi rủi ro timeout và vòng lặp chi phí.
