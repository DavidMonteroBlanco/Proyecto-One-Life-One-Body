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
        | Modelo principal y modelos de reserva.
        |
        | Probado el 13/11/2026 con una clave del plan gratuito:
        |
        |   gemini-2.5-*            404, retirados para claves nuevas
        |   gemini-3.5/3.8-flash    503 casi siempre: saturados en gratis
        |   *-pro                   429, sin cuota en el plan gratuito
        |   gemini-3.6-flash        responde, pero tardó 163 s
        |   gemini-3.5-flash-lite   responde en ~1 s y no "piensa"
        |
        | Por eso el principal es un "lite": no es el más listo, pero
        | contesta, y completa las tres cosas que pide el proyecto (chat
        | de la web, asistente y borrador de dieta en JSON).
        |
        | Los modelos que "piensan" antes de contestar quedan solo de
        | reserva: con presupuestos de tokens ajustados gastaban casi todo
        | pensando y la respuesta salía cortada.
        |
        | Si Google retira alguno, se cambia la variable en el panel del
        | hosting, sin tocar código:
        |
        |   GEMINI_MODEL=gemini-3.5-flash-lite
        |   GEMINI_FALLBACK_MODELS=gemini-flash-lite-latest,gemini-3.1-flash-lite
        |
        | El alias "-latest" va el primero de la reserva a propósito:
        | Google lo mantiene apuntando al lite vigente, así que sobrevive a
        | las retiradas de versiones concretas.
        */
        'model' => env('GEMINI_MODEL', 'gemini-3.5-flash-lite'),

        'fallback_models' => array_filter(array_map('trim', explode(',', (string) env(
            'GEMINI_FALLBACK_MODELS',
            'gemini-flash-lite-latest,gemini-3.1-flash-lite,gemini-3-flash-preview'
        )))),
    ],
];
