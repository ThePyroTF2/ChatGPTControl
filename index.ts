import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'
import { Builder, WebDriver, Key, until } from 'selenium-webdriver'
import { encode } from 'gpt-3-encoder'
import untildify from 'untildify'
import fs from 'fs'
import approve from './approve'
import AsyncFunction from './AsyncFunction'

const OpenAIConfig = new Configuration({
	apiKey: process.env.OPENAI_API_KEY
})

const openAI = new OpenAIApi(OpenAIConfig)

const runGivenCode = async (code: string, driver: WebDriver): Promise<string> => {
	let output = ''
	const runnableCode = new AsyncFunction('driver', 'Key', 'until', code)
	const approval = await approve(runnableCode, (e) => e, ['message'], driver, Key, until)

	if(approval.approved) output += JSON.stringify(approval.return)
	else output += '[Code has been denied.]'

	if(approval.options.message) output += `\n[User message: "${approval.options.message}"]`

	return output
}

const main = async () => {
	console.clear()

	const driver = await new Builder().forBrowser('chrome').build()

	const prompt: ChatCompletionRequestMessage[] = JSON.parse(await fs.promises.readFile(untildify('~/Documents/ChatGPTControl/setup.json'), 'utf-8'))

	while(true) {
		try{
			const res = await openAI.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: prompt
			})

			console.clear()

			const reply = res.data.choices[0].message
			console.log(reply.content)
			prompt.push(reply)

			const codeFences = reply.content.match(/^`{3}([\S]+)?\n([\s\S]+)\n`{3}/m)
			const codeFence = codeFences ? codeFences[0] : ''
			const code = codeFence.replace(/`{3}.*\n?/g, '')

			let nTokens: number = 0
			for(const message of prompt) nTokens += encode(message.content).length
			while(nTokens > 4000) prompt.splice(1, 1)

			const result = await runGivenCode(code, driver)
			console.log(`Result: ${result}`)
			prompt.push({role: 'user', content: result ? result : 'undefined'})
		} catch (e) {
			console.error(e)
			await driver.close()
			if(e.message.toLowerCase() == 'canceled') break
		}
	}	
}

main()
