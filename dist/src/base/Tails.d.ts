declare const EventEmitter: any;
declare const Tail: any;
declare const servers: any;
declare const config: any;
declare class tailListener extends EventEmitter {
    constructor(tailLocations: any);
    init(): void;
}
declare let tailLocations: any[];
declare const listen: tailListener;
