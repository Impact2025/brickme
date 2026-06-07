import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Brickme <hello@brickme.nl>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://brickme.nl";

// Strip HTML tags voor plain-text fallback
function htmlNaarTekst(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

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

function knopTekst(tekst: string, href: string): string {
  return `\n${tekst}: ${href}\n`;
}

type EmailResult = { ok: boolean; error?: string };

async function stuurEmail(opts: {
  to: string;
  subject: string;
  inhoud: string;
}): Promise<EmailResult> {
  const html = layout(opts.inhoud);
  const text = htmlNaarTekst(opts.inhoud) + `\n\n—\nJe ontvangt dit bericht omdat je een account hebt bij Brickme.\n${APP_URL}`;
  try {
    const result = await resend.emails.send({ from: FROM, to: opts.to, subject: opts.subject, html, text });
    if (result.error) {
      console.error("[email] mislukt:", opts.subject, result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] exception:", opts.subject, err);
    return { ok: false, error: String(err) };
  }
}

// ─── Magic link ──────────────────────────────────────────────────────────────

export async function sendMagicLinkEmail(naam: string, email: string, token: string): Promise<void> {
  const url = `${APP_URL}/verify-magic?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  const inhoud = `
    <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#2C1F14;">Inloggen bij Brickme</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#2C1F14;">
      Hoi${naam ? ` ${naam}` : ""},<br/><br/>
      Klik op de knop hieronder om in te loggen. De link is 15 minuten geldig.
    </p>
    ${knop("Inloggen →", url)}
    ${knopTekst("Inloggen", url)}
    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#8B7355;">
      Heb je dit niet aangevraagd? Dan kun je deze mail negeren.
    </p>
  `;

  await stuurEmail({ to: email, subject: "Jouw Brickme inloglink", inhoud });
}

// ─── Verificatiemail (registratie) ───────────────────────────────────────────

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

  await stuurEmail({ to: email, subject: "Jouw Brickme verificatiecode", inhoud });
}

// ─── Inlogcode ────────────────────────────────────────────────────────────────

export async function sendInlogcodeEmail(naam: string, email: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const inhoud = `
    <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#2C1F14;">Jouw inlogcode</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#2C1F14;">
      Hoi${naam ? ` ${naam}` : ""},<br/><br/>
      Gebruik onderstaande code om in te loggen bij Brickme. De code is 15 minuten geldig.
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <div style="display:inline-block;padding:20px 40px;background:#F5F0E8;border-radius:12px;">
        <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#C8583A;">${code}</span>
      </div>
    </div>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#8B7355;">
      Heb je dit niet aangevraagd? Dan kun je deze mail negeren.
    </p>
  `;

  return stuurEmail({ to: email, subject: "Jouw inlogcode voor Brickme", inhoud });
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

  await stuurEmail({ to: email, subject: "Welkom bij Brickme", inhoud });
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

  await stuurEmail({ to: email, subject: `Uitnodiging: ${workshopNaam}`, inhoud });
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

  await stuurEmail({ to: email, subject: `Je Brickme rapport — ${themaLabel}`, inhoud });
}

// ─── Terugkeersessie uitnodiging ──────────────────────────────────────────────

export async function sendTerugkeerEmail(
  naam: string,
  email: string,
  themaLabel: string,
  eersteStap: string,
  vorigeSessieId: string,
  thema: string
): Promise<void> {
  const url = `${APP_URL}/start?terugkeer=${vorigeSessieId}&thema=${thema}`;

  const inhoud = `
    <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#2C1F14;">Zes weken verder</h1>
    <p style="margin:0 0 8px;font-size:13px;color:#8B7355;text-transform:uppercase;letter-spacing:1px;">${themaLabel}</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#2C1F14;">
      Hoi${naam ? ` ${naam}` : ""},<br/><br/>
      Zes weken geleden bouwde je iets. Je hebt het toen geformuleerd, gefotografeerd en gereflecteerd.
      En daarna ben je verder gegaan met je leven.
    </p>
    ${eersteStap ? `
    <div style="padding:20px 24px;background:#F5F0E8;border-radius:8px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:1px;">Je eerste stap was</p>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#2C1F14;font-style:italic;">"${eersteStap}"</p>
    </div>
    ` : ""}
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#2C1F14;">
      Bouw het opnieuw. Hetzelfde thema, maar nu. Brickme gebruikt je vorige sessie als context —
      zodat de reflectie laat zien wat er veranderd is.
    </p>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#8B7355;">
      Dit is een terugkeersessie. Alleen beschikbaar voor abonnees.
    </p>
    ${knop("Bouw opnieuw →", url)}
    ${knopTekst("Terugkeersessie starten", url)}
  `;

  await stuurEmail({ to: email, subject: `Zes weken later — bouw het opnieuw | Brickme`, inhoud });
}

// ─── Follow-up dag 3 ─────────────────────────────────────────────────────────

export async function sendFollowupDag3Email(
  naam: string,
  email: string,
  themaLabel: string,
  eersteStap: string
): Promise<void> {
  const inhoud = `
    <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#2C1F14;">Hoe gaat het?</h1>
    <p style="margin:0 0 8px;font-size:13px;color:#8B7355;text-transform:uppercase;letter-spacing:1px;">${themaLabel}</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#2C1F14;">
      Hoi${naam ? ` ${naam}` : ""},<br/><br/>
      Je deed een paar dagen geleden een Brickme-sessie. Niet om je iets te verkopen — gewoon even kijken hoe het gaat.
    </p>
    ${eersteStap ? `
    <div style="padding:20px 24px;background:#F5F0E8;border-radius:8px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:1px;">Je eerste stap was</p>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#2C1F14;font-style:italic;">"${eersteStap}"</p>
    </div>
    <p style="margin:0;font-size:16px;line-height:1.6;color:#2C1F14;">
      Is daar iets van in beweging gekomen?
    </p>
    ` : `
    <p style="margin:0;font-size:16px;line-height:1.6;color:#2C1F14;">
      Is er iets in beweging gekomen?
    </p>
    `}
  `;

  await stuurEmail({ to: email, subject: `Hoe gaat het? — Brickme`, inhoud });
}

// ─── Follow-up dag 21 ─────────────────────────────────────────────────────────

export async function sendFollowupDag21Email(
  naam: string,
  email: string,
  themaLabel: string
): Promise<void> {
  const inhoud = `
    <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#2C1F14;">Drie weken verder</h1>
    <p style="margin:0 0 8px;font-size:13px;color:#8B7355;text-transform:uppercase;letter-spacing:1px;">${themaLabel}</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#2C1F14;">
      Hoi${naam ? ` ${naam}` : ""},<br/><br/>
      Je Brickme-sessie was drie weken geleden. Soms is dat genoeg tijd om te voelen of er iets verschoven is — of juist niet.
    </p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#2C1F14;">
      Als je merkt dat het thema nog steeds speelt — of dat er een nieuw vraagstuk is opgekomen — kan een vervolgsessie helpen om het opnieuw concreet te maken.
    </p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#8B7355;">
      Geen verplichting. Gewoon een uitnodiging.
    </p>
    ${knop("Kies een thema →", `${APP_URL}/start`)}
  `;

  await stuurEmail({ to: email, subject: `Drie weken na je sessie — Brickme`, inhoud });
}

// ─── Nieuw account notificatie (intern) ──────────────────────────────────────

export async function sendNieuwAccountNotificatie(naam: string | null, email: string): Promise<void> {
  const inhoud = `
    <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#2C1F14;">Nieuw account</h1>
    <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#2C1F14;">
      <strong>Naam:</strong> ${naam ?? "—"}<br/>
      <strong>E-mail:</strong> ${email}<br/>
      <strong>Tijdstip:</strong> ${new Date().toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" })}
    </p>
  `;

  await stuurEmail({ to: "hello@brickme.nl", subject: `Nieuw account: ${naam ?? email}`, inhoud });
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

  await stuurEmail({ to: email, subject: "Je bent gekoppeld aan een coach", inhoud });
}
