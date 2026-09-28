type EmailLayoutOptions = {
    preheader?: string
    welcomeText?: string
    bodyHtml: string
}

export function escapeHtml(value: unknown): string {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;")
}

export function renderEmailLayout({preheader, welcomeText, bodyHtml}: EmailLayoutOptions): string {
    const pre = preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>` : ""
    const welcome = welcomeText
        ? `<div class="text-welcome">${escapeHtml(welcomeText)}</div>`
        : ""

    return `
<!doctype html>
<html lang="ru">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: Arial, Helvetica, sans-serif; color: #0f172a; }
    .wrapper { background-color: #fff; border-radius: 4px; max-width: 550px; width: 100%; margin: 64px 0; padding: 32px 48px; box-sizing: border-box; }
    .wrapper-td { padding: 0 10px; }
    .logo-wrap { text-align: center; padding: 16px 0; margin-bottom: 48px; font-size: 24px; font-weight: 800; letter-spacing: 0.06em; color: #0f172a; }
    .text-wrap { text-align: center; margin: 20px 0; }
    .text-welcome { font-weight: bold; font-size: 18px; margin-bottom: 24px; }
    .text-body { line-height: 25px; font-size: 16px; }
    .activation-link { display: inline-block; padding: 16px 48px; border-radius: 26px; background-color: #0f172a; color: #fff !important; text-decoration: none; margin: 40px 0; font-weight: 700; }
    .link-copy { opacity: .75; font-size: 14px; line-height: 24px; }
    .link-copy a { color: #0f172a; word-break: break-all; }
  </style>
</head>
<body>
  ${pre}
  <table width="100%" style="background-color:#f1f5f9" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tr>
      <td align="center" class="wrapper-td">
        <div class="wrapper">
          <div class="logo-wrap">NEXUS</div>
          <div class="text-wrap">
            ${welcome}
            ${bodyHtml}
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

export function renderJsonBlock(data: Record<string, unknown>): string {
    const pretty = escapeHtml(JSON.stringify(data, null, 2))
    return `<pre style="text-align:left;background:#f1f5f9;border-radius:8px;padding:12px;font-size:12px;line-height:18px;overflow:auto;">${pretty}</pre>`
}
