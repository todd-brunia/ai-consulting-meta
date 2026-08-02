# Governed AI Sprint Delivery Orchestrator Cost Estimate

## Status and scope

**Planning estimate — 2026-08-02. Validate with the AWS Pricing Calculator and
measured pilot usage before approving a production budget.**

This document estimates the weekly AWS operating cost of the architecture in
the [implementation plan](./sprint-delivery-orchestrator-implementation-plan.md).
It assumes a single pilot deployment in `us-east-1`, prices in US dollars, and
the planned scale-to-zero behavior.

The estimate covers AWS infrastructure only. It excludes OpenAI API usage,
GitHub plans and Actions overages, engineering labor, taxes, AWS Support, and
free-tier credits. Those costs should be budgeted separately; model usage can
exceed the AWS infrastructure cost.

## Weekly planning range

| Usage scenario | Sprints per week | Issues per week | Estimated AWS cost per week |
| --- | ---: | ---: | ---: |
| Deployed but idle | 0 | 0 | **$1–$3** |
| Light | 2 sprints × 10 issues | 20 | **$2–$6** |
| Typical | 3 sprints × 15 issues | 45 | **$4–$11** |
| Heavy | 5 sprints × 20 issues | 100 | **$8–$22** |
| Inefficient or unusually chatty | 5 sprints × 20 issues | 100 | **$15–$35** |

Use **$8–$15 per week** as an initial operating expectation for regular pilot
use and **$25 per week** as a conservative AWS planning allowance. Set a
monthly AWS Budget alert at $75 initially and investigate any projection above
$100 per month.

These ranges are not a quote. The largest uncertainties are how long Aurora
remains awake, how much application logging is retained, and how often GitHub
events wake workers while builds and reviews are in progress.

## Workload and configuration assumptions

The ranges assume:

- One `1 vCPU / 2 GB` Linux/x86 Fargate worker normally, with at most two
  workers during safe concurrent execution.
- Between 15 and 45 minutes of aggregate worker runtime per issue. Workers
  stop while waiting for GitHub Actions, required checks, human review, or
  merge rather than polling continuously.
- Aurora Serverless v2 uses Aurora Standard storage, averages approximately
  `0.5–1.5 ACUs` while active, and automatically pauses at `0 ACUs` five
  minutes after the final connection closes.
- An initial Aurora dataset of 5–20 GB with moderate I/O and seven-day backup
  retention.
- DynamoDB on-demand capacity, low-volume API Gateway and Lambda traffic, and
  fewer than one million SQS requests per month.
- Three application secrets plus an AWS-managed Aurora master credential.
- Moderate structured CloudWatch logging with bounded retention and a small
  alarm set.
- Small ECR, S3 Terraform-state, and DynamoDB storage footprints.
- Low outbound data transfer and no NAT Gateway or load balancer.

The implementation should record actual Fargate task-seconds, Aurora ACU-hours,
log ingestion, model usage, and per-run counts so this estimate can be replaced
with measured cost per issue and cost per sprint.

## Typical-week cost composition

For approximately three 15-issue sprints in one week:

| Component | Estimated weekly cost | Primary cost basis |
| --- | ---: | --- |
| Aurora compute | **$1–$5** | Active ACU-hours and wake duration |
| Aurora storage, I/O, and backups | **$0.20–$1** | Stored GB, request I/O, backup growth |
| ECS Fargate and task public IPv4 | **$0.40–$1.50** | Worker vCPU, memory, duration, and IP-hours |
| CloudWatch | **$0.75–$2.50** | Log ingestion/retention, alarms, custom metrics |
| Secrets Manager | **about $0.30** | Stored secrets and low API-call volume |
| API Gateway, Lambda, SQS, and DynamoDB | **under $0.25** | Low-volume requests and duration |
| ECR, S3 state, and miscellaneous storage | **$0.10–$0.50** | Stored images and state versions |
| **Likely total** | **$4–$11** | Rounded planning range |

The component ranges are correlated and should not be interpreted as
independent maxima. The scenario total is the controlling estimate.

## Pricing basis

The estimate uses public on-demand pricing available on 2026-08-02:

- [Aurora pricing](https://aws.amazon.com/rds/aurora/pricing/) illustrates
  Aurora Serverless v2 Standard compute in US East (N. Virginia) at $0.12 per
  ACU-hour. One ACU provides approximately 2 GiB of memory with corresponding
  CPU and networking.
- [Aurora auto-pause
  documentation](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2-auto-pause.html)
  states that supported Aurora PostgreSQL versions can use a zero-ACU minimum.
  Paused instances do not incur instance-capacity charges, but cluster storage
  and other non-instance charges continue.
- [AWS Fargate pricing](https://aws.amazon.com/fargate/pricing/) bills requested
  vCPU and memory per second, with a one-minute minimum for Linux tasks. The
  estimate uses approximately $0.049 per hour for a `1 vCPU / 2 GB` Linux/x86
  task in `us-east-1` before related service charges.
- [Amazon VPC pricing](https://aws.amazon.com/vpc/pricing/) charges $0.005 per
  hour for each public IPv4 address attached to a Fargate task.
- [API Gateway pricing](https://aws.amazon.com/api-gateway/pricing/) prices HTTP
  API requests by usage, with no provisioned server fleet in this design.
- [Lambda pricing](https://aws.amazon.com/lambda/pricing/) charges by requests
  and execution duration and includes a monthly free tier.
- [SQS pricing](https://aws.amazon.com/sqs/pricing/) has no minimum charge and
  includes one million requests per month.
- [DynamoDB pricing](https://aws.amazon.com/dynamodb/pricing/) charges on-demand
  tables for consumed requests and stored data rather than reserved capacity.
- [Secrets Manager pricing](https://aws.amazon.com/secrets-manager/pricing/)
  lists $0.40 per secret per month plus API requests.
- [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/) charges for
  logs, alarms, and custom metrics; log ingestion is a key usage-sensitive
  part of this estimate.

AWS can change prices independently of this plan. Recalculate before the first
apply and at least quarterly during the pilot.

## Cost behavior by state

### Idle but available

The planned normal idle state leaves API Gateway, Lambda, SQS, DynamoDB,
Secrets Manager, ECR, S3 state, CloudWatch, and Aurora storage provisioned.
Fargate remains at desired count zero and Aurora automatically pauses. This
preserves webhook and operator ingress while avoiding continuous worker and
database compute charges.

The remaining $1–$3 weekly estimate primarily covers secrets, alarms, stored
logs and images, database storage/backups, and small request volumes.

### Active sprint processing

Ingress wakes up to two Fargate tasks. The workers resume Aurora, claim durable
work, perform orchestration, and stop after the queue and leases are clear.
Because implementation builds run in GitHub Actions, elapsed sprint duration
must not be treated as Fargate runtime. Waiting should be event-driven.

At the assumed worker size, Fargate plus its public IPv4 address costs roughly
$0.054 per running task-hour. Ten to 35 task-hours therefore cost about
$0.55–$1.90 before logs and other AWS services.

### Failure to pause

Aurora is the most important cost-control boundary. At $0.12 per ACU-hour, an
instance that stays active for all 168 hours in a week costs approximately:

- **$10.08 per week at 0.5 ACU**.
- **$20.16 per week at 1 ACU**.

Open connection pools, polling, frequent reconciliation, or a worker that does
not terminate can prevent the intended pause. The inefficient scenario range
includes this failure mode.

## Sensitivity and exclusions

### Model and GitHub execution

OpenAI planning, feasibility, review, and repair calls are excluded because
their cost depends on the selected model, token volume, cached-input behavior,
and number of repair cycles. GitHub-hosted Actions usage is also excluded
because included minutes and overage rates depend on repository ownership and
plan.

Track both costs per issue. A sprint estimate is incomplete if it reports only
AWS spend.

### Logging

Verbose payload logging can turn CloudWatch into the second-largest AWS cost.
Do not log raw model reasoning, credentials, webhook secrets, or complete
payloads. Use structured summaries, bounded retention, sampling for repetitive
events, and explicit log-level controls.

### Deployment and recovery testing

Terraform applies, database migrations, runtime smoke tests, crash-recovery
tests, and intentional multi-worker exercises produce short bursts above the
normal run rate. Reserve an additional **$2–$10** in weeks containing repeated
infrastructure or recovery testing.

## Required cost controls

Before enabling the pilot:

1. Configure an AWS Budget with alerts before or in the same protected apply
   that creates application resources.
2. Enforce Fargate desired count `0–2`; alarm when tasks run beyond the expected
   sprint window.
3. Pin an Aurora PostgreSQL version that supports `0 ACUs`, configure the
   five-minute auto-pause interval, and alarm on unexpected ACU-hours.
4. Ensure worker shutdown closes PostgreSQL pools and releases or checkpoints
   leases.
5. Set CloudWatch retention explicitly and prohibit unbounded debug logging.
6. Apply ECR lifecycle retention and avoid retaining redundant images.
7. Tag all resources with environment, application, and cost-allocation tags.
8. Record per-run AWS usage proxies and model token usage in the cost and
   provenance records already required by the implementation plan.
9. Review Cost Explorer weekly during the pilot and revise these ranges after
   the first two, five, and ten completed sprints.
10. Keep the operator drain control and test that it safely returns Fargate to
    zero without abandoning active leases.

## Validation checkpoints

Replace planning assumptions with evidence at these points:

- **Before first apply:** export an AWS Pricing Calculator estimate from the
  final Terraform resource graph and confirm no NAT Gateway, load balancer, or
  unintended always-on compute exists.
- **After the first idle week:** verify the actual fixed baseline, Aurora pause
  behavior, retained storage, alarms, and secret count.
- **After the first sprint:** calculate worker task-hours, ACU-hours, log GB,
  API requests, model tokens, and total cost per issue.
- **After five sprints:** update the low, typical, and high scenario ranges
  using measured percentiles rather than estimates.
- **Before broader rollout:** separate pilot fixed costs from incremental
  per-repository and per-sprint costs and approve a new operating budget.
