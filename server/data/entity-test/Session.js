"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
var typeorm_1 = require("typeorm");
var Session = /** @class */ (function () {
    function Session() {
    }
    __decorate([
        (0, typeorm_1.ObjectIdColumn)(),
        __metadata("design:type", typeorm_1.ObjectID)
    ], Session.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.Column)(),
        __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
    ], Session.prototype, "expiredAt", void 0);
    __decorate([
        (0, typeorm_1.Column)(),
        __metadata("design:type", String)
    ], Session.prototype, "json", void 0);
    Session = __decorate([
        (0, typeorm_1.Entity)()
    ], Session);
    return Session;
}());
exports.Session = Session;
// module.exports = new EntitySchema({
//     name: "Session",
//     target: Session,
//     columns: {
//         expiredAt: {
//             type: "bigint",
//         },
//         id: {
//             primary: true,
//             type: "varchar"
//         },
//         json: {
//             type: "text"
//         }
//     }
// });
//# sourceMappingURL=Session.js.map