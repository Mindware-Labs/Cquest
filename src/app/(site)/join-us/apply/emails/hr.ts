import { C, emailShell, escapeHtml, rowsTable, sectionLabel, type Row } from "@/lib/emails/shell";
import { AVAILABILITY_OPTIONS, ENGLISH_OPTIONS, EXPERIENCE_OPTIONS, formatBytes, optionLabel } from "../data";

export type HrEmailInput = {
  id: string;
  target: string;
  isPool: boolean;
  departmentLabel: string | null;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  experience: string;
  english: string;
  availability: string;
  message: string;
  resumeName: string;
  resumeSize: number;
  adminUrl: string;
};

const ACCENT = C.celeste;

export function buildHrEmail(input: HrEmailInput): { subject: string; html: string; text: string } {
  const candidate: Row[] = [
    { label: "Name", value: input.fullName },
    { label: "Email", value: input.email },
    { label: "Phone / WhatsApp", value: input.phone },
    { label: "City", value: input.city },
  ];

  const profile: Row[] = [
    { label: "Experience", value: optionLabel(EXPERIENCE_OPTIONS, input.experience) },
    { label: "English", value: optionLabel(ENGLISH_OPTIONS, input.english) },
    { label: "Availability", value: optionLabel(AVAILABILITY_OPTIONS, input.availability) },
    { label: "Resume", value: `${input.resumeName} · ${formatBytes(input.resumeSize)}` },
  ];
  if (input.isPool && input.departmentLabel) profile.unshift({ label: "Area of interest", value: input.departmentLabel });

  const messageBlock = input.message
    ? `
        <tr>
          <td style="padding:6px 32px 8px;">
            ${sectionLabel("Message from the candidate", ACCENT)}
            <div style="margin-top:10px;padding:14px 16px;background:${C.panel};border-left:3px solid ${ACCENT};font-size:13px;color:${C.body};line-height:1.6;white-space:pre-wrap;">${escapeHtml(input.message)}</div>
          </td>
        </tr>`
    : "";

  const body = `
        <tr>
          <td style="padding:28px 32px 6px;">
            ${sectionLabel(input.isPool ? "Open application" : "New application", ACCENT)}
            <div style="margin-top:10px;font-size:23px;font-weight:700;color:${C.strong};line-height:1.2;letter-spacing:-0.01em;">${escapeHtml(input.target)}</div>
            <div style="margin-top:5px;font-size:14px;color:${C.muted};">${escapeHtml(input.fullName)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px 6px;">
            ${sectionLabel("Candidate", ACCENT)}
            ${rowsTable(candidate)}
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px 6px;">
            ${sectionLabel("Profile", ACCENT)}
            ${rowsTable(profile)}
          </td>
        </tr>
        ${messageBlock}
        <tr>
          <td style="padding:22px 32px 30px;">
            <a href="${escapeHtml(input.adminUrl)}" style="display:inline-block;padding:13px 22px;background:${C.ink};color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;border-radius:2px;">Open in the panel</a>
            <div style="margin-top:12px;font-size:12px;color:${C.faint};">The resume is attached and also stored in the panel.</div>
          </td>
        </tr>`;

  const text = [
    `${input.isPool ? "Open application" : "New application"}: ${input.target}`,
    "",
    ...candidate.map((row) => `${row.label}: ${row.value}`),
    "",
    ...profile.map((row) => `${row.label}: ${row.value}`),
    input.message ? `\nMessage:\n${input.message}` : "",
    "",
    `Open in the panel: ${input.adminUrl}`,
  ].join("\n");

  return {
    subject: `${input.isPool ? "Open application" : "Application"} — ${input.target} · ${input.fullName}`,
    html: emailShell({ preheader: `${input.fullName} applied for ${input.target}`, accent: ACCENT, body }),
    text,
  };
}
