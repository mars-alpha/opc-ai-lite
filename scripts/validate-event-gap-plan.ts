import assert from 'node:assert/strict';
import {validateEventGapOutput} from '../lib/server/content/event-gap-policy';
const input={schemaVersion:'event-gap-input-v1' as const,eventId:'e',subject:'MCP Tool v1',gap:'SEARCH_MATERIAL',gapFingerprint:'abc',evidence:[{id:'r',text:'MCP Tool v1'}]};
const output={schemaVersion:'event-gap-output-v1',queries:[{query:'MCP Tool v1 原作者 工作流 附件',language:'ZH',expansionType:'TUTORIAL'},{query:'MCP Tool v1 workflow repository hands-on',language:'EN',expansionType:'EXPERIENCE'}]};
assert.equal(validateEventGapOutput(input,output).queries.length,2);
assert.throws(()=>validateEventGapOutput(input,{...output,queries:output.queries.map(q=>({...q,query:'unrelated v9 download'}))}));
console.log('EVENT_GAP_PLAN=PASS');
