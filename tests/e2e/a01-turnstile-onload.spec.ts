import { expect, test } from '@playwright/test';

// A-01 review round 1, F2 (evidence: findings-review-a01-round1.md): the
// widget's loader promise only resolves via the window.onA01TurnstileLoad
// named global, so SCRIPT_SRC MUST declare &onload=onA01TurnstileLoad (the
// official Cloudflare "Using onload callback" mechanism). Without it the
// first mount hangs forever and login/signup are bricked.
//
// This smoke replays the reviewer's browser repro against the REAL api.js:
// it extracts SCRIPT_SRC from the component source, serves a page that
// mounts the widget with the CF testing sitekey, and asserts the full chain
// script onload -> turnstile.render -> token callback -> submit enabled.
const CF_TESTING_SITEKEY = '1x00000000000000000000AA';

test('A-01 /login smoke: turnstile onload contract fires, token arrives, submit enables', async ({
  page,
}) => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const widgetSrc = path.resolve('src/components/auth/turnstile-widget.tsx');
  const source = fs.readFileSync(widgetSrc, 'utf8');
  const scriptSrc = source.match(
    /SCRIPT_SRC\s*=\s*'(https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js[^']*)'/
  )?.[1];
  expect(scriptSrc, 'SCRIPT_SRC literal found in turnstile-widget.tsx').toBeDefined();
  // Same regression guard as the unit test, but proven in a real browser.
  expect(scriptSrc, 'official CF onload callback must be declared in the src').toMatch(
    /[?&]onload=onA01TurnstileLoad/
  );

  const HTML = `<!doctype html><html><body>
<form id="login">
  <div id="a01-turnstile-container"></div>
  <button type="submit" id="submit" disabled>Entrar</button>
</form>
<script>
  window.__fired = { callbackFired: false, token: '', rendered: false };
  window.onA01TurnstileLoad = function () {
    window.__fired.callbackFired = true;
    try {
      var id = window.turnstile.render(document.getElementById('a01-turnstile-container'), {
        sitekey: '${CF_TESTING_SITEKEY}',
        callback: function (token) { window.__fired.token = token; document.getElementById('submit').disabled = false; },
        'error-callback': function () { window.__fired.error = true; }
      });
      window.__fired.rendered = typeof id === 'string';
    } catch (e) { window.__fired.renderError = String(e); }
  };
  (function () {
    var s = document.createElement('script');
    s.src = '${scriptSrc}';
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  })();
</script>
</body></html>`;

  // Only the local page is fulfilled; challenges.cloudflare.com must hit the
  // real network — this is a live contract test against CF infrastructure.
  await page.route('http://localhost:3000/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: HTML })
  );
  await page.goto('http://localhost:3000/login');

  await expect
    .poll(
      () =>
        page.evaluate(
          () => (window as unknown as { __fired: { callbackFired: boolean } }).__fired.callbackFired
        ),
      { timeout: 15000 }
    )
    .toBe(true);

  const state = await page.evaluate(
    () => (window as unknown as { __fired: Record<string, unknown> }).__fired
  );
  expect(state.renderError, 'turnstile.render must not throw').toBeUndefined();
  expect(state.rendered, 'turnstile.render returns a widget id').toBe(true);

  // Testing sitekey auto-passes and delivers a dummy token through the
  // component's callback contract; the submit button unlocks exactly like
  // login-form.tsx does on `disabled={pending || !token}`.
  await expect
    .poll(
      () =>
        page.evaluate(() => (window as unknown as { __fired: { token: string } }).__fired.token),
      { timeout: 15000 }
    )
    .not.toBe('');
  await expect(page.locator('#submit')).toBeEnabled();
});
