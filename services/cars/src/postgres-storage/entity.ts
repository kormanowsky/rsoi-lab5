import { PostgresEntityStorage } from '@rsoi-lab2/library';
import { Car, CarFilter, CarId } from '../logic';

export class PostgresCarsStorage extends PostgresEntityStorage<Car, CarFilter, CarId>{}