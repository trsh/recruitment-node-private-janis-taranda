// Lib
import basicAuth from "express-basic-auth";
import * as swaggerUi from "swagger-ui-express";
import { Application } from "express";
import { defaultMetadataStorage as classTransformerMetadataStorage } from "class-transformer/storage";
import { getMetadataStorage } from "class-validator";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { createExpressServer } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import { getMetadataArgsStorage } from "routing-controllers";

// Local
import { ErrorHandlerMiddleware } from "middlewares/error-handler.middleware";
import { UsersController } from "../../src/modules/users/users.controller";
import { AuthController } from "../../src/modules/auth/auth.controller";
import { FarmsController } from "../../src/modules/farms/farms.controller";
import { authorizationChecker } from "../modules/auth/helpers/authorizationChecker";
import { currentUserChecker } from "../modules/auth/helpers/currentUserChecker";
import config from "config/config";

export function setupServer(): Application {
  // App api
  const app: Application = <Application>createExpressServer({
    //cors: true,
    classTransformer: true,
    routePrefix: `/api/${config.API_VERSION}`,
    defaultErrorHandler: false,
    controllers: [UsersController, AuthController, FarmsController],
    middlewares: [ErrorHandlerMiddleware],
    authorizationChecker: authorizationChecker(),
    currentUserChecker: currentUserChecker(),
  });

  // Swagger
  const schemas = validationMetadatasToSchemas({
    classTransformerMetadataStorage,
    refPointerPrefix: "#/components/schemas/",
    classValidatorMetadataStorage: getMetadataStorage()
  });

  const swaggerFile = routingControllersToSpec(
    getMetadataArgsStorage(),
    {},
    {
      components: {
        schemas,
        securitySchemes: {
          basicAuth: {
            type: "http",
            scheme: "basic",
          },
        },
      },
    }
  );

  swaggerFile.info = {
    title: "Farm REST API",
    description: "REST API",
    version: config.API_VERSION,
  };

  swaggerFile.servers = [
    {
      url: `${config.APP_PROTOCOL}://${config.APP_HOST}:${config.APP_PORT}/api/${config.API_VERSION}`,
    },
  ];

  app.use(
    "/swagger",
    basicAuth({
      users: {
        [config.SWAGGER_SUPER_USER_NAME]: config.SWAGGER_SUPER_USER_PASS, // TODO: Should move to safer place, but will do for now
      },
      challenge: true,
    }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerFile)
  );

  return app;
}
