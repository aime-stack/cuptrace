import { Router } from 'express';
import { 
  registerController, 
  loginController,
  getCurrentUserController 
} from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { verifyTokenMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);

// Protected routes
router.get('/me', verifyTokenMiddleware, getCurrentUserController);

export default router;

