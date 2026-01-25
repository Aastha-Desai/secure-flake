import { Request, Response, Router } from 'express';
import { requireAuth } from '../middleware/middleware.auth';
import { getMetrics } from '../config/config.database';

const router = Router();

router.use(requireAuth);

router.get('/', (req: Request, res: Response) => {
    const userId = req.session.userId as string;
    const metrics = getMetrics(userId);

    res.json({
        metrics: metrics?.slice(-20) || [],
        total: metrics?.length || 0
    });
});

export default router;