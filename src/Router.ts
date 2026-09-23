import { Node } from './Node';

export class Router<T> {
  root: Node<T>;

  constructor() {
    this.root = new Node();
  }
}
