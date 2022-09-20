import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { Router } from 'express';
import { JsonObject, serve, setup } from 'swagger-ui-express';

import { OpenapiController } from './OpenapiController';

export interface OpenapiRouterConfig {
  filePathOrSpec: string | JsonObject;
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

    let openapiSpec: JsonObject;

    if (typeof this.config.filePathOrSpec === 'string') {
      const openapiSpecYml = readFileSync(this.config.filePathOrSpec, 'utf8');
      openapiSpec = load(openapiSpecYml) as JsonObject;
    } else {
      openapiSpec = this.config.filePathOrSpec;
    }

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
