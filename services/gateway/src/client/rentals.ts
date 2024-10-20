import { EntityClient } from "@rsoi-lab2/library";
import { Rental, RentalFilter, RentalId } from "../../../rental/src/logic";

export class RentalsClient extends EntityClient<Rental, RentalFilter, RentalId>{
    getOne(id: string, opts?: RequestInit): Promise<Required<Rental> | null> {
        return super.getOne(id, opts).then(this.patchRental.bind(this));
    }

    update(id: string, update: Partial<Rental>, opts?: RequestInit): Promise<Required<Rental>> {
        return super.update(id, update, opts).then(this.patchRental.bind(this));
    }

    create(entity: Rental, opts?: RequestInit): Promise<Required<Rental>> {
        return super.create(entity, opts).then(this.patchRental.bind(this));
    }

    protected patchRental(rental: Required<Rental> | null): Required<Rental> | null {
        if (rental == null) {
            return null;
        }

        return {
            ...rental,
            dateFrom: new Date(rental.dateFrom),
            dateTo: new Date(rental.dateTo)
        }
    }
}