import { Router } from 'express';
import { 
  registerController, 
  loginController,
  getCurrentUserController,
  listUsersController,
  getUserByIdController,
  updateUserController,
  changePasswordController,
  resetPasswordController,
  deactivateUserController,
  activateUserController,
} from '../controllers/auth.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { 
  registerSchema, 
  loginSchema, 
  getCurrentUserSchema,
  listUsersSchema,
  getUserSchema,
  updateUserSchema,
  changePasswordSchema,
  resetPasswordSchema,
  deactivateUserSchema,
  activateUserSchema,
} from '../validators/auth.validator.js';
import { verifyTokenMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);

// Protected routes
router.get('/me', verifyTokenMiddleware, validate(getCurrentUserSchema), getCurrentUserController);
router.get('/users', verifyTokenMiddleware, validate(listUsersSchema), listUsersController);
router.get('/users/:id', verifyTokenMiddleware, validate(getUserSchema), getUserByIdController);
router.put('/users/:id', verifyTokenMiddleware, validate(updateUserSchema), updateUserController);
router.post('/change-password', verifyTokenMiddleware, validate(changePasswordSchema), changePasswordController);
router.post('/users/:id/reset-password', verifyTokenMiddleware, validate(resetPasswordSchema), resetPasswordController);
router.post('/users/:id/deactivate', verifyTokenMiddleware, validate(deactivateUserSchema), deactivateUserController);
router.post('/users/:id/activate', verifyTokenMiddleware, validate(activateUserSchema), activateUserController);

export default router;

