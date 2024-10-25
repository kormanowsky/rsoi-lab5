import { CarsLogic } from "../src/logic";
import { MockCarsClient } from "./mocks/client";
import { mockCar } from "./mocks/const";

describe('CarsLogic', () => {
    let logic: CarsLogic; 

    beforeEach(() => {
        logic = new CarsLogic(new MockCarsClient([mockCar]));
    });

    test('получает одну Car', async () => {
        const car = await logic.getOne(mockCar.carUid);

        expect(car).toEqual(mockCar);
    });

    describe('получает несколько Car', () => {
        beforeEach(async () => {
            for(let i = 0; i < 5; ++i) {
                await logic.create({...mockCar, available: i % 2 === 0});
            }
        });

        for(const showAll of [true, false]) {
            describe(`с showAll = ${showAll}`, () => {
                test('с пагинацией, page = 1', async () => {
                    const cars = await logic.getPaginatedMany({showAll, page: 1, size: 2});
            
                    expect(cars.items).toHaveLength(2);
                    expect(cars.page).toEqual(1);
                    expect(cars.pageSize).toEqual(2);
                    expect(cars.totalElements).toEqual(showAll ? 6 : 4);
                    expect(cars.items[0]).toEqual(mockCar);
                });

                test('с пагинацией, page > 1', async () => {
                    const cars = await logic.getPaginatedMany({showAll, page: 2, size: 2});
            
                    expect(cars.items).toHaveLength(2);
                    expect(cars.page).toEqual(2);
                    expect(cars.pageSize).toEqual(2);
                    expect(cars.totalElements).toEqual(showAll ? 6 : 4);
                    expect(cars.items[0]).not.toEqual(mockCar);
                });
            });
        }
    });

    test('создает Car', async () => {
        const newCar = await logic.create(mockCar);

        expect(newCar.id).toBeDefined();
        expect(newCar.id).not.toEqual(mockCar.id);
        expect(newCar.carUid).not.toEqual(mockCar.carUid);
        expect(newCar.registrationNumber).toEqual(mockCar.registrationNumber);
    });

    test('обновляет Car', async () => {
        await logic.update(mockCar.carUid, {price: 20000});

        const updatedCar = await logic.getOne(mockCar.carUid);

        expect(updatedCar).toBeDefined();
        expect(updatedCar!.carUid).toEqual(mockCar.carUid);
        expect(updatedCar!.price).toEqual(20000);
        expect(updatedCar!.registrationNumber).toEqual(mockCar.registrationNumber);
    });

    test('удаляет Car', async () => {
        await logic.delete(mockCar.carUid);

        const deletedCar = await logic.getOne(mockCar.carUid);

        expect(deletedCar).toBeNull();
    });
});