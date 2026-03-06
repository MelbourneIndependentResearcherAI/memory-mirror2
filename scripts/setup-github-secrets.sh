#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# setup-github-secrets.sh
#
# Sets the three GitHub repository secrets required to deploy Carer Hire AI
# and Little Ones AI to Azure App Service:
#
#   AZURE_CREDENTIALS        – service principal JSON for the Memory Mirror
#                              Azure subscription
#   CARER_HIRE_AI_APP_NAME   – Azure App Service name for Carer Hire AI
#   LITTLE_ONES_AI_APP_NAME  – Azure App Service name for Little Ones AI
#
# Prerequisites
# -------------
#   az   – Azure CLI, authenticated with: az login
#   gh   – GitHub CLI, authenticated with: gh auth login
#
# Usage
# -----
#   cd <repo-root>
#   bash scripts/setup-github-secrets.sh [OPTIONS]
#
# Options
# -------
#   --subscription <id-or-name>   Azure subscription ID or name to use.
#                                 If omitted the currently active subscription
#                                 is used (same as the output of `az account show`).
#   --yes                         Skip the interactive confirmation prompt.
#                                 Useful in non-interactive / CI environments.
#
# Examples
# --------
#   # Use the currently active subscription (prompted to confirm)
#   bash scripts/setup-github-secrets.sh
#
#   # Explicitly target a subscription by ID, no confirmation prompt
#   bash scripts/setup-github-secrets.sh \
#     --subscription "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
#     --yes
#
# The script is idempotent – re-running it overwrites existing secrets with
# fresh values.
# ---------------------------------------------------------------------------

set -euo pipefail

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
info()    { echo "[INFO]  $*"; }
success() { echo "[OK]    $*"; }
error()   { echo "[ERROR] $*" >&2; exit 1; }

require_tool() {
  command -v "$1" >/dev/null 2>&1 || error "'$1' is not installed or not on PATH. $2"
}

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------
SUBSCRIPTION_ARG=""
AUTO_YES=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --subscription)
      [[ $# -ge 2 ]] || error "--subscription requires a value (subscription ID or name)."
      SUBSCRIPTION_ARG="$2"
      shift 2
      ;;
    --yes|-y)
      AUTO_YES=true
      shift
      ;;
    --help|-h)
      # Print the Usage/Options/Examples block from the header comment.
      # awk uses ERE; {70,} matches the 75-dash separator that closes the
      # header block while safely ignoring the short underlines (5–8 dashes)
      # used beneath section titles like "Usage" and "Options".
      awk '/^# -{70,}/ && p{exit} /^# Usage/{p=1} p' "$0" \
        | sed 's/^# \?//'
      exit 0
      ;;
    *)
      error "Unknown option: $1  (use --help for usage)"
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Prerequisite checks
# ---------------------------------------------------------------------------
require_tool az "Install the Azure CLI: https://learn.microsoft.com/cli/azure/install-azure-cli"
require_tool gh "Install the GitHub CLI: https://cli.github.com"

# Confirm az is logged in
az account show --query id -o tsv >/dev/null 2>&1 \
  || error "Not logged in to Azure. Run: az login"

# Confirm gh is logged in
gh auth status >/dev/null 2>&1 \
  || error "Not logged in to GitHub. Run: gh auth login"

# ---------------------------------------------------------------------------
# Resolve repository (owner/repo) from git remote or gh CLI
# ---------------------------------------------------------------------------
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)
if [ -z "$REPO" ]; then
  # Fall back to reading the git remote
  REMOTE_URL=$(git remote get-url origin 2>/dev/null || true)
  REPO=$(echo "$REMOTE_URL" \
    | sed -E 's#(https://github.com/|git@github.com:)##;s#\.git$##')
fi
[ -n "$REPO" ] || error "Could not determine GitHub repository. Run this script from inside the cloned repository."
info "Target repository: $REPO"

# ---------------------------------------------------------------------------
# Read app names from terraform.tfvars
# ---------------------------------------------------------------------------
TFVARS="$(dirname "$0")/../infrastructure/terraform.tfvars"
TFVARS=$(realpath "$TFVARS")
[ -f "$TFVARS" ] || error "terraform.tfvars not found at: $TFVARS"

extract_tfvar() {
  # Extract value from  key = "value"  or  key = value  lines.
  # The first branch strips double-quotes; the second handles bare (unquoted) values.
  grep -E "^\s*$1\s*=" "$TFVARS" \
    | head -1 \
    | sed -E 's/^[^=]+=\s*"([^"]+)".*/\1/;t;s/^[^=]+=\s*([^[:space:]#]+).*/\1/' \
    | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

CARER_HIRE_AI_APP_NAME=$(extract_tfvar carer_hire_ai_app_name)
LITTLE_ONES_AI_APP_NAME=$(extract_tfvar little_ones_ai_app_name)

[ -n "$CARER_HIRE_AI_APP_NAME" ] \
  || error "carer_hire_ai_app_name not found in $TFVARS"
[ -n "$LITTLE_ONES_AI_APP_NAME" ] \
  || error "little_ones_ai_app_name not found in $TFVARS"

info "carer_hire_ai_app_name  = $CARER_HIRE_AI_APP_NAME"
info "little_ones_ai_app_name = $LITTLE_ONES_AI_APP_NAME"

# ---------------------------------------------------------------------------
# Resolve Azure subscription
# ---------------------------------------------------------------------------

# If --subscription was passed, switch to it now so all subsequent az calls
# target the correct subscription.
if [ -n "$SUBSCRIPTION_ARG" ]; then
  info "Switching to subscription: $SUBSCRIPTION_ARG"
  az account set --subscription "$SUBSCRIPTION_ARG" \
    || error "Could not set subscription '$SUBSCRIPTION_ARG'. Check the ID/name and try again."
fi

# Read the now-active subscription details
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)

echo ""
echo "  Active Azure subscription"
echo "  ─────────────────────────────────────────────────"
echo "  Name : $SUBSCRIPTION_NAME"
echo "  ID   : $SUBSCRIPTION_ID"
echo "  ─────────────────────────────────────────────────"
echo ""

if [ "$AUTO_YES" = false ]; then
  read -r -p "  Proceed with this subscription? [y/N] " CONFIRM
  case "$CONFIRM" in
    [yY][eE][sS]|[yY]) ;;
    *)
      # Empty input (pressing Enter alone) defaults to 'No' and aborts.
      error "Aborted. Re-run with --subscription to choose a different subscription."
      ;;
  esac
  echo ""
fi

RESOURCE_GROUP=$(extract_tfvar resource_group_name)
[ -n "$RESOURCE_GROUP" ] || RESOURCE_GROUP="memory-mirror-production"
info "Resource group: $RESOURCE_GROUP"

# ---------------------------------------------------------------------------
# Create (or refresh) the service principal for AZURE_CREDENTIALS
# ---------------------------------------------------------------------------
SP_NAME="memory-mirror-github-actions"
info "Creating / refreshing service principal '$SP_NAME' ..."

# --sdk-auth is deprecated; we build the equivalent JSON manually from the
# standard output so that azure/login@v2 can consume it.
SP_JSON=$(az ad sp create-for-rbac \
  --name "$SP_NAME" \
  --role Contributor \
  --scopes "/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}" \
  --output json)

CLIENT_ID=$(echo "$SP_JSON"     | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['appId'])")
CLIENT_SECRET=$(echo "$SP_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['password'])")
TENANT_ID=$(echo "$SP_JSON"     | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['tenant'])")

# Build the JSON object that azure/login@v2 expects when using `creds:`
# Values are passed via environment variables to avoid shell injection.
AZURE_CREDENTIALS=$(CLIENT_ID="$CLIENT_ID" \
  CLIENT_SECRET="$CLIENT_SECRET" \
  SUBSCRIPTION_ID="$SUBSCRIPTION_ID" \
  TENANT_ID="$TENANT_ID" \
  python3 - <<'PYEOF'
import json, os
print(json.dumps({
  "clientId":       os.environ["CLIENT_ID"],
  "clientSecret":   os.environ["CLIENT_SECRET"],
  "subscriptionId": os.environ["SUBSCRIPTION_ID"],
  "tenantId":       os.environ["TENANT_ID"],
}, indent=2))
PYEOF
)

success "Service principal ready."

# ---------------------------------------------------------------------------
# Push secrets to GitHub
# ---------------------------------------------------------------------------
info "Setting AZURE_CREDENTIALS ..."
echo "$AZURE_CREDENTIALS" | gh secret set AZURE_CREDENTIALS --repo "$REPO"
success "AZURE_CREDENTIALS set."

info "Setting CARER_HIRE_AI_APP_NAME = $CARER_HIRE_AI_APP_NAME ..."
gh secret set CARER_HIRE_AI_APP_NAME --repo "$REPO" --body "$CARER_HIRE_AI_APP_NAME"
success "CARER_HIRE_AI_APP_NAME set."

info "Setting LITTLE_ONES_AI_APP_NAME = $LITTLE_ONES_AI_APP_NAME ..."
gh secret set LITTLE_ONES_AI_APP_NAME --repo "$REPO" --body "$LITTLE_ONES_AI_APP_NAME"
success "LITTLE_ONES_AI_APP_NAME set."

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
echo ""
echo "======================================================================"
echo "  All three secrets have been added to $REPO."
echo ""
echo "  To trigger deployment now, push a commit to main or run:"
echo "    gh workflow run deploy-carer-hire-ai.yml --repo $REPO"
echo "    gh workflow run deploy-little-ones-ai.yml --repo $REPO"
echo "======================================================================"
