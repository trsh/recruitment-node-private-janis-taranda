import { HttpError } from "routing-controllers";

export class HttpErrorExt extends HttpError {
  public errors: string[];
}

export class ApiError extends HttpErrorExt {
  constructor(message: string | undefined) {
    super(403, message);
  }
  public get name() { return this.constructor.name }
}
export class UnprocessableEntityError extends ApiError { }
export class GeocodeAddressError extends ApiError { }
export class GeocodeServiceError extends ApiError { }
export class DistanceServiceError extends ApiError { }
export class DistanceImpossibleError extends ApiError { }
