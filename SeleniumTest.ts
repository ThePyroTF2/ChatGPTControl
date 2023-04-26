import { Builder, Key, until } from 'selenium-webdriver'
import Prompt from 'prompt'

const approve = async (code: () => Promise<void>, fallback: () => Promise<void> = () => new Promise(() => {})) => {
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

const main = async () => {
	Prompt.start()

	const driver = await new Builder().forBrowser('chrome').build()

	try{
		await approve(async () => await driver.get('https://www.google.com'))
		await approve(async () => {
			await (await driver.findElement({name: 'q'}))?.sendKeys(`Selenium${Key.RETURN}`)
			await driver.wait(until.elementLocated({css: '#search'}))
		})
		await approve(async () => await (await driver.findElement({css: '#search .g a'}))?.click())
		await approve(async () => await driver.close())
	} catch (e) {
		console.error(e)
		await driver.close()
	}
}

main()