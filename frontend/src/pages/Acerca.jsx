import logoIntelligentia from '../assets/intelligentia.png'
import logoTechCapital from '../assets/tech-capital-puebla-2026.png'
import { FOTOS } from '../data/fotos.js'
import { NOMBRE } from '../data/marca.js'
import { useIdioma } from '../i18n/contexto.js'

// Textos largos de esta página, por idioma. <strong> solo donde importa para el aviso de privacidad.
const CONTENIDO = {
  es: {
    titulo: `Acerca de ${NOMBRE}`,
    queEs: 'Qué es',
    queEsTexto: <>Una app que te dice a dónde ir <strong>ahora</strong> en Puebla, Cholula y Atlixco, y un panel para que la Secretaría de Turismo reparta mejor los flujos y el gasto de los visitantes.</>,
    significado: `${NOMBRE} significa Redistribución Unificada con Mapas, Búsquedas y Opiniones.`,
    evento: 'Hackathon de SECIHTI Puebla dentro de Tech Capital Puebla 2026, con Intelligentia (Compromiso, Innovación, Conocimiento).',
    origen: 'De dónde viene',
    origenTexto: `${NOMBRE} nació en el hackathon «Puebla Turística 360°». Después siguió creciendo en dos materias de la IBERO Puebla: en Interacción Persona Máquina se rediseñó su interfaz para que cualquier persona la pueda usar, y en Diseño de Software se desarrolló como sistema.`,
    equipos: [
      {
        nombre: 'Hackathon Puebla Turística 360°',
        guia: ['Tutor', 'Mtro. Rafael Pérez Aguirre'],
        integrantes: [
          ['Axel García Arellano', 'Backend, datos y asistente'],
          ['Angel Rugerio Jiménez', 'Frontend y catálogo'],
          ['Diego Navarro Sánchez', 'Integrante del equipo'],
        ],
      },
      {
        nombre: 'Interacción Persona Máquina',
        guia: ['Docente', 'Dra. Gabriela A. Rodríguez Ruiz'],
        integrantes: [
          ['Angel Rugerio Jiménez', 'Representante'],
          ['Axel García Arellano'],
          ['Diego Navarro Sánchez'],
          ['Yohualli Ollin Luna Reyes'],
        ],
      },
      {
        nombre: 'Diseño de Software',
        guia: ['Docente', 'Mtro. Rafael Pérez Aguirre'],
        integrantes: [
          ['Angel Rugerio Jiménez', 'Arquitecto de diseño de UI y flujo de información (representante)'],
          ['Axel García Arellano', 'Arquitecto de RAG, BD, API, MCP y lógica'],
          ['Diego Navarro Sánchez', 'Programación de componentes de backend'],
          ['Yohualli Ollin Luna Reyes', 'Programación de componentes de frontend'],
          ['Cristian Alexei Romero Martínez', 'Coordinación del backlog, pruebas con usuarios y documentación'],
        ],
      },
    ],
    queNo: 'Qué no hace',
    queNoTexto: <>No resuelve infraestructura, seguridad ni señalización de los destinos. La afluencia es una <strong>estimación</strong> que mejora con cada reporte; no es un conteo exacto.</>,
    privacidad: 'Aviso de privacidad (versión corta)',
    privacidadLista: [
      <><strong>Sin registro:</strong> no pedimos nombre, correo ni teléfono.</>,
      'Tu sesión es un código aleatorio.',
      <><strong>No guardamos tu ubicación</strong>; solo la distancia al lugar cuando reportas. Si usas el GPS para centrar el mapa, tus coordenadas no salen de tu celular.</>,
      <>A la Secretaría solo le llegan <strong>totales por lugar y hora</strong>, nunca tus reportes individuales.</>,
      'Las preguntas al asistente se procesan en nuestro equipo, sin enviarse a terceros.',
    ],
    datos: 'Datos y atribuciones',
    datosLista: [
      'Mapa base: Light Gray Canvas de Esri (Esri, HERE, Garmin y la comunidad GIS).',
      'Mapa y lugares: © colaboradores de OpenStreetMap, licencia ODbL.',
      'Clima: Open-Meteo, licencia CC BY 4.0.',
      'Tráfico: TomTom. Traslados: OpenRouteService.',
      'Establecimientos: DENUE, INEGI.',
      'Museos: Sistema de Información Cultural, Secretaría de Cultura.',
      'Ocupación, llegadas y derrama: Observatorio Turístico, Secretaría de Desarrollo Turístico de Puebla.',
      'Visitas a recintos: estadísticas del INAH.',
    ],
    fotos: 'Fotos',
    fotosTexto: 'De Wikimedia Commons, recortadas y reducidas para la app. Cada una conserva su licencia.',
  },
  en: {
    titulo: `About ${NOMBRE}`,
    queEs: 'What it is',
    queEsTexto: <>An app that tells you where to go <strong>right now</strong> in Puebla, Cholula and Atlixco, plus a dashboard that helps the Tourism Office spread visitors and their spending more evenly.</>,
    significado: `${NOMBRE} stands for Redistribución Unificada con Mapas, Búsquedas y Opiniones (Unified Redistribution with Maps, Searches and Reviews).`,
    evento: 'SECIHTI Puebla hackathon at Tech Capital Puebla 2026, with Intelligentia (Commitment, Innovation, Knowledge).',
    origen: 'Where it comes from',
    origenTexto: `${NOMBRE} began at the “Puebla Turística 360°” hackathon. It then kept growing in two courses at IBERO Puebla: in Human-Computer Interaction its interface was redesigned so anyone can use it, and in Software Design it was developed as a system.`,
    equipos: [
      {
        nombre: 'Puebla Turística 360° hackathon',
        guia: ['Mentor', 'Rafael Pérez Aguirre'],
        integrantes: [
          ['Axel García Arellano', 'Backend, data and assistant'],
          ['Angel Rugerio Jiménez', 'Frontend and catalog'],
          ['Diego Navarro Sánchez', 'Team member'],
        ],
      },
      {
        nombre: 'Human-Computer Interaction',
        guia: ['Professor', 'Dr. Gabriela A. Rodríguez Ruiz'],
        integrantes: [
          ['Angel Rugerio Jiménez', 'Team lead'],
          ['Axel García Arellano'],
          ['Diego Navarro Sánchez'],
          ['Yohualli Ollin Luna Reyes'],
        ],
      },
      {
        nombre: 'Software Design',
        guia: ['Professor', 'Rafael Pérez Aguirre'],
        integrantes: [
          ['Angel Rugerio Jiménez', 'UI design and information flow architect (team lead)'],
          ['Axel García Arellano', 'RAG, database, API, MCP and logic architect'],
          ['Diego Navarro Sánchez', 'Backend component development'],
          ['Yohualli Ollin Luna Reyes', 'Frontend component development'],
          ['Cristian Alexei Romero Martínez', 'Backlog coordination, user testing and documentation'],
        ],
      },
    ],
    queNo: 'What it doesn’t do',
    queNoTexto: <>It doesn’t fix infrastructure, safety or signage at the destinations. Crowd levels are an <strong>estimate</strong> that improves with every report; they are not an exact count.</>,
    privacidad: 'Privacy notice (short version)',
    privacidadLista: [
      <><strong>No sign-up:</strong> we don’t ask for your name, email or phone.</>,
      'Your session is a random code.',
      <><strong>We don’t store your location</strong>; only your distance to the place when you report. If you use GPS to center the map, your coordinates never leave your phone.</>,
      <>The Tourism Office only receives <strong>totals per place and hour</strong>, never your individual reports.</>,
      'Questions to the assistant are processed on our own computer and are not sent to third parties.',
    ],
    datos: 'Data and credits',
    datosLista: [
      'Base map: Esri Light Gray Canvas (Esri, HERE, Garmin and the GIS user community).',
      'Map and places: © OpenStreetMap contributors, ODbL license.',
      'Weather: Open-Meteo, CC BY 4.0 license.',
      'Traffic: TomTom. Travel times: OpenRouteService.',
      'Businesses: DENUE, INEGI.',
      'Museums: Cultural Information System, Ministry of Culture.',
      'Occupancy, arrivals and spending: Tourism Observatory, Puebla Tourism Development Office.',
      'Site visits: INAH statistics.',
    ],
    fotos: 'Photos',
    fotosTexto: 'From Wikimedia Commons, cropped and resized for the app. Each keeps its own license.',
  },
}

// A1 — Acerca de y privacidad: atribuciones obligatorias por licencia (RN_13) y aviso corto (RN_07).
function Acerca() {
  const { idioma } = useIdioma()
  const c = CONTENIDO[idioma]
  return (
    <div className="pagina-texto">
      <div className="contenido">
        <h1>{c.titulo}</h1>

        <section className="caja">
          <h2>{c.queEs}</h2>
          <p className="secundario" style={{ marginTop: 8 }}>{c.queEsTexto}</p>
          <p className="secundario" style={{ marginTop: 8 }}>{c.significado}</p>
          <h2 style={{ marginTop: 20 }}>{c.queNo}</h2>
          <p className="secundario" style={{ marginTop: 8 }}>{c.queNoTexto}</p>
        </section>

        <section className="caja">
          <h2>{c.privacidad}</h2>
          <ul className="secundario">
            {c.privacidadLista.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </section>

        <section className="caja" style={{ gridColumn: '1 / -1' }}>
          <h2>{c.origen}</h2>
          <p className="secundario origen-texto">{c.origenTexto}</p>
          <div className="equipos">
            {c.equipos.map((e) => (
              <article key={e.nombre} className="equipo">
                <h3>{e.nombre}</h3>
                <p className="suave">{e.guia[0]}: {e.guia[1]}</p>
                <ul>
                  {e.integrantes.map(([nombre, rol]) => (
                    <li key={nombre}><strong>{nombre}</strong>{rol && <span>{rol}</span>}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="pie-evento">
            <div className="logos-evento">
              <img src={logoTechCapital} alt="Tech Capital Puebla 2026" width="400" height="365" />
              <img src={logoIntelligentia} alt="Intelligentia: Compromiso, Innovación, Conocimiento" width="229" height="240" />
            </div>
            <p>{c.evento}</p>
          </div>
        </section>

        <section className="caja" style={{ gridColumn: '1 / -1' }}>
          <h2>{c.datos}</h2>
          <ul className="secundario">
            {c.datosLista.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section className="caja" style={{ gridColumn: '1 / -1' }}>
          <h2>{c.fotos}</h2>
          <p className="subtitulo">{c.fotosTexto}</p>
          <ul className="creditos">
            {Object.entries(FOTOS).map(([id, f]) => (
              <li key={id}>
                <span>{f.lugar}</span>
                <a href={f.pagina} target="_blank" rel="noreferrer">{f.autor}, {f.licencia}</a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default Acerca
