const launchTime = Date.now()

/**
 * Affiche dans la console un message de log avec le temps écoulé depuis le lancement de l'application
 *
 * @export
 * @param {string} txt: Message à afficher
 */
export function log(txt: string) {
	console.log(`At ${((Date.now() - launchTime) / 1000).toFixed(3)}s: ${txt}`)
}
