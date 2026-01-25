import { Request, Response, NextFunction } from 'express';

//kick out if the user not authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'user_unauthenticated', message: 'User is not authenticated in the session.'});
    }
}