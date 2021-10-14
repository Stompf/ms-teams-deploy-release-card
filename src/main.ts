import * as core from '@actions/core';
import { Octokit } from 'octokit';
import axios from 'axios';
import dotenv from 'dotenv';
import emojiUnicode from 'emoji-unicode';
import toEmoji from 'emoji-name-map';

dotenv.config();

// https://docs.microsoft.com/en-us/outlook/actionable-messages/message-card-reference

const octokit = new Octokit({ auth: core.getInput('github-token') });

async function run(): Promise<void> {
  try {
    const releases = await octokit.rest.repos.getReleaseByTag({
      owner: core.getInput('github-owner'),
      repo: core.getInput('github-repo'),
      tag: core.getInput('github-tag'),
    });

    const { body } = releases.data;

    core.debug(`Releases notes: ${body}`);

    if (body) {
      const title = core.getInput('ms-teams-card-title') || core.getInput('github-tag');

      await postMessageToTeams(title, fixMarkdown(body));
    } else {
      core.info(`Nothing to send`);
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(JSON.stringify(error));
  }
}

function fixMarkdown(body: string) {
  // Fixes newlines
  let fixedBody = body.split('%0D').join('\n').split('%0A').join('\n');

  // Fixes emojis
  for (const word of fixedBody.split(' ')) {
    if (word.startsWith(':') && word.endsWith(':')) {
      const unicode: string | undefined = emojiUnicode(toEmoji.get(word));
      if (unicode) {
        const code = unicode.split(' ')[0];

        fixedBody = fixedBody
          .split(word)
          .join(`![${word}](https://github.githubassets.com/images/icons/emoji/unicode/${code}.png)`);
      }
    }
  }

  return fixedBody;
}

async function postMessageToTeams(title: string, message: string) {
  const card = {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    themeColor: core.getInput('ms-teams-card-theme-color'),
    text: message,
    title,
  };

  const response = await axios.post(core.getInput('ms-teams-webhook-url'), card, {
    headers: {
      'content-type': 'application/json',
    },
  });
  return `${response.status} - ${response.statusText}`;
}

run();
