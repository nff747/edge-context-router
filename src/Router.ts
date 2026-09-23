import { Node } from './Node';

export class Router<T> {
  root: Node<T>;

  constructor() {
    this.root = new Node();
  }

  insert(path: string, handler: T): void {
    const parts = path.split('/').filter(Boolean);
    let currentNode = this.root;

    for (const part of parts) {
      if (part === '*') {
        if (!currentNode.wildcardChild) {
          currentNode.wildcardChild = new Node();
        }
        currentNode = currentNode.wildcardChild;
        break; // wildcard matches rest of the path
      } else if (part.startsWith(':')) {
        if (!currentNode.paramChild) {
          currentNode.paramChild = new Node();
          currentNode.paramName = part.slice(1);
        }
        currentNode = currentNode.paramChild;
      } else {
        if (!currentNode.children.has(part)) {
          currentNode.children.set(part, new Node());
        }
        currentNode = currentNode.children.get(part)!;
      }
    }

    currentNode.handler = handler;
  }

  find(path: string): { handler: T; params: Record<string, string> } | null {
    const parts = path.split('/').filter(Boolean);
    let currentNode = this.root;
    const params: Record<string, string> = {};

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (currentNode.children.has(part)) {
        currentNode = currentNode.children.get(part)!;
      } else if (currentNode.paramChild) {
        currentNode = currentNode.paramChild;
        params[currentNode.paramName!] = part;
      } else if (currentNode.wildcardChild) {
        currentNode = currentNode.wildcardChild;
        params['*'] = parts.slice(i).join('/');
        break;
      } else {
        return null;
      }
    }

    // also check if the path ended but we have a wildcard
    if (!currentNode.handler && currentNode.wildcardChild) {
      currentNode = currentNode.wildcardChild;
      params['*'] = '';
    }

    if (!currentNode.handler) {
      return null;
    }

    return { handler: currentNode.handler, params };
  }
}
