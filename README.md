# Flag Team Manager (SkyRunners)

Gestión completa para un equipo de **Flag Football**: jugadores (H/M), eventos (práctica/juego), asistencia, lesiones, pagos, patrocinantes y anuncios, **landing pública**, **reglamentos**, **inscripción pública** y **panel admin**.  
Stack: **Node.js + Express**, **PostgreSQL**, **Angular 20**, **Nginx**, **Docker Compose**. Autenticación **JWT** (solo admin puede crear/editar).

---

## 0) ¿Para quién es esta guía?
Para **usuarios sin experiencia técnica**. No necesitas instalar nada complicado fuera de Docker. Aquí verás **paso a paso** cómo levantar el sistema, entrar como admin, hacer las tareas del día a día y cómo resolver los casos comunes.

---

## 1) Requisitos
- **Docker** y **Docker Compose** instalados.
- Acceso a una terminal (Windows PowerShell, macOS Terminal o Linux Shell).
- (Opcional) Node 20+ y npm 10+ si quieres ejecutar comandos locales, pero **no es necesario**.

---

## 2) Estructura del proyecto (carpetas principales)
```
/backend    → API (Node/Express)
/web        → Frontend (Angular 20, build para Nginx)
/db/init    → Migraciones SQL y semillas (se ejecutan en la 1ª creación del volumen)
/nginx      → Configuración de Nginx (sirve el Angular y hace proxy al API)
docker-compose.yml
```

---

## 3) Variables de entorno (.env)
Crea un archivo llamado **`.env`** en la raíz (junto al `docker-compose.yml`) con algo como:

```
POSTGRES_USER=flag
POSTGRES_PASSWORD=flagpass
POSTGRES_DB=flagdb

# JWT
JWT_SECRET=supersecret

# S3 (para archivos opcionales: fotos/waivers)
S3_ENDPOINT=http://minio:9000
S3_BUCKET=flag-bucket
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio123
```

> Si no usarás S3 todavía, puedes dejar esos valores por defecto (no afecta el arranque).

---

## 4) Puesta en marcha (primer uso)

1. Abre una terminal **en la carpeta del proyecto** (donde está `docker-compose.yml`).
2. Ejecuta:
   ```bash
   docker compose build
   docker compose up -d
   ```
3. Espera ~30–60 segundos y abre:
   - **Web (público + admin)**: http://localhost:8080  
   - **API**: http://localhost:3000

> Si algo falla, usa `docker compose logs -n 200` para ver los últimos mensajes.

---

## 5) Acceso Admin (primer inicio de sesión)

- El sistema viene con un **usuario administrador** de ejemplo (semilla).  
- Ve a **Inicio de sesión** en la web y usa las credenciales definidas por el script de semilla (consulta con tu responsable/tecnico si cambió).  
- Después de entrar:
  1) Cambia tu contraseña desde el perfil (si la app lo permite) o solicita al responsable técnico que lo haga.
  2) Crea administradores adicionales si es necesario.

> **Importante:** Solo los **admin** pueden crear/editar datos. Los visitantes solo ven la parte **pública**.

---

## 6) Qué trae el sistema (resumen claro)

### Parte Pública (no requiere login)
- **Landing** con anuncios, patrocinantes y próximos eventos.
- **Calendario** de eventos (prácticas/juegos).
- **Reglamentos** del equipo.
- **Inscripción**: formulario para aspirantes (queda en “bandeja de espera” en Admin).

### Parte Admin (requiere login)
- **Jugadores**: altas, bajas, edición; importación masiva vía **Excel** (plantilla incluida).
- **Eventos**: prácticas y juegos, con reglas de roster (mínimos por posición/género).
- **Rosters**: seleccionar convocados; validación automática.
- **Asistencia**: presente / tarde / ausente.
- **Lesiones** y **Pagos**: registro y seguimiento.
- **Patrocinadores** y **Anuncios**: para la landing pública.
- **Reglamentos**: editor HTML, publicación instantánea.
- **Inscripciones (bandeja)**: ver solicitantes, **invitar por WhatsApp**, **aprobar** (crea jugador) o **rechazar**.
- **Métricas**: dashboard con asistencia, lesiones y pagos.

---

## 7) Tareas típicas (paso a paso para administradores)

### 7.1 Crear/editar **Reglamentos**
1. Entra a **Admin → Reglamentos**.
2. El **slug** por defecto es `team-rules`. Puedes cambiarlo o crear otros.
3. Escribe un **título** y el **contenido HTML** (se muestra una vista previa).
4. Marca **Público** si quieres que aparezca en la web pública.
5. Guarda. Verás el reglamento en `http://localhost:8080/reglamentos`.

### 7.2 Recibir **Inscripciones** de aspirantes
- Los aspirantes llenan **http://localhost:8080/inscripcion**.
- Entra a **Admin → Inscripciones**. Verás la **bandeja**:
  - **pending** (pendiente)
  - **invited** (invitado por WhatsApp)
  - **approved** (aprobado → ya es jugador)
  - **rejected** (rechazado)

**Flujo recomendado:**
1. Revisa los datos (nombre, posición, contacto).
2. Pulsa **WhatsApp** para invitar (se abre chat prellenado). El sistema cambia el estado a **invited**.
3. Si pasa a formar parte del equipo, pulsa **Aprobar** → se crea/actualiza el registro de **Jugador**.
4. Si no procede, pulsa **Rechazar** y coloca un motivo opcional.

### 7.3 Cargar **Jugadores** en masa vía Excel
1. En **Admin → Players**, pulsa **Excel template** para descargar la **plantilla**.
2. Rellena las columnas (nombre, género, contacto, etc.).
3. Pulsa **Importar Excel**, selecciona el archivo y confirma.
4. El sistema te informará **insertados**, **actualizados** y **omitidos** (si hay errores).

> Tipos de datos:
> - **gender**: `male`, `female`, `nonbinary`
> - **position**: `QB`, `WR`, `RB`, `TE`, `LB`, `CB`, `S`, `DL`
> - **Fechas**: usa `YYYY-MM-DD`

### 7.4 Crear **Eventos** (prácticas/juegos)
1. Ve a **Admin → Eventos** (según tu menú).
2. Crea un evento con fecha/hora y lugar.
3. (Opcional) Define **política de roster** (límites por posición/género).
4. Guarda. El evento aparecerá en la landing y en el calendario público (si está como público).

### 7.5 Convocar **Roster** y pasar **Asistencia**
1. En el evento, abre el módulo **Roster** y elige a los convocados.
2. Valida: el sistema te avisará si no cumples los mínimos por posición/género.
3. Durante/tras el evento, marca asistencia: **present**, **late** o **absent**.

### 7.6 Gestionar **Lesiones** y **Pagos**
- **Lesiones**: registra incidencias, severidad y fechas.
- **Pagos**: crea cuotas, marca **paid** (pagado) o deja **pending**; controla **overdue** (vencidos).

### 7.7 Patrocinadores & Anuncios
- Añade logos, enlaces y **nivel** del patrocinio (gold/silver/bronze).
- Crea anuncios (hero/banner) para la landing.

### 7.8 Ver **Métricas**
- En **Dashboard** verás:
  - **Roster** total / activos por género.
  - **Asistencia** reciente (%).
  - **Lesiones por severidad**.
  - **Pagos** (pendientes/atrasados/pagados).

---

## 8) Endpoints (resumen)

### Público
- `GET /api/public/players`
- `GET /api/public/events/upcoming?limit=10`
- `GET /api/public/events/range?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/public/sponsors`
- `GET /api/public/ads?placement=hero|banner|sidebar`
- `GET /api/public/regulations?slug=team-rules`
- `POST /api/public/registrations/public` — crear inscripción

### Admin (JWT)
- **Auth**: `POST /api/auth/login`
- **Players**: `GET/POST/PUT/DELETE /api/players`
  - Import Excel: `GET /api/players/template.xlsx`, `POST /api/players/import`
- **Events**: `GET/POST/PUT /api/events`
- **Attendance**: `GET/POST /api/attendance`
- **Injuries**: `GET/POST/PUT/DELETE /api/injuries`
- **Payments**: `GET/POST/PUT/DELETE /api/payments`
- **Rosters**: `POST /api/rosters/:eventId/bulk`
- **Sponsors**: `GET/POST/PUT/DELETE /api/sponsors`
- **Ads**: `GET/POST/PUT/DELETE /api/ads`
- **Regulations**: `GET /api/regulations`, `POST /api/regulations` (upsert por slug)
- **Registrations**:
  - `GET /api/registrations?status=pending|invited|approved|rejected`
  - `GET /api/registrations/:id`
  - `POST /api/registrations/:id/invite`
  - `GET  /api/registrations/:id/whatsapp-link`
  - `POST /api/registrations/:id/approve`
  - `POST /api/registrations/:id/reject`
- **Metrics**: `GET /api/metrics/summary`

---

## 9) Actualizar el sistema (nueva versión)
1. Apaga los contenedores:
   ```bash
   docker compose down
   ```
2. Toma los cambios del código (pull o copia).
3. Reconstruye e inicia:
   ```bash
   docker compose build
   docker compose up -d
   ```
4. Si hay un archivo nuevo en `db/init/XX_*.sql`, **aplícalo** (si ya tenías datos):
   ```bash
   docker compose exec -T db psql -U $POSTGRES_USER -d $POSTGRES_DB \
     -f /docker-entrypoint-initdb.d/XX_loque_sea.sql
   ```

---

## 10) Copias de seguridad (backup/restore)

**Backup** (dump de PostgreSQL):
```bash
docker compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup.sql
```

**Restore** (sobrescribe la base):
```bash
cat backup.sql | docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

---

## 11) Solución de problemas (FAQ)

**A) “relation ... does not exist”**  
No se aplicó una migración. Ejecuta el `.sql` correspondiente desde `db/init/`:
```bash
docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -f /docker-entrypoint-initdb.d/05_public_and_rules.sql
```
(reemplaza por el archivo correcto)

**B) `npm ci` falla con EUSAGE**  
Actualiza el `package-lock.json`:
```bash
# en backend/
npm install            # regenera el lock
docker compose build api && docker compose up -d api
```

**C) Web muestra error de Chart.js (controller "line")**  
Registra Chart.js en `web/src/main.ts`:
```ts
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
```

**D) Nginx: “upstream may not have port”**  
La ruta del proxy en `nginx/default.conf` debe apuntar a `api:3000;`. Revisa el archivo y reconstruye la imagen `web`.

**E) Importar Excel falla**  
- Usa la **plantilla** descargada desde Players → *Excel template*.
- Valida que `gender` sea `male|female|nonbinary` y que las fechas usen `YYYY-MM-DD`.

**F) No carga la landing pública**  
Verifica que existan **sponsors/ads** o usa la semilla rápida (consultar guía técnica).

---

## 12) Seguridad

- Mantén el **JWT_SECRET** en secreto.
- Solo **administradores** confiables deben poder acceder al panel.
- Si editas **Reglamentos** con HTML, asegúrate de que los administradores sean de confianza (el HTML se muestra tal cual).

---

## 13) Créditos / Licencia
Proyecto interno para gestión de equipos (SkyRunners). Uso según acuerdos del proyecto.
