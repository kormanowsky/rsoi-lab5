import { EntityServer } from '@rsoi-lab2/library';
import { Car, CarFilter, CarId } from '../logic';

export class CarsServer extends EntityServer<Car, CarFilter, CarId> {}