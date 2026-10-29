#!/bin/bash
# ══════════════════════════════════════════════════════════
# Arranque del contenedor.
#
# Prepara lo mínimo para que la demo funcione sola al desplegar:
# puerto, clave, base de datos, migraciones, datos de demo y cachés.
# ══════════════════════════════════════════════════════════
set -euo pipefail

cd /var/www/html

echo "── One Life One Body ──────────────────────────────"

# ── 1. Puerto ──
# Railway y Render pasan el puerto en PORT y hay que escucharlo; si no,
# el servicio queda "arrancado" pero sin responder y parece caído.
PUERTO="${PORT:-80}"
sed -i "s/^Listen 80$/Listen ${PUERTO}/" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost *:${PUERTO}>/" \
    /etc/apache2/sites-available/000-default.conf
echo "   Puerto: ${PUERTO}"

# ── 2. Clave de la aplicación ──
# Sin APP_KEY, Laravel no arranca. Lo correcto es ponerla como variable
# en el panel del hosting; si no está, se genera una para no dejar la
# demo bloqueada, pero cambia en cada despliegue (y eso cierra las
# sesiones abiertas).
if [ -z "${APP_KEY:-}" ]; then
    echo "   AVISO: APP_KEY no está definida. Genero una temporal."
    echo "          Ponla como variable en el hosting para que las"
    echo "          sesiones sobrevivan a los despliegues."
    export APP_KEY="base64:$(head -c 32 /dev/urandom | base64)"
fi

# ── 3. Registro de errores ──
# A la salida del contenedor, que es lo que se ve en el panel del
# hosting. Por defecto Laravel escribe en storage/logs/laravel.log, un
# fichero dentro del contenedor al que no hay forma de llegar desde el
# panel: cuando algo fallaba, solo se veia "Server Error" y la causa
# quedaba enterrada.
export LOG_CHANNEL="${LOG_CHANNEL:-stderr}"
export LOG_LEVEL="${LOG_LEVEL:-info}"

# ── 4. Base de datos ──
# SQLite, en el disco que haya. Si el hosting tiene un volumen montado
# en /data, conviene apuntar DB_DATABASE ahí: así los datos sobreviven
# a los despliegues. Sin volumen funciona igual, pero cada despliegue
# empieza de cero (que para una demo tampoco es malo).
export DB_CONNECTION="${DB_CONNECTION:-sqlite}"
export DB_DATABASE="${DB_DATABASE:-/var/www/html/database/database.sqlite}"

if [ "${DB_CONNECTION}" = "sqlite" ]; then
    CARPETA_DB="$(dirname "${DB_DATABASE}")"
    mkdir -p "${CARPETA_DB}"
    touch "${DB_DATABASE}"

    # La CARPETA también, no solo el fichero.
    #
    # SQLite crea un fichero de diario (-journal) junto a la base en cada
    # transacción, así que necesita permiso de escritura en el directorio.
    # Con solo el fichero accesible, cualquier escritura falla con
    # "attempt to write a readonly database".
    #
    # Y eso tiraba la API ENTERA, no solo las escrituras: el limitador de
    # peticiones es global y guarda su contador en la caché, que aquí va
    # en base de datos. Resultado: un 500 en cada llamada, incluido el
    # login y hasta /api/ping.
    chown -R www-data:www-data "${CARPETA_DB}"
    chmod 775 "${CARPETA_DB}"

    echo "   Base de datos: ${DB_DATABASE}"
fi

# Permisos de escritura de Laravel.
chown -R www-data:www-data storage bootstrap/cache
mkdir -p storage/framework/{cache,sessions,views} storage/logs
chown -R www-data:www-data storage

# ── 5. Migraciones ──
echo "   Migrando..."
php artisan migrate --force --no-interaction

# ── 6. Datos de la demo ──
# Idempotente: solo toca las dos cuentas de demostración.
# Se desactiva poniendo DEMO_SEED=false, que es lo que habrá que hacer
# cuando esto deje de ser una demo y entren clientes de verdad.
if [ "${DEMO_SEED:-true}" = "true" ]; then
    echo "   Creando los datos de la demo..."
    php artisan db:seed --class=DemoSeeder --force --no-interaction
else
    echo "   DEMO_SEED=false: no se tocan los datos."
fi

# ── 7. Cachés ──
# Se hacen al final, ya con las variables en su sitio. A partir de aquí
# env() devuelve null dentro del código: todo tiene que leerse con
# config(), que es justo lo que hace la aplicación.
echo "   Compilando cachés..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# ── 8. Permisos, otra vez y al final ──
#
# No es repetición: todo lo anterior (migraciones, datos de demo,
# cachés) se ejecuta como root, así que deja ficheros de root por el
# camino: la propia base de datos, su diario, y las cachés compiladas.
# Apache sirve como www-data, y sin esta pasada se encuentra ficheros
# que no puede escribir.
chown -R www-data:www-data storage bootstrap/cache
if [ "${DB_CONNECTION}" = "sqlite" ]; then
    chown -R www-data:www-data "$(dirname "${DB_DATABASE}")"
fi

echo "── Listo. Sirviendo en el puerto ${PUERTO} ────────"

exec apache2-foreground
