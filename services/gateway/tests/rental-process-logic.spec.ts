import { RentalProcessLogic, RetrievedRentalWithPayment } from '../src/logic';
import { mockCar } from './mocks/const';
import { createRentalProcessLogic } from './mocks/helpers';

describe('RentalProcessLogic', () => {
    let logic: RentalProcessLogic;

    describe('если все сервисы работают', () => {
        beforeEach(() => {
            logic = createRentalProcessLogic(true, true, true);
        });

        test('стартует аренду свободной машины', async () => {
            // @ts-ignore создаем машину
            const newCar = await logic.carsLogic.create({
                ...mockCar,
                available: true
            });

            const response = await logic.startRental({
                carUid: newCar.carUid, 
                dateFrom: new Date(2024, 1, 1), 
                dateTo: new Date(2024, 1, 2)
            });

            expect(response.error).toBeFalsy();
            expect(response).toHaveProperty('rental');
        });

        test('не стартует аренду занятой машины', async () => {
            // @ts-ignore создаем машину
            const notAvailableCar = await logic.carsLogic.create({
                ...mockCar,
                available: false
            });

            const response = await logic.startRental({
                carUid: notAvailableCar.carUid, 
                dateFrom: new Date(2024, 1, 1), 
                dateTo: new Date(2024, 1, 2)
            });

            expect(response.error).toBeTruthy();
            expect(response).not.toHaveProperty('rental');
        });

        describe('выполняет действия с арендой', () => {
            let 
                rental: RetrievedRentalWithPayment;

            beforeEach(async () => {
                // @ts-ignore создаем машину
                const newCar = await logic.carsLogic.create({
                    ...mockCar            
                });

                const response = await logic.startRental({
                    carUid: newCar.carUid, 
                    dateFrom: new Date(2024, 1, 1), 
                    dateTo: new Date(2024, 1, 2)
                });

                if (response.error === false) {
                    rental = response.rental;
                }
            });

            test('отменяет аренду', async () => {
                const response = await logic.cancelRental({rentalUid: rental.rentalUid});
                
                expect(response.error).toBeFalsy();
            });

            test('завершает аренду', async () => {
                const response = await logic.finishRental({rentalUid: rental.rentalUid});
                
                expect(response.error).toBeFalsy();
            });
        });
    });
});