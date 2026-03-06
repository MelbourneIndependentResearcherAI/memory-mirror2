# ---------------------------------------------------------------
# Azure App Service Plan — shared by Carer Hire AI and Little Ones AI
# Linux B1 (Basic) plan: cheapest tier that supports custom domains
# ---------------------------------------------------------------
resource "azurerm_service_plan" "apps" {
  name                = "${var.app_name}-apps-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  os_type             = "Linux"
  sku_name            = var.app_service_sku

  tags = local.common_tags
}

# ---------------------------------------------------------------
# Carer Hire AI — Azure App Service
# ---------------------------------------------------------------
resource "azurerm_linux_web_app" "carer_hire_ai" {
  name                = var.carer_hire_ai_app_name
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  service_plan_id     = azurerm_service_plan.apps.id

  site_config {
    always_on        = true
    app_command_line = "node server.js"

    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    VITE_BASE44_APP_ID      = var.base44_app_id
    VITE_BASE44_APP_BASE_URL = var.base44_app_base_url
    WEBSITE_RUN_FROM_PACKAGE = "1"
    SCM_DO_BUILD_DURING_DEPLOYMENT = "true"
    WEBSITE_NODE_DEFAULT_VERSION   = "~20"
  }

  tags = local.common_tags
}

# ---------------------------------------------------------------
# Little Ones AI — Azure App Service
# ---------------------------------------------------------------
resource "azurerm_linux_web_app" "little_ones_ai" {
  name                = var.little_ones_ai_app_name
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  service_plan_id     = azurerm_service_plan.apps.id

  site_config {
    always_on        = true
    app_command_line = "node server.js"

    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    VITE_BASE44_APP_ID       = var.base44_app_id
    VITE_BASE44_APP_BASE_URL = var.base44_app_base_url
    WEBSITE_RUN_FROM_PACKAGE = "1"
    SCM_DO_BUILD_DURING_DEPLOYMENT = "true"
    WEBSITE_NODE_DEFAULT_VERSION   = "~20"
  }

  tags = local.common_tags
}
