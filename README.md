# ChatGPT browses the internet

## Usage

You need two things: [chromedriver](https://chromedriver.chromium.org/downloads) and an environment variable called `OPENAI_API_KEY` containing, fittingly enough, your OpenAI API key.

## Remarks

Sometimes ChatGPT gets confused and gets stuck trying to do things that it can't. This might be because it thinks it's on a different page than it really is, because it's convinced itself that a nonexistant element is real, or it just can't get itself to write functioning code.

Also, while I've done my best to force it to have a timeout on any `driver.wait()` calls, there's no guarantee with this thing -_-. This matters because sometimes it'll wait for a condition that will never be true. A good rule of thumb is that if you end up waiting for something for more than 10 seconds, you need to shut the thing down.

For the love of god ***keep an eye on this thing***. While ChatGPT's current abilities are limited, we still can't know what it might try to do, and it will always be best to err on the side of caution. If you run this without the approval step so help me God I will send out for you.

The script will never stop due to an error. For it to end, you will need to do `ctrl+c` in the terminal. I believe it has protection to ensure the thread doesn't get longer than the API will accept, but I don't have a convenient way to test to make sure. So, if you get a *really* long thread and end up with a `400` error, make an issue! I'll look into fixing it.
