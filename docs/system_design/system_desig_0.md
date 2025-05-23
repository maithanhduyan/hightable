## MasterVIP Backend Architecture (NestJS)

### 1. Tầm nhìn & Nguyên lý

* **SOA / Micro‑services trước**: Mọi năng lực (auth, thẻ, điểm, sự kiện…) đều là dịch vụ độc lập, giao tiếp qua API hoặc sự kiện Kafka → dễ thay đổi, dễ thương mại hóa.
* **Khách hàng trung tâm**: API phải dễ dùng như quẹt thẻ & email – org admin có thể on‑board trong <5′.
* **Xây hạ tầng dùng được cho tương lai**: Thiết kế mặc định scale tới **500 M MAU**, đa khu vực.
* **Build → Run → Iterate**: CI/CD tự động; quan sát, thu thập telemetry và xoay vòng nhanh feature.

### 2. Kiến trúc tổng quan

```
┌────────┐   REST/gRPC   ┌────────────┐
│ Mobile │  ───────────▶ │ API‑Gateway│
└────────┘               └────┬───────┘
                              │AuthZ + Rate‑Limit + BFF adapters
                              ▼
                  ┌──────────────────────────────┐
                  │ Service Mesh (gRPC + Kafka)  │
                  └──────────────────────────────┘
          ┌──────────────┬──────────────┬──────────────┬──────────────┐
          ▼              ▼              ▼              ▼              ▼
  Auth‑Svc  Org‑Svc  Member‑Svc  Card‑Svc   Event‑Svc   Reward‑Svc  Payment‑Svc  Notification‑Svc  Admin‑Portal

```

> Mọi service là một **NestJS app** riêng, đóng gói Docker, deploy trên **EKS/Kubernetes**; cấu hình bằng Helm.

### 3. Danh sách service & nhiệm vụ

* **api‑gateway**: JWT validation, API key của tổ chức, BFF cho mobile, GraphQL fan‑out.
* **auth‑service**: Đăng ký/đăng nhập, OAuth2, cấp/doi JWT, refresh, SSO Apple/Google.
* **org‑service**: CRUD tổ chức (High Table), định mức thẻ, gói Freemium/Premium, billing hook.
* **member‑service**: Hồ sơ Hunter, chỉ số uy tín, liên kết tài khoản xã hội.
* **card‑service**: Phát hành/thu hồi thẻ, phân hạng (Bronze→Diamond), QR & NFC payload signer.
* **event‑service**: Tạo sự kiện, check‑in realtime (WebSocket), log tham dự.
* **reward‑service**: Điểm, coupon, rule engine (IFTTT style) để cấu hình khuyến mãi.
* **payment‑service**: Ví nội bộ, top‑up, thanh toán điểm, webhook gateway tới VNPay/Momo.
* **notification‑service**: Push (FCM/APNs), email (SES), in‑app stream (Redis Stream).
* **admin‑portal**: Next.js + tRPC, quản trị cross‑tenant.

### 4. Mô hình dữ liệu & lưu trữ

| Thành phần        | Lưu trữ chính        | Ghi chú                                                          |
| ----------------- | -------------------- | ---------------------------------------------------------------- |
| Bản ghi giao dịch | **PostgreSQL Citus** | Shard theo `tenant_id` → scale tuyến tính                        |
| Hồ sơ người dùng  | **MongoDB**          | Document flexible, TTL cho token, secondary index Search         |
| Bộ nhớ cache      | **Redis Cluster**    | Session, rate‑limit, leaderboard hunter points                   |
| Hàng đợi sự kiện  | **Kafka**            | Topic per domain; Exactly‑once with transactional outbox pattern |
| Search/Analytics  | **OpenSearch**       | Full‑text search thẻ/hội viên; Kibana dashboard                  |
| Object / QR image | **S3 + CloudFront**  | Private bucket, presigned URL                                    |

### 5. Giao tiếp & hợp đồng

* **Sync**: gRPC cho service‑to‑service (protobuf schema registry); REST/GraphQL ra ngoài.
* **Async**: Kafka, CDC từ DB → outbox, Saga/Orchestration cho quy trình phức tạp (vd. phát hành thẻ + gửi mail + push).
* **API versioning**: `/v1/`, `/v2/` bằng URI + header; deprecate bằng header sunset.

### 6. Authentication & Authorization

* **JWT Access (15 min)** + **Refresh (30 d)**; ký bằng RSA‐256.
* **RBAC**:

  * `SuperAdmin` (MasterVIP)
  * `OrgAdmin` (High Table)
  * `Member` (Hunter)
* **Policy enforcement** nằm ở api‑gateway (Nest Guard) + CASL lib trong service.

### 7. Khả năng mở rộng

| Layer               | Chiến lược                           |
| ------------------- | ------------------------------------ |
| API‑Gateway         | HPA theo RPS; Envoy + Lua filter     |
| Service (Stateless) | HPA theo CPU + custom SQS metric     |
| Database            | Citus shard, read‑replica, pgbouncer |
| Kafka               | Multi‑AZ cluster, tiered storage     |
| Cache               | Redis Cluster, hash‑slot re‑sharding |

### 8. DevOps & Monorepo (Nx)

#### 8.1 Repository Layout

```
mastervip/
├── apps/                   # NestJS micro‑services (runnable)
│   ├── api-gateway/
│   ├── auth-service/
│   ├── org-service/
│   ├── member-service/
│   ├── card-service/
│   ├── event-service/
│   ├── reward-service/
│   ├── payment-service/
│   ├── notification-service/
│   └── admin-portal/       # Next.js frontend (tRPC)
├── libs/                   # Reusable domain libraries
│   ├── common/             # DTO, constants, guards, filters
│   ├── config/             # Typed config, validation schema
│   ├── database/           # TypeORM/Prisma adapters, migrations
│   ├── messaging/          # Kafka producers/consumers, saga helpers
│   ├── auth/               # Passport strategies, RBAC helpers
│   ├── tracing/            # OpenTelemetry module
│   └── test-utils/         # factories, mocks
├── tools/                  # Custom Nx generators, schematics
├── infra/                  # Helm charts, k8s manifests, Terraform IaC
├── .github/workflows/      # CI pipelines (GitHub Actions)
├── nx.json
├── tsconfig.base.json
└── package.json
```

#### 8.2 Dependency Boundaries

* Tag libs using **`@scope/domain`** in `nx.json` (e.g. `@core/auth`, `@feature/card`).
* Enforce boundaries via `nx-enforce-module-boundaries` — no service can import another service’s internal code, only libraries.
* Shared code stays in `libs/`; each lib can be published to a private NPM registry → mở đường thương mại hóa.

#### 8.3 Testing Strategy

| Layer    | Tools                                  | Location                        |
| -------- | -------------------------------------- | ------------------------------- |
| Unit     | Jest + ts‑jest                         | `apps/*/__tests__`, `libs/**/*` |
| Contract | protobuf‑lint + Pact (consumer‑driven) | Generated in CI (`contract/`)   |
| E2E      | Supertest + In‑memory Postgres         | `apps/*/e2e/`                   |
| Load     | K6 scripts                             | `tests/load/`                   |

#### 8.4 CI/CD Flow

1. **PR** → `nx affected --target=lint,test,build`.
2. On merge to `main`: build docker images `service‑name:sha‑short` and push to **ECR**.
3. Update corresponding Helm `values.yaml` via `helmfile` in `infra/`.
4. **ArgoCD** detects chart version bump → canary rollout 5‑25‑50‑100.
5. Post‑deploy hooks run smoke tests & Pact verification.

#### 8.5 Developer Experience

* **Nx generators** (`nx g @mastervip/svc my‑service`) scaffolds a NestJS app with tracing, health, CI‑workflow ready.
* **Pre‑commit**: husky + lint‑staged (eslint, prettier, commitlint).
* **VSCode workspace** settings & `devcontainer` for instant onboarding.

---

### 9. Observability. Observability

* **Prometheus + Grafana**: RED metrics / service.
* **Jaeger**: distributed tracing (OpenTelemetry SDK Nest).
* **Loki**: log aggregation (structured JSON).
* **SLO**: 99.9% latency < 150 ms p95.

### 10. Bảo mật & Tuân thủ

* TLS 1.3, HSTS, OWASP header via Gateway.
* Encrypt‑at‑rest (KMS) + Field level (Vault Transit) cho số thẻ.
* GDPR/CCPA: Data subject export API.
* RBAC K8s, IAM roles for service accounts.

### 11. Roadmap MVP ( < 3 tháng )

| Tuần  | Milestone                         | Ghi chú                    |
| ----- | --------------------------------- | -------------------------- |
| 1‑2   | Skeleton nx monorepo + CI         | Tạo workspace & dockerize  |
| 3‑4   | Auth‑service + api‑gateway        | OAuth, JWT, org seed       |
| 5‑6   | Org‑service + Card‑service        | Phát hành thẻ QR prototype |
| 7‑8   | Member‑service + Event‑service    | Check‑in WebSocket         |
| 9‑10  | Reward‑service & Point engine     | Rule: check‑in mỗi ngày    |
| 11‑12 | Payment stub + Notification       | Tích hợp FCM & email       |
| 13    | Load test 20k RPS, fix bottleneck | K6 + Locust, scale infra   |

### 12. Chiến lược tăng trưởng AWS‑Style

* Khởi đầu **Freemium** (2 org, 10 thẻ) → upsell Premium (∞ thẻ, analytics, white‑label API).
* Khi tổ chức thành công, traffic tăng → **vòng xoáy giảm phí đơn vị** (unit economics) nhờ auto‑scale.
* Mở **Public API** để các quán cà phê tích hợp POS → biến "thẻ VIP" thành tiêu chuẩn ngành.

---

**Câu hỏi mở tiếp theo**

* Bạn muốn đi sâu module nào trước? Auth, Card hay Reward engine?
* Có yêu cầu đặc thù về tuân thủ (PCI‑DSS, e‑KYC)?
* Bạn dự trù ngân sách cloud giai đoạn MVP bao nhiêu?
