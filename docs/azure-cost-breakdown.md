# Azure Infrastructure – Cost Breakdown & Budget Analysis

## Monthly Cost Estimates (AUD, Australia East region)

All prices are approximate retail prices as of early 2025.
Actual costs depend on usage and Azure pricing changes.

---

### 1. Azure Static Web Apps – Standard Tier

| Item | Details | Monthly Cost (AUD) |
|---|---|---|
| Hosting | Standard plan | ~$18 |
| Custom domains | Included | $0 |
| SSL certificate | Included | $0 |
| Bandwidth (first 100 GB) | Included | $0 |
| Bandwidth over 100 GB | ~$0.12/GB | Variable |

**Subtotal: ~$18/month** (assuming < 100 GB bandwidth)

---

### 2. Azure CDN – Standard Microsoft

| Item | Details | Monthly Cost (AUD) |
|---|---|---|
| Data transfer (first 10 TB) | ~$0.11/GB | Variable |
| HTTP/HTTPS requests (10M) | ~$0.008/10K requests | ~$8 |

**Estimated subtotal: ~$15–25/month** (assuming 20 GB traffic, 5M requests)

---

### 3. Azure Blob Storage – Standard LRS

| Item | Details | Monthly Cost (AUD) |
|---|---|---|
| Storage (hot tier, 10 GB) | ~$0.028/GB | ~$0.28 |
| Storage (cool tier, after 30 days) | ~$0.013/GB | ~$0.13 |
| Write operations (10K) | ~$0.059/10K | ~$0.06 |
| Read operations (100K) | ~$0.0047/10K | ~$0.05 |
| Data egress (Australia, 5 GB) | ~$0.114/GB | ~$0.57 |

**Estimated subtotal: ~$2–5/month**

---

### 4. Azure Communication Services – Pay-per-send

| Item | Details | Monthly Cost (AUD) |
|---|---|---|
| Email (1,000 messages) | $0.00028/message | ~$0.28 |
| Email (10,000 messages) | $0.00028/message | ~$2.80 |
| SMS (if needed) | ~$0.05/message | Variable |

**Estimated subtotal: ~$1–5/month** (for 1,000–10,000 emails)

---

### 5. Azure Monitor + Application Insights

| Item | Details | Monthly Cost (AUD) |
|---|---|---|
| Log Analytics (first 5 GB/month) | Free | $0 |
| Log Analytics (over 5 GB) | ~$3.24/GB | Variable |
| App Insights data ingestion | Included in Log Analytics | $0 |
| 30-day retention | Minimum, no extra cost | $0 |

**Estimated subtotal: ~$0–5/month** (with 10% adaptive sampling enabled)

---

### 6. Azure Key Vault – Standard Tier

| Item | Details | Monthly Cost (AUD) |
|---|---|---|
| Vault operations (10K) | ~$0.044/10K | ~$0.04 |
| Secret storage | ~$0.05/secret/month | ~$0.20 |

**Estimated subtotal: ~$1/month**

---

## Total Monthly Cost Summary

| Service | Low Estimate | High Estimate |
|---|---|---|
| Static Web Apps (Standard) | $18 | $25 |
| Azure CDN (Standard Microsoft) | $15 | $30 |
| Blob Storage (LRS) | $2 | $8 |
| Communication Services | $1 | $10 |
| Application Insights | $0 | $5 |
| Key Vault | $1 | $2 |
| **Total** | **~$37/month** | **~$80/month** |

---

## $1,000 Credit Lifespan

| Scenario | Monthly Cost | Credit Duration |
|---|---|---|
| Low traffic (launch phase) | ~$37/month | **~27 months** |
| Medium traffic | ~$55/month | **~18 months** |
| High traffic (growth phase) | ~$80/month | **~12 months** |

---

## Cost Optimisation Recommendations

### Implemented (already in Terraform config)
1. **Static Web App Standard tier** – cheaper than Premium; supports custom domains
2. **CDN Standard Microsoft** – ~70% cheaper than Premium Verizon
3. **LRS storage redundancy** – cheapest option; sufficient for media files
4. **Blob lifecycle policies** – auto-move to Cool tier after 30 days, delete after 365 days
5. **Communication Services pay-per-send** – zero monthly commitment
6. **30-day App Insights retention** – minimum retention, lowest log storage cost
7. **10% adaptive sampling** – reduces App Insights data ingestion by up to 90%
8. **Key Vault Standard tier** – identical functionality to Premium at lower cost

### Additional recommendations
- Enable **CDN compression** for JS/CSS to reduce egress bytes
- Use **SAS tokens with short expiry** for blob uploads instead of public access
- Review CDN analytics monthly and **purge unused cached content**
- Set up **budget alerts** in Azure Cost Management at $50 and $100/month
- Consider **Azure Front Door Standard** ($35/month base) as a CDN replacement if you need WAF features — it bundles CDN + WAF for less than buying them separately

---

## Scaling Recommendations

| Growth Milestone | Recommended Change |
|---|---|
| > 1,000 daily active users | Enable CDN Premium Rules Engine for advanced routing |
| > 10 GB media uploads/month | Review storage tier; GRS may be justified for redundancy |
| > 50,000 emails/month | Evaluate SendGrid or Mailgun for potential cost savings |
| > 10 GB App Insights/month | Increase sampling or add custom telemetry filters |
| Need WAF protection | Migrate CDN to Azure Front Door Standard |
