---
title: "Workshop"
date: 2026-07-21
weight: 5
chapter: false
pre: " <b> 5. </b> "
---

# Step-by-Step Guide: Building a Serverless & Event-Driven Game Backend on AWS

#### Workshop Overview

The Workshop modules are structured under main chapters **5.1** through **5.6** and sub-modules **5.x.y** below:

> [!NOTE]
> * **Live Web Demo Link**: [http://fighting-game-assets-508768431157.s3-website-ap-southeast-1.amazonaws.com/](http://fighting-game-assets-508768431157.s3-website-ap-southeast-1.amazonaws.com/)
> * **Source Code Repository**: [https://github.com/Nothingtoread/fighting-game/tree/main](https://github.com/Nothingtoread/fighting-game/tree/main)

---

#### Agenda:

1. [5.1. Prerequisites & Region Setup](5.1-prerequiste/)
2. [5.2. Amazon Cognito & DynamoDB Setup](5.2-cognito-dynamodb/)
   * [5.2.1. Provisioning Amazon Cognito User Pool](5.2-cognito-dynamodb/5.2.1-cognito-user-pool/)
   * [5.2.2. Provisioning Amazon Cognito Identity Pool](5.2-cognito-dynamodb/5.2.2-cognito-identity-pool/)
   * [5.2.3. Provisioning Amazon DynamoDB Tables](5.2-cognito-dynamodb/5.2.3-dynamodb-tables/)
3. [5.3. Lambda Matchmaker & API Gateway REST API Deployment](5.3-matchmaker-api/)
   * [5.3.1. Provisioning AWS Lambda Matchmaker](5.3-matchmaker-api/5.3.1-lambda-matchmaker/)
   * [5.3.2. Provisioning Amazon API Gateway REST API](5.3-matchmaker-api/5.3.2-api-gateway/)
4. [5.4. EC2 Spot Fleet, Launch Template & GitOps CodeDeploy Setup](5.4-ec2-fleet-gitops/)
   * [5.4.1. Sample EC2 Game Server & Baking AMI](5.4-ec2-fleet-gitops/5.4.1-ec2-ami/)
   * [5.4.2. Launch Template & Auto Scaling Group Warm Pool](5.4-ec2-fleet-gitops/5.4.2-spot-launch-template/)
   * [5.4.3. Amazon S3 Bucket & Static Website Hosting](5.4-ec2-fleet-gitops/5.4.3-s3-website/)
   * [5.4.4. GitHub OIDC & AWS CodeDeploy GitOps Pipeline](5.4-ec2-fleet-gitops/5.4.4-github-codedeploy/)
5. [5.5. Asynchronous Analytics with DynamoDB Streams & Lambda](5.5-async-analytics/)
   * [5.5.1. Enabling DynamoDB Streams](5.5-async-analytics/5.5.1-dynamodb-streams/)
   * [5.5.2. Creating & Connecting MatchAnalytic Lambda](5.5-async-analytics/5.5.2-match-analytic-lambda/)
6. [5.6. Resource Cleanup](5.6-cleanup/)
   * [5.6.1. Cleaning up Amazon Cognito](5.6-cleanup/5.6.1-cognito-cleanup/)
   * [5.6.2. Cleaning up Amazon DynamoDB](5.6-cleanup/5.6.2-dynamodb-cleanup/)
   * [5.6.3. Cleaning up AWS Lambda Functions](5.6-cleanup/5.6.3-lambda-cleanup/)
   * [5.6.4. Cleaning up Amazon API Gateway](5.6-cleanup/5.6.4-api-gateway-cleanup/)
   * [5.6.5. Cleaning up CloudFront & AWS WAF](5.6-cleanup/5.6.5-cloudfront-waf-cleanup/)
