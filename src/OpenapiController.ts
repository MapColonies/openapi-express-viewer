import { JsonObject } from 'swagger-ui-express';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { dump } from 'js-yaml';

const JSON_INDENT_LEVEL = 2;

export class OpenapiController {
  private readonly openapiDocString: string;
  private readonly yamlString: string;

  public constructor(openapiDoc: JsonObject) {
    this.openapiDocString = JSON.stringify(openapiDoc, null, JSON_INDENT_LEVEL);
    this.yamlString = dump(openapiDoc);
  }

  public serveJson(req: Request, res: Response): void {
    res.status(StatusCodes.OK).set('Content-Type', 'application/json').end(this.openapiDocString);
  }
  public serveYaml(req: Request, res: Response): void {
    res.status(StatusCodes.OK).set('Content-Type', 'text/plain').end(this.yamlString);
  }
}
