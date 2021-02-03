import { JsonObject, serve, setup } from 'swagger-ui-express';
import { RequestHandler, Request, Response } from 'express';
import { getStatusCode, ReasonPhrases } from 'http-status-codes';

export class OpenapiViewerMiddleware {
  private readonly uiMiddlewares: RequestHandler[];
  private readonly openapiSpec: JsonObject;

  public constructor(openapiSpec: JsonObject) {
    this.openapiSpec = openapiSpec;
    setup(this.openapiSpec);
    this.uiMiddlewares = serve;
  }

  public getOpenapiUiMiddlewares(): RequestHandler[] {
    return this.uiMiddlewares;
  }

  public getOpenapiJsonSpecMiddleware(): RequestHandler {
    return (req: Request, res: Response): void => {
      res.status(getStatusCode(ReasonPhrases.OK)).json(this.openapiSpec);
    };
  }
}
