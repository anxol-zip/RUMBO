import { pesos } from '../../data/formato.js'
import { repartoEstados, repartoReportes } from '../../data/tablero.js'
import { useIdioma } from '../../i18n/contexto.js'

// Barra apilada con su leyenda debajo. Los segmentos llevan su número también en texto (WCAG 1.4.1).
function Apilada({ partes, etiqueta }) {
  const total = partes.reduce((s, p) => s + p.n, 0)
  return (
    <>
      <div className="apilada" role="img" aria-label={etiqueta}>
        {total === 0 ? <span className="apilada-vacia" /> : partes.filter((p) => p.n > 0).map((p) => (
          <span key={p.clave} className={`apilada-parte ${p.clase}`} style={{ flexGrow: p.n }} />
        ))}
      </div>
      <ul className="apilada-leyenda" aria-hidden="true">
        {partes.map((p) => <li key={p.clave}><span className={`apilada-punto ${p.clase}`} />{p.texto}</li>)}
      </ul>
    </>
  )
}

// Los cuatro números del día, cada uno con lo que explica: cuántos turistas aceptaron otra opción,
// cuánto dinero movió eso (dos cifras con su supuesto, RN_14), qué reportaron y cómo están los lugares.
function Indicadores({ hoy, derrama, puntos }) {
  const { t } = useIdioma()
  const sugeridas = hoy.redirecciones_sugeridas
  const aceptadas = hoy.redirecciones_aceptadas
  const tasa = sugeridas ? Math.round((aceptadas / sugeridas) * 100) : 0
  const reportes = repartoReportes(hoy.reportes_por_estado)
  const totalReportes = reportes.reduce((s, r) => s + r.n, 0)
  const estados = repartoEstados(puntos)
  const verdes = estados.find((e) => e.color === 'verde')?.n ?? 0
  const lista = (partes) => partes.map((p) => `${p.texto}`).join(', ')

  const partesReportes = reportes.map((r) => ({ clave: r.estado, clase: r.estado, n: r.n, texto: t(`tablero.reporte.${r.estado}${r.n === 1 ? 'Uno' : ''}`, { n: r.n }) }))
  const partesEstados = estados.map((e) => ({ clave: e.color, clase: e.color, n: e.n, texto: `${e.n} ${t(`sem.${e.color}`).toLowerCase()}` }))

  return (
    <div className="indicadores">
      <article className="indicador">
        <h2>{t('tablero.kpi.redir')}</h2>
        <p className="indicador-valor numero">{aceptadas}<span className="indicador-de">{sugeridas ? t('tablero.kpi.redirDe', { n: sugeridas }) : ''}</span></p>
        {sugeridas
          ? <>
              <div className="progreso" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={tasa} aria-label={t('tablero.kpi.redirTasa', { n: tasa })}>
                <span style={{ width: `${tasa}%` }} />
              </div>
              <p className="indicador-nota">{t('tablero.kpi.redirTasa', { n: tasa })}</p>
            </>
          : <p className="indicador-nota">{t('tablero.kpi.redirNinguna')}</p>}
      </article>

      <article className="indicador">
        <h2>{t('tablero.kpi.derrama')}</h2>
        <p className="indicador-valor numero">{pesos(derrama.redistribuida_mxn)}</p>
        <p className="indicador-nota">{t('tablero.kpi.derramaRedis')}</p>
        <p className="indicador-segunda"><strong className="numero">{pesos(derrama.nueva_estimada_mxn)}</strong> {t('tablero.kpi.derramaNueva')}</p>
        <details className="indicador-como">
          <summary>{t('tablero.kpi.derramaComo')}</summary>
          <p><strong>{t('tablero.kpi.derramaRedisTitulo')}</strong> {t('tablero.kpi.derramaRedisTexto')}</p>
          <p><strong>{t('tablero.kpi.derramaNuevaTitulo')}</strong> {t('tablero.kpi.derramaNuevaTexto')}</p>
          <p className="indicador-nota">{t('tablero.kpi.derramaSupuesto')}</p>
        </details>
      </article>

      <article className="indicador">
        <h2>{t('tablero.kpi.reportes')}</h2>
        <p className="indicador-valor numero">{totalReportes}</p>
        <Apilada partes={partesReportes} etiqueta={lista(partesReportes)} />
      </article>

      <article className="indicador">
        <h2>{t('tablero.kpi.lugares')}</h2>
        <p className="indicador-valor numero">{verdes}<span className="indicador-de">{t('tablero.kpi.lugaresDe', { n: puntos.length })}</span></p>
        <Apilada partes={partesEstados} etiqueta={lista(partesEstados)} />
      </article>
    </div>
  )
}

export default Indicadores
