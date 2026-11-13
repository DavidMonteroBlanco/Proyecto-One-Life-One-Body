# Despliegue en hosting compartido (cPanel)

Para LucusHost, Namecheap, Hostinger o cualquier hosting con cPanel, PHP 8.2+,
MySQL/MariaDB y Apache o LiteSpeed. No necesita Node.js ni Python en el
servidor.

## Ficheros

| Fichero | Qué es |
|---|---|
| `empaquetar.sh` | Genera el paquete listo para subir: `bash deploy/cpanel/empaquetar.sh` |
| `index.php` | Controlador frontal para `public_html/`. Apunta a `../olob` |
| `env.lucushost` | Plantilla del `.env` de producción, con cada variable explicada |

El `.htaccess` es el de `Backend/public/.htaccess`, el mismo para Docker y cPanel.

## Estructura en el servidor

```
/home/USUARIO/olob/          la aplicación (con el .env)
/home/USUARIO/public_html/   el frontend + index.php + .htaccess
```

## Pasos, en corto

1. `bash deploy/cpanel/empaquetar.sh` → `salida/olob-cpanel-FECHA.zip`
2. Crear base de datos MySQL y buzón de correo en cPanel
3. Subir el zip a `/home/USUARIO` y extraerlo
4. `olob/.env.lucushost` → `olob/.env`, rellenar los `CAMBIAR`
5. En la terminal, dentro de `~/olob`:
   ```bash
   php artisan key:generate --show        # pegar en APP_KEY
   php artisan migrate --force
   php artisan olob:crear-admin correo@dominio.com --nombre="Nombre"
   php artisan olob:probar-correo correo@dominio.com
   php artisan config:cache && php artisan route:cache && php artisan view:cache
   ```
6. Cron cada minuto: `cd /home/USUARIO/olob && php artisan schedule:run >> /dev/null 2>&1`

La guía completa, con qué menú de cPanel usar en cada paso, comprobaciones y qué hacer si
algo falla, está en la documentación del proyecto (Obsidian):
**Despliegue en LucusHost**.

No ejecutar `php artisan db:seed` en producción: carga datos de prueba.
