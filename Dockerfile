# ══════════════════════════════════════════════════════════
# ONE LIFE ONE BODY — imagen para la demo
#
# Un solo servicio: Laravel sirve la API y también la aplicación
# de React ya construida. Una sola dirección, sin CORS y sin dos
# despliegues que mantener sincronizados.
#
# Vale igual para Railway y para Render: los dos detectan este
# fichero y pasan el puerto en la variable PORT.
# ══════════════════════════════════════════════════════════

# ── 1. Construir el frontend ──
FROM node:20-bookworm-slim AS frontend

WORKDIR /build

# Primero solo los manifiestos: así la capa de dependencias se
# reaprovecha mientras no cambien, y cada despliegue no vuelve a
# descargar todo npm.
COPY Frontend/package.json Frontend/package-lock.json ./
RUN npm ci

COPY Frontend/ ./

# Usa .env.production, donde VITE_API_URL=/api (mismo origen).
RUN npm run build


# ── 2. Imagen final ──
FROM php:8.2-apache

# Los pasos van separados a propósito. Juntos en un solo RUN, un
# fallo solo dice "exit code 1" y hay que adivinar cuál de las
# cinco cosas se rompió.

# Librerías que necesitan las extensiones de PHP.
RUN apt-get update && apt-get install -y --no-install-recommends \
        libzip-dev \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libsqlite3-dev \
        unzip \
        git \
    && rm -rf /var/lib/apt/lists/*

# gd, que es lo que usa dompdf para meter el logo en los PDF.
RUN docker-php-ext-configure gd --with-jpeg --with-freetype \
    && docker-php-ext-install -j"$(nproc)" gd

# zip, que lo pide alguna dependencia de composer.
RUN docker-php-ext-install -j"$(nproc)" zip

# pdo_sqlite, solo si hace falta.
#
# La imagen oficial de PHP ya viene compilada con soporte de SQLite.
# Pedir su instalación la hacía recompilar, y sin libsqlite3-dev el
# build moría justo aquí: ese fue el fallo del primer despliegue.
#
# Escrito así no depende de esa suposición: si ya está, se salta; si
# no estuviera, se compila, y libsqlite3-dev ya está instalado
# arriba. Funciona en los dos casos.
RUN if php -m | grep -qi '^pdo_sqlite$'; then \
        echo "pdo_sqlite ya viene en la imagen base"; \
    else \
        docker-php-ext-install -j"$(nproc)" pdo_sqlite; \
    fi

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Apache: la raíz es public/, y .htaccess necesita AllowOverride.
RUN a2enmod rewrite headers
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

# Todo el backend de una vez, y después un único `composer install`.
#
# Se podría instalar antes solo con composer.json para reaprovechar
# la capa, pero entonces hay que partir la instalación en dos pasos
# (--no-scripts y luego dump-autoload), y el segundo ejecuta
# `artisan package:discover`, que necesita la aplicación entera.
# Para una demo, un despliegue algo más lento vale más que un paso
# frágil.
COPY Backend/ ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

# El frontend construido, dentro de public/. Va DESPUÉS de copiar el
# backend: si fuera antes, el COPY del backend lo borraría.
COPY --from=frontend /build/dist/ ./public/

COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint \
    && chown -R www-data:www-data storage bootstrap/cache

CMD ["entrypoint"]
