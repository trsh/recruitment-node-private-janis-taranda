import * as express from "express";
import { ExpressErrorMiddlewareInterface, Middleware } from "routing-controllers";
import { HttpErrorExt } from "errors/errors";

@Middleware({ type: "after" })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
    public error(error: HttpErrorExt, _req: express.Request, res: express.Response): void {
        // TODO: log 500
        console.error(error.message);
        const httpCode = error.httpCode || 500;
        res.status(httpCode);
        res.json({
            name: httpCode === 500 ? "InternalServerError" : error.name,
            message: httpCode === 500 ? "Internal server error" : error.message,
            errors: error.errors
        });
    }
}
