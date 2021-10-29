import { fixMarkdown } from '../markdown';
import { Options } from '../options';

describe('fixMarkdown tests', () => {
  describe('PR links', () => {
    let config: Options;

    beforeEach(() => {
      config = getBaseConfig();
    });

    test('should replace github PR http only links with markdown links', () => {
      const result = fixMarkdown(`https://github.com/${config.githubOwner}/${config.githubRepo}/pull/11`, config);
      expect(result).toBe(`[#11](https://github.com/${config.githubOwner}/${config.githubRepo}/pull/11)`);
    });

    test('should replace github PR hash with markdown links', () => {
      const result = fixMarkdown(`#11`, config);
      expect(result).toBe(`[#11](https://github.com/${config.githubOwner}/${config.githubRepo}/pull/11)`);
    });

    test('should replace github PR hash with markdown links, handle parentheses', () => {
      const result = fixMarkdown(`(#11)`, config);
      expect(result).toBe(`([#11](https://github.com/${config.githubOwner}/${config.githubRepo}/pull/11))`);
    });
  });

  describe('anonymize', () => {
    let config: Options;

    beforeEach(() => {
      config = {
        ...getBaseConfig(),
        anonymize: true,
      };
    });

    test('should remove github links', () => {
      const result = fixMarkdown(`https://github.com/${config.githubOwner}/${config.githubRepo}/pull/11`, config);
      expect(result).toBe(``);
    });

    test('should remove authors', () => {
      const body = `
      ## What's Changed
        * P2 by @Stompf in https://github.com/${config.githubOwner}/${config.githubRepo}/pull/1
        * Ui design by @Stompf in https://github.com/${config.githubOwner}/${config.githubRepo}/pull/2
        * Unity by @Stompf in https://github.com/${config.githubOwner}/${config.githubRepo}/pull/3
        * Bump acorn from 6.4.0 to 6.4.1 by @dependabot in https://github.com/${config.githubOwner}/${config.githubRepo}/pull/4
      `;

      const result = fixMarkdown(body, config);
      expect(result).toBe(
        `
      ## What's Changed
        * P2          * Ui design          * Unity          * Bump acorn from 6.4.0 to 6.4.1
      `.trim()
      );
    });

    test('should remove new contributors', () => {
      const body = `
      Test

      ## New Contributors
        * @Stompf made their first contribution in https://github.com/${config.githubOwner}/${config.githubRepo}/pull/1
        * @dependabot made their first contribution in https://github.com/${config.githubOwner}/${config.githubRepo}/pull/4
      `;

      const result = fixMarkdown(body, config);
      expect(result).toBe(`Test`);
    });

    test('should remove full changelog', () => {
      const body = `
      Test

      **Full Changelog**: https://github.com/${config.githubOwner}/${config.githubRepo}/commits/v1.0.0
      `;

      const result = fixMarkdown(body, config);
      expect(result).toBe(`Test`);
    });
  });

  describe('emojis', () => {
    let config: Options;

    beforeEach(() => {
      config = getBaseConfig();
    });

    test('should replace github emojis with image links', () => {
      const result = fixMarkdown(`:warning:`, config);
      expect(result).toBe(`![:warning:](https://github.githubassets.com/images/icons/emoji/unicode/26a0.png)`);
    });

    test('should only replace found github emojis with image links', () => {
      const result = fixMarkdown(`:warning_not_found:`, config);
      expect(result).toBe(`:warning_not_found:`);
    });
  });
});

function getBaseConfig(): Options {
  return {
    anonymize: false,
    githubOwner: 'Owner',
    githubRepo: 'Repo',
    githubTag: 'v1.0.0',
    githubToken: 'token',
    msTeamsCardThemeColor: '000000',
    msTeamsCardTitle: 'title',
    msTeamsWebHookUrl: 'webhookUrl',
  };
}
