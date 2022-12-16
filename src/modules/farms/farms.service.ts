import { UnprocessableEntityError } from "errors/errors";
import { DeepPartial, EntityManager, FindOptionsOrder, FindOptionsWhere, LessThan, MoreThan, Repository } from "typeorm";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { Farm } from "./entities/farm.entity";
import dataSource from "orm/orm.config";
import { Geocode, GeoCodeData } from "helpers/geocode";
import { Point } from "geojson";
import { UsersService } from "modules/users/users.service";
import { UpdateFarmDto } from "./dto/update-farm.dto";
import { plainToClassFromExist } from "class-transformer-up";
import { FetchListQuery, SortDirection } from "modules/common/dto/fetch-list.dto";
import { User } from "modules/users/entities/user.entity";
import { Coordinates } from "helpers/definitions";
import { Distance } from "helpers/distance";

export class FarmsService {
  private readonly _farmsRepository: Repository<Farm>;
  private readonly usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
    this._farmsRepository = dataSource.getRepository(Farm);
  }

  private farmsRepository(transactionalEM?: EntityManager) {
    return transactionalEM ? transactionalEM.getRepository(Farm) : this._farmsRepository;
  }

  public async createFarm(data: CreateFarmDto, userId: string, transactionalEM: EntityManager): Promise<Farm> {
    const { name, size, theYield, address: providedAddress } = data;

    const existingFarm = await this.findOneBy({ name });
    if (existingFarm) throw new UnprocessableEntityError("A farm with this name already exists");

    const existingUser = await this.usersService.findOneBy({ id: userId }, transactionalEM);

    if (!existingUser) {
      throw new UnprocessableEntityError("There no user with provided id");
    }

    const geoCodeData: GeoCodeData = await Geocode.getGeocodeDataByAddress(providedAddress, "GOOGLE");

    const coordinates: Point = {
      type: "Point",
      coordinates: [geoCodeData.lng, geoCodeData.lat]
    };

    const address = geoCodeData.fullAddress;
    const owner = existingUser;
    const farmData: DeepPartial<Farm> = { name, address, size, theYield, coordinates, owner };

    const farmsRepository = this.farmsRepository(transactionalEM);

    const newFarm = farmsRepository.create(farmData);
    const newFarmRecord = await farmsRepository.save(newFarm);

    return newFarmRecord;
  }

  public async findOneBy(
    param: FindOptionsWhere<Farm>,
    fetchUsers: boolean = false,
    transactionalEM?: EntityManager
  ): Promise<Farm | null> {
    const farmsRepository = this.farmsRepository(transactionalEM);
    const results = await farmsRepository.find({
      where: param,
      relations: fetchUsers ? ["owner"] : []
    });

    if (results?.length === 1) {
      const farm = results[0];

      if (farm.owner) {
        // TODO should probably have method for this boilerplate
        const userPostion: Coordinates = {
          lat: farm.owner.coordinates.coordinates[1],
          lng: farm.owner.coordinates.coordinates[0],
        }

        const farmPostion: Coordinates = {
          lat: farm.coordinates.coordinates[1],
          lng: farm.coordinates.coordinates[0],
        };
        const distances = await Distance.getShortestDistanceBy2Coordinates(userPostion, [farmPostion], "GOOGLE") || [];
        farm.distance = distances[0];
      }
      return results[0];
    }

    return null;
  }

  public async getList(
    fetchListQuery: FetchListQuery<Farm>,
    user: User,
    sortByDistanceDir?: SortDirection,
    filterOutliers: boolean = false,
    transactionalEM?: EntityManager
  ): Promise<Farm[]> {
    const farmsRepository = this.farmsRepository(transactionalEM);

    const sortNames = fetchListQuery.sortByNames || [];
    const sortDirections = fetchListQuery.sortByDirections || [];

    // TODO: move stuff to some common space for all lists type services
    const order: FindOptionsOrder<Farm> = sortNames.reduce((a, v, i) => ({
      ...a, [v]: sortDirections[i] ? sortDirections[i] : "ASC"
    }), {});

    let avgYieldFloor: number = -1;
    let avgYieldCeil: number = -1;

    if (filterOutliers) {
      const { avg } = <{ avg: number }>await farmsRepository
        .createQueryBuilder("farm")
        .select('AVG("theYield")', "avg")
        .getRawOne();

      avgYieldFloor = avg * 0.7;
      avgYieldCeil = avg * 1.3;
    }

    const results = await farmsRepository.find({
      where: avgYieldFloor > -1 ? [
        { theYield: MoreThan(avgYieldCeil) },
        { theYield: LessThan(avgYieldFloor) }
      ] : {},
      take: fetchListQuery.pageSize,
      skip: fetchListQuery.getOffset(),
      relations: ["owner"],
      order
    });

    if (results?.length) {
      const userPostion: Coordinates = {
        lat: user.coordinates.coordinates[1],
        lng: user.coordinates.coordinates[0],
      }

      const farmPositions: Coordinates[] = [];

      for (const farm of results) {
        farmPositions.push({
          lat: farm.coordinates.coordinates[1],
          lng: farm.coordinates.coordinates[0],
        });
      }

      const distances = await Distance.getShortestDistanceBy2Coordinates(userPostion, farmPositions, "GOOGLE");

      for (let i = 0; i < results.length; i++) {
        results[i].distance = distances[i];
      }

      if (sortByDistanceDir) {
        results.sort((a, b) => {
          return sortByDistanceDir === "DESC" ? b.distance - a.distance : a.distance - b.distance;
        });
      }
    }

    return results;
  }

  public async findOneByIdAndUser(id: string, userId: string, transactionalEM?: EntityManager): Promise<Farm | null> {
    const farmsRepository = this.farmsRepository(transactionalEM);
    const results = await farmsRepository.find({
      where: {
        "id": id,
        "owner": {
          id: userId
        }
      }
    });

    if (results?.length) {
      return results[0];
    }

    return null;
  }

  public async deleteById(id: string, transactionalEM?: EntityManager): Promise<number | null | undefined> {
    const farmsRepository = this.farmsRepository(transactionalEM);
    const results = await farmsRepository.delete({ id });
    return results.affected;
  }

  public async update(farm: Farm, params: UpdateFarmDto, transactionalEM: EntityManager): Promise<Farm | null | undefined> {
    const farmsRepository = this.farmsRepository(transactionalEM);
    const { address: providedAddress, userId } = params;

    farm = plainToClassFromExist(farm, params);

    if (providedAddress) {
      const geoCodeData: GeoCodeData = await Geocode.getGeocodeDataByAddress(providedAddress, "GOOGLE");

      const coordinates: Point = {
        type: "Point",
        coordinates: [geoCodeData.lng, geoCodeData.lat]
      };
      const address = geoCodeData.fullAddress;

      farm.address = address;
      farm.coordinates = coordinates;
    }

    if (userId) {
      const existingUser = await this.usersService.findOneBy({ id: userId }, transactionalEM);

      if (!existingUser) {
        throw new UnprocessableEntityError("There no user with provided id");
      }

      farm.owner = existingUser;
    }

    const result = await farmsRepository.save(farm);
    return result;
  }
}
