---
title: "Provisioning Cognito User Pool"
date: 2026-07-21
weight: 1
chapter: false
pre: " <b> 5.2.1. </b> "
---

# 5.2.1. Provisioning Amazon Cognito User Pool

1. In the AWS Console search bar, type **Cognito** and select **Amazon Cognito**.

![Search Cognito](/images/5-Workshop/img_A/image3.png)

![Amazon Cognito Console](/images/5-Workshop/img_A/image4.png)

2. Select **Single-page application (SPA)** and set the application name to `FightingGame`.

![Configure SPA Application](/images/5-Workshop/img_A/image7.png)

3. Under **Username**, check **Enable Self-registration** to allow players to register.
4. Under **Required attributes for sign-up**, select **email**.

![Configure Registration Attributes](/images/5-Workshop/img_A/image8.png)

5. Click **Create user directory**. Once created:
   * **User pool ID**: `ap-southeast-1_phYoaMUPC`
   * Under **App clients**, select `FightingGame` to view the **Client ID** (e.g., `73ipqvvo7h3u0j3elfqlj23jo3`).

![View User Pool ID](/images/5-Workshop/img_A/image11.png)

![View App Client ID](/images/5-Workshop/img_A/image12.png)

6. Click **Edit** under App client `FightingGame`, enable `ALLOW_USER_PASSWORD_AUTH`, and click **Save changes**.

![Enable ALLOW_USER_PASSWORD_AUTH](/images/5-Workshop/img_A/image14.png)
