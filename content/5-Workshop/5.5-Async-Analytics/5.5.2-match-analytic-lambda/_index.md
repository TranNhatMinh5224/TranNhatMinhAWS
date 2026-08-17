---
title: "MatchAnalytic Lambda Function"
date: 2026-07-21
weight: 2
chapter: false
pre: " <b> 5.5.2. </b> "
---

# 5.5.2. Provisioning & Connecting MatchAnalytic Lambda

1. Navigate to **AWS IAM** -> **Roles** -> **Create role**.
2. Select Trusted Entity: **AWS service** -> **Lambda**.
3. Name the role `MatchAnalyticLambdaRole`.
4. Attach an inline policy granting stream read permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:DescribeStream",
        "dynamodb:ListStreams"
      ],
      "Resource": "arn:aws:dynamodb:ap-southeast-1:*:table/ActiveMatches/stream/*"
    }
  ]
}
```

5. Navigate to **AWS Lambda** -> **Create function**.
6. Set Function name to `MatchAnalyticLambda`, attach IAM Role `MatchAnalyticLambdaRole`.
7. Click **Add trigger**, select **DynamoDB**.
8. Select table `ActiveMatches`, Batch size: `100`, Starting position: **Latest**. Click **Add**.

![Create MatchAnalytic Lambda & DynamoDB Stream Trigger](/images/5-Workshop/img_B/image8.png)

9. Paste the post-match log parser code under **Code** and click **Deploy**.
10. When a game match ends and updates DynamoDB, DynamoDB Streams trigger `MatchAnalyticLambda` to process and stream telemetry data directly to S3/analytics stores without incurring RTT latency overhead on active players.
