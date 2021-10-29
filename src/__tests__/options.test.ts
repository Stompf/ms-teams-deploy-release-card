import { getOptions, Options } from '../options';

describe('options tests', () => {
  beforeEach(() => {
    process.env['INPUT_MS-TEAMS-WEBHOOK-URL'] = 'webhookUrl';
    process.env['INPUT_GITHUB-TOKEN'] = 'token';
    process.env['INPUT_GITHUB-REPO'] = 'owner/repo';
    process.env['INPUT_GITHUB-TAG'] = 'v1.0.0';
    process.env['INPUT_MS-TEAMS-CARD-THEME-COLOR'] = 'themeColor';
    process.env['INPUT_MS-TEAMS-CARD-TITLE'] = 'title';

    delete process.env['INPUT_ANONYMIZE'];
  });

  test('should map options correctly', () => {
    const result = getOptions();

    const expectedResult: Options = {
      anonymize: false,
      githubOwner: 'owner',
      githubRepo: 'repo',
      githubTag: 'v1.0.0',
      githubToken: 'token',
      msTeamsCardThemeColor: 'themeColor',
      msTeamsCardTitle: 'title',
      msTeamsWebHookUrl: 'webhookUrl',
    };

    expect(result).toEqual(expectedResult);
  });

  test('should set title if not set explicitly', () => {
    delete process.env['INPUT_MS-TEAMS-CARD-TITLE'];

    const result = getOptions();

    const expectedResult: Options = {
      anonymize: false,
      githubOwner: 'owner',
      githubRepo: 'repo',
      githubTag: 'v1.0.0',
      githubToken: 'token',
      msTeamsCardThemeColor: 'themeColor',
      msTeamsCardTitle: 'owner/repo - v1.0.0',
      msTeamsWebHookUrl: 'webhookUrl',
    };

    expect(result).toEqual(expectedResult);
  });

  test('should set anonymize correctly', () => {
    process.env['INPUT_ANONYMIZE'] = 'true';

    const result = getOptions();

    const expectedResult: Options = {
      anonymize: true,
      githubOwner: 'owner',
      githubRepo: 'repo',
      githubTag: 'v1.0.0',
      githubToken: 'token',
      msTeamsCardThemeColor: 'themeColor',
      msTeamsCardTitle: 'title',
      msTeamsWebHookUrl: 'webhookUrl',
    };

    expect(result).toEqual(expectedResult);
  });
});
