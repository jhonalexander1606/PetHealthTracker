# Publicar la app para el video (túnel de Cloudflare)

Tu computador sirve la aplicación y Cloudflare le da una dirección pública
temporal (https://algo.trycloudflare.com). No necesitas cuenta ni tarjeta.

## Una sola vez
1. Descomprime este zip dentro de tu carpeta del proyecto y acepta reemplazar
   los 3 archivos (vite.config.js, .env y axiosInstance.js).
2. Instala cloudflared. En una terminal:
       winget install --id Cloudflare.cloudflared
   Cierra esa terminal y abre otra nueva.

## Cada vez que vayan a grabar
1. MySQL encendido y el backend corriendo en NetBeans (puerto 8094).
2. Terminal 1, en frontend-react:  npm run dev
3. Terminal 2:  cloudflared tunnel --url http://localhost:5173
4. En la terminal 2 aparece un enlace https://....trycloudflare.com.
   Ese es el que les mandas a David y Juan Diego.

Mientras graban: tu PC encendido, sin suspenderse, y las dos terminales abiertas.
Si cierras cloudflared, el enlace deja de funcionar y al volver a abrirlo sale uno nuevo.
