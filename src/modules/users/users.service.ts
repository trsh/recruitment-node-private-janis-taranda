import * as bcrypt from "bcrypt";
import config from "config/config";
import { UnprocessableEntityError } from "errors/errors";
import { DeepPartial, EntityManager, FindOptionsWhere, Repository } from "typeorm";
import { Point } from "geojson";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./entities/user.entity";
import dataSource from "orm/orm.config";
import { Geocode, GeoCodeData } from "../../helpers/geocode";


export class UsersService {
  private readonly _usersRepository: Repository<User>;

  constructor() {
    this._usersRepository = dataSource.getRepository(User);
  }

  private usersRepository(transactionalEM?: EntityManager) {
    return transactionalEM ? transactionalEM.getRepository(User) : this._usersRepository;
  }

  public async createUser(data: CreateUserDto, transactionalEM: EntityManager): Promise<User> {
    const usersRepository = this.usersRepository(transactionalEM);
    const { email, password, address: providedAddress } = data;

    const existingUser = await this.findOneBy({ email: email });
    if (existingUser) throw new UnprocessableEntityError("A user for the email already exists");

    const hashedPassword = await this.hashPassword(password);

    const geoCodeData: GeoCodeData = await Geocode.getGeocodeDataByAddress(providedAddress, "GOOGLE");

    const coordinates: Point = {
      type: "Point",
      coordinates: [geoCodeData.lng, geoCodeData.lat]
    };

    const address = geoCodeData.fullAddress;
    const userData: DeepPartial<User> = { email, hashedPassword, coordinates, address };

    const newUser = usersRepository.create(userData);
    return usersRepository.save(newUser);
  }

  public async findOneBy(param: FindOptionsWhere<User>, transactionalEM?: EntityManager): Promise<User | null> {
    const usersRepository = this.usersRepository(transactionalEM);
    return usersRepository.findOneBy({ ...param });
  }

  private async hashPassword(password: string, salt_rounds = config.SALT_ROUNDS): Promise<string> {
    const salt = await bcrypt.genSalt(salt_rounds);
    return bcrypt.hash(password, salt);
  }
}
