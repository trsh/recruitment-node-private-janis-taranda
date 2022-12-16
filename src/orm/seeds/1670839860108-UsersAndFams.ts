import { MigrationInterface, QueryRunner } from "typeorm"
import { FarmsService } from "modules/farms/farms.service";
import { UsersService } from "modules/users/users.service";

export class UsersAndFams1670839860108 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const usersService = new UsersService();
        const farmsService = new FarmsService();

        const u1 = await usersService.createUser({
            email: "peter@farm.xx",
            password: "1234",
            address: "3448 Ile De France St #242, Fort Wainwright, Alaska 99703, USA"
        }, queryRunner.manager);

        await farmsService.createFarm({
            address: "23475 Glacier View Dr, Eagle River, Alaska 99577, USA",
            name: "Farm1",
            size: 1000,
            theYield: 200
        }, u1.id, queryRunner.manager);

        const u2 = await usersService.createUser({
            email: "lina@farm.yy",
            password: "4321",
            address: "4821 Ridge Top Cir, Anchorage, Alaska 99508, USA"
        }, queryRunner.manager);

        await farmsService.createFarm({
            address: "2268 S Tongass Hwy, Ketchikan, Alaska 99901, USA",
            name: "Farm2",
            size: 2000,
            theYield: 400
        }, u2.id, queryRunner.manager);

        const u3 = await usersService.createUser({
            email: "john@farm.zz",
            password: "3412",
            address: "925 S Chugach St #APT 10, Palmer, Alaska 99645, USA"
        }, queryRunner.manager);

        await farmsService.createFarm({
            address: "925 S Chugach St #APT 10, Palmer, Alaska 99645, USA",
            name: "Farm3",
            size: 3000,
            theYield: 600
        }, u3.id, queryRunner.manager);

        const u4 = await usersService.createUser({
            email: "anna@farm.ww",
            password: "1342",
            address: "900 Lanark Dr, Wasilla, Alaska 99654, USA"
        }, queryRunner.manager);

        await farmsService.createFarm({
            address: "940 Goldendale Dr, Wasilla, Alaska 99654, USA",
            name: "Farm4",
            size: 4000,
            theYield: 800
        }, u4.id, queryRunner.manager);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM "farm" WHERE 
                "name" = 'Farm1' OR 
                "name" = 'Farm2' OR 
                "name" = 'Farm3' OR
                "name" = 'Farm4'`
        );

        await queryRunner.query(
            `DELETE FROM "user" WHERE 
                "email" = 'peter@farm.xx' OR 
                "email" = 'lina@farm.yy' OR 
                "email" = 'john@farm.zz' OR
                "email" = 'anna@farm.ww'`
        );

    }

}
