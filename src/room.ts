export class RoomManager {
    private static _instance: RoomManager;
    private rooms: Map<string, RoomClient> = new Map();

    public static getInstance(): RoomManager {
        if (!RoomManager._instance) {
            RoomManager._instance = new RoomManager();
        }
        return RoomManager._instance;
    }

    private constructor() {}
    /**
     * Add new room to the manager
     * @param roomName : Name of the room
     * @param RoomClient : RoomClient instance
     */
    public addRoom(roomName: string, RoomClient: RoomClient) {
        this.rooms.set(roomName, RoomClient);
    }

    /**
     * Get node room by name from the manager
     * @param roomName : Name of the room
     * @param nodeName : Name of the node
     * @returns
     */
    public getNode(roomName: string, nodeName: string) {
        return this.rooms.get(roomName)?.getNode(nodeName);
    }
}

export class RoomClient {
    constructor(private roomInstance: any) {}

    /**
     * Get the name of the room
     * @returns : Name of the room
     */
    public getRoomName(): string {
        return this.roomInstance.getRoomName();
    }
    /**
     * Get the node from the room
     * @param nodeName : Name of the node
     * @returns
     */
    public getNode(nodeName: string): any {
        return this.roomInstance.getNode(nodeName);
    }
}
