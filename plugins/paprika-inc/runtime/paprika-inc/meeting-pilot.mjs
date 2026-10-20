import {mkdir, lstat, realpath, readFile, writeFile, readdir} from 'node:fs/promises';
import {resolve, join} from 'node:path';
import {createHash} from 'node:crypto';
import {git} from './checkout.mjs';
import {requireInput as check} from './errors.mjs';
import {startOutbound, outboundStatus} from './outbound.mjs';

const meetingHash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const meetingId = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,95}$/.test(value);
function meetingResult(report) {
  check(report && typeof report === 'object' && !report.isError, 'meeting_report_required', 'Supply the actual meeting tool result saved as private JSON.');
  if (report.structuredContent) return report.structuredContent;
  if (Array.isArray(report.content)) for (const item of report.content) if (item.type === 'text') {
    try { return JSON.parse(item.text); } catch { /* Other blocks may contain metadata. */ }
  }
  return report;
}
export async function prepareMeetingMessage({repository, meetingReport, notificationId}, env = process.env) {
  const meeting = meetingResult(meetingReport).meeting;
  check(meeting && meetingId(meeting.id) && meetingId(meeting.board) && meeting.board.length <= 64 && Array.isArray(meeting.notifications),
    'meeting_report_required', 'Read get_meeting on the selected private board first.');
  const notice = meeting.notifications.find(n => n.id === notificationId);
  check(notice && meetingId(notice.id) && meetingId(notice.sender_id) && meetingId(notice.recipient_id)
    && typeof notice.body === 'string' && typeof notice.topic === 'string', 'meeting_notification_required', 'Select one stored notification ID.');
  check(notice.actionable !== false || notice.delivery, 'meeting_notification_obsolete', 'Reload the meeting and select an actionable notice; old round signals must not wake participants.');
  const metadata = {board:meeting.board, meeting_id:meeting.id, notification_id:notice.id, sender_id:notice.sender_id, recipient_id:notice.recipient_id};
  if (notice.delivery) return {ok:true, command:'meeting message', status:'already_recorded', operation_id:notice.delivery.operation_id,
    meeting_notification:metadata, next_step:'The board already has a delivery receipt. Do not create a second delivery journal.'};
  const deliveryInput = {request_id:'meeting-' + meetingHash(metadata).slice(0, 40), body:notice.body, topic:notice.topic, meeting_notification:metadata};
  const result = await startOutbound({repository, deliveryInput}, env);
  return {...result, command:'meeting message', next_step:'Use message next/record with this operation_id, the existing service binding, exact recipient route and current sender observations. Then use meeting receipt. Preparation sent nothing.'};
}
export async function meetingReceipt({repository, operationId}) {
  const result = await outboundStatus({repository, operationId});
  check(result.meeting_notification && ['submitted', 'stored_events_only'].includes(result.status), 'meeting_delivery_unconfirmed',
    'Finish or reconcile the existing meeting outbound operation before recording its delivery.');
  return {ok:true, command:'meeting receipt', read_only:true, service_operation:'record_meeting_notification',
    arguments:{...result.meeting_notification, operation_id:result.operation_id, delivery_state:result.status}, recipient_read:'unverified'};
}
async function realDirectory(path) {
  const info = await lstat(path);
  check(info.isDirectory() && !info.isSymbolicLink() && await realpath(path) === path, 'unsafe_meeting_export', 'Use an ordinary directory inside the selected repository; linked export directories are not supported.');
}
export async function exportMeetingNotes({repository, meetingReport, exportName}) {
  const bundle = meetingResult(meetingReport);
  check(bundle.format === 'paprika-meeting-export/v1' && meetingId(bundle.board) && meetingId(bundle.meeting_id)
    && Number.isSafeInteger(bundle.source_revision) && bundle.source_revision >= 1,
  'invalid_meeting_export', 'Use the export_meeting_notes result for the closed meeting.');
  const documents = bundle.documents;
  check(documents && typeof documents === 'object' && !Array.isArray(documents)
    && Object.keys(documents).sort().join(',') === 'notes.md,summary.md'
    && Object.values(documents).every(value => typeof value === 'string' && !value.includes('\0') && Buffer.byteLength(value) <= 128000),
  'invalid_meeting_export', 'The export must contain only notes.md and summary.md, as bounded UTF-8 text.');
  const name = exportName ?? bundle.suggested_directory;
  check(typeof name === 'string' && /^\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]{0,99}$/.test(name), 'invalid_meeting_export_path', 'Use a directory name such as 2026-10-20-design-review.');
  const root = await realpath(resolve(repository));
  const common = await realpath(resolve(root, await git(['rev-parse', '--git-common-dir'], root)));
  const directory = join(root, 'meetings');
  await mkdir(directory, {recursive:true}); await realDirectory(directory);
  const target = join(directory, name);
  let duplicate = false;
  try { await mkdir(target, {mode:0o700}); }
  catch (e) {
    if (e.code !== 'EEXIST') throw e;
    await realDirectory(target);
    check((await readdir(target)).sort().join(',') === 'notes.md,summary.md', 'meeting_export_conflict', 'The destination contains other or incomplete files. Choose another export name.');
    for (const [file, body] of Object.entries(documents)) {
      const path = join(target, file), info = await lstat(path);
      check(info.isFile() && !info.isSymbolicLink() && await readFile(path, 'utf8') === body,
        'meeting_export_conflict', 'Existing meeting notes differ. They were preserved; choose another export name.');
    }
    duplicate = true;
  }
  if (!duplicate) for (const [file, body] of Object.entries(documents)) await writeFile(join(target, file), body, {flag:'wx', mode:0o600});
  const provenance = {board:bundle.board, meeting_id:bundle.meeting_id, source_revision:bundle.source_revision,
    directory:target, documents:Object.fromEntries(Object.entries(documents).map(([file, body]) => [file, meetingHash(body)]))};
  const privateRoot = join(common, 'paprika-inc');
  await mkdir(privateRoot, {recursive:true, mode:0o700}); await realDirectory(privateRoot);
  const privateDirectory = join(privateRoot, 'meeting-exports');
  await mkdir(privateDirectory, {recursive:true, mode:0o700}); await realDirectory(privateDirectory);
  const record = join(privateDirectory, meetingHash(provenance) + '.json');
  try { await writeFile(record, JSON.stringify(provenance) + '\n', {flag:'wx', mode:0o600}); }
  catch (e) { if (e.code !== 'EEXIST') throw e; }
  return {ok:true, command:'meeting export', read_only:false, applied:!duplicate, duplicate, directory:target,
    files:Object.keys(documents).map(file => join(target, file)), private_provenance:record, git_commit_created:false,
    next_step:'Review the curated notes before committing or publishing. The full private transcript was not exported.'};
}
export async function meetingCommand(options) {
  if (options.command === 'meeting message') return prepareMeetingMessage(options);
  if (options.command === 'meeting receipt') return meetingReceipt(options);
  if (options.command === 'meeting export') return exportMeetingNotes(options);
}
