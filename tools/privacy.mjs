// The privacy page as served (tools/build.mjs): its counting parts appear only once counting is switched on
// (src/engine/count.js GOATCOUNTER), and then the page must name the counter's host. While counting is off, the
// <!--counts:off--> wording stands instead, and the page may not mention the counter at all.
// tools/count_test.mjs checks both versions.
export function privacyPage(text, code, counterHost) {
  const on = !!code, host = on ? counterHost(code) : '';
  if (on && !/^[a-z0-9-]{2,40}$/.test(code)) throw new Error(`count.js GOATCOUNTER "${code}" is not a GoatCounter code`);
  const page = text
    .replace(on ? /<!--counts:off-->[\s\S]*?<!--\/counts:off-->/g : /<!--counts:on-->[\s\S]*?<!--\/counts:on-->/g, '')
    .replace(/<!--\/?counts:(on|off)-->/g, '').replaceAll('{COUNTER_HOST}', host);
  if (/\{COUNTER_HOST\}|counts:(on|off)/.test(page)) throw new Error('privacy.html: an unmatched counts block');
  if (on && !page.includes(host)) throw new Error(`src/privacy.html does not name ${host}: counting is on, and players must be told`);
  if (!on && /goatcounter/i.test(page)) throw new Error('privacy.html mentions GoatCounter outside a counts:on block, while counting is off');
  return page;
}
