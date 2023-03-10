import config from "config/config";
import "./config/declarations";
import dataSource from "orm/orm.config";
import { setupServer } from "./server/server";

import "../scripts/scripts";

async function bootstrap() {
  const app = setupServer();

  await dataSource.initialize();
  const port = config.APP_PORT;

  app.listen(port);
  console.log(`Listening on ${config.APP_PROTOCOL}://${config.APP_HOST}:${config.APP_PORT}/api/${config.API_VERSION}`);
}

bootstrap();
