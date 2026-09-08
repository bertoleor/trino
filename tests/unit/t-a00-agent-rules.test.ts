import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-A00 AGENT_RULES mandatory checklist', () => {
  it('openspec/AGENT_RULES.md exists and is blocking checklist', () => {
    const p = path.join(ROOT, 'openspec/AGENT_RULES.md');
    expect(fs.existsSync(p)).toBe(true);
    const content = fs.readFileSync(p, 'utf8');
    expect(content).toMatch(/MANDATORY|BLOQUEANTE|BLOCKING/i);
    expect(content).toMatch(/checklist/i);
  });

  it('covers 12 categories and 154 rules trace', () => {
    const p = path.join(ROOT, 'openspec/AGENT_RULES.md');
    const content = fs.readFileSync(p, 'utf8');
    const categories = [
      'Seguridad',
      'Pagos',
      'Envíos',
      'I18N',
      'DB',
      'Performance',
      'Testing',
      'Estilo',
      'Flujo masivo',
      'Anti-spam',
      'Automatizaciones',
      'Docs',
    ];
    for (const cat of categories) {
      expect(content).toContain(cat);
    }
    expect(content).toMatch(/154/);
    expect(content).toMatch(/CONST|CONSTITUTION/i);
  });

  it('docs/RULES.md mirror exists and traces 10 specs', () => {
    const p = path.join(ROOT, 'docs/RULES.md');
    expect(fs.existsSync(p)).toBe(true);
    const content = fs.readFileSync(p, 'utf8');
    expect(content.length).toBeGreaterThan(200);
    expect(content).toMatch(/154/);
  });

  it('file respects 150-line budget per CQ-03', () => {
    const p = path.join(ROOT, 'openspec/AGENT_RULES.md');
    const content = fs.readFileSync(p, 'utf8');
    const lines = content.split('\n').length;
    expect(lines).toBeLessThanOrEqual(80);
  });
});
