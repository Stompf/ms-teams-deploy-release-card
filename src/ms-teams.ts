import { Agent } from 'http';
import fetch from 'node-fetch';

// https://docs.microsoft.com/en-us/outlook/actionable-messages/message-card-reference

export async function postMessageToTeams(
  title: string,
  message: string,
  themeColor: string,
  webhookUrl: string,
  releaseLink: string,
  agent?: Agent
) {
  const linkAction = {
    '@type': 'OpenUri',
    name: 'View in GitHub',
    targets: [{ os: 'default', uri: releaseLink }],
  };

  const card = {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    themeColor,
    text: message,
    title,
    potentialAction: [linkAction],
  };

  const response = await fetch(webhookUrl, {
    method: 'post',
    body: JSON.stringify(card),
    agent,
    headers: {
      'content-type': 'application/json',
    },
  });

  return `${response.status} - ${response.statusText}`;
}
