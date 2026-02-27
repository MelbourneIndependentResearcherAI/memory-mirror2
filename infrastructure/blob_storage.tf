# ---------------------------------------------------------------
# Azure Blob Storage
# LRS (Locally Redundant Storage) is the cheapest redundancy tier.
# Lifecycle policy moves blobs to Cool after 30 days and deletes
# them after 365 days to keep costs low.
# ---------------------------------------------------------------
resource "azurerm_storage_account" "main" {
  name                     = replace("${var.app_name}media", "-", "")
  resource_group_name      = azurerm_resource_group.main.name
  location                 = var.location
  account_tier             = var.storage_account_tier
  account_replication_type = var.storage_replication_type
  account_kind             = "StorageV2"
  access_tier              = "Hot"

  # Allow only HTTPS traffic
  enable_https_traffic_only = true
  min_tls_version           = "TLS1_2"

  # Prevent public blob access by default; individual containers opt in via SAS tokens
  allow_nested_items_to_be_public = false

  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"]
      allowed_origins    = ["https://${var.custom_domain}", "https://www.${var.custom_domain}"]
      exposed_headers    = ["ETag", "Content-Length", "x-ms-request-id"]
      max_age_in_seconds = 3600
    }

    delete_retention_policy {
      days = 7
    }

    versioning_enabled = false
  }

  tags = local.common_tags
}

# Container for user-uploaded media (photos, audio, video)
resource "azurerm_storage_container" "user_media" {
  name                  = "user-media"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# Lifecycle management: cool tier after 30 days, delete after 365 days
resource "azurerm_storage_management_policy" "lifecycle" {
  storage_account_id = azurerm_storage_account.main.id

  rule {
    name    = "move-to-cool"
    enabled = true

    filters {
      prefix_match = ["user-media/"]
      blob_types   = ["blockBlob"]
    }

    actions {
      base_blob {
        tier_to_cool_after_days_since_modification_greater_than    = var.blob_lifecycle_cool_days
        delete_after_days_since_modification_greater_than          = var.blob_lifecycle_delete_days
      }

      snapshot {
        delete_after_days_since_creation_greater_than = 7
      }
    }
  }
}
