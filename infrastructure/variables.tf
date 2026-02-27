variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
  sensitive   = true
}

variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string
  default     = "memory-mirror-production"
}

variable "location" {
  description = "Azure region for all resources"
  type        = string
  default     = "australiaeast"
}

variable "environment" {
  description = "Environment name (production, staging)"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application name prefix for all resources"
  type        = string
  default     = "memory-mirror"
}

variable "github_org" {
  description = "GitHub organisation or username"
  type        = string
  default     = "MelbourneIndependentResearcherAI"
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = "memory-mirror2"
}

variable "github_branch" {
  description = "GitHub branch to deploy from"
  type        = string
  default     = "main"
}

variable "custom_domain" {
  description = "Custom domain for the Static Web App"
  type        = string
  default     = "memory-mirror.app"
}

variable "static_web_app_sku" {
  description = "SKU for Azure Static Web App (Free or Standard)"
  type        = string
  default     = "Standard"
}

variable "storage_account_tier" {
  description = "Storage account performance tier (Standard or Premium)"
  type        = string
  default     = "Standard"
}

variable "storage_replication_type" {
  description = "Storage replication type - LRS is cheapest"
  type        = string
  default     = "LRS"
}

variable "cdn_sku" {
  description = "CDN profile SKU"
  type        = string
  default     = "Standard_Microsoft"
}

variable "app_insights_retention_days" {
  description = "Application Insights data retention in days (30 is minimum and cheapest)"
  type        = number
  default     = 30
}

variable "key_vault_sku" {
  description = "Key Vault SKU (standard or premium)"
  type        = string
  default     = "standard"
}

variable "blob_lifecycle_cool_days" {
  description = "Days after last modification to move blobs to cool tier"
  type        = number
  default     = 30
}

variable "blob_lifecycle_delete_days" {
  description = "Days after last modification to delete blobs"
  type        = number
  default     = 365
}

variable "alert_email" {
  description = "Email address for monitoring alerts"
  type        = string
  default     = ""
}
