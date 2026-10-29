{{-- Estilos compartidos por los PDF del centro --}}
<style>
    @page { margin: 0 0 58px; }

    body {
        font-family: Helvetica, Arial, sans-serif;
        font-size: 11px;
        color: #1b2323;
        margin: 0;
    }

    /* ── Banda de marca ── */
    .marca {
        background: #0d1515;
        padding: 16px 34px;
        color: #eaf7f7;
    }
    .marca__logo {
        height: 54px;
        width: auto;
    }
    .marca__texto {
        font-size: 20px;
        font-weight: bold;
        letter-spacing: 3px;
        color: #ffffff;
    }
    .marca__datos {
        margin-top: 8px;
    }
    .marca__nombre {
        font-size: 12px;
        font-weight: bold;
        letter-spacing: 2px;
        color: #7ee8e8;
    }
    .marca__linea {
        font-size: 8.5px;
        color: #8fb8b8;
        padding-top: 1px;
    }

    /* ── Título del documento ── */
    .doc { padding: 22px 34px 0; }
    .doc__titulo {
        font-size: 17px;
        font-weight: bold;
        color: #0d1515;
    }
    .doc__sujeto {
        font-size: 10.5px;
        color: #46605f;
        padding-top: 4px;
    }

    .cuerpo { padding: 0 34px; }

    .notas {
        margin-top: 14px;
        padding: 10px 13px;
        background: #f2f8f8;
        border-left: 3px solid #1a9e9e;
        font-size: 10.5px;
        line-height: 1.55;
        color: #2c3a3a;
    }

    /* ── Bloques (comida o ejercicio) ── */
    .bloque {
        margin-top: 12px;
        border: 1px solid #dbe6e6;
        border-radius: 5px;
    }
    .bloque__cab {
        background: #f2f8f8;
        border-bottom: 1px solid #dbe6e6;
        padding: 7px 12px;
    }
    .bloque__nombre {
        font-size: 11.5px;
        font-weight: bold;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: #12605f;
    }
    .bloque__meta {
        float: right;
        font-size: 9.5px;
        color: #6a8281;
        padding-top: 2px;
    }
    .bloque__cuerpo {
        padding: 10px 12px;
        font-size: 11px;
        line-height: 1.6;
        color: #22302f;
    }

    /* ── Tabla de series ── */
    table.series {
        width: 100%;
        border-collapse: collapse;
        margin-top: 4px;
    }
    table.series th {
        background: #f2f8f8;
        font-size: 8.5px;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: #6a8281;
        text-align: left;
        padding: 5px 8px;
        border-bottom: 1px solid #dbe6e6;
    }
    table.series td {
        font-size: 10.5px;
        padding: 6px 8px;
        border-bottom: 1px solid #eef4f4;
        color: #22302f;
    }
    table.series td.num { white-space: nowrap; }

    /* ── Pie fijo ── */
    .pie {
        position: fixed;
        bottom: -40px;
        left: 34px;
        right: 34px;
        border-top: 1px solid #dbe6e6;
        padding-top: 7px;
        font-size: 8.5px;
        color: #8aa0a0;
        line-height: 1.5;
    }
    .pie strong { color: #46605f; }
</style>
