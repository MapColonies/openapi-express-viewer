import { readFileSync } from 'fs';
import { JsonObject, serve, setup } from 'swagger-ui-express';
import { RequestHandler, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { dump, load } from 'js-yaml';
import { Router } from 'express';

const JSON_INDENT_LEVEL = 2;

class OpenapiController {
  public uiMiddleware: RequestHandler[];
  public serveUi: RequestHandler;

  private readonly openapiDocString: string;
  private readonly yamlString: string;

  public constructor(openapiDoc: JsonObject) {
    this.openapiDocString = JSON.stringify(openapiDoc, null, JSON_INDENT_LEVEL);
    this.serveUi = setup(openapiDoc);
    this.uiMiddleware = serve;
    this.yamlString = dump(openapiDoc);
  }

  public serveJson(req: Request, res: Response): void {
    res.status(StatusCodes.OK).set('Content-Type', 'application/json').end(this.openapiDocString);
  }
  public serveYaml(req: Request, res: Response): void {
    res.status(StatusCodes.OK).set('Content-Type', 'text/plain').end(this.yamlString);
  }
}

export interface OpenapiRouterConfig {
  filePath: string;
  rawPath?: string;
  uiPath: string;
}

export class OpenapiViewerRouter {
  private readonly config: OpenapiRouterConfig;
  private isAlreadySetup: boolean;
  private router: Router | undefined;
  private openapiController: OpenapiController | undefined;

  public constructor(openapiRouterConfig: OpenapiRouterConfig) {
    this.config = openapiRouterConfig;
    this.isAlreadySetup = false;
  }

  public setup(): void {
    if (this.isAlreadySetup) {
      throw new Error("Can't call setup twice on object.");
    }
    const openapiSpecYml = readFileSync(this.config.filePath, 'utf8');
    const openapiSpec = load(openapiSpecYml) as JsonObject;

    this.openapiController = new OpenapiController(openapiSpec);
    this.router = Router();
    const rawPath = this.config.rawPath;

    if (rawPath !== undefined && rawPath !== '') {
      this.router.get(`${rawPath}.json`, this.openapiController.serveJson.bind(this.openapiController));
      this.router.get(`${rawPath}.yml`, this.openapiController.serveYaml.bind(this.openapiController));
      this.router.get(`${rawPath}.yaml`, this.openapiController.serveYaml.bind(this.openapiController));
    }

    this.router.use(this.config.uiPath, serve);
    this.router.get(this.config.uiPath, setup(openapiSpec));
    this.isAlreadySetup = true;
  }

  public getRouter(): Router {
    if (this.isAlreadySetup && this.router) {
      return this.router;
    }
    throw new Error('you need to run setup before using the router');
  }
}
