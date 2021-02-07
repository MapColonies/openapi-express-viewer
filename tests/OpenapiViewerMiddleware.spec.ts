import * as fs from 'fs';
import * as express from 'express';
import { load } from 'js-yaml';
import { Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as supertest from 'supertest';

import { OpenapiRouterConfig, OpenapiViewerRouter } from '../src/index';

const openapiSpec = `openapi: 3.0.1
info:
  title: service-name
  description: yolo
  version: 1.0.0
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT
servers:
- url: http://localhost:8080
paths:
  "/resourceName":
    get:
      operationId: getResourceName
      tags:
      - resourceName
      summary: gets the resource
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                "$ref": "#/components/schemas/resource"
    post:
      operationId: createResource
      tags:
      - resourceName
      summary: creates a new record of type resource
      responses:
        '201':
          description: created
          content:
            application/json:
              schema:
                "$ref": "#/components/schemas/resource"
        '400':
          description: Bad Request
          content:
            application/json:
              schema:
                "$ref": "#/components/schemas/error"
components:
  schemas:
    error:
      type: object
      required:
      - message
      properties:
        message:
          type: string
    resource:
      type: object
      required:
      - id
      - name
      - description
      properties:
        id:
          type: number
          format: int64
        name:
          type: string
        description:
          type: string
`;
const expectedOpenapiYamlSpec = `openapi: 3.0.1
info:
  title: service-name
  description: yolo
  version: 1.0.0
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT
servers:
  - url: http://localhost:8080
paths:
  /resourceName:
    get:
      operationId: getResourceName
      tags:
        - resourceName
      summary: gets the resource
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/resource'
    post:
      operationId: createResource
      tags:
        - resourceName
      summary: creates a new record of type resource
      responses:
        '201':
          description: created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/resource'
        '400':
          description: Bad Request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/error'
components:
  schemas:
    error:
      type: object
      required:
        - message
      properties:
        message:
          type: string
    resource:
      type: object
      required:
        - id
        - name
        - description
      properties:
        id:
          type: number
          format: int64
        name:
          type: string
        description:
          type: string
`;

describe('openapiViewerRouter', function () {
  let expressApp: Application;
  let openapiViewerRouter: OpenapiViewerRouter;

  beforeAll(function () {
    const config: OpenapiRouterConfig = {
      filePath: './openapi.yml',
      rawPath: '/api',
      uiPath: '/api/ui',
    };
    jest.spyOn(fs, 'readFileSync').mockReturnValue(openapiSpec);
    openapiViewerRouter = new OpenapiViewerRouter(config);
    openapiViewerRouter.setup();
    expressApp = express();
    expressApp.use('/docs', openapiViewerRouter.getRouter());
  });
  describe('Serve UI', function () {
    describe('Happy Path 😀', function () {
      it('should return 301 status code when requesting the /docs/api/ui', async function () {
        const response = await supertest.agent(expressApp).get('/docs/api/ui');
        expect(response).toHaveProperty('statusCode', StatusCodes.MOVED_PERMANENTLY);
        expect(response).toHaveProperty('headers.location', '/docs/api/ui/');
      });
      it('should return 200 status code when requesting the /docs/api.json an the spec should be equal', async function () {
        const response = await supertest.agent(expressApp).get('/docs/api.json');
        expect(response).toHaveProperty('statusCode', StatusCodes.OK);
        expect(response).toHaveProperty('body', load(openapiSpec));
      });
      it('should return 200 status code when requesting the /docs/api.yml an the spec should be equal', async function () {
        const response = await supertest.agent(expressApp).get('/docs/api.yml');
        expect(response).toHaveProperty('statusCode', StatusCodes.OK);
        expect(response).toHaveProperty('text', expectedOpenapiYamlSpec);
      });
      it('should return 200 status code when requesting the /docs/api.yaml an the spec should be equal', async function () {
        const response = await supertest.agent(expressApp).get('/docs/api.yaml');
        expect(response).toHaveProperty('statusCode', StatusCodes.OK);
        expect(response).toHaveProperty('text', expectedOpenapiYamlSpec);
      });
    });
    describe('Sad Path 😔', function () {
      it('should return 404 status code when requesting the /docs/api/', async function () {
        const response = await supertest.agent(expressApp).get('/docs/api/');
        expect(response).toHaveProperty('statusCode', StatusCodes.NOT_FOUND);
      });
    });
  });
});
