"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserClass = void 0;
const tslib_1 = require("tslib");
const typegoose_1 = require("@typegoose/typegoose");
class UserClass {
}
(0, tslib_1.__decorate)([
    (0, typegoose_1.prop)(),
    (0, tslib_1.__metadata)("design:type", String)
], UserClass.prototype, "id", void 0);
(0, tslib_1.__decorate)([
    (0, typegoose_1.prop)({ default: Date.now() }),
    (0, tslib_1.__metadata)("design:type", Number)
], UserClass.prototype, "registeredAt", void 0);
(0, tslib_1.__decorate)([
    (0, typegoose_1.prop)({ default: "" }),
    (0, tslib_1.__metadata)("design:type", String)
], UserClass.prototype, "factorioName", void 0);
(0, tslib_1.__decorate)([
    (0, typegoose_1.prop)({ default: [] }),
    (0, tslib_1.__metadata)("design:type", Array)
], UserClass.prototype, "factorioRoles", void 0);
(0, tslib_1.__decorate)([
    (0, typegoose_1.prop)({ type: () => new typegoose_1.Passthrough({
            deaths: 0,
            builtEntities: 0,
            timePlayed: 0,
            points: 0
        }) }),
    (0, tslib_1.__metadata)("design:type", Object)
], UserClass.prototype, "factorioStats", void 0);
exports.UserClass = UserClass;
const UserModel = (0, typegoose_1.getModelForClass)(UserClass);
exports.default = UserModel;
//# sourceMappingURL=User.js.map