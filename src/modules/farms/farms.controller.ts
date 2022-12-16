import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, IsUUID, Max, ValidateNested } from "class-validator";
import { Authorized, Body, Delete, Get, JsonController, Param, Post, Put, QueryParams, Req } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { FarmsService } from "./farms.service";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { Farm } from "./entities/farm.entity";
import { UnprocessableEntityError } from "errors/errors";
import { CoordinatesResponse, DeletionResponse } from "modules/common/responses";
import { UserResponse } from "modules/users/users.controller";
import { UpdateFarmDto } from "./dto/update-farm.dto";
import { IncomingMessage } from "http";
import { BaseController } from "modules/common/base.controller";
import { FetchListQuery, SortDirection, SortNameOptions } from "modules/common/dto/fetch-list.dto";
import { JSONSchema } from "class-validator-jsonschema";
import { QueryRunner } from "typeorm";


export class FarmResponseBase {
  @IsUUID()
  public id: string;
  @IsString()
  public name: string;
  @IsNumber()
  public size: number;
  @IsNumber()
  public theYield: number;
  @ValidateNested()
  public coordinates: CoordinatesResponse;
  @IsString()
  public address: string;
  @ValidateNested()
  public owner?: UserResponse;

  constructor(farm: Farm) {
    this.id = farm.id;
    this.size = farm.size;
    this.address = farm.address;
    this.name = farm.name;
    this.theYield = farm.theYield;
    this.owner = farm.owner ? new UserResponse(farm.owner) : undefined;
    this.coordinates = {
      lat: farm.coordinates.coordinates[1],
      lng: farm.coordinates.coordinates[0]
    };
  }
}

export class FarmResponse extends FarmResponseBase {
  @IsNumber()
  @JSONSchema({ description: "-1 means there is no possible route" })
  public drivingDistance: number;

  constructor(farm: Farm){
    super(farm);
    this.drivingDistance = farm.distance;
  }
}

const sortNameOptions: SortNameOptions<Farm> = ["name", "createdAt", "updatedAt"];

class FarmFetchListQuery extends FetchListQuery<Farm> {
  @IsIn(sortNameOptions, { each: true })
  public sortByNames: SortNameOptions<Farm>;

  @Max(20)
  public pageSize: number;

  @IsBoolean()
  @IsOptional()
  public sortByDistance?: boolean;

  @IsBoolean()
  @IsOptional()
  public filterOutliers?: boolean;
}

@Authorized()
@JsonController("/farms")
@OpenAPI({ security: [{ basicAuth: [] }] })
export class FarmsController extends BaseController {
  private readonly farmsService: FarmsService;

  constructor() {
    super();
    this.farmsService = new FarmsService();
  }

  private async checkUserFarm(farmId: string, userId: string, queryRunner?: QueryRunner): Promise<Farm> {
    const userFarm = await this.farmsService.findOneByIdAndUser(farmId, userId, queryRunner);

    if (!userFarm) {
      throw new UnprocessableEntityError("Farm doesn't exist or is not owned");
    }

    return userFarm;
  }

  @Get("/:id")
  @ResponseSchema(FarmResponse)
  public async get(@Param("id") id: string): Promise<FarmResponse | null> {
    const farm = await this.farmsService.findOneBy({ id }, true);

    if (farm) {
      return new FarmResponse(farm);
    }

    return null;
  }

  @Get()
  @ResponseSchema(FarmResponse, { isArray: true })
  public async list(@Req() request: IncomingMessage, @QueryParams() query: FarmFetchListQuery): Promise<FarmResponse[]> {
    const list = await this.farmsService.getList(
      query,
      request.user,
      query.sortByDistance ? SortDirection.ASC : undefined,
      query.filterOutliers
    );
    const responseList: FarmResponse[] = [];

    if (list) {
      for (const farm of list) {
        responseList.push(new FarmResponse(farm));
      }
    }

    return responseList;
  }

  @Delete("/:id")
  @ResponseSchema(FarmResponse)
  public async delete(@Req() request: IncomingMessage, @Param("id") id: string): Promise<DeletionResponse> {
    return this.transactionWrap<DeletionResponse>(async (queryRunner: QueryRunner) => {
      const farm = await this.checkUserFarm(id, request.user.id, queryRunner);
      const deletions = await this.farmsService.deleteById(farm.id);
      return new DeletionResponse(deletions);
    });
  }

  @Put("/:id")
  @ResponseSchema(FarmResponseBase)
  public async update(@Req() request: IncomingMessage, @Param("id") id: string, @Body() body: UpdateFarmDto): Promise<FarmResponseBase> {
    this.throwEmptyBody(body);

    return this.transactionWrap<FarmResponseBase>(async (queryRunner: QueryRunner) => {
      const farm = await this.checkUserFarm(id, request.user.id, queryRunner);
      const updateFarm = await this.farmsService.update(farm, body, queryRunner);

      if (updateFarm) {
        return new FarmResponseBase(updateFarm);
      }

      throw new UnprocessableEntityError("Could not update farm a record")
    });
  }

  @Post()
  @ResponseSchema(FarmResponseBase)
  public async create(@Req() request: IncomingMessage, @Body() body: CreateFarmDto): Promise<FarmResponseBase | null> {
    return this.transactionWrap<FarmResponseBase | null>(async (queryRunner: QueryRunner) => {
      const farm = await this.farmsService.createFarm(body, request.user.id, queryRunner);

      if (farm) {
        return new FarmResponseBase(farm);
      }

      throw new UnprocessableEntityError("Could not create farm a record")
    });
  }
}
