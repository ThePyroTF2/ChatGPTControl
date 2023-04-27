import { Builder, Key, until } from 'selenium-webdriver'
import approve from './approve'
import AsyncFunction from './AsyncFunction'

const main = async () => {
	const driver = await new Builder().forBrowser('chrome').build()

	try{
		const getGoogle = new AsyncFunction(`await driver.get('https://www.google.com')`)
		await approve(getGoogle)
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