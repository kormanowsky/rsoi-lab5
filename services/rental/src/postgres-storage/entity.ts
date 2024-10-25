import { PostgresEntityStorage } from '@rsoi-lab2/library';
import { Rental, RentalFilter, RentalId } from '../logic';

export class PostgresRentalStorage extends PostgresEntityStorage<Rental, RentalFilter, RentalId>{
    supportsPagination(): boolean {
        return false;
    }
}
