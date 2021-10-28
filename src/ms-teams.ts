import { Agent } from 'http';
import fetch from 'node-fetch';

export async function postMessageToTeams(
  title: string,
  message: string,
  themeColor: string,
  webhookUrl: string,
  agent?: Agent
) {
  const card = {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    themeColor,
    text: message,
    title,
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
