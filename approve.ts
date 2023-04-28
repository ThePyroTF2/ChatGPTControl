import Prompt from 'prompt'
import AsyncFunction from './AsyncFunction'

Prompt.start()

interface approveResponse {
	approved: boolean
	success?: boolean
	return?: any
}

type syncFunction<T> = (...args: any[]) => T
type asyncFunction<T> = (...args: any[]) => Promise<T>

/**
 * Prompts the user to approve a function call on the command line.
 * @param code - The function to run
 * @param fallback - The function to run if `code` throws an error. This function will be passed the error as an argument
 * @param args - The arguments to pass to `code`
 * @returns Whether the call was approved, whether it threw an error, and the return value of the function call
 */
export default async function approve<T>(code: asyncFunction<T> | syncFunction<T>, fallback: asyncFunction<T> | syncFunction<T> = () => undefined, ...args: any[]): Promise<approveResponse> {
	const promptString = `Run the following code? (y/n)\n\n${code.toString()}\n`
	const res = await Prompt.get<{[key: string]: string}>([promptString])
	const approved = res[promptString].toLowerCase()
	if(approved == 'y') {
		console.log()
		try{
			return {
				approved: true,
				success: true,
				return: await code(...args)
			}
		} catch(e) {
			console.error(e)
			return {
				approved: true,
				success: false,
				return: await fallback(e)
			}
		}
	}
	return {
		approved: false
	}
}