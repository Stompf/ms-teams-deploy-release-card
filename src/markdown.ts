import * as core from '@actions/core';
import { utils } from './utils';
import emojiUnicode from 'emoji-unicode';
import toEmoji from 'emoji-name-map';
import { getOptions } from './options';

export function fixMarkdown(body: string | null | undefined, options: ReturnType<typeof getOptions>) {
  if (!body) {
    return null;
  }

  let fixedBody = body.split('\r\n').join(' \r\n ');

  if (options.anonymize) {
    // Remove GitHub links linking to the repository
    for (const word of fixedBody.split(' ').filter(utils.onlyUnique)) {
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
    for (const word of fixedBody.split(' ').filter(utils.onlyUnique)) {
      if (word.match(new RegExp(`https://github.com/${options.githubOwner}/${options.githubRepo}/pull/d*`, 'gm'))) {
        core.debug(`matching PR with link - ${word}`);
        fixedBody = fixedBody.split(word).join(`[#${word.substring(word.lastIndexOf('/') + 1)}](${word})`);
      } else if (word.match(new RegExp(/#\d+/))) {
        core.debug(`matching PR with hash - ${word}`);

        const newWord = word.split('(').join('').split(')').join('');

        fixedBody = fixedBody
          .split(newWord)
          .join(
            `[${newWord}](https://github.com/${options.githubOwner}/${options.githubRepo}/pull/${newWord.replace(
              '#',
              ''
            )})`
          );
      }
    }
  }

  // Replace GitHub emojis with images
  for (const word of fixedBody.split(' ').filter(utils.onlyUnique)) {
    if (word.startsWith(':') && word.endsWith(':')) {
      core.debug(`Found word ${word}`);

      const emoji = toEmoji.get(word);

      if (emoji) {
        const unicode: string | undefined = emojiUnicode(emoji);
        if (unicode) {
          const code = unicode.split(' ')[0];

          core.debug(`Replaced ${word} with ${code}`);

          fixedBody = fixedBody
            .split(word)
            .join(`![${word}](https://github.githubassets.com/images/icons/emoji/unicode/${code}.png)`);
        }
      }
    }
  }

  fixedBody = fixedBody.trim();

  core.debug(`Fixed releases notes: ${fixedBody}`);

  return fixedBody;
}
