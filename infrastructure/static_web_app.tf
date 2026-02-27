# ---------------------------------------------------------------
# Azure Static Web App
# Standard tier: supports custom domains + free SSL certificates
# ---------------------------------------------------------------
resource "azurerm_static_web_app" "main" {
  name                = "${var.app_name}-swa"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location

  sku_tier = var.static_web_app_sku
  sku_size = var.static_web_app_sku

  tags = local.common_tags
}

# Custom domain binding (DNS CNAME must already point to the SWA default hostname)
resource "azurerm_static_web_app_custom_domain" "apex" {
  static_web_app_id = azurerm_static_web_app.main.id
  domain_name       = var.custom_domain
  validation_type   = "cname-delegation"
}

resource "azurerm_static_web_app_custom_domain" "www" {
  static_web_app_id = azurerm_static_web_app.main.id
  domain_name       = "www.${var.custom_domain}"
  validation_type   = "cname-delegation"
}
