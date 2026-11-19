// Nombre de la persona tal como se muestra. Las cuentas institucionales de Microsoft llegan en
// mayúsculas y con los apellidos primero ("RUGERIO JIMENEZ ANGEL"): tomar la primera palabra
// saludaba a la persona por su apellido. Aquí solo se corrigen las mayúsculas; el orden no se
// adivina, porque no hay forma confiable de saber cuál palabra es el nombre de pila.

const MINUSCULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y'])

// "RUGERIO JIMENEZ ANGEL" → "Rugerio Jimenez Angel"; un nombre que ya trae minúsculas no se toca.
export function nombreVisible(nombre) {
  const limpio = (nombre ?? '').trim().replace(/\s+/g, ' ')
  if (!limpio || limpio !== limpio.toLocaleUpperCase('es-MX')) return limpio
  return limpio.toLocaleLowerCase('es-MX').split(' ')
    .map((palabra, i) => (i > 0 && MINUSCULAS.has(palabra) ? palabra : palabra.charAt(0).toLocaleUpperCase('es-MX') + palabra.slice(1)))
    .join(' ')
}

// Iniciales para el avatar: las de las dos primeras palabras con mayúscula ("Ana de la Cruz" → "AC").
// Sin nombre, se usa la primera letra del correo; sin nada, un punto medio.
export function iniciales(nombre, correo = '') {
  const palabras = nombreVisible(nombre).split(' ').filter((p) => p && !MINUSCULAS.has(p))
  if (palabras.length > 0) return palabras.slice(0, 2).map((p) => p.charAt(0).toLocaleUpperCase('es-MX')).join('')
  const letra = (correo ?? '').trim().charAt(0)
  return letra ? letra.toLocaleUpperCase('es-MX') : '·'
}
