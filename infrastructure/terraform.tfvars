# ---------------------------------------------------------------
# terraform.tfvars – Example values
# Copy this file and fill in real values before running Terraform.
# NEVER commit a file with real secrets to source control.
# ---------------------------------------------------------------

subscription_id     = "00000000-0000-0000-0000-000000000000"
resource_group_name = "memory-mirror-production"
location            = "australiaeast"
environment         = "production"
app_name            = "memory-mirror"

github_org    = "MelbourneIndependentResearcherAI"
github_repo   = "memory-mirror2"
github_branch = "main"

custom_domain = "memory-mirror.app"

# Cost-optimised defaults
static_web_app_sku           = "Standard"
storage_account_tier         = "Standard"
storage_replication_type     = "LRS"
cdn_sku                      = "Standard_Microsoft"
app_insights_retention_days  = 30
key_vault_sku                = "standard"
blob_lifecycle_cool_days     = 30
blob_lifecycle_delete_days   = 365

# Set to your email address to receive monitoring alerts
alert_email = ""
