# ---------------------------------------------------------------
# Azure Log Analytics Workspace (shared by App Insights)
# 30-day retention reduces storage costs.
# ---------------------------------------------------------------
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.app_name}-logs"
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = var.app_insights_retention_days

  tags = local.common_tags
}

# ---------------------------------------------------------------
# Application Insights (workspace-based, Basic tier by default)
# Sampling is configured in the client SDK (src/services/appInsights.js)
# to further reduce ingestion volume.
# ---------------------------------------------------------------
resource "azurerm_application_insights" "main" {
  name                = "${var.app_name}-insights"
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"
  retention_in_days   = var.app_insights_retention_days

  # No server-side sampling: pass all telemetry to the workspace and let the
  # client-side adaptive sampling (10 %) reduce ingestion volume instead.
  sampling_percentage = 100

  tags = local.common_tags
}

# ---------------------------------------------------------------
# Action Group for alerts (email notification)
# ---------------------------------------------------------------
resource "azurerm_monitor_action_group" "email" {
  count               = var.alert_email != "" ? 1 : 0
  name                = "${var.app_name}-alerts"
  resource_group_name = azurerm_resource_group.main.name
  short_name          = "mm-alerts"

  email_receiver {
    name          = "admin"
    email_address = var.alert_email
  }

  tags = local.common_tags
}

# Alert: high failure rate
resource "azurerm_monitor_metric_alert" "failure_rate" {
  count               = var.alert_email != "" ? 1 : 0
  name                = "${var.app_name}-high-failure-rate"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_application_insights.main.id]
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "Microsoft.Insights/components"
    metric_name      = "requests/failed"
    aggregation      = "Count"
    operator         = "GreaterThan"
    threshold        = 10
  }

  action {
    action_group_id = azurerm_monitor_action_group.email[0].id
  }

  tags = local.common_tags
}
