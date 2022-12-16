import { IsNumber } from "class-validator";


export class CoordinatesResponse {
  @IsNumber()
  public lat: number;
  @IsNumber()
  public lng: number;
}

export class DeletionResponse {
  @IsNumber()
  public deletions: number | null | undefined;

  constructor(deletions: number | null | undefined){
    this.deletions = deletions;
  }
}

export class UpdatesResponse {
  @IsNumber()
  public updates: number | null | undefined;

  constructor(updates: number | null | undefined){
    this.updates = updates;
  }
}
