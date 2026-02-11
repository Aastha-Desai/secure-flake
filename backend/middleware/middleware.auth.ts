import { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.session.userId) {
        console.log('User not authenticated on middleware.')
        return res.status(401).json({ 
            error: 'user_unauthenticated', 
            message: 'User is not authenticated in the session.'
        });
    }
    
    next();
}