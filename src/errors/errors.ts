import { HttpError } from "routing-controllers";

export class HttpErrorExt extends HttpError {
  public errors: string[];
}

export class ApiError extends HttpErrorExt {
  constructor(message: string | undefined, code?: number) {
    super(code || 403, message);
  }
  public get name() { return this.constructor.name }
}
export class UnprocessableEntityError extends ApiError { }
export class NotFoundEntityError extends ApiError { 
  public httpCode: number = 404;
}
export class GeocodeAddressError extends ApiError { }
export class GeocodeServiceError extends ApiError { }
export class DistanceServiceError extends ApiError { }
export class DistanceImpossibleError extends ApiError { }
