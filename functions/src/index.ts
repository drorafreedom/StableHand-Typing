
// functions/src/index.ts
import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import sgMail from "@sendgrid/mail";

admin.initializeApp();

// Use Firebase secrets (set via CLI)
const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");
const FROM_EMAIL = defineSecret("FROM_EMAIL");

// Change recipients here
const TEAM_RECIPIENTS = ["drora@caltech.edu", "jburdick@caltech.edu"];

export const emailOnNewMessage = onDocumentCreated(
  {
    document: "messages/{messageId}", // <-- must match your collection path
    region: "us-central1",
    secrets: [SENDGRID_API_KEY, FROM_EMAIL],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      logger.warn("No snapshot data in event.");
      return;
    }
    const data = snap.data() as any;

    const {
      name = "Unknown",
      email = "",
      subject = "New Contact Form Message",
      message = "",
      sendCopy = false,
      userId = "anonymous",
      timestamp,
      source = "contact_form",
    } = data || {};

    try {
      sgMail.setApiKey(SENDGRID_API_KEY.value());

      const submittedAt = timestamp?.toDate
        ? timestamp.toDate().toISOString()
        : new Date().toISOString();

      const plain = [
        `New message from Stable Hand contact form`,
        `-----------------------------------------`,
        `Name: ${name}`,
        `Email: ${email}`,
        `User ID: ${userId}`,
        `Source: ${source}`,
        `Submitted: ${submittedAt}`,
        ``,
        `Subject: ${subject}`,
        ``,
        message,
        ``,
        `— End of message —`,
      ].join("\n");

      const html = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5">
          <h2 style="margin:0 0 12px">New message from Stable Hand contact form</h2>
          <table style="border-collapse:collapse;margin-bottom:16px">
            <tr><td style="padding:4px 8px"><b>Name</b></td><td style="padding:4px 8px">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:4px 8px"><b>Email</b></td><td style="padding:4px 8px">${escapeHtml(email)}</td></tr>
            <tr><td style="padding:4px 8px"><b>User ID</b></td><td style="padding:4px 8px">${escapeHtml(userId)}</td></tr>
            <tr><td style="padding:4px 8px"><b>Source</b></td><td style="padding:4px 8px">${escapeHtml(source)}</td></tr>
            <tr><td style="padding:4px 8px"><b>Submitted</b></td><td style="padding:4px 8px">${submittedAt}</td></tr>
          </table>
          <p style="margin:0 0 4px"><b>Subject:</b> ${escapeHtml(subject)}</p>
          <pre style="white-space:pre-wrap;background:#f6f8fa;padding:12px;border-radius:8px;border:1px solid #e5e7eb">${escapeHtml(
            message
          )}</pre>
        </div>
      `;

      // Send to team
      await sgMail.send({
        to: TEAM_RECIPIENTS,
        from: FROM_EMAIL.value(),
        replyTo: email || FROM_EMAIL.value(),
        subject: `[Stable Hand] ${subject} — ${name}`,
        text: plain,
        html,
      });

      // Optional: email a copy to the sender
      if (sendCopy && email) {
        await sgMail.send({
          to: email,
          from: FROM_EMAIL.value(),
          replyTo: FROM_EMAIL.value(),
          subject: `Copy: ${subject} — Stable Hand`,
          text: `Thanks for contacting us!\n\nHere’s a copy of your message:\n\n${plain}`,
          html:
            `<p style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">Thanks for contacting us! Here’s a copy of your message:</p>` +
            html,
        });
      }

      logger.info(`✅ Email(s) sent for message ${event.params.messageId}`);
    } catch (err: any) {
      logger.error("❌ Failed to send contact email", {
        error: err?.message || err,
        stack: err?.stack,
      });
    }
  }
);

// Simple HTML escaping
function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}



// /**
//  * Import function triggers from their respective submodules:
//  *
//  * import {onCall} from "firebase-functions/v2/https";
//  * import {onDocumentWritten} from "firebase-functions/v2/firestore";
//  *
//  * See a full list of supported triggers at https://firebase.google.com/docs/functions
//  */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript

// // export const helloWorld = onRequest((request, response) => {
// //   logger.info("Hello logs!", {structuredData: true});
// //   response.send("Hello from Firebase!");
// // });
