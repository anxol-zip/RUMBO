import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import logoIntelligentia from '../assets/intelligentia.png'
import logoTechCapital from '../assets/tech-capital-puebla-2026.png'
import Icono from '../components/Icono.jsx'
import { FOTOS, rutaFoto } from '../data/fotos.js'
import { NOMBRE } from '../data/marca.js'
import { useIdioma } from '../i18n/contexto.js'

// Textos de esta página, por idioma. Cada punto de privacidad y cada fuente de datos va como
// { icono, titulo, texto } para mostrarse en tarjetas; <strong> solo donde importa.
const CONTENIDO = {
  es: {
    titulo: `Acerca de ${NOMBRE}`,
    indice: 'En esta página',
    secciones: { 'que-es': 'Qué es', equipo: 'Equipo', privacidad: 'Privacidad', datos: 'Datos', fotos: 'Fotos' },
    queEsTexto: <>Una app que te dice a dónde ir <strong>ahora</strong> en Puebla, Cholula y Atlixco, y un panel para que la Secretaría de Turismo reparta mejor los flujos y el gasto de los visitantes.</>,
    significado: `${NOMBRE} significa Redistribución Unificada con Mapas, Búsquedas y Opiniones.`,
    acronimo: [['R', 'Redistribución'], ['U', 'Unificada'], ['M', 'con Mapas'], ['B', 'Búsquedas'], ['O', 'y Opiniones']],
    destinos: ['Puebla', 'Cholula', 'Atlixco'],
    queNo: 'Qué no hace',
    queNoTexto: <>No resuelve infraestructura, seguridad ni señalización de los destinos. La afluencia es una <strong>estimación</strong> que mejora con cada reporte; no es un conteo exacto.</>,
    origen: 'Equipo',
    origenTexto: `${NOMBRE} nació en el hackathon «Puebla Turística 360°». Después siguió creciendo en dos materias de la IBERO Puebla: en Interacción Persona Máquina se rediseñó su interfaz para que cualquier persona la pueda usar, y en Diseño de Software se desarrolló como sistema.`,
    evento: 'Hackathon de SECIHTI Puebla dentro de Tech Capital Puebla 2026, con Intelligentia (Compromiso, Innovación, Conocimiento).',
    personas: [
      ['Angel Rugerio Jiménez', ['Arquitectura de Interfaces (UI)', 'Desarrollo Frontend', 'Implementación y Despliegue (Deploy)', 'Gestión de Flujo de Información']],
      ['Axel García Arellano', ['Desarrollo Backend', 'Desarrollo del asistente', 'Arquitecto BD', 'Arquitecto API']],
      ['Diego Navarro Sánchez', ['Desarrollo Frontend', 'Experiencia de Usuario (UX)', 'Desarrollo de Interfaces (UI)']],
      ['Yohualli Ollin Luna Reyes', ['Desarrollo Frontend', 'Documentación', 'Análisis de Estructura de Proyecto']],
      ['Cristian Alexei Romero Martínez', ['Documentación', 'Investigación', 'Fuentes']],
    ],
    guias: 'Con la guía de',
    docentes: [
      ['Mtro. Rafael Pérez Aguirre', 'Tutor del hackathon y docente de Diseño de Software'],
      ['Dra. Gabriela A. Rodríguez Ruiz', 'Docente de Interacción Persona Máquina'],
    ],
    privacidad: 'Aviso de privacidad',
    promesas: [
      { icono: 'usuario', texto: 'Sin cuenta, la app funciona igual' },
      { icono: 'escudo', texto: 'No vendemos ni compartimos tus datos' },
      { icono: 'papelera', texto: 'Borras tu cuenta cuando quieras' },
    ],
    modos: [
      {
        icono: 'usuario', titulo: 'Sin cuenta', resumen: 'No sabemos quién eres.',
        puntos: ['No pedimos nombre, correo ni teléfono.', 'Tu sesión es un código aleatorio.', 'La app funciona igual.'],
      },
      {
        icono: 'candado', titulo: 'Con cuenta de Microsoft', resumen: 'Solo lo necesario para recordarte.',
        puntos: [
          'Guardamos tu nombre y tu correo (nos los da Microsoft; no pedimos nada más).',
          'Y lo que tú guardes: tus gustos, tus Favoritos, tus reseñas, tus votos de “útil” y tus denuncias.',
          'Para recordar tus gustos y Favoritos en cualquier dispositivo y para publicar tus reseñas.',
          'En público solo aparece tu nombre con la inicial de tu apellido (por ejemplo, “Axel G.”); tu correo nunca se muestra.',
        ],
      },
    ],
    siempre: 'En los dos casos',
    detalles: [
      { icono: 'nube', titulo: 'Dónde', texto: 'En Supabase, un servicio en la nube con servidores fuera de México. No vendemos ni compartimos tus datos.' },
      { icono: 'reloj', titulo: 'Cuánto tiempo', texto: 'Mientras exista tu cuenta. Puedes borrarla cuando quieras desde el botón con tu nombre → “Borrar mi cuenta”: se elimina en ese momento todo lo anterior.' },
      { icono: 'pin', titulo: 'Tu ubicación', texto: 'No la guardamos; solo la distancia al lugar cuando reportas. Si usas el GPS para centrar el mapa, tus coordenadas no salen de tu celular. Los reportes “¿Cómo está?” son anónimos aunque tengas cuenta.' },
      { icono: 'edificio', titulo: 'La Secretaría', texto: <>Solo le llegan <strong>totales por lugar y hora</strong>, nunca tus reportes individuales.</> },
      { icono: 'chat', titulo: 'El asistente', texto: 'Tus preguntas se procesan en nuestro equipo, sin enviarse a terceros.' },
    ],
    derechos: 'Tus derechos (acceso, rectificación, cancelación y oposición)',
    derechosTexto: 'Escribe a',
    responsable: 'Responsable: Axel García Arellano, equipo RUMBO.',
    datos: 'Datos y atribuciones',
    datosLista: [
      { icono: 'mapa', titulo: 'Mapa base', texto: 'Light Gray Canvas de Esri (Esri, HERE, Garmin y la comunidad GIS).' },
      { icono: 'pin', titulo: 'Mapa y lugares', texto: '© colaboradores de OpenStreetMap, licencia ODbL.' },
      { icono: 'sol', titulo: 'Clima', texto: 'Open-Meteo, licencia CC BY 4.0.' },
      { icono: 'coche', titulo: 'Tráfico', texto: 'TomTom.' },
      { icono: 'navegar', titulo: 'Traslados', texto: 'OpenRouteService.' },
      { icono: 'edificio', titulo: 'Establecimientos', texto: 'DENUE, INEGI.' },
      { icono: 'museo', titulo: 'Museos', texto: 'Sistema de Información Cultural, Secretaría de Cultura.' },
      { icono: 'grafica', titulo: 'Ocupación, llegadas y derrama', texto: 'Observatorio Turístico, Secretaría de Desarrollo Turístico de Puebla.' },
      { icono: 'personas', titulo: 'Visitas a recintos', texto: 'Estadísticas del INAH.' },
    ],
    fotos: 'Fotos',
    fotosTexto: 'De Wikimedia Commons, recortadas y reducidas para la app. Cada una conserva su licencia.',
  },
  en: {
    titulo: `About ${NOMBRE}`,
    indice: 'On this page',
    secciones: { 'que-es': 'What it is', equipo: 'Team', privacidad: 'Privacy', datos: 'Data', fotos: 'Photos' },
    queEsTexto: <>An app that tells you where to go <strong>right now</strong> in Puebla, Cholula and Atlixco, plus a dashboard that helps the Tourism Office spread visitors and their spending more evenly.</>,
    significado: `${NOMBRE} stands for Redistribución Unificada con Mapas, Búsquedas y Opiniones (Unified Redistribution with Maps, Searches and Reviews).`,
    acronimo: [['R', 'Redistribution'], ['U', 'Unified'], ['M', 'with Maps'], ['B', 'Searches'], ['O', 'and Reviews']],
    destinos: ['Puebla', 'Cholula', 'Atlixco'],
    queNo: 'What it doesn’t do',
    queNoTexto: <>It doesn’t fix infrastructure, safety or signage at the destinations. Crowd levels are an <strong>estimate</strong> that improves with every report; they are not an exact count.</>,
    origen: 'Team',
    origenTexto: `${NOMBRE} began at the “Puebla Turística 360°” hackathon. It then kept growing in two courses at IBERO Puebla: in Human-Computer Interaction its interface was redesigned so anyone can use it, and in Software Design it was developed as a system.`,
    evento: 'SECIHTI Puebla hackathon at Tech Capital Puebla 2026, with Intelligentia (Commitment, Innovation, Knowledge).',
    personas: [
      ['Angel Rugerio Jiménez', ['Interface Architecture (UI)', 'Frontend development', 'Implementation and Deployment', 'Information Flow Management']],
      ['Axel García Arellano', ['Backend development', 'Assistant development', 'Database architect', 'API architect']],
      ['Diego Navarro Sánchez', ['Frontend development', 'User Experience (UX)', 'Interface Development (UI)']],
      ['Yohualli Ollin Luna Reyes', ['Frontend development', 'Documentation', 'Project Structure Analysis']],
      ['Cristian Alexei Romero Martínez', ['Documentation', 'Research', 'Sources']],
    ],
    guias: 'Guided by',
    docentes: [
      ['Rafael Pérez Aguirre', 'Hackathon mentor and Software Design professor'],
      ['Dr. Gabriela A. Rodríguez Ruiz', 'Human-Computer Interaction professor'],
    ],
    privacidad: 'Privacy notice',
    promesas: [
      { icono: 'usuario', texto: 'The app works the same without an account' },
      { icono: 'escudo', texto: 'We don’t sell or share your data' },
      { icono: 'papelera', texto: 'Delete your account whenever you want' },
    ],
    modos: [
      {
        icono: 'usuario', titulo: 'Without an account', resumen: 'We don’t know who you are.',
        puntos: ['We don’t ask for your name, email or phone.', 'Your session is a random code.', 'The app works the same.'],
      },
      {
        icono: 'candado', titulo: 'With a Microsoft account', resumen: 'Only what we need to remember you.',
        puntos: [
          'We store your name and email (provided by Microsoft; we ask for nothing else).',
          'And what you choose to save: your interests, your Favorites, your reviews, your “helpful” votes and your reports of reviews.',
          'To remember your interests and Favorites on any device and to publish your reviews.',
          'Publicly, only your first name and last initial appear (for example, “Axel G.”); your email is never shown.',
        ],
      },
    ],
    siempre: 'Either way',
    detalles: [
      { icono: 'nube', titulo: 'Where', texto: 'In Supabase, a cloud service with servers outside Mexico. We don’t sell or share your data.' },
      { icono: 'reloj', titulo: 'For how long', texto: 'For as long as your account exists. You can delete it at any time from the button with your name → “Delete my account”: everything above is removed right away.' },
      { icono: 'pin', titulo: 'Your location', texto: 'We don’t store it; only your distance to the place when you report. If you use GPS to center the map, your coordinates never leave your phone. “How is it?” reports are anonymous even if you have an account.' },
      { icono: 'edificio', titulo: 'The Tourism Office', texto: <>It only receives <strong>totals per place and hour</strong>, never your individual reports.</> },
      { icono: 'chat', titulo: 'The assistant', texto: 'Your questions are processed on our own computer and are not sent to third parties.' },
    ],
    derechos: 'Your rights (access, rectification, cancellation and objection)',
    derechosTexto: 'Write to',
    responsable: 'Data controller: Axel García Arellano, RUMBO team.',
    datos: 'Data and credits',
    datosLista: [
      { icono: 'mapa', titulo: 'Base map', texto: 'Esri Light Gray Canvas (Esri, HERE, Garmin and the GIS user community).' },
      { icono: 'pin', titulo: 'Map and places', texto: '© OpenStreetMap contributors, ODbL license.' },
      { icono: 'sol', titulo: 'Weather', texto: 'Open-Meteo, CC BY 4.0 license.' },
      { icono: 'coche', titulo: 'Traffic', texto: 'TomTom.' },
      { icono: 'navegar', titulo: 'Travel times', texto: 'OpenRouteService.' },
      { icono: 'edificio', titulo: 'Businesses', texto: 'DENUE, INEGI.' },
      { icono: 'museo', titulo: 'Museums', texto: 'Cultural Information System, Ministry of Culture.' },
      { icono: 'grafica', titulo: 'Occupancy, arrivals and spending', texto: 'Tourism Observatory, Puebla Tourism Development Office.' },
      { icono: 'personas', titulo: 'Site visits', texto: 'INAH statistics.' },
    ],
    fotos: 'Photos',
    fotosTexto: 'From Wikimedia Commons, cropped and resized for the app. Each keeps its own license.',
  },
}

const CORREO = 'abejo.2005@gmail.com'
const SECCIONES = ['que-es', 'equipo', 'privacidad', 'datos', 'fotos']
// Una foto por destino para la portada
const PORTADA = ['catedral', 'zona_arq_cholula', 'atlixco_centro']

// Iniciales para el círculo de cada integrante: nombre y primer apellido ("Axel García Arellano" → "AG")
const iniciales = (nombre) => nombre.split(' ').slice(0, 2).map((p) => p[0]).join('')

// Título de sección: con id y tabIndex para que los enlaces (/acerca#privacidad) lleven el foco ahí
function Titulo({ id, icono, children }) {
  return (
    <h2 id={id} tabIndex={-1} className="acerca-titulo">
      <span className="acerca-titulo-icono"><Icono nombre={icono} /></span>{children}
    </h2>
  )
}

// Tarjeta con ícono, título y texto (privacidad y fuentes de datos)
function Tarjeta({ icono, titulo, texto }) {
  return (
    <li className="acerca-tarjeta">
      <Icono nombre={icono} />
      <div>
        <h3>{titulo}</h3>
        <p>{texto}</p>
      </div>
    </li>
  )
}

// A1 — Acerca de y privacidad: atribuciones obligatorias por licencia (RN_13) y aviso corto (RN_07).
// Portada, índice fijo para saltar entre secciones y el contenido en tarjetas.
function Acerca() {
  const { idioma } = useIdioma()
  const c = CONTENIDO[idioma]
  const [activa, setActiva] = useState(SECCIONES[0])

  // Enlaces como /acerca#privacidad (desde "Iniciar sesión") bajan hasta esa sección.
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.focus()
  }, [hash])

  // El índice marca la sección que se está leyendo
  useEffect(() => {
    const observador = new IntersectionObserver((entradas) => {
      const visible = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (visible) setActiva(visible.target.dataset.seccion)
    }, { rootMargin: '-15% 0px -70% 0px' })
    document.querySelectorAll('[data-seccion]').forEach((s) => observador.observe(s))
    return () => observador.disconnect()
  }, [])

  function irA(e, id) {
    e.preventDefault()
    const destino = document.getElementById(id)
    if (!destino) return
    const suave = !matchMedia('(prefers-reduced-motion: reduce)').matches
    destino.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' })
    destino.focus({ preventScroll: true })
    history.replaceState(null, '', `#${id}`)
    setActiva(id)
  }

  return (
    <div className="pagina-texto acerca">
      <div className="acerca-marco">
        <nav className="acerca-indice" aria-label={c.indice}>
          <p className="acerca-indice-titulo">{c.indice}</p>
          <ul>
            {SECCIONES.map((id) => (
              <li key={id}>
                <a href={`#${id}`} onClick={(e) => irA(e, id)} aria-current={activa === id ? 'location' : undefined}>
                  {c.secciones[id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="acerca-contenido">
          {/* Portada: qué es, el acrónimo y los tres destinos */}
          <section className="acerca-portada" data-seccion="que-es" aria-labelledby="que-es">
            <div className="acerca-portada-texto">
              <h1>{c.titulo}</h1>
              <h2 id="que-es" tabIndex={-1} className="oculto-accesible">{c.secciones['que-es']}</h2>
              <p className="acerca-lema">{c.queEsTexto}</p>
              <p className="oculto-accesible">{c.significado}</p>
              <ol className="acronimo" aria-hidden="true">
                {c.acronimo.map(([letra, palabra]) => (
                  <li key={letra}><span className="acronimo-letra">{letra}</span><span className="acronimo-palabra">{palabra}</span></li>
                ))}
              </ol>
            </div>
            <ul className="acerca-destinos" aria-label={c.destinos.join(', ')}>
              {PORTADA.map((id, i) => (
                <li key={id}>
                  <img src={rutaFoto(id)} alt="" width="900" height="600" loading="lazy" decoding="async" />
                  <span>{c.destinos[i]}</span>
                </li>
              ))}
            </ul>
          </section>

          <aside className="acerca-aviso" aria-labelledby="que-no">
            <Icono nombre="info" />
            <div>
              <h2 id="que-no">{c.queNo}</h2>
              <p>{c.queNoTexto}</p>
            </div>
          </aside>

          {/* Equipo: una tarjeta por persona con sus roles; abajo, los docentes y el hackathon */}
          <section className="acerca-seccion" data-seccion="equipo" aria-labelledby="equipo">
            <Titulo id="equipo" icono="personas">{c.origen}</Titulo>
            <p className="acerca-intro">{c.origenTexto}</p>
            <ul className="personas">
              {c.personas.map(([nombre, roles]) => (
                <li key={nombre} className="persona">
                  <span className="persona-avatar" aria-hidden="true">{iniciales(nombre)}</span>
                  <div>
                    <h3>{nombre}</h3>
                    <ul className="roles">{roles.map((r) => <li key={r}>{r}</li>)}</ul>
                  </div>
                </li>
              ))}
            </ul>
            <div className="acerca-creditos-equipo">
              <div className="docentes">
                <p className="docentes-titulo"><Icono nombre="birrete" />{c.guias}</p>
                <ul>
                  {c.docentes.map(([nombre, papel]) => <li key={nombre}><strong>{nombre}</strong><span>{papel}</span></li>)}
                </ul>
              </div>
              <div className="pie-evento">
                <div className="logos-evento">
                  <img src={logoTechCapital} alt="Tech Capital Puebla 2026" width="400" height="365" />
                  <img src={logoIntelligentia} alt="Intelligentia: Compromiso, Innovación, Conocimiento" width="229" height="240" />
                </div>
                <p>{c.evento}</p>
              </div>
            </div>
          </section>

          {/* Privacidad: tres compromisos, la comparación sin cuenta / con cuenta, lo que aplica siempre y tus derechos */}
          <section className="acerca-seccion" data-seccion="privacidad" aria-labelledby="privacidad">
            <Titulo id="privacidad" icono="escudo">{c.privacidad}</Titulo>
            <ul className="promesas">
              {c.promesas.map((p) => <li key={p.texto}><Icono nombre={p.icono} />{p.texto}</li>)}
            </ul>
            <div className="modos">
              {c.modos.map((m, i) => (
                <article key={m.titulo} className={`modo${i === 1 ? ' con-cuenta' : ''}`}>
                  <div className="modo-cabeza">
                    <span className="modo-icono" aria-hidden="true"><Icono nombre={m.icono} /></span>
                    <div><h3>{m.titulo}</h3><p>{m.resumen}</p></div>
                  </div>
                  <ul>{m.puntos.map((pt) => <li key={pt}><Icono nombre="check" />{pt}</li>)}</ul>
                </article>
              ))}
            </div>
            <h3 className="siempre-titulo">{c.siempre}</h3>
            <dl className="siempre">
              {c.detalles.map((d) => (
                <div key={d.titulo}>
                  <dt><Icono nombre={d.icono} />{d.titulo}</dt>
                  <dd>{d.texto}</dd>
                </div>
              ))}
            </dl>
            <div className="acerca-derechos">
              <Icono nombre="correo" />
              <div>
                <h3>{c.derechos}</h3>
                <p>{c.derechosTexto} <a href={`mailto:${CORREO}`}>{CORREO}</a></p>
                <p className="suave">{c.responsable}</p>
              </div>
            </div>
          </section>

          <section className="acerca-seccion" data-seccion="datos" aria-labelledby="datos">
            <Titulo id="datos" icono="base">{c.datos}</Titulo>
            <ul className="acerca-tarjetas compactas">
              {c.datosLista.map((d) => <Tarjeta key={d.titulo} {...d} />)}
            </ul>
          </section>

          {/* Fotos: miniatura, lugar y crédito de cada una (lo exige la licencia) */}
          <section className="acerca-seccion" data-seccion="fotos" aria-labelledby="fotos">
            <Titulo id="fotos" icono="imagen">{c.fotos}</Titulo>
            <p className="acerca-intro">{c.fotosTexto}</p>
            <ul className="creditos-fotos">
              {Object.entries(FOTOS).map(([id, f]) => (
                <li key={id}>
                  <img src={rutaFoto(id, 'mini')} alt="" width="200" height="200" loading="lazy" decoding="async" />
                  <div>
                    <span className="credito-lugar">{f.lugar}</span>
                    <a href={f.pagina} target="_blank" rel="noreferrer">{f.autor} · {f.licencia}</a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Acerca
