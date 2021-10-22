import * as core from '@actions/core';
import { Octokit } from 'octokit';
import emojiUnicode from 'emoji-unicode';
import toEmoji from 'emoji-name-map';
import { getOptions } from './options';
import { postMessageToTeams } from './ms-teams';

// https://docs.microsoft.com/en-us/outlook/actionable-messages/message-card-reference

async function run(): Promise<void> {
  try {
    core.debug(`Starting...`);

    const options = getOptions();
    const octokit = new Octokit({ auth: options.githubToken });

    const releases = await octokit.rest.repos.getReleaseByTag({
      owner: options.githubOwner,
      repo: options.githubRepo,
      tag: options.githubTag,
    });

    const { body } = releases.data;

    core.debug(`Raw releases notes: ${body}`);

    const fixedBody = fixMarkdown(body, options);

    if (fixedBody) {
      await postMessageToTeams(
        options.msTeamsCardTitle,
        fixedBody,
        options.msTeamsCardThemeColor,
        options.msTeamsWebHookUrl
      );
    } else {
      core.info(`Nothing to send`);
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else if (typeof error === 'string') {
      core.setFailed(error);
    } else {
      core.setFailed(`Action failed for unknown reason`);
    }
  }
}

function fixMarkdown(body: string | null | undefined, options: ReturnType<typeof getOptions>) {
  if (!body) {
    return null;
  }

  let fixedBody = body.split('\r\n').join(' \r\n ');

  if (options.anonymize) {
    // Remove GitHub links linking to the repository
    for (const word of fixedBody.split(' ')) {
      if (word.startsWith(`https://github.com/${options.githubOwner}`)) {
        fixedBody = fixedBody.split(word).join('');
      }
    }

    // Remove authors
    fixedBody = fixedBody.split(new RegExp(/by @[\S]* in/, 'gm')).join('');

    // Remove new contributors link
    fixedBody = fixedBody.split(new RegExp(/## New Contributors.*/, 'gm')).join('');
    fixedBody = fixedBody.split(new RegExp(/\* @[\S]* made their first contribution in/, 'gm')).join('');

    // Remove full changelog link
    fixedBody = fixedBody.split(new RegExp(/\*\*Full Changelog\*\*.*/, 'gm')).join('');
  } else {
    // Replace GitHub pull links
    for (const word of fixedBody.split(' ')) {
      if (word.match(/https:\/\/github.com\/${options.githubOwner}\/${options.githubRepo}\/pull\/\d*/)) {
        fixedBody = fixedBody.split(word).join(`[#${word.substring(word.lastIndexOf('/'))}](${word})`);
      } else if (word.match(new RegExp(/#\d*/))) {
        fixedBody = fixedBody
          .split(word)
          .join(
            `[${word}](https://github.com/${options.githubOwner}/${options.githubRepo}/pull/${word.replace('#', '')})`
          );
      }
    }
  }

  // Replace GitHub emojis with images
  for (const word of fixedBody.split(' ')) {
    if (word.startsWith(':') && word.endsWith(':')) {
      core.debug(`Found word ${word}`);

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
