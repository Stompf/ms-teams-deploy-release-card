import * as core from '@actions/core';
import { Octokit } from 'octokit';
import emojiUnicode from 'emoji-unicode';
import toEmoji from 'emoji-name-map';
import { getOptions } from './options';
import { postMessageToTeams } from './ms-teams';

// https://docs.microsoft.com/en-us/outlook/actionable-messages/message-card-reference

async function run(): Promise<void> {
  try {
    const options = getOptions();
    const octokit = new Octokit({ auth: options.githubToken });

    const releases = await octokit.rest.repos.getReleaseByTag({
      owner: options.githubOwner,
      repo: options.githubRepo,
      tag: options.githubTag,
    });

    const body = fixMarkdown(releases.data.body, options.anonymize);

    core.debug(`Raw releases notes: ${body}`);

    if (body) {
      await postMessageToTeams(
        options.msTeamsCardTitle,
        body,
        options.msTeamsCardThemeColor,
        options.msTeamsWebHookUrl
      );
    } else {
      core.info(`Nothing to send`);
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(JSON.stringify(error));
  }
}

function fixMarkdown(body: string | null | undefined, anonymize: boolean) {
  if (!body) {
    return null;
  }

  let fixedBody = body;

  if (anonymize) {
    // Remove GitHub links
    for (const word of fixedBody.split(' ')) {
      if (word.startsWith(`https://github.com/${core.getInput('github-owner')}`)) {
        fixedBody = fixedBody.split(word.substring(0, word.indexOf('\r'))).join('');
      }
    }

    // Remove authors
    fixedBody = fixedBody.split(new RegExp(/by @[\S]* in/, 'gm')).join('');

    // Remove full changelog link
    fixedBody = fixedBody.split(new RegExp(/\*\*Full Changelog\*\*.*/, 'gm')).join('');
  }

  // Replace GitHub emojis with images
  for (const word of fixedBody.split(' ')) {
    if (word.startsWith(':') && word.endsWith(':')) {
      const unicode: string | undefined = emojiUnicode(toEmoji.get(word));
      if (unicode) {
        const code = unicode.split(' ')[0];

        core.debug(`Replaced ${word} with ${code}`);

        fixedBody = fixedBody
          .split(word)
          .join(`![${word}](https://github.githubassets.com/images/icons/emoji/unicode/${code}.png)`);
      }
    }
  }

  fixedBody = fixedBody.trim();

  core.debug(`Fixed releases notes: ${fixedBody}`);

  return fixedBody;
}

run();
