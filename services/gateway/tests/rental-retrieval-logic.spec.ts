import { RentalRetrievalLogic } from '../src/logic';
import { mockRental } from './mocks/const';
import { createRentalRetrievalLogic } from './mocks/helpers';

describe('RentalRetrievalLogic', () => {
    let logic: RentalRetrievalLogic; 

    for(const carsOk of [true, false]) {
        for(const paymentsOk of [true, false]) {
            describe(
                `если RentalService работает, ` + 
                `PaymentService${paymentsOk ? ' ' : ' не '}работает, ` + 
                `CarsService${paymentsOk ? ' ' : ' не '}рабоатет`, () => {
                beforeEach(() => {
                    logic = createRentalRetrievalLogic(carsOk, paymentsOk, true);
                });

                test('достает одну аренду пользователя', async () => {
                    const response = await logic.retrieveRental({rentalUid: mockRental.rentalUid, username: mockRental.username});
        
                    expect(response.rental).not.toBeNull();
                    expect(response.rental?.rentalUid).toEqual(mockRental.rentalUid);
                });
            
                test('достает все аренды пользователя', async () => {
                    const response = await logic.retrieveRentals({username: mockRental.username});
        
                    expect(response.rentals).toHaveLength(1);
                    expect(response.rentals[0]?.rentalUid).toEqual(mockRental.rentalUid);
                });
            
                test('не достает одну чужую аренду', async () => {
                    const response = await logic.retrieveRental({rentalUid: mockRental.rentalUid, username: 'not-a-' + mockRental.username});
        
                    expect(response.rental).toBeNull();
                });
            
                test('не достает чужие аренды', async () => {
                    const response = await logic.retrieveRentals({username: 'not-a-' + mockRental.username});
        
                    expect(response.rentals).toHaveLength(0);
                });
            });

            describe(
                `если RentalService не работает, ` + 
                `PaymentService${paymentsOk ? ' ' : ' не '}работает, ` + 
                `CarsService${paymentsOk ? ' ' : ' не '}рабоатет`, () => {
                beforeEach(() => {
                    logic = createRentalRetrievalLogic(carsOk, paymentsOk, false);
                });

                test('не достает одну аренду пользователя', async () => {
                    await expect(() => logic.retrieveRental({rentalUid: mockRental.rentalUid, username: mockRental.username})).rejects.toThrow();
                });
            
                test('не достает ни одну аренду пользователя', async () => {
                    await expect(() => logic.retrieveRentals({username: mockRental.username})).rejects.toThrow();
                });
            })
        }
    }
});