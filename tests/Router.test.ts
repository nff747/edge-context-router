import { describe, it, expect, beforeEach } from 'vitest';
import { Router } from '../src/Router';

describe('Router', () => {
  let router: Router<string>;

  beforeEach(() => {
    router = new Router<string>();
  });

  it('should match exact route', () => {
    router.insert('/api/users', 'users_handler');
    const result = router.find('/api/users');
    expect(result).not.toBeNull();
    expect(result?.handler).toBe('users_handler');
    expect(result?.params).toEqual({});
  });

  it('should not match partial route', () => {
    router.insert('/api/users', 'users_handler');
    const result = router.find('/api');
    expect(result).toBeNull();
  });
});
