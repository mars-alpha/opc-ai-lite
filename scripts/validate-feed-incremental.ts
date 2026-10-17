import assert from "node:assert/strict";
import * as runner from "../lib/server/content/collection-runner";

async function main() {
  assert.equal(typeof (runner as Record<string, unknown>).collectRssDocument, "function", "FEED_DOCUMENT_EXPOSES_CONDITIONAL_RECEIPT");
  const { collectRssDocument } = await import("../lib/server/content/collection-runner");
  const empty = await collectRssDocument("https://example.com/feed.xml", { fetchText: async () => ({ status: 200, body: '<rss version="2.0"><channel><title>Empty official feed</title></channel></rss>', contentType: "application/rss+xml", finalUrl: "https://example.com/feed.xml" }) });
  assert.deepEqual(empty.items, [], "VALID_EMPTY_FEED_IS_NO_NEW_ITEMS");
  assert.equal(empty.disposition, "NO_NEW_ITEMS");
  const calls: unknown[] = [];
  const result = await collectRssDocument("https://example.com/feed.xml", {
    validators: { etag: '"v1"', lastModified: "Wed, 14 Oct 2026 00:00:00 GMT" },
    fetchText: async (_url, validators) => { calls.push(validators); return { status: 304, body: "", contentType: "", finalUrl: "https://example.com/feed.xml", etag: '"v1"' }; }
  });
  assert.equal(result.disposition, "NOT_MODIFIED");
  assert.equal(result.items.length, 0);
  assert.equal(result.validators.etag, '"v1"');
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], { etag: '"v1"', lastModified: "Wed, 14 Oct 2026 00:00:00 GMT" });
  const itemFeed = "<rss><channel><item><title>Gemini release</title><link>https://example.com/release</link></item></channel></rss>";
  const updated = await collectRssDocument("https://example.com/feed.xml", { fetchText: async () => ({ status: 200, body: itemFeed, finalUrl: "https://example.com/feed.xml", contentType: "application/rss+xml", etag: '"v2"' }) });
  assert.equal(updated.items.length, 1);
  assert.equal(updated.validators.lastModified, null, "STALE_VALIDATOR_REMOVED_WHEN_200_OMITS_IT");
  const page=async(body:string)=>collectRssDocument("https://example.com/feed.xml",{fetchText:async()=>({status:200,body,finalUrl:"https://example.com/feed.xml",contentType:"application/atom+xml"})});
  assert.equal((await page('<?xml version="1.0"?><?xml-stylesheet type="text/xsl" href="https://example.com/feed.xsl"?>'+itemFeed)).items.length,1,"XML_STYLESHEET_IS_INERT_FEED_METADATA");
  const examples=Array.from({length:100},()=>'<item><title>Example</title><link>https://example.com/example</link></item>').join('');
  const lexical=await page(itemFeed.replace('<channel>','<channel><description><![CDATA['+examples+']]></description><!--'+examples+'-->'));
  assert.equal(lexical.items.length,1,"INERT_EXAMPLES_DO_NOT_CONSUME_ITEM_LIMIT");
  assert.equal(lexical.items[0].title,'Gemini release');
  assert.equal(lexical.truncated,false);
  assert.equal((await page(itemFeed.replace('</item>','<description><![CDATA[<!DOCTYPE html><!ENTITY example><item>example</item>]]></description></item>')+'<!-- publisher cache footer -->')).items.length,1,"CDATA_AND_COMMENTS_ARE_NOT_XML_DECLARATIONS_OR_ITEMS");
  await assert.rejects(page(itemFeed.replace('</item>','<description><![CDATA[unclosed</description></item>')),/RSS_DOCUMENT_INVALID/,"UNCLOSED_CDATA_IS_NOT_COMPLETE");
  assert.equal((await page('<feed xmlns="http://www.w3.org/2005/Atom"/>')).disposition,"NO_NEW_ITEMS","SELF_CLOSING_ATOM_FEED_IS_VALID");
  assert.equal((await page('<rss><channel>'+Array.from({length:101},(_,i)=>`<item><title>Release ${i}</title><link>https://example.com/${i}</link></item>`).join('')+'</channel></rss>')).truncated,true,"PARSER_CAP_PREVENTS_CHECKPOINT_COMMIT");
  await assert.rejects(page(itemFeed.replace('</channel>','<item><title>Broken</title></channel>')),/RSS_DOCUMENT_INVALID/,"PARTIAL_MALFORMED_FEED_IS_NOT_SUCCESS");
  await assert.rejects(collectRssDocument("https://example.com/feed.xml", { fetchText: async () => ({ status: 200, body: "<html>Login</html>", finalUrl: "https://example.com/feed.xml", contentType: "text/html" }) }), /RSS_DOCUMENT_INVALID/);
  await assert.rejects(collectRssDocument("https://example.com/feed.xml", { fetchText: async () => ({ status: 200, body: '<!DOCTYPE rss [<!ENTITY x SYSTEM "file:///private">]><rss><channel/></rss>', finalUrl: "https://example.com/feed.xml", contentType: "application/xml" }) }), /RSS_DOCUMENT_INVALID/);
  console.log("FEED_INCREMENTAL=PASS");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
