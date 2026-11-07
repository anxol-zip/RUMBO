import { partesRazon, textoTraslado } from '../data/formato.js'
import { useIdioma } from '../i18n/contexto.js'
import Foto from './Foto.jsx'
import IconoEstado from './IconoEstado.jsx'

// Grupos de "Ver todos", en el orden en que conviene leerlos. Sin dato y cerrado van juntos:
// ninguno de los dos es una opción para ir ahora.
const GRUPOS = [
  { id: 'verde', colores: ['verde'] },
  { id: 'amarillo', colores: ['amarillo'] },
  { id: 'rojo', colores: ['rojo'] },
  { id: 'otros', colores: ['sin_dato', 'cerrado'] },
]

// "Ver todos los lugares" (D4 de la propuesta): todos los lugares agrupados por estado. La foto
// ayuda a reconocer el lugar y su forma repite el estado del grupo (Nielsen: reconocer antes que
// recordar; Gestalt: proximidad y similitud). El encabezado de cada grupo se queda arriba al bajar.
function TodosLosLugares({ puntos, seleccionadoId, onSeleccionar }) {
  const { idioma, t } = useIdioma()
  return (
    <div className="todos">
      {GRUPOS.map((g) => {
        const lugares = puntos.filter((p) => g.colores.includes(p.color))
        if (lugares.length === 0) return null
        const titulo = g.id === 'otros' ? t('todos.otros') : t(`sem.${g.id}`)
        return (
          <section key={g.id} className={`grupo-estado ${g.id}`} aria-labelledby={`grupo-${g.id}`}>
            <h3 id={`grupo-${g.id}`}>
              <IconoEstado color={g.colores[0]} />
              {titulo} <span className="cuenta">{lugares.length}</span>
            </h3>
            <ul>
              {lugares.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`lugar-tarjeta${p.color === 'cerrado' ? ' apagado' : ''}`}
                    data-punto={p.id}
                    aria-current={p.id === seleccionadoId}
                    onClick={() => onSeleccionar(p.id)}
                  >
                    <span className="miniatura">
                      <Foto id={p.clave} tamano="mini" />
                      <IconoEstado color={p.color} />
                    </span>
                    <span className="lugar-texto">
                      <strong>{p.nombre}</strong>
                      {p.traslado && <span className="lugar-traslado numero">{textoTraslado(p.traslado, t)}</span>}
                      <span className="lugar-destino">{p.destino}</span>
                      <span className="oculto-accesible">{t(`sem.${p.color}`)}. {partesRazon(p.razon, idioma)[0]}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

export default TodosLosLugares
