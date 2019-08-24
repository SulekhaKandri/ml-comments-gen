import { execFile } from 'child_process';
import { join } from 'path';
import { dumpAst } from './dump-ast';
import { renameArgsInComments } from './rename-args-in-comments';

const CODE = `
  function concat(a: string, b: string) {
    return a + b;
  }
`;

function predict(ast: string) {
  const pyScript = join(__dirname, '../../model/predict.py');
  return new Promise<string>((resolve, reject) =>
    execFile('python', [pyScript, ast], (err, stdout, stderr) => (err ? reject(err) : resolve(stdout))),
  );
}

async function main() {
  const ast = dumpAst(CODE, true);
  const astTokens = ast.split(' ').filter((token) => !['(', ')'].includes(token));

  console.log(`Predicting for AST with ${astTokens.length} token`);

  const comment = await predict(ast);
  console.log('Result:');
  console.log(renameArgsInComments(comment, CODE, true));
}

main().catch(console.error);