"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashCode = void 0;
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash.toString(16);
}
exports.hashCode = hashCode;
