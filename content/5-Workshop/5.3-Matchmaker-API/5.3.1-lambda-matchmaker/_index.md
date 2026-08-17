---
title: "Provisioning Lambda Matchmaker"
date: 2026-07-21
weight: 1
chapter: false
pre: " <b> 5.3.1. </b> "
---

# 5.3.1. Provisioning AWS Lambda Matchmaker

1. Navigate to **AWS Lambda** and click **Create a function**.
2. Select **Author from scratch**, set Function Name to `FightingGameMatchmaker`, and select the Node.js Runtime.

![Create Lambda Function](/images/5-Workshop/img_A/image31.png)

3. Under **Configuration** -> **Permissions** -> click the IAM Role Name link to open the IAM Console.

![Configure Lambda Role](/images/5-Workshop/img_A/image33.png)

4. Click **Add permissions** -> **Create inline policy**.
5. Paste the JSON policy granting DynamoDB read/write access to `MatchmakingQueue` and `ActiveMatches`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-southeast-1:*:table/MatchmakingQueue",
        "arn:aws:dynamodb:ap-southeast-1:*:table/ActiveMatches"
      ]
    }
  ]
}
```

6. Name the policy and click **Create policy**. Verify that the policy is attached.

![Policy Attached to Lambda Role](/images/5-Workshop/img_A/image40.png)

7. Back in the Lambda Console, navigate to **Configuration** -> **Environment variables** -> **Edit** and add:
   * `QUEUE_TABLE`: `MatchmakingQueue`
   * `MATCH_TABLE`: `ActiveMatches`

![Set Environment Variables](/images/5-Workshop/img_A/image41.png)

8. Navigate to **Code**, paste the matchmaking logic handler, and click **Deploy**.
9. Test the function using sample payloads for Player 1 and Player 2. Verify that `200 OK` is returned and player queue entries are processed.

![Player 1 Test Success](/images/5-Workshop/img_A/image46.png)

![Player 2 Test Success](/images/5-Workshop/img_A/image50.png)
