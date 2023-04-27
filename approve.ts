import Prompt from 'prompt'

type asyncCode = (...args) => Promise<void>
type syncCode = (...args) => void

Prompt.start()

export default async function approve(code: asyncCode | syncCode, fallback: asyncCode | syncCode = () => {}, ...args) {
	const promptString = `Run the following code? (y/n)\n\n${code.toString()}\n`
	const res = await Prompt.get<{[key: string]: string}>([promptString])
	const approved = res[promptString].toLowerCase()
	if(approved == 'y') {
		console.log()
		try{
			await code(...args)
		} catch(e) {
			await fallback()
			console.error(e)
		}
		return
	}
	return
}