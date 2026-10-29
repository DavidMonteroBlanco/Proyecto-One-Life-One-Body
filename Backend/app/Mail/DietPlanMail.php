<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

/**
 * Envía a un cliente su plan de alimentación en PDF.
 * El PDF se pasa ya renderizado: no se guarda en disco en ningún momento.
 */
class DietPlanMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public string $planTitle,
        public string $pdfContents,
        public string $pdfFilename,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tu plan de alimentación — One Life One Body',
        );
    }

    public function content(): Content
    {
        return new Content(htmlString: $this->buildHtml());
    }

    public function attachments(): array
    {
        return [
            Attachment::fromData(fn () => $this->pdfContents, $this->pdfFilename)
                ->withMime('application/pdf'),
        ];
    }

    private function buildHtml(): string
    {
        $name = e(explode(' ', trim($this->userName))[0]);
        $title = e($this->planTitle);

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

  <tr>
    <td style="height:3px;background:linear-gradient(90deg,#1a9e9e,#7ee8e8,#1a9e9e);border-radius:4px 4px 0 0;"></td>
  </tr>

  <tr>
    <td style="background-color:#111c1c;padding:40px 36px 36px;border:1px solid rgba(126,232,232,0.12);border-top:none;border-radius:0 0 4px 4px;">

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:22px;font-weight:bold;color:#eaf7f7;letter-spacing:3px;padding-bottom:6px;">ONE LIFE</td>
        </tr>
        <tr>
          <td style="font-size:22px;font-weight:bold;color:#7ee8e8;letter-spacing:3px;padding-bottom:30px;">ONE BODY</td>
        </tr>
      </table>

      <p style="font-size:16px;color:#eaf7f7;margin:0 0 8px;">
        Hola <strong>{$name}</strong>,
      </p>
      <p style="font-size:14px;color:#8fb8b8;margin:0 0 24px;line-height:1.6;">
        Aquí tienes tu plan de alimentación. Lo llevas adjunto en PDF para que
        puedas guardarlo en el móvil o imprimirlo.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="background:rgba(126,232,232,0.06);border-left:3px solid #1a9e9e;padding:14px 18px;border-radius:0 6px 6px 0;">
            <p style="font-size:11px;color:#4a6a6a;margin:0 0 4px;letter-spacing:1.5px;text-transform:uppercase;">Plan adjunto</p>
            <p style="font-size:15px;color:#7ee8e8;margin:0;font-weight:bold;">{$title}</p>
          </td>
        </tr>
      </table>

      <p style="font-size:14px;color:#8fb8b8;margin:0 0 28px;line-height:1.6;">
        Cualquier duda con las cantidades o si algo no te encaja, escríbeme y lo ajustamos.
        Recuerda reservar tu pesaje semanal desde tu área de cliente.
      </p>

      <hr style="border:none;border-top:1px solid rgba(126,232,232,0.1);margin:0 0 20px;">

      <p style="font-size:11px;color:#4a6a6a;margin:0 0 12px;line-height:1.5;">
        Este plan es personal y está hecho para ti: no lo compartas. Es orientativo y no
        sustituye el consejo de un médico o un dietista-nutricionista colegiado.
      </p>

      <p style="font-size:12px;color:#4a6a6a;margin:0;line-height:1.5;">
        One Life One Body · Fitness Center · Benidorm, Alicante
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
