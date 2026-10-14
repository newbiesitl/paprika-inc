import { open } from 'node:fs/promises';
import { execute } from './engine.mjs';
import { IncError, requireInput as check } from './errors.mjs';
import { parseJson } from './definition.mjs';

export function parseArguments(argv) {
  const options = {}, words = [];
  const flags = { '--repo': 'repository', '--manifest': 'manifestPath', '--service-report': 'serviceReportPath' };
  for (let index = 0; index < argv.length; index++) {
    const token = argv[index];
    if (Object.hasOwn(flags, token)) {
      const key = flags[token];
      check(!Object.hasOwn(options, key), 'duplicate_option', `${token} must be supplied once.`);
      const value = argv[++index];
      check(typeof value === 'string' && value.trim() && !value.startsWith('--'), 'missing_option_value', `${token} requires a value.`);
      options[key] = value;
    } else if (token === '--help' || token === '-h') words.push('help');
    else {
      check(!token.startsWith('-'), 'unknown_option', 'Unknown option. Use --repo, --manifest, or --service-report.');
      words.push(token);
    }
  }
  options.command = words.join(' ') || 'help';
  return options;
}

export async function runCli(argv = process.argv.slice(2), output = process.stdout) {
  try {
    const { serviceReportPath, ...options } = parseArguments(argv);
    if (serviceReportPath) {
      let report;
      let handle;
      try {
        handle = await open(serviceReportPath, 'r');
        check((await handle.stat()).isFile(), 'invalid_service_report', 'Service report must be a regular file.');
        const buffer = Buffer.alloc(65537);
        let length = 0;
        while (length < buffer.length) {
          const chunk = await handle.read(buffer, length, buffer.length - length, length);
          if (!chunk.bytesRead) break;
          length += chunk.bytesRead;
        }
        check(length <= 65536, 'invalid_service_report', 'Service reports must be at most 64 KiB.');
        report = buffer.subarray(0, length);
      } catch (error) {
        if (error instanceof IncError) throw error;
        throw new IncError('missing_service_report', 'The selected service report cannot be read.');
      } finally { await handle?.close(); }
      let text;
      try { text = new TextDecoder('utf-8', { fatal: true }).decode(report); }
      catch { throw new IncError('invalid_service_report', 'Service report must contain UTF-8 JSON.'); }
      options.serviceReport = parseJson(text, 'service report');
    }
    const result = await execute(options);
    output.write(JSON.stringify(result, null, 2) + '\n');
    return result.status === 'unsupported' ? 3 : 0;
  } catch (error) {
    const known = error instanceof IncError;
    output.write(JSON.stringify({ ok: false, read_only: true, applied: false,
      error: { code: known ? error.code : 'inspection_failed', message: known ? error.message : 'Inspection failed; no setup or lifecycle operation was applied.', details: known ? error.details : {} } }, null, 2) + '\n');
    return 2;
  }
}
