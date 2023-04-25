import { Builder, By, Key, until, WebDriver } from './node_modules/selenium-webdriver/index.js'

const driver = new Builder().forBrowser('chrome').build()

const approve = async (code: () => unknown) => {
	const approved = (await prompt(`Run the following code? (y/n)\n\n${code.toString()}\n`))?.toLowerCase()
	if(approved == 'y') {
		console.log()
		code()
		return
	}
	return
}

approve(() => {
	console.log(JSON.stringify(driver))
})