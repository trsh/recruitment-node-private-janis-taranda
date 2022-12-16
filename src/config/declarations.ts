
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-ignore
import { IncomingMessage } from "http";
import { User } from "modules/users/entities/user.entity";

declare module "http" {
  interface IncomingMessage {
    user: User
  }
}
