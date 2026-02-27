# Static Web App
output "static_web_app_default_hostname" {
  description = "Default hostname of the Azure Static Web App"
  value       = azurerm_static_web_app.main.default_host_name
}

output "static_web_app_api_key" {
  description = "Deployment API key for the Static Web App (used in GitHub Actions)"
  value       = azurerm_static_web_app.main.api_key
  sensitive   = true
}

# CDN
output "cdn_endpoint_hostname" {
  description = "CDN endpoint hostname"
  value       = azurerm_cdn_endpoint.swa.host_name
}

# Blob Storage
output "storage_account_name" {
  description = "Name of the Azure Storage account"
  value       = azurerm_storage_account.main.name
}

output "storage_primary_endpoint" {
  description = "Primary blob service endpoint"
  value       = azurerm_storage_account.main.primary_blob_endpoint
}

output "storage_connection_string" {
  description = "Storage account connection string"
  value       = azurerm_storage_account.main.primary_connection_string
  sensitive   = true
}

# Communication Services
output "communication_service_endpoint" {
  description = "Azure Communication Services endpoint"
  value       = "https://${azurerm_communication_service.main.name}.communication.azure.com"
}

output "communication_service_connection_string" {
  description = "Azure Communication Services primary connection string"
  value       = azurerm_communication_service.main.primary_connection_string
  sensitive   = true
}

output "email_sender_domain" {
  description = "Azure-managed sender domain for outbound email"
  value       = azurerm_email_communication_service_domain.azure_managed.mail_from_sender_domain
}

# Application Insights
output "app_insights_instrumentation_key" {
  description = "Application Insights instrumentation key"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "app_insights_connection_string" {
  description = "Application Insights connection string"
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
}

# Key Vault
output "key_vault_uri" {
  description = "Key Vault URI for secret retrieval"
  value       = azurerm_key_vault.main.vault_uri
}
