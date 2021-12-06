const core = require('@actions/core');
const github = require('@actions/github');

const run = async () => {
  const token = core.getInput('GITHUB_TOKEN');

  const octokit = github.getOctokit(token);
  const { pull_request } = github.context.payload;
  const { additions: totalAdditions, deletions: totalDeletions, number, owner, repo } = pull_request;
  console.log(owner.name, repo.name, number);
  let changedFiles;
  try {
    changedFiles = await octokit.rest.pulls.listFiles({
      owner, repo: repo.name, number
    });
  } catch(error) {
    console.log(error.message);
  }

  console.log(totalAdditions, totalDeletions, changedFiles);
};

run();