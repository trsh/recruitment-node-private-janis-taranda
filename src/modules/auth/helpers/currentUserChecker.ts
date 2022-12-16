import { IncomingMessage } from "http";
import { Action } from "routing-controllers";
import { User } from "../../users/entities/user.entity";

export function currentUserChecker(): (action: Action) => User | undefined {
    return function innerCurrentUserChecker(action: Action): User | undefined {
        return (<IncomingMessage>action.request).user;
    };
}
