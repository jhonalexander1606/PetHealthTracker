package uis.edu.entorno.pethealth.servicio;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import uis.edu.entorno.pethealth.modelo.EventoMedico;
import uis.edu.entorno.pethealth.modelo.Mascota;
import uis.edu.entorno.pethealth.modelo.Usuario;
import uis.edu.entorno.pethealth.repositorio.EventoMedicoRepositorio;
import uis.edu.entorno.pethealth.repositorio.MascotaRepositorio;
import uis.edu.entorno.pethealth.repositorio.UsuarioRepositorio;
import uis.edu.entorno.pethealth.seguridad.UsuarioAutenticado;

/**
 * Calcula las estadisticas del panel principal (dashboard).
 *
 * Alcance segun el rol (RNF-03):
 *  - ADMIN y VETERINARIO ven los datos de todo el sistema.
 *  - DUENO solo ve sus propias mascotas y su historial.
 *
 * Alertas de vacunacion / medicina preventiva:
 *  Para cada combinacion (mascota, tipo de evento) se toma el evento MAS
 *  RECIENTE. Si ese evento tiene fecha de proxima dosis:
 *   - fecha ya pasada                -> VENCIDA
 *   - fecha dentro de los proximos 30 dias -> PROXIMA
 *  Asi, si una vacuna vencida ya se volvio a aplicar, la alerta desaparece.
 */
@Service
public class DashboardService implements IDashboardService {

    private static final int DIAS_ALERTA = 30;
    private static final int MESES_HISTORICO = 6;
    private static final int ACTIVIDAD_RECIENTE = 5;

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @Autowired
    private MascotaRepositorio mascotaRepositorio;

    @Autowired
    private EventoMedicoRepositorio eventoMedicoRepositorio;

    @Autowired
    private UsuarioAutenticado usuarioAutenticado;

    @Override
    public ResponseEntity<?> resumen() {
        Map<String, Object> response = new HashMap<>();
        try {
            Usuario actual = usuarioAutenticado.obtener();
            boolean soloPropios = actual != null && "DUENO".equals(actual.getRol());

            // 1. Datos visibles segun el rol
            List<Mascota> mascotas;
            List<EventoMedico> eventos;
            long totalUsuarios;
            if (soloPropios) {
                mascotas = mascotaRepositorio.findByIdUsuario(actual.getId());
                Set<Integer> idsPropios = mascotas.stream()
                        .map(Mascota::getId)
                        .collect(Collectors.toSet());
                eventos = eventoMedicoRepositorio.listarOrdenadosPorFecha().stream()
                        .filter(e -> e.getMascota() != null && idsPropios.contains(e.getMascota().getId()))
                        .collect(Collectors.toList());
                totalUsuarios = 1;
            } else {
                mascotas = mascotaRepositorio.findAll();
                eventos = eventoMedicoRepositorio.listarOrdenadosPorFecha();
                totalUsuarios = usuarioRepositorio.count();
            }

            LocalDate hoy = LocalDate.now();
            List<Map<String, Object>> alertas = calcularAlertas(eventos, hoy);
            long vencidas = alertas.stream()
                    .filter(a -> "VENCIDA".equals(a.get("estado")))
                    .count();

            // 2. Totales (tarjetas KPI)
            Map<String, Object> totales = new LinkedHashMap<>();
            totales.put("usuarios", totalUsuarios);
            totales.put("mascotas", mascotas.size());
            totales.put("eventos", eventos.size());
            totales.put("vacunas", eventos.stream()
                    .filter(e -> e.getTipoEvento() != null
                            && e.getTipoEvento().toUpperCase().contains("VACUNA"))
                    .count());
            totales.put("eventosUltimos30Dias", eventos.stream()
                    .filter(e -> e.getFechaAplicacion() != null
                            && !e.getFechaAplicacion().isBefore(hoy.minusDays(30)))
                    .count());
            totales.put("alertasVencidas", vencidas);
            totales.put("alertasProximas", alertas.size() - vencidas);

            // 3. Graficas
            Map<String, Long> porTipo = eventos.stream().collect(Collectors.groupingBy(
                    e -> e.getTipoEvento() == null ? "SIN TIPO" : e.getTipoEvento(),
                    Collectors.counting()));
            Map<String, Long> porEspecie = mascotas.stream().collect(Collectors.groupingBy(
                    m -> m.getEspecie() == null ? "Sin especie" : m.getEspecie(),
                    Collectors.counting()));

            List<Map<String, Object>> porMes = new ArrayList<>();
            YearMonth mesActual = YearMonth.from(hoy);
            for (int i = MESES_HISTORICO - 1; i >= 0; i--) {
                YearMonth mes = mesActual.minusMonths(i);
                long total = eventos.stream()
                        .filter(e -> e.getFechaAplicacion() != null
                                && YearMonth.from(e.getFechaAplicacion()).equals(mes))
                        .count();
                Map<String, Object> fila = new LinkedHashMap<>();
                fila.put("mes", mes.toString());
                fila.put("total", total);
                porMes.add(fila);
            }

            // 4. Actividad reciente (la lista ya viene ordenada de mas nuevo a mas viejo)
            List<EventoMedico> recientes = new ArrayList<>(
                    eventos.subList(0, Math.min(ACTIVIDAD_RECIENTE, eventos.size())));

            response.put("Mensaje", "Resumen generado correctamente");
            response.put("alcance", soloPropios ? "PROPIO" : "GLOBAL");
            response.put("fechaCorte", hoy.toString());
            response.put("totales", totales);
            response.put("eventosPorTipo", ordenarDescendente(porTipo));
            response.put("mascotasPorEspecie", ordenarDescendente(porEspecie));
            response.put("eventosPorMes", porMes);
            response.put("alertas", alertas);
            response.put("actividadReciente", recientes);
            response.put("statusCode", HttpStatus.OK.value());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("Mensaje", "Error al generar el resumen: " + e.getMessage());
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /** Alertas de proximas dosis vencidas o por vencer (ver explicacion de la clase). */
    private List<Map<String, Object>> calcularAlertas(List<EventoMedico> eventos, LocalDate hoy) {
        // Evento mas reciente por (mascota, tipo de evento)
        Map<String, EventoMedico> ultimos = new HashMap<>();
        for (EventoMedico e : eventos) {
            if (e.getMascota() == null || e.getFechaAplicacion() == null) {
                continue;
            }
            String clave = e.getMascota().getId() + "|" + e.getTipoEvento();
            EventoMedico previo = ultimos.get(clave);
            if (previo == null || esMasReciente(e, previo)) {
                ultimos.put(clave, e);
            }
        }

        List<Map<String, Object>> alertas = new ArrayList<>();
        for (EventoMedico e : ultimos.values()) {
            LocalDate proxima = e.getFechaProximaDosis();
            if (proxima == null) {
                continue;
            }
            long dias = ChronoUnit.DAYS.between(hoy, proxima);
            if (dias > DIAS_ALERTA) {
                continue;
            }
            Mascota m = e.getMascota();
            Map<String, Object> alerta = new LinkedHashMap<>();
            alerta.put("idEvento", e.getId());
            alerta.put("idMascota", m.getId());
            alerta.put("mascota", m.getNombre());
            alerta.put("especie", m.getEspecie());
            alerta.put("dueno", m.getUsuario() != null ? m.getUsuario().getNombreCompleto() : null);
            alerta.put("telefonoDueno", m.getUsuario() != null ? m.getUsuario().getTelefono() : null);
            alerta.put("tipoEvento", e.getTipoEvento());
            alerta.put("fechaProximaDosis", proxima.toString());
            alerta.put("diasRestantes", dias);
            alerta.put("estado", dias < 0 ? "VENCIDA" : "PROXIMA");
            alertas.add(alerta);
        }
        alertas.sort(Comparator.comparingLong(x -> (Long) x.get("diasRestantes")));
        return alertas;
    }

    private boolean esMasReciente(EventoMedico a, EventoMedico b) {
        int comparacion = a.getFechaAplicacion().compareTo(b.getFechaAplicacion());
        if (comparacion != 0) {
            return comparacion > 0;
        }
        return a.getId() != null && b.getId() != null && a.getId() > b.getId();
    }

    /** Devuelve el mapa ordenado de mayor a menor cantidad (para las graficas). */
    private Map<String, Long> ordenarDescendente(Map<String, Long> mapa) {
        Map<String, Long> ordenado = new LinkedHashMap<>();
        mapa.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .forEachOrdered(entrada -> ordenado.put(entrada.getKey(), entrada.getValue()));
        return ordenado;
    }
}
