import Prompt from 'prompt'

Prompt.start()

interface approveResponse {
	approved: boolean
	success?: boolean
	return?: any
	options?: {[key: string]: string}
}

type syncFunction<T> = (...args: any[]) => T
type asyncFunction<T> = (...args: any[]) => Promise<T>

/**
 * Prompts the user to approve a function call on the command line.
 * @param code - The function to run
 * @param fallback - The function to run if `code` throws an error. This function will be passed the error as an argument
 * @param args - The arguments to pass to `code`
 * @returns Whether the call was approved, whether it threw an error, the return value of the function call, and the result of any options
 */
export default async function approve<T>(code: asyncFunction<T> | syncFunction<T>, fallback: asyncFunction<T> | syncFunction<T> = () => undefined, options: string[] = [], ...args: any[]): Promise<approveResponse> {
	let valid = false
	const output: approveResponse = {approved: false, options: {}}
	while(!valid) {
		valid = true
		const promptString = `Run the following code? (y/n)\n\n${code.toString()}\n`
		const res = await Prompt.get<{[key: string]: string}>([promptString, ...options])
		console.log()
		const approved = res[promptString].toLowerCase()
		if(approved == 'y') {
			output.approved = true
			try{
				output.return = await code(...args)
				output.success = true
			} catch(e) {
				console.error(e)
				output.return = fallback(e)
				output.success = false
			}
		}
		else if(approved == 'n') output.approved = false
		else valid = false
		for(const option of options) output.options[option] = res[option]
		if(!valid) console.log('Invalid input. Please try again.')
	}

	return output
}