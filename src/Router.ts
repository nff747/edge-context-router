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
      if (part.startsWith(':')) {
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

    for (const part of parts) {
      if (currentNode.children.has(part)) {
        currentNode = currentNode.children.get(part)!;
      } else if (currentNode.paramChild) {
        currentNode = currentNode.paramChild;
        params[currentNode.paramName!] = part;
      } else {
        return null;
      }
    }

    if (!currentNode.handler) {
      return null;
    }

    return { handler: currentNode.handler, params };
  }
}
