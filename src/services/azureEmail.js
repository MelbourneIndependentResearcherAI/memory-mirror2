/**
 * Azure Communication Services – Email integration
 *
 * Sending email directly from the browser would expose the ACS connection
 * string, so all send requests are proxied through Base44 backend functions.
 * This module provides a typed client that calls those functions.
 *
 * Usage:
 *   import { sendEmail, EmailTemplate } from "@/services/azureEmail";
 *
 *   await sendEmail({
 *     to: "user@example.com",
 *     template: EmailTemplate.WELCOME,
 *     data: { name: "Alice" },
 *   });
 */

import { base44 } from "@/api/base44Client";

/** Supported email template identifiers */
export const EmailTemplate = /** @type {const} */ ({
  WELCOME: "welcome",
  SUBSCRIPTION_CONFIRMATION: "subscription_confirmation",
  CARE_TEAM_INVITE: "care_team_invite",
  EMERGENCY_ALERT: "emergency_alert",
  DAILY_REPORT: "daily_report",
  PASSWORD_RESET: "password_reset",
});

/**
 * @typedef {Object} SendEmailOptions
 * @property {string}                    to        - Recipient email address.
 * @property {string}                    [subject] - Override the template subject.
 * @property {string}                    template - Template identifier (one of the EmailTemplate values).
 * @property {Record<string, unknown>}   [data]    - Template variable substitutions.
 */

/**
 * Send a transactional email via the Base44 backend function.
 *
 * @param {SendEmailOptions} options
 * @returns {Promise<{messageId: string}>}
 */
export async function sendEmail({ to, subject, template, data = {} }) {
  if (!to || !template) {
    throw new Error("sendEmail: 'to' and 'template' are required.");
  }

  const result = await base44.functions.invoke("sendEmail", { to, subject, template, data });
  return result;
}

/**
 * Send a welcome email to a newly registered user.
 *
 * @param {string} email
 * @param {string} name
 * @returns {Promise<{messageId: string}>}
 */
export async function sendWelcomeEmail(email, name) {
  return sendEmail({
    to: email,
    template: EmailTemplate.WELCOME,
    data: { name },
  });
}

/**
 * Send a care-team invitation email.
 *
 * @param {string} email      - Recipient email address.
 * @param {string} inviterName - Name of the person who sent the invite.
 * @param {string} inviteUrl  - One-time invite acceptance URL.
 * @returns {Promise<{messageId: string}>}
 */
export async function sendCareTeamInvite(email, inviterName, inviteUrl) {
  return sendEmail({
    to: email,
    template: EmailTemplate.CARE_TEAM_INVITE,
    data: { inviterName, inviteUrl },
  });
}
