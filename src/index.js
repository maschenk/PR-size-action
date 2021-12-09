import core from '@actions/core';
import github from '@actions/github';
import { thresholdOptions, labelOptions } from './constants';

const run = async () => {
  const token = core.getInput('GITHUB_TOKEN');
  const ignoredFiles = core.getInput('ignore_files');
  const octokit = github.getOctokit(token);
  const { pull_request, repository, number } = github.context.payload;
  
  const { changes: totalChanges } = pull_request;

  let excludedChanges = 0;
  if (ignoredFiles.length > 0) {
    const expr = new RegExp(`[a-zA-Z0-9]*${ignoredFiles}`);
    try {
      const { data } = await octokit.rest.pulls.listFiles({
        owner: repository.owner.login, repo: repository.name, pull_number: number
      });
      
      data.forEach((file) => {
        console.log(file.filename, file.changes);
        console.log(expr.test(file.filename));
        if(expr.test(file.filename)) {
          excludedChanges += file.changes;
        }
      });
    } catch(error) {
      console.log(error.message);
    };
  };
  const cleanedChanges = totalChanges - excludedChanges;
  const currentLabels = getCurrentLabels(pull_request.labels);
  const desiredLabel = getDesiredLabel(cleanedChanges);
  const newLabel = currentLabels.includes(desiredLabel) ? '' : desiredLabel;
  const staleLabels = currentLabels.filter(label => label !== desiredLabel);

  core.setOutput('new_label', newLabel);
  core.setOutput('stale_label', staleLabels);
  };

// getDesiredLabel
const getDesiredLabel = (cleanedChanges) => {
  if (cleanedChanges > thresholdOptions.sizeSThreshold) {
    return labelOptions.sizeXSLabel;
  }
  if (cleanedChanges > thresholdOptions.sizeMThreshold) {
    return labelOptions.sizeSLabel;
  }
  if (cleanedChanges > thresholdOptions.sizeLThreshold) {
    return labelOptions.sizeMLabel;
  }
  if (cleanedChanges > thresholdOptions.sizeXLThreshold) {
    return labelOptions.sizeLLabel;
  }
  if (cleanedChanges > thresholdOptions.sizeXXLThreshold) {
    return labelOptions.sizeXLLabel;
  }
  return labelOptions.sizeXXLLabel;
};

// getCurrentLabels
const getCurrentLabels = (labels) => {
  labels.filter((label) => {
    Object.values(labelOptions).includes(label.name).map((label) => label.name);
  })
};


run();