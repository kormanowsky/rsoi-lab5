import { CircuitBreaker, EntityLogic, Rental, RentalFilter, RentalId } from "@rsoi-lab2/library";

import { ConfigurableLogic } from "../interface";

import { 
    RentalDereferenceUidsLogic, RentalRetrievalLogic, RentalRetrieveAllRequest, RentalRetrieveAllResponse, 
    RentalRetrieveSingleRequest, RentalRetrieveSingleResponse, RetrievedRental 
} from "../rental-retrieval";

export class CBRentalRetrievalLogic extends RentalRetrievalLogic {
    constructor(
        cb: CircuitBreaker, 
        rentalLogic: EntityLogic<Rental, RentalFilter, RentalId>, 
        dereferenceLogic: ConfigurableLogic<RentalDereferenceUidsLogic>
    ) {
        super(rentalLogic, dereferenceLogic);
        this.cb = cb;

        this.cb.register({
            id: this.retrieveRentalsOperationId, 
            realOperation: (request: RentalRetrieveAllRequest) => super.retrieveRentals(request),
            fallbackOperation: (request: RentalRetrieveAllRequest) => this.retrieveRentalsFallback(request)
        });

        this.cb.register({
            id: this.retrieveRentalOperationId, 
            realOperation: (request: RentalRetrieveSingleRequest) => super.retrieveRental(request),
            fallbackOperation: (request: RentalRetrieveSingleRequest) => this.retrieveRentalFallback(request)
        });
    }

    retrieveRentals(request: RentalRetrieveAllRequest): Promise<RentalRetrieveAllResponse> {
        return this.cb.dispatch(this.retrieveRentalsOperationId, request);
    }

    retrieveRental(request: RentalRetrieveSingleRequest): Promise<RentalRetrieveSingleResponse> {
        return this.cb.dispatch(this.retrieveRentalOperationId, request);    
    }

    protected async retrieveRentalsFallback(_: RentalRetrieveAllRequest): Promise<RentalRetrieveAllResponse> {
        return {
            rentals: []
        };
    }

    protected async retrieveRentalFallback(request: RentalRetrieveSingleRequest): Promise<RentalRetrieveSingleResponse> {
        return {
            rental: <RetrievedRental>{
                rentalUid: request.rentalUid,
                username: request.username
            }
        };
    }


    private cb: CircuitBreaker;
    private readonly retrieveRentalsOperationId = 'retrieveRentals';
    private readonly retrieveRentalOperationId = 'retrieveRental';
}
