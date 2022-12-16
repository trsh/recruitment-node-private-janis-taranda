import { IncomingMessage } from "http";
import { Action } from "routing-controllers";
import { AuthService } from "../auth.service";

export function authorizationChecker(): (action: Action, roles: any[]) => Promise<boolean> | boolean {
  const authService = new AuthService();

  // TODO: throw some user friendlier errors?
  return async function innerAuthorizationChecker(action: Action, _roles: string[]): Promise<boolean> {
    const req: IncomingMessage = <IncomingMessage>action.request;
    const authHeader = String(req.headers["authorization"] || "");

    if (authHeader.startsWith("Bearer ")) {
      const tokenStr = authHeader.substring(7, authHeader.length);
      const token = await authService.checkJwtToken(tokenStr);

      if (!token) {
        return false;
      }else{
        req.user = token.user;
      }

    } else {
      return false;
    }

    return true;
  };
}
