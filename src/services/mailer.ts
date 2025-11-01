import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = (() => {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    return null as any;
  }
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: { user: env.smtpUser, pass: env.smtpPass },
  });
})();

export const sendOtpEmail = async (to: string, code: string) => {
  if (!transporter) {
    return false;
  }
  const subject = "Your verification code";
  const text = `Your verification code is ${code}. It expires in 10 minutes.`;
  const html = `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`;
  await transporter.sendMail({
    from: env.smtpFrom || env.smtpUser,
    to,
    subject,
    text,
    html,
  });
  return true;
};
