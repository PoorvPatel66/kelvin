import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from '../docs/swagger.js';

const router = express.Router();

router.get('/json', (req, res) => {
  res.status(200).json(swaggerDocument);
});
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
