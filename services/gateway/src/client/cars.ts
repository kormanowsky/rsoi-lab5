import { EntityClient } from "@rsoi-lab2/library";
import { Car, CarFilter, CarId } from "../../../cars/src/logic";

export class CarsClient extends EntityClient<Car, CarFilter, CarId>{}