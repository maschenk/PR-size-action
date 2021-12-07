const core = require('@actions/core');
const github = require('@actions/github');

const run = async () => {
  const token = core.getInput('GITHUB_TOKEN');
  const ignoredFiles = core.getInput('ignore_files');
  const expr = new RegExp(`[a-zA-Z0-9]*${ignoredFiles}`);
  console.log(expr);
  const octokit = github.getOctokit(token);
  const { pull_request, repository, number } = github.context.payload;
  const { additions: totalAdditions, deletions: totalDeletions } = pull_request;
  let excludedAdditions = 0;
  let excludedDeletions = 0;

  try {
    const { data } = await octokit.rest.pulls.listFiles({
      owner: repository.owner.login, repo: repository.name, pull_number: number
    });
    
    data.forEach((file) => {
      console.log(file.filename, file.additions, file.deletions);
      console.log(expr.test(file.filename));
      if(expr.test(file.filename)) {
        excludedAdditions += file.additions;
        excludedDeletions += file.deletions;
      }
    })

  } catch(error) {
    console.log(error.message);
  } 

  console.log(totalAdditions, totalDeletions, excludedAdditions, excludedDeletions);
};

run();