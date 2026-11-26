// Netlify Event-Triggered Function: automatically runs on every Netlify Form submission.
// Sends a polite rejection email when an applicant selects monthly revenue below $1,000.

const DISQUALIFYING_REVENUES = new Set([
  "Pre revenue / Starting out",
  "Under $1,000",
]);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildRejectionEmail({ name, business }) {
  const firstName = (name || "there").trim().split(/\s+/)[0];
  const businessLabel = (business || "your business").trim();

  const subject = "Update on your Velocity Scales strategy call application";

  const text = [
    `Hi ${firstName},`,
    "",
    "Thank you for taking the time to apply for a strategy call with Velocity Scales.",
    "",
    `We reviewed your application for ${businessLabel} and want to be upfront with you. Right now, our performance marketing systems are designed for businesses already generating at least $1,000 per month in revenue. Below that stage, paid advertising and testing budgets can put unnecessary pressure on your cash flow before your offer has enough margin to scale smoothly.`,
    "",
    "Because of that, we are not able to move forward with a strategy call right now.",
    "",
    "Here is what we recommend focusing on next:",
    "1. Keep building steady sales through organic social content, referrals, and repeat customers.",
    "2. Focus on your highest-margin product or service and increase your average client spend.",
    "3. Once your monthly revenue passes $1,000 consistently, reapply anytime and we would be glad to help you scale with Meta Ads.",
    "",
    "Wishing you strong growth ahead,",
    "Velocity Scales",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px;">
      <p>Hi ${escapeHtml(firstName)},</p>
      <p>Thank you for taking the time to apply for a strategy call with Velocity Scales.</p>
      <p>
        We reviewed your application for <strong>${escapeHtml(businessLabel)}</strong> and want to be upfront with you.
        Right now, our performance marketing systems are designed for businesses already generating at least
        <strong>$1,000 per month</strong> in revenue. Below that stage, paid advertising and testing budgets can put
        unnecessary pressure on your cash flow before your offer has enough margin to scale smoothly.
      </p>
      <p>Because of that, we are not able to move forward with a strategy call right now.</p>
      <p><strong>What we recommend focusing on next:</strong></p>
      <ol style="padding-left: 20px;">
        <li>Keep building steady sales through organic social content, referrals, and repeat customers.</li>
        <li>Focus on your highest-margin product or service and increase your average client spend.</li>
        <li>Once your monthly revenue passes $1,000 consistently, reapply anytime and we would be glad to help you scale with Meta Ads.</li>
      </ol>
      <p style="margin-top: 24px;">
        Wishing you strong growth ahead,<br />
        <strong>Velocity Scales</strong>
      </p>
    </div>
  `.trim();

  return { subject, text, html };
}

export async function handler(event) {
  try {
    const parsed = JSON.parse(event.body || "{}");
    const data = parsed?.payload?.data || {};

    const email = typeof data.email === "string" ? data.email.trim() : "";
    const monthlyRevenue =
      typeof data.monthly_revenue === "string" ? data.monthly_revenue.trim() : "";

    if (!email || !DISQUALIFYING_REVENUES.has(monthlyRevenue)) {
      return {
        statusCode: 200,
        body: JSON.stringify({ skipped: true }),
      };
    }

    const env = globalThis.process?.env ?? {};
    const senderEmail = env.SENDER_EMAIL || "jovinabesiga@gmail.com";
    const senderName = env.SENDER_NAME || "Velocity Scales";
    const { subject, text, html } = buildRejectionEmail({
      name: data.name,
      business: data.business,
    });

    if (env.BREVO_API_KEY) {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email, name: data.name || email }],
          replyTo: { email: senderEmail, name: senderName },
          subject,
          textContent: text,
          htmlContent: html,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Brevo rejection email failed:", response.status, errText);
        return { statusCode: 502, body: "Email provider error" };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ sent: true, provider: "brevo" }),
      };
    }

    if (env.RESEND_API_KEY) {
      const fromAddress = env.RESEND_FROM || `${senderName} <${senderEmail}>`;
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [email],
          reply_to: senderEmail,
          subject,
          text,
          html,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Resend rejection email failed:", response.status, errText);
        return { statusCode: 502, body: "Email provider error" };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ sent: true, provider: "resend" }),
      };
    }

    if (env.REJECTION_WEBHOOK_URL) {
      await fetch(env.REJECTION_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: data.name || "",
          business: data.business || "",
          monthly_revenue: monthlyRevenue,
          subject,
          text,
        }),
      });

      return {
        statusCode: 200,
        body: JSON.stringify({ sent: true, provider: "webhook" }),
      };
    }

    console.warn(
      "No email provider key configured (BREVO_API_KEY, RESEND_API_KEY, or REJECTION_WEBHOOK_URL). Skipped sending rejection email to:",
      email
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ skipped: true, reason: "missing_email_provider" }),
    };
  } catch (error) {
    console.error("Error in submission-created function:", error);
    return { statusCode: 500, body: "Internal error" };
  }
}
