import { describe, it, expect } from 'vitest';
import { hasRole, requireRole, isEditorOrAbove, ROLE_RANK, type Role } from '@/lib/auth/roles';

describe('has-role hierarchy 4-tier — W-02', () => {
  it('exports Role rank super_admin 4 > admin 3 > editor 2 > viewer 1', () => {
    expect(ROLE_RANK.super_admin).toBe(4);
    expect(ROLE_RANK.admin).toBe(3);
    expect(ROLE_RANK.editor).toBe(2);
    expect(ROLE_RANK.viewer).toBe(1);
  });

  it('hasRole 4x4 matrix — super_admin passes all, viewer only self', () => {
    expect(hasRole('super_admin', 'super_admin')).toBe(true);
    expect(hasRole('super_admin', 'admin')).toBe(true);
    expect(hasRole('super_admin', 'editor')).toBe(true);
    expect(hasRole('super_admin', 'viewer')).toBe(true);

    expect(hasRole('admin', 'super_admin')).toBe(false);
    expect(hasRole('admin', 'admin')).toBe(true);
    expect(hasRole('admin', 'editor')).toBe(true);
    expect(hasRole('admin', 'viewer')).toBe(true);

    expect(hasRole('editor', 'admin')).toBe(false);
    expect(hasRole('editor', 'editor')).toBe(true);
    expect(hasRole('editor', 'viewer')).toBe(true);

    expect(hasRole('viewer', 'editor')).toBe(false);
    expect(hasRole('viewer', 'viewer')).toBe(true);
    expect(hasRole('viewer', 'admin')).toBe(false);
  });

  it('editor cannot delete (requires admin) — deny', () => {
    expect(hasRole('editor', 'admin')).toBe(false);
    expect(() => requireRole('editor' as Role, 'admin')).toThrow();
  });

  it('editor edits catalog allowed (requires editor)', () => {
    expect(hasRole('editor', 'editor')).toBe(true);
    expect(() => requireRole('editor' as Role, 'editor')).not.toThrow();
  });

  it('viewer read-only — viewer < editor deny', () => {
    expect(hasRole('viewer', 'editor')).toBe(false);
    expect(isEditorOrAbove('viewer')).toBe(false);
  });

  it('isEditorOrAbove true for editor admin super_admin', () => {
    expect(isEditorOrAbove('editor')).toBe(true);
    expect(isEditorOrAbove('admin')).toBe(true);
    expect(isEditorOrAbove('super_admin')).toBe(true);
  });

  it('super_admin hierarchy — can manage roles, editor cannot', () => {
    expect(hasRole('super_admin', 'super_admin')).toBe(true);
    expect(hasRole('admin', 'super_admin')).toBe(false);
    expect(hasRole('editor', 'super_admin')).toBe(false);
  });

  it('unknown role returns false and rank 0', () => {
    expect(hasRole('unknown' as Role, 'viewer')).toBe(false);
    expect(hasRole('viewer', 'unknown' as Role)).toBe(false);
  });
});
