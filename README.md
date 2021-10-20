# MS Teams deploy release card

Send release notes from GitHub to MS Teams after a deployment

### Usage

1. Add `MS_TEAMS_WEBHOOK_URI` on your repository's configs on Settings > Secrets. It is the [webhook URI](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook) of the dedicated Microsoft Teams channel for notification.

2) Add two new `step` on your workflow code below `actions/checkout@v2`:

```yaml
name: MS Teams Deploy Card

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      # Gets the release tag
      - name: Get the release tag
        id: get_version
        run: echo ::set-output name=VERSION::${GITHUB_REF/refs\/tags\//}}

      # Send release notes to ms teams
      - uses: Stompf/ms-teams-deploy-release-card@main #  or "./" if in a local set-up
        with:
          github-token: ${{ github.token }}
          github-repo: ${{ github.repository }}
          github-tag: ${{ steps.get_version.outputs.VERSION }}
          ms-teams-webhook-url: ${{ secrets.MS_TEAMS_WEBHOOK_URI }}
```

### Configuration

| Name                         | Required | Default                          | Description                                                                                                                                                                                                |
| ---------------------------- | -------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `github-token`               | `true`   | None                             | This can be set to the following:<br/>- `${{ github.token }}`<br/>- `${{ secrets.GITHUB_TOKEN }}`<br/>- `${{ secrets.CUSTOM_TOKEN }}`                                                                      |
| `github-repo`                | `true`   | None                             | The repository to check for release notes. In the format `owner/repo`.<br/> Example: `Stompf/ms-teams-deploy-release-card` <br/>Can be set with `${{ github.repository }} ` to get the current repository. |
| `github-tag`                 | `true`   | None                             | The git tag to get the release notes by. See the example how to get the tag the workflow is running when using `on: push: tags`.                                                                           |
| `ms-teams-webhook-url`       | `true`   | None                             | The value of `MS_TEAMS_WEBHOOK_URI`                                                                                                                                                                        |
| `ms-teams-card-title`        | `false`  | `$(github-repo) - $(github-tag)` | The title shown on the ms teams card. Defaults to using the full repo name and the tag. <br/> Example: `Stompf/ms-teams-deploy-release-card - v1.0.0`                                                      |
| ` ms-teams-card-theme-color` | `false`  | None                             | Theme color shown on the ms teams card.                                                                                                                                                                    |
| `anonymize`                  | `false`  | `false`                          | Removes all links and contributors from the release notes sent to teams. Used for example if you auto-generate release notes in a private repository.                                                      |

### Local development

To test locally create a `.env` file in the root folder with the configuration above in uppercase and prefixed with `INPUT_`

Example:

```
INPUT_MS-TEAMS-WEBHOOK-URL=https://webhook.office.com/webhookb2/123
INPUT_GITHUB-TOKEN=abcdef1234
INPUT_GITHUB-REPO=Stompf/ms-teams-deploy-release-card
INPUT_GITHUB-TAG=v1.0.0
INPUT_MS-TEAMS-CARD-THEME-COLOR=0072C6
INPUT_ANONYMIZE=true
```

When this config file exists run with `npm start`
