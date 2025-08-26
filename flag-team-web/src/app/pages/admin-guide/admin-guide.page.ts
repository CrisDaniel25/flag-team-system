import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-guide',
  imports: [CommonModule],
  template: `
  <div class="card prose max-w-none">
    <h1>Guía del Sistema — Administradores (Paso a Paso)</h1>

    <p>Esta guía está pensada para <b>usuarios sin experiencia técnica</b>. Aquí aprenderás a usar el sistema desde cero: iniciar sesión, gestionar jugadores y eventos, revisar inscripciones, publicar reglamentos, y ver tus métricas.</p>

    <h2>1) Iniciar sesión</h2>
    <ol>
      <li>Abre <code>http://localhost:8080</code> (o la URL que te compartieron).</li>
      <li>Haz clic en <b>Iniciar sesión</b>.</li>
      <li>Escribe tu <b>correo</b> y <b>contraseña</b> de administrador y entra.</li>
      <li>Si es tu primera vez, cambia tu contraseña (pide ayuda si no ves esa opción).</li>
    </ol>

    <h2>2) Menú principal (qué hay dentro)</h2>
    <ul>
      <li><b>Dashboard</b>: resumen con métricas (asistencia, jugadores, lesiones, pagos).</li>
      <li><b>Jugadores</b>: lista de jugadores. Puedes <i>crear, editar, eliminar</i> y hacer <i>importación Excel</i>.</li>
      <li><b>Eventos</b>: prácticas y juegos. Puedes definir reglas de roster.</li>
      <li><b>Rosters & Asistencia</b>: seleccionar convocados y marcar presentes/tarde/ausentes.</li>
      <li><b>Lesiones</b> y <b>Pagos</b>: registrar y consultar estados.</li>
      <li><b>Patrocinadores</b> y <b>Anuncios</b>: se muestran en la página pública.</li>
      <li><b>Reglamentos</b>: editor para publicar reglas del equipo.</li>
      <li><b>Inscripciones</b>: bandeja con solicitantes del formulario público.</li>
      <li><b>Guía</b>: esta página con instrucciones.</li>
    </ul>

    <h2>3) Jugadores (altas, edición e importación Excel)</h2>
    <h3>3.1 Crear/editar jugadores</h3>
    <ol>
      <li>Entra en <b>Jugadores</b>.</li>
      <li>Pulsa <b>Nuevo</b> para crear o el ícono de editar para modificar uno existente.</li>
      <li>Completa los campos importantes:
        <ul>
          <li><b>Nombre y Apellido</b></li>
          <li><b>Género</b> (male/female/nonbinary)</li>
          <li><b>Posición</b> (QB, WR, RB, TE, LB, CB, S, DL)</li>
          <li><b>Teléfono</b> y <b>Email</b></li>
          <li><b>Contacto de emergencia</b>, <b>teléfono</b> y <b>parentesco</b></li>
        </ul>
      </li>
      <li>Guarda.</li>
    </ol>

    <h3>3.2 Importación masiva con Excel</h3>
    <ol>
      <li>En <b>Jugadores</b>, pulsa <b>Excel template</b> para descargar la plantilla.</li>
      <li>Rellena la hoja <b>PLAYERS</b> (lee la hoja <b>INSTRUCTIONS</b> dentro del Excel para ejemplos).</li>
      <li>Vuelve a la app y pulsa <b>Importar Excel</b>, selecciona el archivo y confirma.</li>
      <li>El sistema te dirá cuántos <b>insertó</b>, <b>actualizó</b> o <b>omitió</b> por error.</li>
    </ol>

    <h2>4) Eventos (prácticas y juegos)</h2>
    <ol>
      <li>Entra en <b>Eventos</b> → <b>Nuevo</b>.</li>
      <li>Completa: <b>tipo</b> (práctica/juego), <b>fecha y hora</b>, <b>lugar</b>, <b>oponente</b> (si aplica).</li>
      <li>(Opcional) Configura <b>reglas de roster</b> (mínimos por posición/género y límite total).</li>
      <li>Guarda. El evento puede aparecer en la parte pública según su configuración.</li>
    </ol>

    <h2>5) Rosters & Asistencia</h2>
    <h3>5.1 Seleccionar convocados</h3>
    <ol>
      <li>Abre un evento y entra en <b>Roster</b>.</li>
      <li>Selecciona a los jugadores para convocar.</li>
      <li>El sistema te avisa si faltan mínimos por posición/género.</li>
      <li>Guarda la lista.</li>
    </ol>
    <h3>5.2 Marcar asistencia</h3>
    <ol>
      <li>Durante o después del evento, abre <b>Asistencia</b>.</li>
      <li>Marca a cada jugador como <b>present</b>, <b>late</b> o <b>absent</b>.</li>
      <li>Guarda para que se refleje en el Dashboard de métricas.</li>
    </ol>

    <h2>6) Lesiones y Pagos</h2>
    <h3>6.1 Lesiones</h3>
    <ol>
      <li>Ve a <b>Lesiones</b> → <b>Nuevo</b>.</li>
      <li>Registra el <b>tipo</b>, <b>severidad</b> y <b>fecha</b>.</li>
      <li>Guarda para seguimiento y métricas por severidad.</li>
    </ol>
    <h3>6.2 Pagos</h3>
    <ol>
      <li>Ve a <b>Pagos</b> → <b>Nuevo</b>.</li>
      <li>Define el <b>concepto</b>, <b>monto</b> y <b>fecha de vencimiento</b>.</li>
      <li>Marca como <b>paid</b> cuando esté pagado. El panel muestra <b>pendientes</b> y <b>atrasados</b>.</li>
    </ol>

    <h2>7) Patrocinadores y Anuncios</h2>
    <ol>
      <li>Entra a <b>Patrocinadores</b> o <b>Anuncios</b>.</li>
      <li>Agrega el contenido (nombre, enlace, logo / título, texto, ubicación).</li>
      <li>Actívalo para que aparezca en la página pública.</li>
    </ol>

    <h2>8) Reglamentos del equipo</h2>
    <ol>
      <li>Entra a <b>Reglamentos</b> (admin).</li>
      <li>Usa el <b>slug</b> <code>team-rules</code> (o crea otro) y escribe el contenido en <b>HTML</b>.</li>
      <li>Marca <b>Público</b> y <b>Guarda</b>.</li>
      <li>Todo quedará visible en <code>/reglamentos</code> de la parte pública.</li>
    </ol>

    <h2>9) Inscripciones (aspirantes)</h2>
    <p>Los aspirantes completan el formulario en la parte pública (<code>/inscripcion</code>). Como administrador:</p>
    <ol>
      <li>Ve a <b>Inscripciones</b>.</li>
      <li>Elige un estado en el filtro (por defecto <b>pending</b>).</li>
      <li>Usa el botón <b>WhatsApp</b> para enviar un mensaje de invitación (se abrirá el chat con el texto prellenado). El registro pasa a <b>invited</b>.</li>
      <li>Si el aspirante se integra al equipo, pulsa <b>Aprobar</b> → se crea/actualiza un <b>Jugador</b> activo.</li>
      <li>Si no procede, pulsa <b>Rechazar</b> y, si quieres, escribe el motivo.</li>
    </ol>

    <h2>10) Dashboard (métricas)</h2>
    <ul>
      <li><b>Roster</b>: total de jugadores y distribución por género.</li>
      <li><b>Asistencia</b>: porcentaje en los últimos eventos.</li>
      <li><b>Lesiones</b>: gráfico por severidad.</li>
      <li><b>Pagos</b>: pendientes, atrasados, pagados.</li>
    </ul>

    <h2>11) Consejos y solución de problemas</h2>
    <ul>
      <li>Si un gráfico no carga, recarga la página. Si persiste, avisa a soporte.</li>
      <li>Si la landing pública no muestra elementos (patrocinadores/anuncios), verifica que estén <b>activos</b> en el admin.</li>
      <li>Si un registro aparece con datos raros (teléfonos con letras, etc.), edítalo y corrígelo.</li>
      <li>Para inscripciones duplicadas, usa <b>Aprobar</b> solo una; luego elimina o rechaza la otra.</li>
    </ul>

    <h2>12) ¿Dónde veo la parte pública?</h2>
    <ul>
      <li><code>/</code> — Landing principal.</li>
      <li><code>/calendario</code> — Próximos eventos.</li>
      <li><code>/reglamentos</code> — Reglamento del equipo.</li>
      <li><code>/inscripcion</code> — Formulario para aspirantes.</li>
    </ul>

    <h2>13) Soporte</h2>
    <p>Si algo no funciona o tienes dudas, recopila una captura de pantalla y describe qué estabas haciendo. Contacta a tu responsable técnico o al equipo de soporte para recibir ayuda.</p>
  </div>
  `,
  styles: ``
})
export class AdminGuidePage {

}
