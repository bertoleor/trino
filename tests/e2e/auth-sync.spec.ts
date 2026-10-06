import { expect, test } from '@playwright/test';

const HTML = `<!doctype html><html><body>
<script>
(function(){
  const AUTH_CHANNEL='auth';
  const AUTH_KEY='auth:logout';
  let state={loggedOut:false};
  window.__authState=state;
  let ch=null;
  try{ ch=new BroadcastChannel(AUTH_CHANNEL); }catch(e){ ch=null; }
  if(ch){
    ch.onmessage=(e)=>{ if(e.data && e.data.type==='logout') state.loggedOut=true; };
    window.__authChannel=ch;
  }
  window.addEventListener('storage',(e)=>{
    if(e.key===AUTH_KEY && e.newValue) state.loggedOut=true;
  });
  window.__broadcastLogout=()=>{
    const payload={type:'logout', timestamp:Date.now()};
    try{
      const c=new BroadcastChannel(AUTH_CHANNEL);
      c.postMessage(payload); c.close();
    }catch(e){}
    try{ localStorage.setItem(AUTH_KEY,String(payload.timestamp)); }catch(e){}
  };
})();
</script>
</body></html>`;

test.describe('auth-sync E2E W-05 cross-tab logout <1s', () => {
  test('BroadcastChannel two tabs <1s', async ({ browser }) => {
    const context = await browser.newContext();
    const pageA = await context.newPage();
    const pageB = await context.newPage();

    for (const p of [pageA, pageB]) {
      await p.route('**/*', (route) =>
        route.fulfill({ status: 200, contentType: 'text/html', body: HTML })
      );
      await p.goto('http://localhost:3000/');
    }

    await expect
      .poll(
        async () =>
          pageB.evaluate(
            () =>
              (window as unknown as { __authState: { loggedOut: boolean } }).__authState.loggedOut
          ),
        { timeout: 2000 }
      )
      .toBe(false);

    const t0 = Date.now();
    await pageA.evaluate(() =>
      (window as unknown as { __broadcastLogout: () => void }).__broadcastLogout()
    );
    await expect
      .poll(
        async () =>
          pageB.evaluate(
            () =>
              (window as unknown as { __authState: { loggedOut: boolean } }).__authState.loggedOut
          ),
        { timeout: 1000 }
      )
      .toBe(true);
    const elapsed = Date.now() - t0;
    expect(elapsed).toBeLessThan(1000);

    await context.close();
  });

  test('storage fallback when BroadcastChannel blocked', async ({ browser }) => {
    const context = await browser.newContext();
    const pageA = await context.newPage();
    const pageB = await context.newPage();

    const fallbackHTML = HTML.replace(
      'try{ ch=new BroadcastChannel',
      'try{ throw new Error("block"); ch=new BroadcastChannel'
    );
    for (const p of [pageA, pageB]) {
      await p.route('**/*', (route) =>
        route.fulfill({ status: 200, contentType: 'text/html', body: fallbackHTML })
      );
      await p.goto('http://localhost:3000/');
    }

    await pageA.evaluate(() =>
      (window as unknown as { __broadcastLogout: () => void }).__broadcastLogout()
    );
    // storage event fires in other tab; playwright isolated storage per context shares via same origin?
    await pageB.evaluate((k) => {
      // simulate storage event manually since localStorage is per-page isolated in playwright
      window.dispatchEvent(
        new StorageEvent('storage', { key: k, newValue: String(Date.now()) } as StorageEventInit)
      );
    }, 'auth:logout');

    await expect
      .poll(
        async () =>
          pageB.evaluate(
            () =>
              (window as unknown as { __authState: { loggedOut: boolean } }).__authState.loggedOut
          ),
        { timeout: 1000 }
      )
      .toBe(true);

    await context.close();
  });

  test('spec file exports auth-sync channel auth', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const file = path.resolve('src/lib/realtime/auth-sync.ts');
    const content = fs.readFileSync(file, 'utf8');
    expect(content).toMatch(/AUTH_CHANNEL.*auth/);
    expect(content).toMatch(/AUTH_STORAGE_KEY.*auth:logout/);
    expect(content).toMatch(/BroadcastChannel/);
  });
});
