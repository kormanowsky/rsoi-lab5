import { RentalLogic } from '../src/logic';
import { mockRental, MockRentalsStorage } from './mocks';

describe('RentalLogic', () => {
    let logic: RentalLogic;

    beforeEach(() => {
        logic = new RentalLogic(new MockRentalsStorage([mockRental]))
            .withOptions({username: mockRental.username});
    });

    test('получает один Rental', async () => {
        const rental = await logic.getOne(mockRental.rentalUid);

        expect(rental).toEqual(mockRental);
    });

    describe('получает несколько Rental', () => {
        beforeEach(async () => {
            for(let i = 0; i < 5; ++i) {
                const newMockRental = {...mockRental};

                delete newMockRental.username;

                await logic.create(newMockRental);
            }
        });

        test('без пагинации', async () => {
            const rentals = await logic.getMany({});
    
            expect(rentals).toHaveLength(6);
            expect(rentals[0]).toEqual(mockRental);
        });
    });

    test('создает Rental', async () => {
        const newMockRental = {...mockRental};

        delete newMockRental.username;

        const newRental = await logic.create(newMockRental);

        expect(newRental.id).toBeDefined();
        expect(newRental.id).not.toEqual(mockRental.id);
        expect(newRental.rentalUid).not.toEqual(mockRental.rentalUid);
        expect(newRental.username).toEqual(mockRental.username);
    });

    test('обновляет Rental', async () => {
        await logic.update(mockRental.rentalUid, {status: 'FINISHED'});

        const updatedRental = await logic.getOne(mockRental.rentalUid);

        expect(updatedRental).toBeDefined();
        expect(updatedRental!.carUid).toEqual(mockRental.carUid);
        expect(updatedRental!.status).toEqual('FINISHED');
        expect(updatedRental!.status).toEqual(mockRental.status);
    });

    test('удаляет Rental', async () => {
        await logic.delete(mockRental.rentalUid);

        const deletedRental = await logic.getOne(mockRental.rentalUid);

        expect(deletedRental).toBeNull();
    });
});