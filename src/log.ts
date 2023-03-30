const launchTime = Date.now()

export function log(txt: string) {
	console.log(`At ${((Date.now() - launchTime) / 1000).toFixed(3)}s: ${txt}`)
}