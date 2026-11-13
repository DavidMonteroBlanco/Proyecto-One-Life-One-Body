<?php

/*
|--------------------------------------------------------------------------
| Mensajes de validación en español
|--------------------------------------------------------------------------
|
| Lo que ve el cliente cuando un formulario no pasa: registrarse,
| cambiar la contraseña, reservar una cita...
|
| Lleva TODAS las claves que trae Laravel en inglés, no solo las que se
| usan hoy. Si faltara una, en el servidor saldría la clave en bruto
| ("validation.required") en lugar de un mensaje, que es justo lo que
| pasaba antes de que existiera este fichero.
|
*/

return [

    'accepted'             => 'Debes aceptar el campo :attribute.',
    'accepted_if'          => 'Debes aceptar el campo :attribute cuando :other sea :value.',
    'active_url'           => 'El campo :attribute debe ser una URL válida.',
    'after'                => 'El campo :attribute debe ser una fecha posterior a :date.',
    'after_or_equal'       => 'El campo :attribute debe ser una fecha posterior o igual a :date.',
    'alpha'                => 'El campo :attribute solo puede contener letras.',
    'alpha_dash'           => 'El campo :attribute solo puede contener letras, números, guiones y guiones bajos.',
    'alpha_num'            => 'El campo :attribute solo puede contener letras y números.',
    'any_of'               => 'El campo :attribute no es válido.',
    'array'                => 'El campo :attribute debe ser una lista.',
    'ascii'                => 'El campo :attribute solo puede contener caracteres alfanuméricos y símbolos de un byte.',
    'before'               => 'El campo :attribute debe ser una fecha anterior a :date.',
    'before_or_equal'      => 'El campo :attribute debe ser una fecha anterior o igual a :date.',
    'between'              => [
        'array'   => 'El campo :attribute debe tener entre :min y :max elementos.',
        'file'    => 'El archivo :attribute debe pesar entre :min y :max kilobytes.',
        'numeric' => 'El campo :attribute debe estar entre :min y :max.',
        'string'  => 'El campo :attribute debe tener entre :min y :max caracteres.',
    ],
    'boolean'              => 'El campo :attribute debe ser verdadero o falso.',
    'can'                  => 'El campo :attribute contiene un valor no autorizado.',
    'confirmed'            => 'La confirmación de :attribute no coincide.',
    'contains'             => 'Al campo :attribute le falta un valor obligatorio.',
    'current_password'     => 'La contraseña no es correcta.',
    'date'                 => 'El campo :attribute debe ser una fecha válida.',
    'date_equals'          => 'El campo :attribute debe ser una fecha igual a :date.',
    'date_format'          => 'El campo :attribute debe tener el formato :format.',
    'decimal'              => 'El campo :attribute debe tener :decimal decimales.',
    'declined'             => 'Debes rechazar el campo :attribute.',
    'declined_if'          => 'Debes rechazar el campo :attribute cuando :other sea :value.',
    'different'            => 'Los campos :attribute y :other deben ser distintos.',
    'digits'               => 'El campo :attribute debe tener :digits dígitos.',
    'digits_between'       => 'El campo :attribute debe tener entre :min y :max dígitos.',
    'dimensions'           => 'La imagen :attribute tiene unas dimensiones no válidas.',
    'distinct'             => 'El campo :attribute tiene un valor repetido.',
    'doesnt_contain'       => 'El campo :attribute no puede contener ninguno de estos valores: :values.',
    'doesnt_end_with'      => 'El campo :attribute no puede terminar en: :values.',
    'doesnt_start_with'    => 'El campo :attribute no puede empezar por: :values.',
    'email'                => 'El campo :attribute debe ser un correo electrónico válido.',
    'encoding'             => 'El campo :attribute debe estar codificado en :encoding.',
    'ends_with'            => 'El campo :attribute debe terminar en: :values.',
    'enum'                 => 'El valor de :attribute no es válido.',
    'exists'               => 'El valor de :attribute no es válido.',
    'extensions'           => 'El archivo :attribute debe tener una de estas extensiones: :values.',
    'file'                 => 'El campo :attribute debe ser un archivo.',
    'filled'               => 'El campo :attribute no puede estar vacío.',
    'gt'                   => [
        'array'   => 'El campo :attribute debe tener más de :value elementos.',
        'file'    => 'El archivo :attribute debe pesar más de :value kilobytes.',
        'numeric' => 'El campo :attribute debe ser mayor que :value.',
        'string'  => 'El campo :attribute debe tener más de :value caracteres.',
    ],
    'gte'                  => [
        'array'   => 'El campo :attribute debe tener :value elementos o más.',
        'file'    => 'El archivo :attribute debe pesar :value kilobytes o más.',
        'numeric' => 'El campo :attribute debe ser mayor o igual que :value.',
        'string'  => 'El campo :attribute debe tener :value caracteres o más.',
    ],
    'hex_color'            => 'El campo :attribute debe ser un color hexadecimal válido.',
    'image'                => 'El archivo :attribute debe ser una imagen.',
    'in'                   => 'El valor de :attribute no es válido.',
    'in_array'             => 'El campo :attribute debe estar en :other.',
    'in_array_keys'        => 'El campo :attribute debe contener al menos una de estas claves: :values.',
    'integer'              => 'El campo :attribute debe ser un número entero.',
    'ip'                   => 'El campo :attribute debe ser una dirección IP válida.',
    'ipv4'                 => 'El campo :attribute debe ser una dirección IPv4 válida.',
    'ipv6'                 => 'El campo :attribute debe ser una dirección IPv6 válida.',
    'json'                 => 'El campo :attribute debe ser un texto JSON válido.',
    'list'                 => 'El campo :attribute debe ser una lista.',
    'lowercase'            => 'El campo :attribute debe estar en minúsculas.',
    'lt'                   => [
        'array'   => 'El campo :attribute debe tener menos de :value elementos.',
        'file'    => 'El archivo :attribute debe pesar menos de :value kilobytes.',
        'numeric' => 'El campo :attribute debe ser menor que :value.',
        'string'  => 'El campo :attribute debe tener menos de :value caracteres.',
    ],
    'lte'                  => [
        'array'   => 'El campo :attribute no puede tener más de :value elementos.',
        'file'    => 'El archivo :attribute debe pesar :value kilobytes o menos.',
        'numeric' => 'El campo :attribute debe ser menor o igual que :value.',
        'string'  => 'El campo :attribute debe tener :value caracteres o menos.',
    ],
    'mac_address'          => 'El campo :attribute debe ser una dirección MAC válida.',
    'max'                  => [
        'array'   => 'El campo :attribute no puede tener más de :max elementos.',
        'file'    => 'El archivo :attribute no puede pesar más de :max kilobytes.',
        'numeric' => 'El campo :attribute no puede ser mayor que :max.',
        'string'  => 'El campo :attribute no puede tener más de :max caracteres.',
    ],
    'max_digits'           => 'El campo :attribute no puede tener más de :max dígitos.',
    'mimes'                => 'El archivo :attribute debe ser de tipo: :values.',
    'mimetypes'            => 'El archivo :attribute debe ser de tipo: :values.',
    'min'                  => [
        'array'   => 'El campo :attribute debe tener al menos :min elementos.',
        'file'    => 'El archivo :attribute debe pesar al menos :min kilobytes.',
        'numeric' => 'El campo :attribute debe ser como mínimo :min.',
        'string'  => 'El campo :attribute debe tener al menos :min caracteres.',
    ],
    'min_digits'           => 'El campo :attribute debe tener al menos :min dígitos.',
    'missing'              => 'El campo :attribute no debe enviarse.',
    'missing_if'           => 'El campo :attribute no debe enviarse cuando :other sea :value.',
    'missing_unless'       => 'El campo :attribute no debe enviarse salvo que :other sea :value.',
    'missing_with'         => 'El campo :attribute no debe enviarse cuando esté :values.',
    'missing_with_all'     => 'El campo :attribute no debe enviarse cuando estén :values.',
    'multiple_of'          => 'El campo :attribute debe ser múltiplo de :value.',
    'not_in'               => 'El valor de :attribute no es válido.',
    'not_regex'            => 'El formato de :attribute no es válido.',
    'numeric'              => 'El campo :attribute debe ser un número.',
    'password'             => [
        'letters'       => 'La :attribute debe contener al menos una letra.',
        'mixed'         => 'La :attribute debe contener al menos una mayúscula y una minúscula.',
        'numbers'       => 'La :attribute debe contener al menos un número.',
        'symbols'       => 'La :attribute debe contener al menos un símbolo.',
        'uncompromised' => 'Esta :attribute ha aparecido en una filtración de datos. Elige otra distinta.',
    ],
    'present'              => 'El campo :attribute debe estar presente.',
    'present_if'           => 'El campo :attribute debe estar presente cuando :other sea :value.',
    'present_unless'       => 'El campo :attribute debe estar presente salvo que :other sea :value.',
    'present_with'         => 'El campo :attribute debe estar presente cuando esté :values.',
    'present_with_all'     => 'El campo :attribute debe estar presente cuando estén :values.',
    'prohibited'           => 'El campo :attribute no está permitido.',
    'prohibited_if'        => 'El campo :attribute no está permitido cuando :other sea :value.',
    'prohibited_if_accepted' => 'El campo :attribute no está permitido cuando se acepta :other.',
    'prohibited_if_declined' => 'El campo :attribute no está permitido cuando se rechaza :other.',
    'prohibited_unless'    => 'El campo :attribute no está permitido salvo que :other esté en :values.',
    'prohibits'            => 'El campo :attribute impide que :other esté presente.',
    'regex'                => 'El formato de :attribute no es válido.',
    'required'             => 'El campo :attribute es obligatorio.',
    'required_array_keys'  => 'El campo :attribute debe contener entradas para: :values.',
    'required_if'          => 'El campo :attribute es obligatorio cuando :other sea :value.',
    'required_if_accepted' => 'El campo :attribute es obligatorio cuando se acepta :other.',
    'required_if_declined' => 'El campo :attribute es obligatorio cuando se rechaza :other.',
    'required_unless'      => 'El campo :attribute es obligatorio salvo que :other esté en :values.',
    'required_with'        => 'El campo :attribute es obligatorio cuando está :values.',
    'required_with_all'    => 'El campo :attribute es obligatorio cuando están :values.',
    'required_without'     => 'El campo :attribute es obligatorio cuando no está :values.',
    'required_without_all' => 'El campo :attribute es obligatorio cuando no está ninguno de :values.',
    'same'                 => 'Los campos :attribute y :other deben coincidir.',
    'size'                 => [
        'array'   => 'El campo :attribute debe tener :size elementos.',
        'file'    => 'El archivo :attribute debe pesar :size kilobytes.',
        'numeric' => 'El campo :attribute debe ser :size.',
        'string'  => 'El campo :attribute debe tener :size caracteres.',
    ],
    'starts_with'          => 'El campo :attribute debe empezar por: :values.',
    'string'               => 'El campo :attribute debe ser texto.',
    'timezone'             => 'El campo :attribute debe ser una zona horaria válida.',
    'unique'               => 'Ese :attribute ya está registrado.',
    'uploaded'             => 'No se ha podido subir :attribute.',
    'uppercase'            => 'El campo :attribute debe estar en mayúsculas.',
    'url'                  => 'El campo :attribute debe ser una URL válida.',
    'ulid'                 => 'El campo :attribute debe ser un ULID válido.',
    'uuid'                 => 'El campo :attribute debe ser un UUID válido.',

    /*
    |--------------------------------------------------------------------------
    | Mensajes propios
    |--------------------------------------------------------------------------
    */

    'custom' => [
        'email' => [
            'unique' => 'Ya hay una cuenta con ese correo. ¿Quieres iniciar sesión o recuperar la contraseña?',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Nombres de los campos
    |--------------------------------------------------------------------------
    |
    | Sustituyen a :attribute en los mensajes. Sin esto se leería
    | "El campo birth_date es obligatorio".
    |
    */

    'attributes' => [
        'name'               => 'nombre',
        'email'              => 'correo electrónico',
        'password'           => 'contraseña',
        'phone'              => 'teléfono',
        'birth_date'         => 'fecha de nacimiento',
        'bio'                => 'biografía',
        'code'               => 'código',
        'message'            => 'mensaje',
        'history'            => 'historial',
        'title'              => 'título',
        'notes'              => 'notas',
        'description'        => 'descripción',
        'goal'               => 'objetivo',
        'level'              => 'nivel',
        'duration_minutes'   => 'duración',
        'status'             => 'estado',
        'role'               => 'rol',
        'date'               => 'fecha',
        'appointment_date'   => 'fecha de la cita',
        'appointment_time'   => 'hora de la cita',
        'recorded_at'        => 'fecha del pesaje',
        'weight_kg'          => 'peso',
        'fat_percentage'     => 'porcentaje de grasa',
        'muscle_percentage'  => 'porcentaje de músculo',
        'meals'              => 'comidas',
        'meals.*.meal_type'  => 'tipo de comida',
        'meals.*.foods'      => 'alimentos',
        'meals.*.calories'   => 'calorías',
        'meals.*.macros'     => 'macros',
        'exercises'          => 'ejercicios',
        'exercises.*.name'   => 'nombre del ejercicio',
        'exercises.*.sets'   => 'series',
        'exercises.*.reps'   => 'repeticiones',
        'exercises.*.weight' => 'peso',
        'exercises.*.rest_seconds' => 'descanso',
        'image_url'          => 'imagen',
        'sort_order'         => 'orden',
        'user_id'            => 'cliente',
    ],

];
