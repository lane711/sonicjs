System.register([], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var _a, Entity, ObjectIdColumn, ObjectID, Column, User;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            _a = require("typeorm"), Entity = _a.Entity, ObjectIdColumn = _a.ObjectIdColumn, ObjectID = _a.ObjectID, Column = _a.Column;
            User = (function () {
                function User() {
                }
                __decorate([
                    ObjectIdColumn()
                ], User.prototype, "id");
                __decorate([
                    Column()
                ], User.prototype, "firstName");
                __decorate([
                    Column()
                ], User.prototype, "lastName");
                __decorate([
                    Column()
                ], User.prototype, "age");
                User = __decorate([
                    Entity()
                ], User);
                return User;
            }());
            exports_1("User", User);
        }
    };
});
//# sourceMappingURL=UserSchema.js.map