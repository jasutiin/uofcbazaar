import { Router } from '@oak/oak';
import { login, register } from '../controllers/auth.controller.ts';
import { oakCors } from '@tajpouria/cors';

export const router = new Router();

router.post('/api/auth/login', login).post('/api/auth/register', register);
