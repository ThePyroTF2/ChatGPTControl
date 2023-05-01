import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'
import { Builder, WebDriver, Key, until } from 'selenium-webdriver'
import { encode } from 'gpt-3-encoder'
import approve from './approve'
import AsyncFunction from './AsyncFunction'

const OpenAIConfig = new Configuration({
	apiKey: process.env.OPENAI_API_KEY
})

const openAI = new OpenAIApi(OpenAIConfig)

const runGivenCode = async (code: string, driver: WebDriver): Promise<string> => {
	let output = ''
	const runnableCode = new AsyncFunction('driver', 'Key', 'until', code)
	const approved = await approve(runnableCode, (e) => e, ['message'], driver, Key, until)
	if(approved.approved) output.concat(JSON.stringify(approved.return))
	else output.concat('[Code has been denied.]')
	if(approved.options.message) output.concat(`\n\n[User message: "${approved.options.message}"]`)
	return output
}

const main = async () => {
	console.clear()
	const driver = await new Builder().forBrowser('chrome').build()
	const prompt: ChatCompletionRequestMessage[] = [
		{role: 'system', content: `You are writing javascript code blocks to be run by a node.js server. Your messages are to contain ***only code blocks***. Your purpose is to control a chrome browser using the selenium webdriver. You have been provided a WebDriver object named \`driver\` to do so. You also have access to the \`until\` object and the \`Key\` object provided by selenium.\n\nEach code block you create will require approval by a human who is supervising you, so it would be wise to break your actions into chunks to increase the chance of approval. For instance, if you wanted to search for something using Google, it would be better to first submit\n\`\`\`js\nawait driver.get('https://www.google/com')\n\`\`\`\nfor approval, then after it is approved, submit\n\`\`\`js\nawait (await driver.findElement({name: 'q'}))?.sendKeys(\`Something\${Key.RETURN}\`)\n\`\`\`\nfor approval.\n\nYour code blocks can be multiple lines.\n\nThe first user message can be disregarded. However, following your first response, the user message will contain information about your previous request. Should your code be accepted, the user message will contain whatever your given code block returns (You will need to use the \`return\` keyword for this to work!). This can be used to make queries to better understand the contents of a given page. If your code is accepted but causes an error, the user message will contain the error. Should your code be rejected, it will not be run and you will be informed.\n\nThe user message may also include a message from your supervisor. If they notice that you are stuck, they will try to help you out.\n\nIf you ever use \`driver.wait()\`, *make the timeout 10000 milliseconds*. That means it should always look something like this:\n\n\`\`\`js\ndriver.wait([condition], 10000)\n\`\`\``},
		{role: 'user', content: '[Disregard this message.]'},
		{role: 'assistant', content:`\`\`\`js\nawait driver.get('https://www.google.com')\n\`\`\``},
		{role: 'user', content: 'undefined'},
		{role: 'assistant', content: `\`\`\`js\nawait (await driver.findElement({name: 'q'}))?.sendKeys(\`Nuclear Launch Codes$\{Key.RETURN}\`)\nawait driver.wait(until.titleIs('Nuclear Launch Codes - Google Search'), 10000)\n\`\`\``},
		{role: 'user', content: `[Code has been denied.]\n\n[User message: "I don't think you should be doing that..."]`},
	]
	await driver.get('https://www.google.com')
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