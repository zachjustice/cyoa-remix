export async function sendEmail(email: {
	to: string
	subject: string
	html: string
	text: string
}) {
	if (!process.env.MAILGUN_SENDING_KEY && !process.env.MOCKS) {
		console.error(`MAILGUN_SENDING_KEY not set and we're not in mocks mode.`)
		console.error(
			`To send emails, set MAILGUN_SENDING_KEY and MAILGUN_DOMAIN environment variables.`,
		)
		console.error(`Failing to send the following email:`, JSON.stringify(email))
		return
	}

	const myHeaders = new Headers()
	myHeaders.append(
		'Authorization',
		`Basic ${Buffer.from(`api:${process.env.MAILGUN_SENDING_KEY}`).toString(
			'base64',
		)}`,
	)

	const formdata = new FormData()
	formdata.append(
		'from',
		`Choose Your Own Adventure <cyoa@${process.env.MAILGUN_DOMAIN}>`,
	)
	formdata.append('to', email.to)
	formdata.append('subject', email.subject)
	formdata.append('text', email.text)
	console.log(JSON.stringify(Array.from(formdata.entries())))
	console.log(JSON.stringify(Array.from(myHeaders.entries())))

	const resp = await fetch('https://cat-fact.herokuapp.com/facts/random')
	console.log(await resp.json())

	const url = `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`
	console.log(`url ${url}`)
	return fetch(url, {
		method: 'POST',
		body: formdata,
		headers: myHeaders,
	})
}
