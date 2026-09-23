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
      if (!currentNode.children.has(part)) {
        currentNode.children.set(part, new Node());
      }
      currentNode = currentNode.children.get(part)!;
    }

    currentNode.handler = handler;
  }

  find(path: string): T | null {
    const parts = path.split('/').filter(Boolean);
    let currentNode = this.root;

    for (const part of parts) {
      if (currentNode.children.has(part)) {
        currentNode = currentNode.children.get(part)!;
      } else {
        return null;
      }
    }

    return currentNode.handler;
  }
}
