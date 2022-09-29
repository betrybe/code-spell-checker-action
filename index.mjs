import * as github from '@actions/github';
import * as core from '@actions/core';
import { exec } from 'child_process';

const { INPUT_TOKEN, INPUT_FILES } = process.env;

const getSpellErrors = (errors) => {
  const ERROR_REGEX = /\/home\/runner\/work\/conteudo-modular-desenvolvimento-web\/conteudo-modular-desenvolvimento-web\/(.+\.md):(.+) - Unknown word \((.+)\)/gm;
  const result = {};
  let total = 0;
  let foundError;
  while ((foundError = ERROR_REGEX.exec(errors)) !== null) {
    const [_match, file, line, word] = foundError;

    total += 1;
    result[file] = result[file] ? [...result[file], { line, word }] : [{ line, word }];
  }

  return { result, total };
};

const formatErrors = (errors, total) => {
  if (!total) return '#### Nenhum problema encontrado';

  const errorsArr = Object.entries(errors);

  const formattedErrors = errorsArr.reduce((fileAcc, [file, fileErrors]) => {
    const formattedFileErrors = fileErrors.reduce((errorAcc, { line, word }) => (
      `${errorAcc}- Linha \`${line}\`: Palavra desconhecida \`${word}\`\n`
    ), '');

    return `${fileAcc}
#### Arquivo: \`${file}\`

${formattedFileErrors}`;
  }, '');

  return `<details>
<summary><strong>Total de erros: ${total}</strong></summary><br />
  ${formattedErrors}
</details>`;
};

const createComment = (errors, total) => {
  const octokit = github.getOctokit(INPUT_TOKEN);

  const comment = `
### Code Spell Checker
${formatErrors(errors, total)}
`;

  octokit.rest.issues.createComment({
    issue_number: github.context.payload.number,
    owner: github.context.payload.organization.login,
    repo: github.context.payload.repository.name,
    body: comment,
  });
};

const runCSpell = () => {
  console.log(`Running 'npm i @cspell/dict-pt-br && npx cspell ${INPUT_FILES}'`);

  exec(`npm i @cspell/dict-pt-br && npx cspell ${INPUT_FILES}`, (_err, stdout, stderr) => {
    const { result, total } = getSpellErrors(stdout);

    console.log(stderr);

    console.log(stdout);

    createComment(result, total);

    if (total) core.setFailed(`Found ${total} errors`);
    else console.log(`Found ${total} errors`);
  });
};

runCSpell();
