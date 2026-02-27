# ---------------------------------------------------------------
# Azure Communication Services
# Pay-per-send email – no monthly commitment, lowest cost option.
# ---------------------------------------------------------------
resource "azurerm_communication_service" "main" {
  name                = "${var.app_name}-comms"
  resource_group_name = azurerm_resource_group.main.name
  data_location       = "Australia"

  tags = local.common_tags
}

resource "azurerm_email_communication_service" "main" {
  name                = "${var.app_name}-email"
  resource_group_name = azurerm_resource_group.main.name
  data_location       = "Australia"

  tags = local.common_tags
}

# Azure-managed email domain (no DNS configuration required)
resource "azurerm_email_communication_service_domain" "azure_managed" {
  name              = "AzureManagedDomain"
  email_service_id  = azurerm_email_communication_service.main.id
  domain_management = "AzureManaged"
}

# Link the email domain to the Communication Service
resource "azurerm_communication_service_email_domain_association" "main" {
  communication_service_id = azurerm_communication_service.main.id
  email_service_domain_id  = azurerm_email_communication_service_domain.azure_managed.id
}
