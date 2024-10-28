import { Rental } from '@rsoi-lab2/library';
import { RentalDereferenceUidsLogic, RetrievedRentalWithCar } from '../src/logic';
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
                    test('разворачивает carUid в непустой объект', async () => {
                        const result = await logic.tryDereferenceRentalUids(rental);
                
                        expect(result).toHaveProperty('car');
                        expect(result).not.toHaveProperty('carUid');
                        expect(result).toHaveProperty('car.carUid');
                    });
                } else {
                    test('разворачивает carUid в пустой объект', async () => {
                        const result = await logic.tryDereferenceRentalUids(rental);
                
                        expect(result).toHaveProperty('car');
                        expect(result).not.toHaveProperty('carUid');
                        expect(result).not.toHaveProperty('car.carUid');
                    });
                }
                
                if (paymentsOk) {
                    test('разворачивает paymentUid в непустой объект', async () => {
                        const result = await logic.tryDereferenceRentalUids(rental);
                
                        expect(result).toHaveProperty('payment');
                        expect(result).not.toHaveProperty('paymentUid');
                        expect(result).toHaveProperty('payment.paymentUid');
                    });

                } else {
                    test('не трогает paymentUid в пустой объект', async () => {
                        const result = await logic.tryDereferenceRentalUids(rental);
                
                        expect(result).toHaveProperty('payment');
                        expect(result).not.toHaveProperty('paymentUid');
                        expect(result).not.toHaveProperty('payment.paymentUid');
                    });
                }
            });
        }
    }
});