terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.47"
    }
  }

  # Uncomment to use Azure Blob Storage backend for state
  # backend "azurerm" {
  #   resource_group_name  = "memory-mirror-tfstate"
  #   storage_account_name = "memorymirrortfstate"
  #   container_name       = "tfstate"
  #   key                  = "memory-mirror.terraform.tfstate"
  # }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
  }
  subscription_id = var.subscription_id
}

provider "azuread" {}

data "azurerm_client_config" "current" {}

resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = local.common_tags
}

locals {
  common_tags = {
    project     = "memory-mirror"
    environment = var.environment
    managed_by  = "terraform"
  }
}
