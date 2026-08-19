type MailBinding = Pick<SendEmail, 'send'>;

function escapeHtml(value: string): string {
	return value.replace(/[&<>'"]/g, (character) => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
	})[character] ?? character);
}

export async function sendActionEmail(
	email: MailBinding | undefined,
	from: string,
	message: { to: string; subject: string; heading: string; text: string; action: string; url: string }
): Promise<void> {
	if (!email) throw new Error('Email binding is unavailable');
	const safeHeading = escapeHtml(message.heading);
	const safeText = escapeHtml(message.text);
	const safeUrl = escapeHtml(message.url);
	await email.send({
		to: message.to,
		from: { email: from, name: 'LinkGarden' },
		subject: message.subject,
		text: `${message.heading}\n\n${message.text}\n\n${message.action}: ${message.url}`,
		html: `<h1>${safeHeading}</h1><p>${safeText}</p><p><a href="${safeUrl}">${escapeHtml(message.action)}</a></p>`
	});
}
