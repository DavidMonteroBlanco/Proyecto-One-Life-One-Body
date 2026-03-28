<?php
require __DIR__ . '/vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;

$mailCfg = require __DIR__ . '/mail_config.php';

$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->SMTPDebug = 2;
$mail->Debugoutput = 'html';

$mail->Host = $mailCfg['host'];
$mail->SMTPAuth = true;
$mail->Username = $mailCfg['username'];
$mail->Password = $mailCfg['password'];
$mail->Port = (int)$mailCfg['port'];

$mail->AuthType = 'LOGIN';
$mail->SMTPAutoTLS = false;
$mail->SMTPSecure = false;

$mail->setFrom($mailCfg['from_email'], $mailCfg['from_name']);
$mail->addAddress('test@demo.com');

$mail->Subject = 'Mailtrap test';
$mail->Body = 'Si esto aparece en Mailtrap Inbox, ya funciona.';

$mail->send();
echo "OK";
