<?php

/*
|--------------------------------------------------------------------------
| One Life One Body — ajustes del negocio
|--------------------------------------------------------------------------
|
| Todo lo que es "de David" y no del framework vive aquí, para poder
| cambiarlo desde el .env sin tocar código.
|
*/

return [

    /*
    | Datos del centro. Salen en los PDF y en el pie de los emails.
    */
    'nombre'    => env('OLOB_NOMBRE', 'One Life One Body'),
    'direccion' => env('OLOB_DIRECCION', 'C/ de Goya 37, 03502 Benidorm, Alicante'),
    'telefono'  => env('OLOB_TELEFONO', '+34 601 38 72 63'),
    'web'       => env('OLOB_WEB', 'https://onelifeonebody.8bitsandpixels.com'),
    'instagram' => env('OLOB_INSTAGRAM', 'one.life.one.body.benidorm'),

    /*
    | Correo del gimnasio.
    |
    | 'avisos'  → recibe notificaciones de actividad: reservas nuevas,
    |             cancelaciones y altas de clientes.
    | 'copia'   → recibe copia oculta de lo que se envía a los clientes
    |             (planes de dieta, entrenos), para tener constancia.
    |
    | Si se dejan vacíos simplemente no se envía nada: el sistema sigue
    | funcionando igual.
    */
    'avisos' => env('OLOB_MAIL_AVISOS', ''),
    'copia'  => env('OLOB_MAIL_COPIA', ''),

    /*
    | Reintentos de las operaciones que fallan (emails, PDF).
    |
    | Las esperas son minutos desde el intento anterior. Con estos
    | valores, una operación se reintenta a los 2, 10, 60 y 240 minutos
    | antes de darse por perdida y aparecer en el panel de incidencias.
    */
    'reintentos' => [
        'esperas' => [2, 10, 60, 240],
    ],

    /*
    | Contraseña de las dos cuentas de demostración que crea
    | DemoSeeder. Va por config y no con env() directo porque en el
    | servidor se ejecuta "config:cache", y ahí env() devuelve null.
    */
    'demo_password' => env('DEMO_PASSWORD', 'Demo2026!Olob'),
];
