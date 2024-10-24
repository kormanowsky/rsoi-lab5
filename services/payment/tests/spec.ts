import { PaymentsLogic } from '../src/logic';
import { mockPayment, MockPaymentsStorage } from './mocks';

describe('PaymentsLogic', () => {
    let logic: PaymentsLogic;

    beforeEach(() => {
        logic = new PaymentsLogic(new MockPaymentsStorage([mockPayment]));
    });

    test('получает один Payment', async () => {
        const Payment = await logic.getOne(mockPayment.paymentUid);

        expect(Payment).toEqual(mockPayment);
    });

    describe('получает несколько Payment', () => {
        beforeEach(async () => {
            for(let i = 0; i < 5; ++i) {
                await logic.create({...mockPayment, price: 1000 * (i + 1)});
            }
        });

        test('без пагинации', async () => {
            const payments = await logic.getMany({});
    
            expect(payments).toHaveLength(6);
            expect(payments[0]).toEqual(mockPayment);
        });
    });

    test('создает Payment', async () => {
        const newPayment = await logic.create(mockPayment);

        expect(newPayment.id).toBeDefined();
        expect(newPayment.id).not.toEqual(mockPayment.id);
        expect(newPayment.paymentUid).not.toEqual(mockPayment.paymentUid);
        expect(newPayment.price).toEqual(mockPayment.price);
    });

    test('обновляет Payment', async () => {
        await logic.update(mockPayment.paymentUid, {price: 20000});

        const updatedPayment = await logic.getOne(mockPayment.paymentUid);

        expect(updatedPayment).toBeDefined();
        expect(updatedPayment!.paymentUid).toEqual(mockPayment.paymentUid);
        expect(updatedPayment!.price).toEqual(20000);
        expect(updatedPayment!.status).toEqual(mockPayment.status);
    });

    test('удаляет Payment', async () => {
        await logic.delete(mockPayment.paymentUid);

        const deletedPayment = await logic.getOne(mockPayment.paymentUid);

        expect(deletedPayment).toBeNull();
    });
});