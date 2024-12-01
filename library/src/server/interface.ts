import { Request, Response } from 'express';

import { User } from '../types';

export type ServerRequest = Request & {user: User | null};
export type ServerResponse = Response;