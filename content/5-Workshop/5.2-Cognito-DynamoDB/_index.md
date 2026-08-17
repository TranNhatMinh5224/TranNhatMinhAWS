---
title: "Amazon Cognito & DynamoDB Setup"
date: 2026-07-21
weight: 2
chapter: false
pre: " <b> 5.2. </b> "
aliases:
  - /5-workshop/5.1-serverless-game-backend/5.1.2-cognito-dynamodb/
  - /5-workshop/5.1-Serverless-Game-Backend/5.1.2-cognito-dynamodb/
---

# 5.2. Amazon Cognito & DynamoDB Setup

In this section, we will configure an **Amazon Cognito User Pool & Identity Pool** to handle player authentication and authorize S3 asset downloads. Then, we will create two **Amazon DynamoDB** tables: one for the matchmaking queue (`MatchmakingQueue`) and another for live matches (`ActiveMatches`).

---

### Detailed Modules:

* **[5.2.1. Provisioning Amazon Cognito User Pool](5.2.1-cognito-user-pool/)**
* **[5.2.2. Provisioning Amazon Cognito Identity Pool](5.2.2-cognito-identity-pool/)**
* **[5.2.3. Provisioning Amazon DynamoDB Tables](5.2.3-dynamodb-tables/)**
