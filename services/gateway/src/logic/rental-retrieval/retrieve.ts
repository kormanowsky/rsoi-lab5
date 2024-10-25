import { EntityLogic, Rental, RentalFilter, RentalId } from "@rsoi-lab2/library";

import { 
    RentalRetrieveAllRequest,
    RentalRetrieveAllResponse,
    RentalRetrieveSingleRequest,
    RentalRetrieveSingleResponse 
} from "./interface";

import { RentalDereferenceUidsLogic } from "./dereference";

export class RentalRetrievalLogic {
    constructor(
        rentalLogic: EntityLogic<Rental, RentalFilter, RentalId>,
        dereferenceLogic: RentalDereferenceUidsLogic
    ) {
        this.rentalLogic = rentalLogic;
        this.dereferenceLogic = dereferenceLogic;
    }

    async retrieveRental(request: RentalRetrieveSingleRequest): Promise<RentalRetrieveSingleResponse> {
        const 
            {rentalUid, username} = request,
            rawRental = await this.rentalLogic.getOne(rentalUid);

        if (rawRental == null || rawRental.username !== username) {
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

    private rentalLogic: EntityLogic<Rental, RentalFilter, RentalId>;
    private dereferenceLogic: RentalDereferenceUidsLogic;
}
