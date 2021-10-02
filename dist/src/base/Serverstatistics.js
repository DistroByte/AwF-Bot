"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerStatistics = void 0;
const tslib_1 = require("tslib");
const typegoose_1 = require("@typegoose/typegoose");
class ServerStatistics {
}
(0, tslib_1.__decorate)([
    (0, typegoose_1.prop)(),
    (0, tslib_1.__metadata)("design:type", String)
], ServerStatistics.prototype, "id", void 0);
(0, tslib_1.__decorate)([
    (0, typegoose_1.prop)(),
    (0, tslib_1.__metadata)("design:type", String)
], ServerStatistics.prototype, "serverName", void 0);
(0, tslib_1.__decorate)([
    (0, typegoose_1.prop)(),
    (0, tslib_1.__metadata)("design:type", String)
], ServerStatistics.prototype, "serverID", void 0);
(0, tslib_1.__decorate)([
    (0, typegoose_1.prop)({ default: 0 }),
    (0, tslib_1.__metadata)("design:type", Number)
], ServerStatistics.prototype, "rocketLaunches", void 0);
(0, tslib_1.__decorate)([
    (0, typegoose_1.prop)({ type: () => new typegoose_1.Passthrough([{
                name: String,
                level: 1
            }]) }),
    (0, tslib_1.__metadata)("design:type", Array)
], ServerStatistics.prototype, "completedResearch", void 0);
(0, tslib_1.__decorate)([
    (0, typegoose_1.prop)({ type: () => new typegoose_1.Passthrough({
            big: false,
            behemoth: false
        }) }),
    (0, tslib_1.__metadata)("design:type", Object)
], ServerStatistics.prototype, "evolution", void 0);
exports.ServerStatistics = ServerStatistics;
const ServerStatisticsModel = (0, typegoose_1.getModelForClass)(ServerStatistics);
exports.default = ServerStatisticsModel;
//# sourceMappingURL=Serverstatistics.js.map