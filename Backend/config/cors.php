<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://onelifeonebody.8bitsandpixels.com',
        'https://onelifeonebody.8bitsandpixel.com',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    /*
     * false porque usamos tokens Bearer en localStorage, no cookies.
     */
    'supports_credentials' => false,

];
