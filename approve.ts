import Prompt from 'prompt'

type asyncCode = () => Promise<void>
type syncCode = () => void

Prompt.start()

export default async function approve(code: asyncCode | syncCode, fallback: asyncCode | syncCode = () => {}) {
	const promptString = `Run the following code? (y/n)\n\n${code.toString()}\n`
	const res = await Prompt.get<{[key: string]: string}>([promptString])
	const approved = res[promptString].toLowerCase()
	if(approved == 'y') {
		console.log()
		try{
			await code()
		} catch(e) {
			await fallback()
			console.error(e)
		}
		return
	}
	return
}