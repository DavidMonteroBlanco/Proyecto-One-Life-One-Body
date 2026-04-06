<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $userName;
    public string $code;

    public function __construct(string $userName, string $code)
    {
        $this->userName = $userName;
        $this->code = $code;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tu código de verificación — One Life One Body',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    private function buildHtml(): string
    {
        $name = e($this->userName);
        $digits = str_split($this->code);

        $codeBoxes = '';
        foreach ($digits as $d) {
            $codeBoxes .= "<td style=\"width:42px;height:50px;background:#0d1515;border:2px solid #1a9e9e;border-radius:8px;text-align:center;font-family:'Courier New',monospace;font-size:26px;font-weight:bold;color:#7ee8e8;letter-spacing:0;\">{$d}</td><td style=\"width:6px;\"></td>";
        }

        return <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#070c0c;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#070c0c;padding:40px 20px;">
<tr><td align="center">
<table width="500" cellpadding="0" cellspacing="0" style="max-width:500px;width:100%;">

  <!-- Header con línea cian -->
  <tr>
    <td style="height:3px;background:linear-gradient(90deg,#1a9e9e,#7ee8e8,#1a9e9e);border-radius:4px 4px 0 0;"></td>
  </tr>

  <!-- Contenido principal -->
  <tr>
    <td style="background-color:#111c1c;padding:40px 36px 36px;border:1px solid rgba(126,232,232,0.12);border-top:none;border-radius:0 0 4px 4px;">

      <!-- Logo texto -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;color:#eaf7f7;letter-spacing:3px;padding-bottom:6px;">
            ONE LIFE
          </td>
        </tr>
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;color:#7ee8e8;letter-spacing:3px;padding-bottom:30px;">
            ONE BODY
          </td>
        </tr>
      </table>

      <!-- Saludo -->
      <p style="font-size:16px;color:#eaf7f7;margin:0 0 8px;">
        Hola <strong>{$name}</strong>,
      </p>
      <p style="font-size:14px;color:#8fb8b8;margin:0 0 28px;line-height:1.6;">
        Has solicitado cambiar tu contraseña. Usa el siguiente código de verificación:
      </p>

      <!-- Código -->
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
        <tr>
          {$codeBoxes}
        </tr>
      </table>

      <!-- Info -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="background:rgba(126,232,232,0.06);border-left:3px solid #1a9e9e;padding:14px 18px;border-radius:0 6px 6px 0;">
            <p style="font-size:13px;color:#8fb8b8;margin:0;line-height:1.5;">
              ⏱ Este código <strong style="color:#7ee8e8;">expira en 10 minutos</strong>.<br>
              Si no has solicitado este cambio, puedes ignorar este email.
            </p>
          </td>
        </tr>
      </table>

      <!-- Separador -->
      <hr style="border:none;border-top:1px solid rgba(126,232,232,0.1);margin:0 0 20px;">

      <!-- Footer -->
      <p style="font-size:12px;color:#4a6a6a;margin:0;line-height:1.5;">
        One Life One Body · Fitness Center · Benidorm, Alicante<br>
        Este email fue enviado automáticamente. No respondas a este mensaje.
      </p>

    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>
HTML;
    }
}