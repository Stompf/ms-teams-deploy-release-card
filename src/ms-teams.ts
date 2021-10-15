import axios from 'axios';

export async function postMessageToTeams(title: string, message: string, themeColor: string, webhookUrl: string) {
  const card = {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    themeColor,
    text: message,
    title,
  };

  const response = await axios.post(webhookUrl, card, {
    headers: {
      'content-type': 'application/json',
    },
  });
  return `${response.status} - ${response.statusText}`;
}
