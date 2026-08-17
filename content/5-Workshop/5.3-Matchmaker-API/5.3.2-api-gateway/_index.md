---
title: "Provisioning API Gateway REST API"
date: 2026-07-21
weight: 2
chapter: false
pre: " <b> 5.3.2. </b> "
---

# 5.3.2. Provisioning Amazon API Gateway REST API

1. Navigate to **Amazon API Gateway** and click **Create API**.
2. Select **REST API** and click **Build**.

![Create REST API](/images/5-Workshop/img_A/image55.png)

3. Set API Name to `FightingGameAPI`, Endpoint Type to **Regional**, and click **Create API**.

![REST API Created](/images/5-Workshop/img_A/image58.png)

4. **Create `/join` Resource**:
   * Click **Create resource**, set Resource Name to `join`.
   * Create a **POST** method on `/join`, set Integration Type to **Lambda Function**, and link to `FightingGameMatchmaker`.

![Create /join Resource](/images/5-Workshop/img_A/image60.png)

![Link POST Method to Lambda](/images/5-Workshop/img_A/image65.png)

5. **Create `/check` Resource**:
   * Select root `/`, click **Create resource**, set Resource Name to `check`.
   * Create a **GET** method on `/check` linked to `FightingGameMatchmaker`.

![GET /check Created](/images/5-Workshop/img_A/image70.png)

6. **Create Cognito Authorizer**:
   * On the left sidebar, click **Authorizers** -> **Create authorizer**.
   * Set Name to `FightinggameCognitoAuthorizer`, Type to **Cognito**, select your User Pool, and set Token Source to `Authorization`. Click **Create authorizer**.

![Create Cognito Authorizer](/images/5-Workshop/img_A/image71.png)

7. **Attach Authorizer to Methods**:
   * Under `/join` (POST), click **Edit**, set **Authorization** to `FightinggameCognitoAuthorizer`, and click **Save**.
   * Repeat for `/check` (GET).

![Attach Cognito Authorizer](/images/5-Workshop/img_A/image74.png)

8. **Enable CORS**:
   * Select `/join`, click **Enable CORS**, check **Default 4xx, 5xx** and **POST**.
   * Repeat for `/check` (GET). Click **Save**.

![CORS Enabled](/images/5-Workshop/img_A/image81.png)

9. **Deploy API**:
   * Select root `/`, click **Deploy API**.
   * Set Stage name to `prod` and click **Deploy**.
   * Copy the generated **Invoke URL** (e.g., `https://6whg1d5qca.execute-api.ap-southeast-1.amazonaws.com/prod`).

![API Deployed Successfully](/images/5-Workshop/img_A/image85.png)
