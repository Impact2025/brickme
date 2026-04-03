import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Brickme <hello@brickme.nl>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://brickme.nl";

// Gedeelde layout wrapper
function layout(inhoud: string): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Brickme</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Inter,Arial,sans-serif;color:#2C1F14;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
        <tr>
          <td style="background:#C8583A;padding:32px 40px;">
            <span style="font-size:22px;font-weight:700;color:#F5F0E8;letter-spacing:-0.5px;">Brickme</span>
          </td>
        </tr>
        <tr><td style="padding:40px;">${inhoud}</td></tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #F0EBE3;">
            <p style="margin:0;font-size:13px;color:#8B7355;">
              Je ontvangt dit bericht omdat je een account hebt bij Brickme.<br/>
              <a href="${APP_URL}" style="color:#C8583A;text-decoration:none;">brickme.nl</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function knop(tekst: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:14px 28px;background:#C8583A;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">${tekst}</a>`;
}

// ─── Verificatiemail ─────────────────────────────────────────────────────────

export async function sendVerificatieEmail(naam: string, email: string, code: string): Promise<void> {
  const inhoud = `
    <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#2C1F14;">Bevestig je e-mailadres</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#2C1F14;">
      Hoi${naam ? ` ${naam}` : ""},<br/><br/>
      Gebruik onderstaande code om je account te activeren. De code is 15 minuten geldig.
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <div style="display:inline-block;padding:20px 40px;background:#F5F0E8;border-radius:12px;">
        <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#C8583A;">${code}</span>
      </div>
    </div>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#8B7355;">
      Heb je geen account aangemaakt? Dan kun je deze mail negeren.
    </p>
  `;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${code} — jouw Brickme verificatiecode`,
    html: layout(inhoud),
  }).catch((err) => console.error("[email] sendVerificatieEmail mislukt:", err));
}

// ─── Welkomstmail ─────────────────────────────────────────────────────────────

export async function sendWelkomEmail(naam: string, email: string): Promise<void> {
  const inhoud = `
    <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#2C1F14;">Welkom bij Brickme${naam ? `, ${naam}` : ""}</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#2C1F14;">
      Je account is aangemaakt. Je kunt nu beginnen met je eerste sessie — kies een levensthema en ga aan de slag.
    </p>
    <p style="margin:0;font-size:16px;line-height:1.6;color:#8B7355;">
      Neem de tijd. Dit is jouw ruimte om te onderzoeken wat er speelt.
    </p>
    ${knop("Begin je eerste sessie", `${APP_URL}/sessie/nieuw`)}
  `;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Welkom bij Brickme",
    html: layout(inhoud),
  }).catch((err) => console.error("[email] sendWelkomEmail mislukt:", err));
}

// ─── Workshop uitnodiging ─────────────────────────────────────────────────────

export async function sendWorkshopUitnodigingEmail(
  email: string,
  naam: string,
  workshopNaam: string,
  code: string
): Promise<void> {
  const inhoud = `
    <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#2C1F14;">Je bent uitgenodigd</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#2C1F14;">
      Hoi${naam ? ` ${naam}` : ""},<br/><br/>
      Je bent uitgenodigd voor de workshop <strong>${workshopNaam}</strong>.
    </p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#2C1F14;">
      Gebruik deze code om je aan te sluiten:
    </p>
    <div style="display:inline-block;padding:16px 32px;background:#F5F0E8;border-radius:8px;font-size:32px;font-weight:700;letter-spacing:8px;color:#C8583A;">${code}</div>
    ${knop("Workshop openen", `${APP_URL}/facilitator/deelnemen?code=${code}`)}
  `;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Uitnodiging: ${workshopNaam}`,
    html: layout(inhoud),
  }).catch((err) => console.error("[email] sendWorkshopUitnodigingEmail mislukt:", err));
}

// ─── Rapport gereed ───────────────────────────────────────────────────────────

export async function sendRapportGereedEmail(
  email: string,
  naam: string,
  themaLabel: string,
  samenvatting: string,
  eersteStap: string,
  inzichten: string[]
): Promise<void> {
  const inzichtenLijst = inzichten
    .map((i) => `<li style="margin-bottom:8px;">${i}</li>`)
    .join("");

  const inhoud = `
    <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#2C1F14;">Je rapport is klaar</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#8B7355;text-transform:uppercase;letter-spacing:1px;">${themaLabel}</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#2C1F14;">${samenvatting}</p>
    ${inzichtenLijst ? `
    <h2 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#2C1F14;">Jouw inzichten</h2>
    <ul style="margin:0 0 24px;padding-left:20px;font-size:16px;line-height:1.6;color:#2C1F14;">
      ${inzichtenLijst}
    </ul>
    ` : ""}
    ${eersteStap ? `
    <div style="padding:20px 24px;background:#F5F0E8;border-radius:8px;margin-bottom:8px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:1px;">Eerste stap</p>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#2C1F14;">${eersteStap}</p>
    </div>
    ` : ""}
    ${knop("Bekijk je volledige rapport", `${APP_URL}`)}
  `;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Je Brickme rapport — ${themaLabel}`,
    html: layout(inhoud),
  }).catch((err) => console.error("[email] sendRapportGereedEmail mislukt:", err));
}

// ─── Coach koppeling ──────────────────────────────────────────────────────────

export async function sendCoachKoppelingEmail(
  email: string,
  naam: string,
  coachNaam: string | null
): Promise<void> {
  const inhoud = `
    <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#2C1F14;">Je hebt een coach</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#2C1F14;">
      Hoi${naam ? ` ${naam}` : ""},<br/><br/>
      ${coachNaam ? `<strong>${coachNaam}</strong> begeleidt` : "Een coach begeleidt"} je voortaan als coach bij Brickme.
      Je sessies en reflecties zijn voor hen zichtbaar.
    </p>
    <p style="margin:0;font-size:16px;line-height:1.6;color:#8B7355;">
      Je kunt gewoon blijven werken — er is niets extra's nodig van jou.
    </p>
    ${knop("Open Brickme", APP_URL)}
  `;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Je bent gekoppeld aan een coach",
    html: layout(inhoud),
  }).catch((err) => console.error("[email] sendCoachKoppelingEmail mislukt:", err));
}
