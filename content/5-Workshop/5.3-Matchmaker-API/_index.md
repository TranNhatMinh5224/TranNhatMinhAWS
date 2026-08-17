---
title: "Lambda Matchmaker & API Gateway"
date: 2026-07-21
weight: 3
chapter: false
pre: " <b> 5.3. </b> "
aliases:
  - /5-workshop/5.1-serverless-game-backend/5.1.3-matchmaker-api/
  - /5-workshop/5.1-Serverless-Game-Backend/5.1.3-matchmaker-api/
---

# 5.3. Deploying AWS Lambda Matchmaker & API Gateway REST API

In this section, we will create the **AWS Lambda Matchmaker** function (`FightingGameMatchmaker`) handling the matchmaking logic (`POST /join` and `GET /check`), grant appropriate IAM DynamoDB permissions, and expose the endpoints via **Amazon API Gateway** protected by a **Cognito Authorizer** and **CORS**.

---

### Detailed Modules:

* **[5.3.1. Provisioning AWS Lambda Matchmaker](5.3.1-lambda-matchmaker/)**
* **[5.3.2. Provisioning Amazon API Gateway REST API](5.3.2-api-gateway/)**
