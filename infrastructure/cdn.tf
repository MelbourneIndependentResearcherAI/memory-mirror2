# ---------------------------------------------------------------
# Azure CDN – Standard Microsoft tier
# Cheaper than Premium Verizon; use Front Door Standard for
# advanced WAF/routing if usage grows.
# ---------------------------------------------------------------
resource "azurerm_cdn_profile" "main" {
  name                = "${var.app_name}-cdn"
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = var.cdn_sku

  tags = local.common_tags
}

resource "azurerm_cdn_endpoint" "swa" {
  name                = "${var.app_name}-cdn-ep"
  profile_name        = azurerm_cdn_profile.main.name
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name

  origin_host_header = azurerm_static_web_app.main.default_host_name

  origin {
    name      = "static-web-app"
    host_name = azurerm_static_web_app.main.default_host_name
  }

  # Optimise for single-page application: never cache the HTML shell
  global_delivery_rule {
    cache_expiration_action {
      behavior = "BypassCache"
    }
  }

  # Cache static assets for 7 days
  delivery_rule {
    name  = "CacheStaticAssets"
    order = 1

    request_uri_condition {
      operator     = "EndsWith"
      match_values = [".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".woff", ".woff2"]
    }

    cache_expiration_action {
      behavior = "SetIfMissing"
      duration = "7.00:00:00"
    }
  }

  tags = local.common_tags
}
