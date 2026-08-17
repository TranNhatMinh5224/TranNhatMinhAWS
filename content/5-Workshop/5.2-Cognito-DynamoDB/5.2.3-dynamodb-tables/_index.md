---
title: "Provisioning DynamoDB Tables"
date: 2026-07-21
weight: 3
chapter: false
pre: " <b> 5.2.3. </b> "
---

# 5.2.3. Provisioning Amazon DynamoDB Tables

We will create two DynamoDB tables to track matchmaking states:

#### Table 1: `MatchmakingQueue`
1. Navigate to **DynamoDB** and click **Create table**.
2. Configure settings:
   * **Table name**: `MatchmakingQueue`
   * **Partition key**: `playerId` (Data type: **String**)
   * **Sort key**: Leave empty
   * **Table settings**: Keep **Default settings**
3. Scroll down and click **Create table**.

![Create MatchmakingQueue Table](/images/5-Workshop/img_A/image27.png)

#### Table 2: `ActiveMatches`
1. Click **Create table** again.
2. Configure settings:
   * **Table name**: `ActiveMatches`
   * **Partition key**: `playerId` (Data type: **String**)
   * **Sort key**: Leave empty
   * **Table settings**: Keep **Default settings**
3. Click **Create table**.

![Create ActiveMatches Table](/images/5-Workshop/img_A/image28.png)

4. Verify table list: Both `MatchmakingQueue` and `ActiveMatches` display **Active** status.

![Active DynamoDB Tables](/images/5-Workshop/img_A/image29.png)
