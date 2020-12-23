import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { App, AppProps } from 'cdkactions';

/**
 * A util function returning an instance of App with a outdir set to a temp directory
 * @param options AppProps to provide to the new App
 */
export const TestingApp = (options: Partial<AppProps>) => new App(
  {
    ...options,
    outdir: fs.mkdtempSync(path.join(os.tmpdir(), 'kraken')),
  },
);

