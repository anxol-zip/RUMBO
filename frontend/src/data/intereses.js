// Intereses que elige el turista en el inicio (T1). El `id` coincide con las categorías
// del catálogo (columna `categorias`); el nombre en pantalla sale de i18n ('interes.<id>').
export const INTERESES = ['historia', 'arte', 'arquitectura', 'cultura', 'gastronomia', 'naturaleza', 'compras', 'familia', 'pueblos_magicos']

// Horas disponibles; el nombre en pantalla sale de i18n ('tiempo.<horas>').
export const TIEMPOS = [2, 5, 9]

// Filtro por grupo de lugar (feature 004): "Comida" = restaurantes y cafés; "Atractivos" = todo lo demás.
export const TIPOS_COMIDA = ['restaurante', 'cafe']
export const GRUPOS = ['atractivos', 'comida']
export const grupoDe = (tipo) => (TIPOS_COMIDA.includes(tipo) ? 'comida' : 'atractivos')
