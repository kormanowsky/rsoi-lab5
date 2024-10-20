import { EntityClient } from "@rsoi-lab2/library";
import { Rental, RentalFilter, RentalId } from "../../../rental/src/logic";

export class RentalsClient extends EntityClient<Rental, RentalFilter, RentalId>{}