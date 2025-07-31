import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { Router } from 'express';
import { JsonObject, serve, setup } from 'swagger-ui-express';

import { OpenapiController } from './OpenapiController';

export interface OpenapiRouterConfig {
  filePathOrSpec: string | JsonObject;
  rawPath?: string;
  uiPath: string;
  customUiCss?: string;
}

/**
 * A router class for serving OpenAPI documentation via Express.
 * Handles both UI presentation and raw spec file serving in JSON/YAML formats.
 *
 * @example
 * ```typescript
 * const config = {
 *   filePathOrSpec: './openapi.yml',
 *   uiPath: '/api-docs',
 *   rawPath: '/spec'
 * };
 * const router = new OpenapiViewerRouter(config);
 * router.setup();
 * app.use('/', router.getRouter());
 * ```
 *
 * @remarks
 * The router must be setup using the {@link setup} method before it can be used.
 * The setup method can only be called once per instance.
 */
export class OpenapiViewerRouter {
  private readonly config: OpenapiRouterConfig;
  private isAlreadySetup: boolean;
  private router: Router | undefined;
  private openapiController: OpenapiController | undefined;

  public constructor(openapiRouterConfig: OpenapiRouterConfig) {
    this.config = openapiRouterConfig;
    this.isAlreadySetup = false;
  }

  /**
   * Initializes the OpenAPI router with the specified configuration.
   * Sets up routes for serving the OpenAPI specification in JSON and YAML formats,
   * as well as configuring the Swagger UI endpoint.
   *
   * @throws {Error} If setup is called more than once on the same instance
   *
   * The method performs the following:
   * 1. Loads the OpenAPI specification from file if path is provided, or uses the provided spec object
   * 2. Creates routes for serving the raw specification in different formats (.json, .yml, .yaml)
   * 3. Sets up the Swagger UI endpoint
   */
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
    this.router.get(this.config.uiPath, setup(openapiSpec, undefined, undefined, this.config.customUiCss));
    this.isAlreadySetup = true;
  }

  /**
   * Retrieves the configured Express router instance.
   * @returns {Router} The configured Express router
   * @throws {Error} When called before running setup
   */
  public getRouter(): Router {
    if (this.isAlreadySetup && this.router) {
      return this.router;
    }
    throw new Error('you need to run setup before using the router');
  }
}
