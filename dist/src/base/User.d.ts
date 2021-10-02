export declare class UserClass {
    id: string;
    registeredAt: number;
    factorioName: string;
    factorioRoles: string[];
    factorioStats: {
        deaths: number;
        builtEntities: number;
        timePlayed: number;
        points: number;
    };
}
declare const UserModel: import("@typegoose/typegoose").ReturnModelType<typeof UserClass, import("@typegoose/typegoose/lib/types").BeAnObject>;
export default UserModel;
