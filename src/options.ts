import * as core from '@actions/core';
import dotenv from 'dotenv';

dotenv.config();

export function getOptions() {
  return {
    githubToken: core.getInput('github-token'),
    githubOwner: core.getInput('github-owner'),
    githubRepo: core.getInput('github-repo'),
    githubTag: core.getInput('github-tag'),
    msTeamsWebHookUrl: core.getInput('ms-teams-webhook-url'),
    msTeamsCardTitle: core.getInput('ms-teams-card-title') || core.getInput('github-tag'),
    msTeamsCardThemeColor: core.getInput('ms-teams-card-theme-color'),
    anonymize: core.getInput('anonymize').toLowerCase().trim() === 'true',
  };
}
