# ---------------------------------------------------------------
# Azure Key Vault – Standard tier (cheapest)
# Stores API keys, connection strings, and other secrets.
# ---------------------------------------------------------------
resource "azurerm_key_vault" "main" {
  name                        = "${var.app_name}-kv"
  location                    = var.location
  resource_group_name         = azurerm_resource_group.main.name
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  sku_name                    = var.key_vault_sku
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false

  # Allow the deploying principal to manage secrets during first setup
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Get", "List", "Set", "Delete", "Recover", "Backup", "Restore", "Purge"
    ]
  }

  tags = local.common_tags
}

# Store Blob Storage connection string as a secret
resource "azurerm_key_vault_secret" "storage_connection_string" {
  name         = "storage-connection-string"
  value        = azurerm_storage_account.main.primary_connection_string
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault.main]
}

# Store Communication Services connection string as a secret
resource "azurerm_key_vault_secret" "comms_connection_string" {
  name         = "comms-connection-string"
  value        = azurerm_communication_service.main.primary_connection_string
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault.main]
}

# Store App Insights connection string as a secret
resource "azurerm_key_vault_secret" "app_insights_connection_string" {
  name         = "app-insights-connection-string"
  value        = azurerm_application_insights.main.connection_string
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault.main]
}
