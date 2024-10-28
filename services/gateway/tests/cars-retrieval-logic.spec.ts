import { CarsLogic, CarsRetrievalLogic } from "../src/logic";
import { MockCarsClient, MockCarsWithErrorsClient } from "./mocks/client";
import { mockCar } from "./mocks/const";

describe('CarsRetrievalLogic', () => {
    let logic: CarsRetrievalLogic;

    describe('если CarsService работает', () => {
        beforeEach(() => {
            logic = new CarsRetrievalLogic(
                new CarsLogic(
                    new MockCarsClient([mockCar, {...mockCar, carUid: 'other' + mockCar.carUid, available: false}])
                )
            );
        });

        for(const showAll of [true, false]) {
            test(`достает ${showAll ? 'все' : 'доступные'} машины`, async () => {
                const response = await logic.retrieveCars({filter: {showAll, page: 1, size: 10}});

                expect(response.cars.items).not.toBeNull();
                expect(response.cars.items).toHaveLength(showAll ? 2 : 1);
            });
        }
    });

    describe('если CarsService не работает', () => {
        beforeEach(() => {
            logic = new CarsRetrievalLogic(
                new CarsLogic(
                    new MockCarsWithErrorsClient()
                )
            );
        });

        for(const showAll of [true, false]) {
            test(`не достает ${showAll ? 'все' : 'доступные'} машины`, async () => {
                expect(() => logic.retrieveCars({filter: {showAll, page: 1, size: 10}})).rejects.toThrow();
            });
        }
    });
});