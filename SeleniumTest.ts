import { Builder } from 'selenium-webdriver'

const driver = await new Builder().forBrowser('chrome').build()

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
	driver.get('https://www.google.com')
})