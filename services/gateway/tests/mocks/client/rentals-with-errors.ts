import { Rental, RentalFilter, RentalId } from '@rsoi-lab2/library';
import { MockRentalsClient } from './rentals';

export class MockRentalsWithErrorsClient extends MockRentalsClient {
    getOne(_: RentalId): Promise<Required<Rental> | null> {
        throw new Error('errored');
    }

    getMany(_: RentalFilter): Promise<Array<Required<Rental>>> {
        throw new Error('errored');
    }

    create(_: Rental): Promise<Required<Rental>> {
        throw new Error('errored');
    }

    update(_: RentalId, __: Partial<Rental>): Promise<Required<Rental>> {
        throw new Error('errored');
    }

    delete(_: RentalId): Promise<boolean> {
        throw new Error('errored');
    }

    getIdType(): 'string' | 'number' {
        return 'string';
    }
}
