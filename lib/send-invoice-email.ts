/**
 * Factuur per e-mail: SMTP (eigen mailbox) of optioneel Resend API.
 *
 * SMTP: zet SMTP_HOST, SMTP_USER, SMTP_PASS (+ optioneel SMTP_PORT, SMTP_SECURE) en EMAIL_FROM.
 * Resend: zet RESEND_API_KEY en EMAIL_FROM (als geen SMTP is ingevuld).
 */
import nodemailer from "nodemailer";

export function isSmtpConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST?.trim() &&
    process.env.SMTP_USER?.trim() &&
    process.env.SMTP_PASS?.trim()
  );
}

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY?.trim();
}

/** True als er een afzender is én SMTP of Resend is ingevuld. */
export function isInvoiceEmailConfigured(): boolean {
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) return false;
  return isSmtpConfigured() || isResendConfigured();
}

export type SendInvoiceEmailParams = {
  to: string;
  subject: string;
  html: string;
  pdfFilename: string;
  pdfBytes: Uint8Array;
};

export async function sendInvoiceEmail(
  params: SendInvoiceEmailParams
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (isSmtpConfigured()) {
    return sendViaSmtp(params);
  }
  if (isResendConfigured()) {
    return sendViaResend(params);
  }
  return {
    ok: false,
    error:
      "E-mail is niet geconfigureerd. Zet EMAIL_FROM plus SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS) of RESEND_API_KEY. Zie BOEKHOUDING-SETUP.md.",
  };
}

async function sendViaSmtp(
  params: SendInvoiceEmailParams
): Promise<{ ok: true } | { ok: false; error: string }> {
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    return { ok: false, error: "EMAIL_FROM ontbreekt." };
  }

  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secureRaw = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure = secureRaw === "true" || secureRaw === "1" || port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!.trim(),
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER!.trim(),
      pass: process.env.SMTP_PASS!.trim(),
    },
  });

  try {
    await transporter.sendMail({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      attachments: [
        {
          filename: params.pdfFilename,
          content: Buffer.from(params.pdfBytes),
          contentType: "application/pdf",
        },
      ],
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "SMTP-versturen mislukt.";
    return { ok: false, error: msg };
  }
}

async function sendViaResend(
  params: SendInvoiceEmailParams
): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!key || !from) {
    return {
      ok: false,
      error:
        "Resend: RESEND_API_KEY en EMAIL_FROM zijn verplicht. Of gebruik SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS).",
    };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      attachments: [
        {
          filename: params.pdfFilename,
          content: Buffer.from(params.pdfBytes).toString("base64"),
        },
      ],
    }),
  });

  const json = (await res.json().catch(() => ({}))) as { message?: string; error?: string };

  if (!res.ok) {
    const msg = json.message || json.error || `E-mail versturen mislukt (${res.status}).`;
    return { ok: false, error: msg };
  }
  return { ok: true };
}

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
