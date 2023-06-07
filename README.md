# Elasticache implementation

**Table of content:**
 - [Objective](#objective)
 - [Code Changes](#code-changes)
 - [Decisions Made](#decisions)
 - [Test Results](#test-results)

<a id="objective"></a>
## Objective
The objective of this project is to implement a charging engine for a telecom system, specifically targeting the balance verification and deduction operations for prepaid subscribers. The goal is to ensure accurate and consistent balance calculations while maintaining low latency.

<a id="code-changes"></a>
## Code Changes
In this project, we made several code changes to enhance the charging engine:

- Implemented the use of Memcached commands GETS and CAS instead of GET and DECR to address racing conditions during concurrent calls.
- Adjusted the response handling logic to return the same response as when the user doesn't have enough credit, avoiding resource-related issues.

<a id="decisions"></a>
## Decisions Made
During the development process, we made the following key decisions:

- Chose Memcached over Redis as the in-memory caching solution to prioritize simplicity and performance in this context.
- Opted to return the same response as when the user doesn't have enough credit to avoid resource problems, considering the impact on downstream systems.
- Conducted manual testing using POST requests via Postman to simulate concurrent calls and verify the behavior of the service. This decision was made to ensure timely completion of the task, as conducting automated and load tests would have required additional time and resources.


<a id="test-results"></a>
## Test results:
The test results indicate the effectiveness of the changes made to the charging engine:

- Concurrent Call Testing: We manually changed the CAS token to reproduce invalid concurrent calls and verified that the service responded with an `"isAuthorized": false` response in those cases.
- Performance Monitoring: We used CloudWatch Logs Insights to analyze the execution time and ensure it stayed within the desired budget.

![](/media/no-balance-call.png)


![](/media/successfull-call.png)

**CloudWatch Logs Insights**  
region: us-east-1  
log-group-names: /aws/lambda/memcached-stack-charge_request_memcached-lambda-fn  
start-time: -10800s  
end-time: 0s  
query-string:
```

        filter @type = "REPORT"
        
        | fields @timestamp as Timestamp, @requestId as RequestID, @logStream as LogStream, @duration as DurationInMS, @billedDuration as BilledDurationInMS, @memorySize/1000000 as MemorySetInMB, @maxMemoryUsed/1000000 as MemoryUsedInMB
        | sort Timestamp desc
        | head 50
    
```
---
| Timestamp | RequestID | LogStream | DurationInMS | BilledDurationInMS | MemorySetInMB | MemoryUsedInMB |
| --- | --- | --- | --- | --- | --- | --- |
| 2023-06-07 16:19:18.819 | bec2091e-9273-4d07-8c14-7019342fccb0 | 2023/06/07/[$LATEST]6f7d48edb8734614a5cff736a2bab461 | 2.95 | 3.0 | 128 | 71 |
| 2023-06-07 16:19:17.700 | 39519b30-1e7b-49eb-acb2-b26d888ab8e9 | 2023/06/07/[$LATEST]6f7d48edb8734614a5cff736a2bab461 | 3.33 | 4.0 | 128 | 71 |
| 2023-06-07 16:19:16.236 | 6ddb169b-a465-4a68-a72e-9f1b327acb8e | 2023/06/07/[$LATEST]6f7d48edb8734614a5cff736a2bab461 | 15.17 | 16.0 | 128 | 71 |
| 2023-06-07 16:19:14.576 | fa1d15ce-2ac5-4d43-b4fb-a4d996e75ed8 | 2023/06/07/[$LATEST]6f7d48edb8734614a5cff736a2bab461 | 7.57 | 8.0 | 128 | 71 |
| 2023-06-07 16:19:13.175 | f57d0747-59b6-41e8-b56f-6a2d6769e74a | 2023/06/07/[$LATEST]6f7d48edb8734614a5cff736a2bab461 | 20.98 | 21.0 | 128 | 71 |
| 2023-06-07 16:19:12.738 | 5932a680-dc32-4b29-b204-b944ec3743e7 | 2023/06/07/[$LATEST]6f7d48edb8734614a5cff736a2bab461 | 251.89 | 252.0 | 128 | 71 |
| 2023-06-07 16:19:11.875 | c9187f3e-c31c-485f-8fb9-d743f2a925f8 | 2023/06/07/[$LATEST]6f7d48edb8734614a5cff736a2bab461 | 272.77 | 273.0 | 128 | 71 |
| 2023-06-07 16:18:52.631 | a5fe0b4d-7fc0-45c2-a6da-58b9ca55510a | 2023/06/07/[$LATEST]6f7d48edb8734614a5cff736a2bab461 | 4.04 | 5.0 | 128 | 71 |
| 2023-06-07 16:18:51.935 | 127496ec-20cb-490e-afdf-ae6f4c65b134 | 2023/06/07/[$LATEST]6f7d48edb8734614a5cff736a2bab461 | 20.33 | 21.0 | 128 | 71 |
| 2023-06-07 16:18:51.255 | 09e2c6fa-1a96-40b9-8934-36d3dd4dd102 | 2023/06/07/[$LATEST]6f7d48edb8734614a5cff736a2bab461 | 66.33 | 67.0 | 128 | 71 |
| 2023-06-07 16:18:50.217 | f241cbf4-d8e7-49a4-b881-f1be9adf8f90 | 2023/06/07/[$LATEST]6f7d48edb8734614a5cff736a2bab461 | 15.34 | 16.0 | 128 | 70 |
| 2023-06-07 16:18:49.396 | 41aa0ed5-8d44-4235-b55d-40e6aea5a892 | 2023/06/07/[$LATEST]6f7d48edb8734614a5cff736a2bab461 | 268.88 | 269.0 | 128 | 70 |
---

