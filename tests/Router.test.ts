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

  it('should match dynamic route', () => {
    router.insert('/api/users/:id', 'user_id_handler');
    const result = router.find('/api/users/123');
    expect(result).not.toBeNull();
    expect(result?.handler).toBe('user_id_handler');
    expect(result?.params).toEqual({ id: '123' });
  });

  it('should handle multiple dynamic parameters', () => {
    router.insert('/api/users/:userId/posts/:postId', 'user_post_handler');
    const result = router.find('/api/users/123/posts/456');
    expect(result).not.toBeNull();
    expect(result?.handler).toBe('user_post_handler');
    expect(result?.params).toEqual({ userId: '123', postId: '456' });
  });

  it('should match wildcard route', () => {
    router.insert('/assets/*', 'assets_handler');
    const result = router.find('/assets/css/main.css');
    expect(result).not.toBeNull();
    expect(result?.handler).toBe('assets_handler');
    expect(result?.params).toEqual({ '*': 'css/main.css' });
  });

  it('should match wildcard route with no trailing path', () => {
    router.insert('/assets/*', 'assets_handler');
    const result = router.find('/assets/');
    expect(result).not.toBeNull();
    expect(result?.handler).toBe('assets_handler');
    expect(result?.params).toEqual({ '*': '' });
  });

  it('should route by HTTP method', () => {
    router.get('/api/users', 'get_users');
    router.post('/api/users', 'post_users');

    const getResult = router.findRoute('GET', '/api/users');
    expect(getResult?.handler).toBe('get_users');

    const postResult = router.findRoute('POST', '/api/users');
    expect(postResult?.handler).toBe('post_users');

    const putResult = router.findRoute('PUT', '/api/users');
    expect(putResult).toBeNull();
  });
});
