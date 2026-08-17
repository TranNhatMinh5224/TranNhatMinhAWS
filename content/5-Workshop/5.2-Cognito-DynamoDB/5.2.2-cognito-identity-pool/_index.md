---
title: "Provisioning Cognito Identity Pool"
date: 2026-07-21
weight: 2
chapter: false
pre: " <b> 5.2.2. </b> "
---

# 5.2.2. Provisioning Amazon Cognito Identity Pool

1. Return to the main Cognito console, navigate to **Identity pools**, and click **Create identity pool**.

![Create Identity Pool](/images/5-Workshop/img_A/image17.png)

2. Select **Authenticated access** and choose **Amazon Cognito user pool** as the provider. Click **Next**.

![Configure Authenticated Access](/images/5-Workshop/img_A/image19.png)

3. Under **Configure permissions**, choose **Create a new IAM Role**, set the IAM role name to `FightingGameAuthenticatedRole`, and click **Next**.

![Create IAM Role](/images/5-Workshop/img_A/image20.png)

4. Enter your **User pool ID** and **App Client ID** to connect the Identity Provider. Click **Next**.

![Connect Identity Provider](/images/5-Workshop/img_A/image21.png)

5. Set the Identity Pool Name to `FightingGameIdentityPool` and click **Create identity pool**.
   * **Identity pool ID**: `ap-southeast-1:a5d743b9-e4a4-45d2-9cb1-9d214cee574c`

![View Identity Pool ID](/images/5-Workshop/img_A/image24.png)
