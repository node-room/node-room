import { Application, Request, Response } from "express";
import {
  HttpCacheManager,
  HttpClient,
  HttpNetworkManager,
} from "./network/http-manager";
import { RoomClient, RoomManager } from "./room";

export class BootstrapNode {
  private static _instance: BootstrapNode;
  private app: Application;

  public static init(
    app: Application,
    config: { rooms: any[] }
  ): BootstrapNode {
    if (!BootstrapNode._instance) {
      BootstrapNode._instance = new BootstrapNode(app, config);
    }
    return BootstrapNode._instance;
  }

  public APP() {
    return this.app;
  }

  private constructor(app: Application, config: { rooms: any[] }) {
    this.app = app;
    HttpCacheManager.getInstance();
    RoomManager.getInstance();
    HttpNetworkManager.getInstance();

    for (const room of config.rooms) {
      const roomClient = new RoomClient(new room());
      RoomManager.getInstance().addRoom(roomClient.getRoomName(), roomClient);
    }

    // attach the post request handler
    this.app.post("/node-room", (req: Request, res: Response) => {
      const httpClient = new HttpClient(req, res);
      HttpNetworkManager.getInstance().addHttpClient(httpClient);
    });

    console.info("node-room is ready");
  }
}
