---
title: "Cleaning up CloudFront & AWS WAF"
date: 2026-07-21
weight: 5
chapter: false
pre: " <b> 5.6.5. </b> "
---

# 5.6.5. Cleaning up CloudFront & AWS WAF

### 1. Clean up Amazon CloudFront Distribution

1. Navigate to **Amazon CloudFront** -> **Distributions**.
2. Select your application distribution and click **Disable** to suspend edge traffic routing.

![Disable CloudFront Distribution](/images/5-Workshop/cleanup/image11.png)

![Confirm Disabling CloudFront Distribution](/images/5-Workshop/cleanup/image12.png)

3. **Note**: Wait approximately 5 to 10 minutes for status propagation across AWS Edge locations until the status changes to **Disabled**. Once enabled, the **Delete** button will activate; click **Delete** to remove the distribution.

![Delete CloudFront Distribution](/images/5-Workshop/cleanup/image13.png)

---

### 2. Clean up AWS WAF & Shield

1. Navigate to **AWS WAF & Shield** -> **Web ACLs**.
2. Select your Web ACL (e.g., `CreatedByCloudFront-56a8180e`), click **Actions** -> **Manage resources**.
3. Click **Disassociate** to unbind the Web ACL from your CloudFront distribution, then click **Delete** to permanently remove the Web ACL.

![Manage Web ACL Association](/images/5-Workshop/cleanup/image14.png)

![Delete Web ACL in AWS WAF](/images/5-Workshop/cleanup/image15.png)
