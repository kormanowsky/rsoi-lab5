import { EntityClient, Car, CarFilter, CarId } from "@rsoi-lab2/library";

export class CarsClient extends EntityClient<Car, CarFilter, CarId, true>{}