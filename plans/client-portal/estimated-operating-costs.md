# Client Portal Estimated Operating Costs

## Purpose

This document provides a planning estimate for the client portal's operating costs as it grows from local development into a production AWS application with proposal, agreement, invoice, communication, and AI-assisted workflows.

These are directional estimates, not an AWS quote. They are intended to identify cost inflection points and help decide when additional infrastructure is justified.

## Estimating assumptions

Estimates are current as of July 18, 2026 and assume:

- AWS US East (N. Virginia), `us-east-1`.
- A small consulting practice with tens—not thousands—of active client users.
- Modest document sizes and traffic.
- Prices before taxes, AWS credits, free-tier benefits, domain registration, and engineering labor.
- One production AWS environment unless a phase explicitly adds another environment.
- Amplify Hosting for Next.js, Cognito Lite, Aurora PostgreSQL Serverless v2, S3, SES, and CloudWatch.
- Aurora Standard at approximately $0.12 per ACU-hour. A continuously warm 0.5 ACU writer is therefore about $43.80 per 730-hour month before storage, I/O, and Data API charges.
- AI inference billed by token usage. Actual cost depends on the selected model, prompt size, output size, retries, revisions, and the number of model calls in each workflow.

AWS changes prices and free-tier programs over time. Recalculate each phase in the [AWS Pricing Calculator](https://calculator.aws/) before activating it.

## Cost progression at a glance

| Phase | Operating state | Estimated monthly cost | Primary cost drivers |
| --- | --- | ---: | --- |
| 0 | Local planning and development | $0–$30 | Optional paid model/API experiments |
| 1 | AWS foundation and private pilot | $5–$25 | Aurora wake time, logs, builds, secrets |
| 2 | Client review hub | $15–$60 | More database activity, storage, monitoring |
| 3 | Transaction workflow automation | $40–$150 | Warm database, background jobs, backups |
| 4 | AI-assisted automation | $75–$350 | Model tokens, workflow compute, observability |
| 5 | Hardened full production platform | $200–$800+ | Database redundancy, networking, WAF, AI volume |

The ranges deliberately include operational headroom. A lightly used system can remain near the bottom of a range, while debugging, repeated deployments, verbose logs, large AI prompts, or an always-warm database can move it upward quickly.

## Phase 0 — Local planning and development

### Capabilities

- Next.js application running locally.
- PostgreSQL, MinIO, and Mailpit in Docker Compose.
- Seeded local authentication.
- Local proposal, agreement, invoice, and review experiments.
- Optional Ollama or paid-model experiments.

### Estimated cost: $0–$30 per month

Docker, PostgreSQL, MinIO, Mailpit, and Ollama have no incremental service charge when run on an existing development computer. Electricity, local storage, internet service, and developer time are excluded.

The upper end allows occasional calls to a paid AI API. Set a hard provider budget while experimenting. Local Ollama keeps inference spend at $0 but uses local CPU, memory, disk, and electricity.

### Move forward when

- The application starts reliably with one command.
- Migrations and seed data are repeatable.
- The admin/client review path is useful enough for a private hosted pilot.

## Phase 1 — AWS foundation and private pilot

### Capabilities

- Amplify-hosted Next.js application.
- Cognito authentication and two application roles.
- Aurora PostgreSQL Serverless v2 with a `0` ACU minimum and ten-minute auto-pause.
- RDS Data API, Secrets Manager, private S3 document storage, SES test email, and basic CloudWatch logs.
- One production-like environment used only by Todd and invited testers.

### Estimated cost: $5–$25 per month

Expected components:

| Component | Planning allowance | Notes |
| --- | ---: | --- |
| Amplify build and hosting | $0–$5 | Low traffic and a few builds should be inexpensive. Amplify currently includes 500,000 SSR requests and 100 GB-hours of SSR duration before usage charges, subject to account eligibility. |
| Aurora, storage, I/O, and Data API | $1–$10 | The database pauses when idle; brief wake-ups and maintenance still consume capacity. |
| Cognito Lite | $0–$1 | A small invited user population should remain negligible; enterprise OIDC/SAML federation has separate MAU pricing. |
| S3 documents | Less than $1 | Small PDF volume; requests and transfer normally cost more than raw storage at this scale. |
| SES | Less than $1 | Standard outbound email is $0.10 per 1,000 messages, plus data charges. |
| Secrets Manager and CloudWatch | $1–$8 | Secret count, log ingestion, and retained log volume matter more than traffic initially. |
| Route 53/custom domain | $0–$2 | Excludes purchasing or renewing the domain itself. Use the Amplify domain initially if desired. |

[Amplify pricing](https://aws.amazon.com/amplify/pricing/), [Aurora pricing](https://aws.amazon.com/rds/aurora/pricing/), [Cognito pricing](https://aws.amazon.com/cognito/pricing/), [SES pricing](https://aws.amazon.com/ses/pricing/)

### Cost controls

- Keep Aurora at `MinCapacity=0`, `MaxCapacity=2`.
- Retain application logs for 14 days.
- Disable Amplify branch previews and extra cloud environments.
- Use the Amplify-provided domain until a custom domain is useful.
- Configure AWS Budget notices at $20 and $40.
- Avoid NAT Gateways, load balancers, dedicated email IPs, WAF, and always-on containers.

### Move forward when

- Cold database wake-up becomes disruptive to real client work.
- Real client documents require stronger backup, alerting, and availability expectations.
- Portal activity is regular enough that the database rarely reaches its paused state.

## Phase 2 — Client review hub

### Capabilities

- Real client organizations and invitations.
- Versioned proposal and agreement PDFs.
- Comments, change requests, approvals, and bilateral signing evidence.
- Structured invoice records with PDF delivery and manually maintained status.
- Transactional SES notifications and an audit trail.

### Estimated cost: $15–$60 per month

Amplify, Cognito, S3, and SES should still be small line items. The range rises because real usage keeps Aurora awake longer, documents and backups accumulate, and operational logs become more valuable.

Example Aurora compute scenarios at $0.12 per ACU-hour:

| Monthly database activity | Approximate compute cost |
| --- | ---: |
| 50 hours at an average 0.5 ACU | $3.00 |
| 200 hours at an average 0.5 ACU | $12.00 |
| Continuously warm at 0.5 ACU | $43.80 |

Storage, I/O, Data API calls, backups beyond the included allowance, and maintenance wake-ups are additional.

### Cost controls

- Keep auto-pause until measured client experience demonstrates a problem.
- Store immutable document versions but add lifecycle rules for failed/incomplete uploads.
- Do not email PDF attachments; send authenticated portal links.
- Sample routine logs and prohibit sensitive document content in logs.
- Tag AWS resources by application, environment, and cost category.
- Review Cost Explorer monthly and investigate any service that doubles without a corresponding usage increase.

### Move forward when

- Clients depend on predictable response time during business hours.
- Invoice and agreement events should automatically trigger downstream work.
- Manual notification retries, status updates, or document preparation become recurring overhead.

## Phase 3 — Proposal, agreement, and invoice automation

### Capabilities

- Structured proposal and invoice data.
- Template-based document generation.
- Durable queues and background jobs for document rendering, notifications, reminders, and accounting/payment integrations.
- Automated invoice state synchronization.
- More formal backup, restore, monitoring, and failure recovery.
- External e-signature or payment providers where business needs justify them.

### Estimated AWS cost: $40–$150 per month

The likely baseline is an always-warm 0.5 ACU Aurora writer at roughly $43.80 per month. Lambda and SQS should remain inexpensive at consultancy-scale volume: Lambda includes one million requests and 400,000 GB-seconds per month, and SQS includes one million requests per month. [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [SQS pricing](https://aws.amazon.com/sqs/pricing/)

Additional allowance covers:

- Database storage, I/O, backups, and Data API requests.
- Lambda document/notification jobs or short-lived Fargate rendering tasks.
- S3 growth and document downloads.
- CloudWatch logs, metrics, alarms, and dashboards.
- A separate non-production cloud environment if local testing is no longer sufficient.
- Higher Amplify build frequency and traffic.

### Costs outside AWS

The phase estimate does not include variable vendor charges such as:

- DocuSign, Adobe Sign, or another qualified e-signature service.
- Stripe or accounting-platform transaction and subscription fees.
- SMS messages and registered messaging campaigns.
- Paid PDF generation, address validation, tax, or bookkeeping services.

Price these separately before enabling each integration. Keep vendor-specific behavior behind adapters so replacing a provider does not require changing the portal's core workflow.

### Move forward when

- Drafting and revision work is repetitive enough to measure a useful AI-assisted workflow.
- Human review gates and source data are reliable without AI.
- Each automated action has an owner, retry policy, audit event, and idempotency key.

## Phase 4 — AI-assisted workflow automation

### Capabilities

- LangGraph proposal or client-message drafting.
- Human review, revision, and approval interrupts.
- Durable workflow state and task queues.
- SQS-triggered Lambda for short work or Fargate tasks for longer model/tool runs.
- Model usage, latency, failure, and per-workflow cost telemetry.
- Optional document extraction, summarization, and accounting/CRM tool calls.

### Estimated cost: $75–$350 per month

The non-AI platform will generally contribute $50–$150. AI inference and workflow execution add roughly $25–$200 at modest volume, but there is no meaningful hard upper bound without quotas.

Use this formula for each workflow type:

```text
workflow inference cost =
  model calls × ((input tokens ÷ 1,000,000 × input rate)
               + (output tokens ÷ 1,000,000 × output rate)
               + cache/tool/model-specific charges)
```

Multiply that result by drafts, revision loops, retries, evaluations, and monthly workflow volume. Amazon Bedrock bills input, output, cache-read, and cache-write tokens separately; omitting cache charges will understate spend. [Bedrock pricing](https://aws.amazon.com/bedrock/pricing/), [Bedrock cost accounting](https://docs.aws.amazon.com/bedrock/latest/userguide/cost-mgmt-understanding-cur-data.html)

### Illustrative AI budget—not a quoted model price

Assume 100 monthly proposal workflows, each totaling 30,000 input tokens and 5,000 output tokens across drafting and revisions:

- Monthly input: 3 million tokens.
- Monthly output: 0.5 million tokens.
- At illustrative rates of $2/million input and $10/million output, inference is about $11.
- At $6/million input and $30/million output, inference is about $33.
- Tool calls, document extraction, embeddings, evaluations, failed runs, and longer revision loops are additional.

The model and its current published rate must be recorded in configuration and rechecked before launch. Do not bake illustrative rates into business pricing.

### Workflow compute

- Lambda and SQS may remain effectively negligible for short, low-volume orchestration.
- Fargate is billed per second with a one-minute minimum. AWS's published example prices a short set of recurring tasks at roughly $1 per month; an always-running minimal task creates a fixed monthly cost instead. [Fargate pricing](https://aws.amazon.com/fargate/pricing/)
- Prefer queue-triggered, run-to-completion Fargate tasks over an always-on worker until queue latency or volume justifies persistent capacity.
- Avoid placing burst workers behind an Application Load Balancer.

### Cost controls

- Set monthly model-provider budgets and per-workflow token ceilings.
- Cap revision loops and automatic retries.
- Use smaller models for classification/extraction and stronger models only for work where quality evidence justifies the price.
- Use prompt caching and batch/flex tiers only after measuring their effect.
- Store token counts, model, workflow type, client/engagement attribution, and estimated cost for every invocation.
- Never log full client documents or prompts merely for cost tracking.
- Require explicit human approval before any generated proposal, agreement, invoice, email, or external action is released.

### Move forward when

- Paying-client volume requires higher availability or throughput.
- Recovery objectives justify database redundancy.
- Security requirements justify WAF, private networking, centralized audit retention, or a dedicated non-production environment.

## Phase 5 — Hardened full production platform

### Capabilities

- Full proposal, agreement, signature-provider, invoice, payment, email, SMS, and AI workflow automation.
- Separate production and non-production AWS environments.
- Database reader/failover capacity and tested recovery procedures.
- WAF, stronger monitoring, longer audit retention, security scanning, and incident alerting.
- Private worker networking or VPC endpoints where required.
- Sustained Fargate workers when measured queue volume warrants them.

### Estimated AWS cost: $200–$800+ per month

Representative fixed-cost additions include:

| Addition | Approximate effect |
| --- | --- |
| Continuously warm 0.5 ACU Aurora writer | About $43.80/month plus storage, I/O, and API usage |
| Warm 0.5 ACU reader | Another roughly $43.80/month plus related usage |
| Second cloud environment | Duplicates many storage, database, secret, log, and build charges |
| Amplify WAF integration | $15/month per Amplify app plus AWS WAF charges |
| Application Load Balancer | AWS's low-traffic example is about $22/month; avoid unless a persistent service needs it |
| NAT Gateway | Hourly and per-GB charges; one continuously provisioned gateway is a notable fixed cost before data transfer |
| Persistent Fargate workers | vCPU, memory, public IPv4/networking, logs, and image storage accrue continuously |
| Longer log and audit retention | CloudWatch/S3 ingestion, storage, querying, and archive retrieval |

[Elastic Load Balancing pricing](https://aws.amazon.com/elasticloadbalancing/pricing/), [NAT Gateway pricing](https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-pricing.html)

AI usage, e-signature subscriptions, payment fees, SMS, accounting/CRM subscriptions, security products, support plans, and engineering operations remain additional. At this phase, total cost should be evaluated as cost per active client or engagement rather than only as an infrastructure bill.

## Cost-management operating practice

Apply these controls from the first AWS deployment:

1. Create AWS Budget alerts before production resources.
2. Tag every resource with `Application=client-portal`, `Environment`, and `CostCenter`.
3. Review Cost Explorer monthly and before enabling a new phase.
4. Record actual monthly cost beside the applicable phase estimate.
5. Alarm on Aurora capacity, Amplify SSR duration, S3 growth, log ingestion, Fargate runtime, and model token spend.
6. Require a documented reason before adding an always-on resource.
7. Recalculate architecture costs whenever availability, retention, data residency, or compliance expectations change.
8. Allocate AI usage to a workflow and client engagement so it can inform future service pricing.

## Items deliberately excluded

These estimates do not include:

- Development and operational labor.
- Legal review of agreements or the hand-rolled consent workflow.
- Compliance certification, penetration testing, cyber-insurance, or an AWS support plan.
- Domain purchase/renewal and business email service.
- Client support and bookkeeping time.
- Taxes and payment disputes/chargebacks.
- Third-party e-signature, payment, SMS, CRM, accounting, or model-provider commitments.
- Data migration or exit costs if a provider changes.

Before serving regulated or unusually sensitive client work, create a separate security/compliance estimate rather than assuming the hardened-platform range covers it.
