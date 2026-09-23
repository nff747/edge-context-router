export class Node<T> {
  children: Map<string, Node<T>>;
  handler: T | null;
  paramChild: Node<T> | null;
  paramName: string | null;
  wildcardChild: Node<T> | null;

  constructor() {
    this.children = new Map();
    this.handler = null;
    this.paramChild = null;
    this.paramName = null;
    this.wildcardChild = null;
  }
}
