<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),

        /*
        | El modelo va aquí y no escrito dentro de los controladores.
        |
        | Google retira modelos con el tiempo: el 29/10/2026,
        | gemini-2.5-flash dejó de aceptar claves nuevas y devolvía un
        | 404 pidiendo usar otro. Estaba puesto a mano en dos sitios, así
        | que la única salida era tocar código y volver a desplegar.
        |
        | Con esto, el día que vuelva a pasar se cambia la variable
        | GEMINI_MODEL en el panel del hosting y listo.
        */
        'model' => env('GEMINI_MODEL', 'gemini-3.8-flash'),
    ],
];
