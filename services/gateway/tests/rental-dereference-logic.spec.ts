import { Rental } from '@rsoi-lab2/library';
import { RentalDereferenceUidsLogic } from '../src/logic';
import { createRentalDereferenceUidsLogic } from './mocks/helpers';
import { mockRental } from './mocks/const';

describe('RentalDereferenceUidsLogic', () => {
    let logic: RentalDereferenceUidsLogic; 
    let rental: Required<Rental>;

    for(const carsOk of [true, false]) {
        for(const paymentsOk of [true, false]) {
            describe(
                `если ` + 
                `PaymentService${paymentsOk ? ' ' : ' не '}работает, ` + 
                `CarsService${carsOk ? ' ' : ' не '}рабоатет`, () => {
                beforeEach(() => {
                    logic = createRentalDereferenceUidsLogic(carsOk, paymentsOk);
                    rental = mockRental;
                });

                if (carsOk) {
                    test('разворачивает carUid', async () => {
                        const result = await logic.tryDereferenceRentalUids(rental);
                
                        expect(result).toHaveProperty('car');
                        expect(result).not.toHaveProperty('carUid');
                    });
                } else {
                    test('не трогает carUid', async () => {
                        const result = await logic.tryDereferenceRentalUids(rental);
                
                        expect(result).not.toHaveProperty('car');
                        expect(result).toHaveProperty('carUid');
                    });
                }
                
                if (paymentsOk) {
                    test('разворачивает paymentUid', async () => {
                        const result = await logic.tryDereferenceRentalUids(rental);
                
                        expect(result).toHaveProperty('payment');
                        expect(result).not.toHaveProperty('paymentUid');
                    });
                } else {
                    test('не трогает paymentUid', async () => {
                        const result = await logic.tryDereferenceRentalUids(rental);
                
                        expect(result).not.toHaveProperty('payment');
                        expect(result).toHaveProperty('paymentUid');
                    });
                }
            });
        }
    }
});