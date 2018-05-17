"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Node {
    constructor(id, url) {
        this.id = id;
        this.url = url;
        this.accounts = [];
    }
    toString() {
        return `${this.id}:${this.url}`;
    }
}
exports.Node = Node;
//# sourceMappingURL=node.js.map