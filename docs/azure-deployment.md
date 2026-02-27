# Azure Deployment Instructions

## Prerequisites Checklist

- [ ] Azure subscription with at least $1,000 credit available
- [ ] Azure CLI installed: `az --version` ≥ 2.50
- [ ] Terraform installed: `terraform --version` ≥ 1.5
- [ ] Node.js ≥ 20 installed
- [ ] DNS access to the `memory-mirror.app` domain registrar
- [ ] GitHub repository admin access (to add secrets)

---

## Step 1 – Authenticate with Azure

```bash
az login
az account set --subscription "<your-subscription-id>"
```

Verify the correct subscription is active:
```bash
az account show --query "{name:name, id:id}" -o table
```

---

## Step 2 – Configure Terraform Variables

```bash
cd infrastructure
cp terraform.tfvars terraform.tfvars.local   # DO NOT commit .local files
```

Edit `terraform.tfvars.local` and fill in:
- `subscription_id` – from `az account show --query id -o tsv`
- `alert_email` – your monitoring email address

---

## Step 3 – Deploy Infrastructure

```bash
cd infrastructure
terraform init
terraform plan -var-file="terraform.tfvars.local" -out=tfplan
terraform apply tfplan
```

Terraform will create all resources in approximately 5–10 minutes.

---

## Step 4 – Capture Outputs

```bash
terraform output -json > /tmp/tf-outputs.json
```

Key values you will need:
```bash
terraform output static_web_app_api_key        # → AZURE_STATIC_WEB_APPS_API_TOKEN
terraform output storage_connection_string     # → backend only, store in Key Vault
terraform output app_insights_connection_string # → VITE_AZURE_APP_INSIGHTS_CONNECTION_STRING
terraform output communication_service_endpoint # → VITE_AZURE_COMMUNICATION_ENDPOINT
```

---

## Step 5 – Add GitHub Secrets

In your GitHub repository go to **Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret name | Value |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | From `terraform output static_web_app_api_key` |
| `VITE_BASE44_APP_ID` | Your Base44 app ID |
| `VITE_BASE44_APP_BASE_URL` | Your Base44 backend URL |
| `VITE_AZURE_STORAGE_ACCOUNT_NAME` | From `terraform output storage_account_name` |
| `VITE_AZURE_STORAGE_CONTAINER_NAME` | `user-media` |
| `VITE_AZURE_STORAGE_SAS_TOKEN` | Generate a SAS token (see below) |
| `VITE_AZURE_APP_INSIGHTS_CONNECTION_STRING` | From `terraform output app_insights_connection_string` |
| `VITE_AZURE_COMMUNICATION_ENDPOINT` | From `terraform output communication_service_endpoint` |
| `VITE_APP_DOMAIN` | `https://memory-mirror.app` |

### Generating a SAS token for Blob Storage

```bash
ACCOUNT_NAME=$(terraform output -raw storage_account_name)
ACCOUNT_KEY=$(az storage account keys list \
  --account-name "$ACCOUNT_NAME" \
  --resource-group memory-mirror-production \
  --query "[0].value" -o tsv)

az storage container generate-sas \
  --account-name "$ACCOUNT_NAME" \
  --account-key "$ACCOUNT_KEY" \
  --name user-media \
  --permissions racwdl \
  --expiry "$(date -v +1y +%Y-%m-%dT%H:%MZ 2>/dev/null || date -d '+1 year' +%Y-%m-%dT%H:%MZ)" \
  --https-only \
  -o tsv
```

Store the output (without the leading `?`) as `VITE_AZURE_STORAGE_SAS_TOKEN`.
**Rotate this token at least once per year.**

---

## Step 6 – Configure Custom Domain DNS

After Terraform creates the Static Web App, retrieve its default hostname:

```bash
terraform output static_web_app_default_hostname
```

In your DNS provider (e.g. Cloudflare, GoDaddy, Namecheap) add:

| Type | Name | Value |
|---|---|---|
| CNAME | `@` (or `memory-mirror.app`) | `<swa-default-hostname>` |
| CNAME | `www` | `<swa-default-hostname>` |

DNS propagation can take up to 48 hours.
Azure Static Web Apps will automatically provision a free SSL certificate once the CNAME is verified.

---

## Step 7 – Trigger First Deployment

Push a commit to `main` or manually trigger the GitHub Actions workflow:

```
GitHub → Actions → "Deploy to Azure Static Web Apps" → Run workflow
```

---

## Manual Verification Steps

After the first successful deployment:

1. **App loads** – visit `https://memory-mirror.app` and confirm the React app renders
2. **Authentication** – sign in with Base44; confirm the auth flow works
3. **CDN is active** – run `curl -I https://<cdn-endpoint>.azureedge.net` and look for `X-Cache: HIT` on a second request
4. **App Insights** – open Azure Portal → Application Insights → Live Metrics; navigate pages in the app and confirm telemetry appears
5. **Blob Storage** – upload a photo/media file in the app; confirm it appears in the `user-media` container in the Azure Portal
6. **Email** – trigger a welcome email (registration) and confirm it arrives

---

## Monitoring & Alerts Setup

Alerts are configured automatically by Terraform when `alert_email` is set.
Additional recommended alerts to add manually in Azure Portal:

| Alert | Threshold | Action |
|---|---|---|
| Monthly cost | > $60 AUD | Email notification |
| Storage capacity | > 80% of paid tier | Email notification |
| App Insights quota | > 80% of free tier | Email notification |

### Budget alert in Azure Cost Management

```bash
az consumption budget create \
  --budget-name "memory-mirror-monthly" \
  --amount 60 \
  --category Cost \
  --time-grain Monthly \
  --start-date "$(date +%Y-%m-01)" \
  --end-date "2027-01-01" \
  --resource-group memory-mirror-production
```

---

## Tearing Down (cost saving)

To remove all resources and stop all charges:

```bash
cd infrastructure
terraform destroy -var-file="terraform.tfvars.local"
```

> ⚠️  This is irreversible.  Export any data from Blob Storage before destroying.
