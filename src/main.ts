import * as core from '@actions/core';
import { Octokit } from 'octokit';
import { getOptions } from './options';
import { postMessageToTeams } from './ms-teams';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { fixMarkdown } from './markdown';

async function run(): Promise<void> {
  try {
    core.debug(`Starting...`);
    const options = getOptions();

    let agent: HttpsProxyAgent | undefined;

    if (process.env.HTTPS_PROXY) {
      core.debug(`Using proxy ${process.env.HTTPS_PROXY}`);
      agent = new HttpsProxyAgent(process.env.HTTPS_PROXY);
    }

    const octokit = new Octokit({
      auth: options.githubToken,
      request: { agent },
    });

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
        options.msTeamsWebHookUrl,
        releases.data.html_url,
        agent
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

run();
