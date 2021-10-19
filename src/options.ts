import * as core from '@actions/core';
import dotenv from 'dotenv';

dotenv.config();

export function getOptions() {
  const repoFullName = core.getInput('github-repo').split('/');

  return {
    githubToken: core.getInput('github-token'),
    githubOwner: repoFullName[0],
    githubRepo: repoFullName[1],
    githubTag: core.getInput('github-tag'),
    msTeamsWebHookUrl: core.getInput('ms-teams-webhook-url'),
    msTeamsCardTitle:
      core.getInput('ms-teams-card-title') || `${core.getInput('github-repo')} - ${core.getInput('github-tag')}`,
    msTeamsCardThemeColor: core.getInput('ms-teams-card-theme-color'),
    anonymize: core.getInput('anonymize').toLowerCase().trim() === 'true',
  };
}
