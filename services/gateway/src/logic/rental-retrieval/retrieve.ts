import { EntityLogic, Rental, RentalFilter, RentalId } from '@rsoi-lab2/library';

import { ConfigurableLogic, LogicOptions } from '../interface';

import { 
    RentalRetrieveAllRequest,
    RentalRetrieveAllResponse,
    RentalRetrieveSingleRequest,
    RentalRetrieveSingleResponse 
} from './interface';

import { RentalDereferenceUidsLogic } from './dereference';

export class RentalRetrievalLogic implements ConfigurableLogic<RentalRetrievalLogic> {
    constructor(
        rentalLogic: ConfigurableLogic<EntityLogic<Rental, Omit<RentalFilter, 'username'>, RentalId>>,
        dereferenceLogic: ConfigurableLogic<RentalDereferenceUidsLogic>
    ) {
        this.rentalLogic = rentalLogic;
        this.dereferenceLogic = dereferenceLogic;
    }

    withOptions(options: LogicOptions): ConfigurableLogic<RentalRetrievalLogic> {
        return new RentalRetrievalLogic(
            this.rentalLogic.withOptions(options),
            this.dereferenceLogic.withOptions(options)
        );
    }

    async retrieveRental(request: RentalRetrieveSingleRequest): Promise<RentalRetrieveSingleResponse> {
        const 
            {rentalUid} = request,
            rawRental = await this.rentalLogic.getOne(rentalUid);

        if (rawRental == null) {
            return {rental: null};
        }

        return {
            rental: await this.dereferenceLogic.tryDereferenceRentalUids(rawRental)
        };
    }

    async retrieveRentals(request: RentalRetrieveAllRequest): Promise<RentalRetrieveAllResponse> {
        const rawRentals = await this.rentalLogic.getMany(request);

        return {
            rentals: await Promise.all(
                rawRentals.map((rental) => this.dereferenceLogic.tryDereferenceRentalUids(rental))
            )
        }
    }

    private rentalLogic: ConfigurableLogic<EntityLogic<Rental, Omit<RentalFilter, 'username'>, RentalId>>;
    private dereferenceLogic: ConfigurableLogic<RentalDereferenceUidsLogic>;
}
