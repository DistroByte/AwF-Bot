export declare class ServerStatistics {
    id: string;
    serverName: string;
    serverID: string;
    rocketLaunches: number;
    completedResearch: {
        name: string;
        level: number;
    }[];
    evolution: {
        big: boolean;
        behemoth: boolean;
    };
}
declare const ServerStatisticsModel: import("@typegoose/typegoose").ReturnModelType<typeof ServerStatistics, import("@typegoose/typegoose/lib/types").BeAnObject>;
export default ServerStatisticsModel;
