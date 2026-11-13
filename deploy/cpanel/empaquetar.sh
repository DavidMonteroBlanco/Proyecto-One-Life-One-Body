#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════
# Genera el paquete para subir a un hosting compartido con cPanel
# (LucusHost, Namecheap, Hostinger...).
#
#   bash deploy/cpanel/empaquetar.sh
#
# Desde Git Bash en Windows, o desde cualquier terminal en Mac/Linux.
# Necesita node, npm, php y composer en ESTE ordenador. En el servidor
# no hace falta nada de eso: solo PHP.
#
# Deja en deploy/cpanel/salida/:
#
#   paquete/olob/          → se sube a /home/USUARIO/olob/
#   paquete/public_html/   → su CONTENIDO va a /home/USUARIO/public_html/
#   olob-cpanel-FECHA.zip  → lo mismo en un solo fichero, para subirlo
#                            y descomprimirlo desde el Administrador de
#                            archivos de cPanel
#
# Empaqueta lo que hay en la carpeta de trabajo y respeta el
# .gitignore: nunca incluye el .env, la base de datos local, los
# registros ni node_modules.
# ══════════════════════════════════════════════════════════
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SALIDA="${RAIZ}/deploy/cpanel/salida"
PAQUETE="${SALIDA}/paquete"
APP="${PAQUETE}/olob"
WEB="${PAQUETE}/public_html"

paso()  { printf '\n\033[1;36m── %s\033[0m\n' "$1"; }
ok()    { printf '   \033[32m✓\033[0m %s\n' "$1"; }
falla() { printf '\n   \033[31m✗ %s\033[0m\n\n' "$1" >&2; exit 1; }

cd "${RAIZ}"

# ── 0. Herramientas ────────────────────────────────────────
paso "Comprobando herramientas"
for h in node npm php composer git; do
    command -v "$h" >/dev/null 2>&1 || falla "Falta '$h' en este ordenador."
done
ok "node $(node -v) · php $(php -r 'echo PHP_VERSION;') · composer $(composer --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)"

# ── 1. Frontend ────────────────────────────────────────────
paso "Compilando el frontend (React)"
(
    cd Frontend
    npm ci --no-audit --no-fund --loglevel=error
    npm run build
) >/dev/null
[ -f Frontend/dist/index.html ] || falla "No se ha generado Frontend/dist/index.html"

# El frontend llama a la API en la misma dirección (/api). Si se
# hubiera compilado apuntando a otro sitio, en el hosting no iría.
grep -rqo 'baseURL:"/api"' Frontend/dist/assets/*.js \
    || falla "El frontend no apunta a /api. Revisa Frontend/.env.production (VITE_API_URL=/api)."
ok "Frontend/dist listo y apuntando a /api"

# ── 2. Carpeta limpia ──────────────────────────────────────
paso "Preparando la carpeta de salida"
rm -rf "${PAQUETE}"
mkdir -p "${APP}" "${WEB}"
ok "${PAQUETE#"$RAIZ"/}"

# ── 3. La aplicación (va FUERA de public_html) ─────────────
paso "Copiando la aplicación a olob/"

# Solo lo que hace falta en el servidor. Fuera: la carpeta pública (va
# a public_html), los tests y la configuración de herramientas.
INCLUIR='^Backend/(app|bootstrap|config|database|lang|resources|routes|storage)/|^Backend/(artisan|composer\.json|composer\.lock)$'

# --others --exclude-standard: incluye también ficheros nuevos aún no
# commiteados, pero nunca lo que esté en el .gitignore.
git ls-files --cached --others --exclude-standard -- Backend \
    | grep -E "${INCLUIR}" \
    | while IFS= read -r f; do
        [ -f "$f" ] || continue   # borrado en la carpeta de trabajo
        destino="${APP}/${f#Backend/}"
        mkdir -p "$(dirname "$destino")"
        cp "$f" "$destino"
    done

# Carpetas en las que Laravel escribe. Tienen que existir.
mkdir -p "${APP}"/storage/app/public \
         "${APP}"/storage/framework/{cache/data,sessions,views} \
         "${APP}"/storage/logs \
         "${APP}"/bootstrap/cache

# Ningún resto local que se haya colado.
rm -f "${APP}"/database/*.sqlite* "${APP}"/bootstrap/cache/*.php
ok "$(find "${APP}" -type f | wc -l | tr -d ' ') ficheros de la aplicación"

paso "Instalando dependencias de PHP de producción (sin las de pruebas)"
(
    cd "${APP}"
    composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --quiet
)
[ -f "${APP}/vendor/autoload.php" ] || falla "composer no ha generado vendor/autoload.php"
[ -d "${APP}/vendor/phpunit" ] && falla "Se han colado dependencias de pruebas (phpunit) en vendor/"
ok "vendor/ listo ($(du -sh "${APP}/vendor" | cut -f1))"

cp deploy/cpanel/env.lucushost "${APP}/.env.lucushost"
ok "Plantilla .env.lucushost (en el servidor se renombra a .env)"

# ── 4. Lo público (va DENTRO de public_html) ───────────────
paso "Copiando lo público a public_html/"
cp -r Frontend/dist/. "${WEB}/"
cp deploy/cpanel/index.php "${WEB}/index.php"
cp Backend/public/.htaccess Backend/public/favicon.ico Backend/public/robots.txt "${WEB}/"
ok "Frontend + index.php para cPanel + .htaccess"

# ── 5. Comprobaciones de seguridad ─────────────────────────
paso "Comprobando el paquete"
[ -f "${APP}/.env" ]                && falla "Hay un .env dentro del paquete. No debe ir nunca."
[ -n "$(find "${PAQUETE}" -name '*.sqlite' -print -quit)" ] && falla "Hay una base de datos .sqlite en el paquete."
[ -n "$(find "${PAQUETE}" -name 'node_modules' -print -quit)" ] && falla "Hay node_modules en el paquete."
grep -q 'usePublicPath' "${WEB}/index.php"   || falla "public_html/index.php no es el de cPanel."
[ -f "${WEB}/.htaccess" ]                    || falla "Falta public_html/.htaccess"
[ -f "${APP}/resources/img/logo-olob.jpg" ]  || falla "Falta el logo de los PDF (resources/img/logo-olob.jpg)."
[ -f "${APP}/lang/es/validation.php" ]       || falla "Faltan las traducciones (lang/es)."
ok "Sin .env, sin base de datos local, sin node_modules; estructura de cPanel correcta"

# ── 6. Zip ─────────────────────────────────────────────────
paso "Comprimiendo"
ZIP="olob-cpanel-$(date +%Y%m%d-%H%M).zip"
rm -f "${SALIDA}"/olob-cpanel-*.zip

if command -v powershell.exe >/dev/null 2>&1; then
    # Windows. Ni Compress-Archive ni ZipFile.CreateFromDirectory valen:
    # en el PowerShell que trae Windows los dos guardan las rutas con
    # "\", y al descomprimir en el servidor (Linux) salen 7.000 ficheros
    # llamados "olob\vendor\autoload.php" en vez de carpetas. Pasó la
    # primera vez que se ejecutó este script.
    #
    # Así que se mete fichero a fichero, escribiendo la ruta con "/".
    # Y se comprueba después, por si acaso.
    ORIGEN_WIN="$(cygpath -w "${PAQUETE}")"
    DESTINO_WIN="$(cygpath -w "${SALIDA}/${ZIP}")"
    powershell.exe -NoProfile -Command "
        Add-Type -AssemblyName System.IO.Compression
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        \$origen = (Resolve-Path -LiteralPath '${ORIGEN_WIN}').ProviderPath.TrimEnd('\')
        \$zip = [IO.Compression.ZipFile]::Open('${DESTINO_WIN}', [IO.Compression.ZipArchiveMode]::Create)
        Get-ChildItem -LiteralPath \$origen -Recurse -File -Force | ForEach-Object {
            \$nombre = \$_.FullName.Substring(\$origen.Length + 1).Replace('\', '/')
            [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                \$zip, \$_.FullName, \$nombre, [IO.Compression.CompressionLevel]::Optimal)
        }
        \$zip.Dispose()
        \$z = [IO.Compression.ZipFile]::OpenRead('${DESTINO_WIN}')
        \$malas = @(\$z.Entries | Where-Object { \$_.FullName -like '*\*' }).Count
        \$total = \$z.Entries.Count
        \$puntos = @(\$z.Entries | Where-Object { \$_.Name -eq '.htaccess' -or \$_.Name -eq '.env.lucushost' }).Count
        \$z.Dispose()
        if (\$malas -gt 0) { Write-Error \"\$malas rutas con barra invertida\"; exit 1 }
        if (\$puntos -lt 2) { Write-Error 'faltan .htaccess o .env.lucushost en el zip'; exit 1 }
        Write-Output \"\$total\"
    " > "${SALIDA}/.zip-check" 2>&1 || { cat "${SALIDA}/.zip-check"; falla "El zip no ha salido bien."; }
    ok "${ZIP}: $(tr -d '\r' < "${SALIDA}/.zip-check") ficheros, rutas con /, incluye .htaccess y .env.lucushost"
    rm -f "${SALIDA}/.zip-check"
elif command -v zip >/dev/null 2>&1; then
    ( cd "${PAQUETE}" && zip -qr "${SALIDA}/${ZIP}" olob public_html )
    ok "${ZIP}"
else
    ZIP="${ZIP%.zip}.tar.gz"
    tar -czf "${SALIDA}/${ZIP}" -C "${PAQUETE}" olob public_html
    ok "${ZIP} (no hay zip en este equipo; cPanel descomprime .tar.gz igual)"
fi

printf '\n\033[1;32mListo.\033[0m %s (%s)\n' \
    "deploy/cpanel/salida/${ZIP}" "$(du -h "${SALIDA}/${ZIP}" | cut -f1)"
printf '  olob/        → /home/USUARIO/olob/\n'
printf '  public_html/ → su contenido a /home/USUARIO/public_html/\n\n'
