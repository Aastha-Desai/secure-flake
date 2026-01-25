import {Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../types/types.index';
import { getUserByEmail, createUser} from '../config/config.database';
import { error } from 'console';

const router = Router();

//signup on our app
router.post('/signup', async (req: Request, res: Response) => {
    try {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'missing_fields', message: 'Email and password are required.'});
    }

    if (getUserByEmail(email)) {
        return res.status(400).json({ error: 'user_exists', message: 'User with this email already exists.'});
    }

    const passwordHash = await bcrypt.hashSync(password, 10);

    const user: User = {
        id: Date.now().toString(),
        email, 
        password: passwordHash,
        createdAt: new Date()
    }

    createUser(user);

    res.json({
        success: true,
        message: 'Account created successfully.',
        userId: user.id
    });
} catch (error) {
    console.log('Singup error: ', error);
    res.status(500).json({ error: 'server_error', message: 'An error occurred during signup.'})
}
});

router.post('/login', async (req: Request, res: Response) => {
    try{
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'missing_fields', message: 'Email and password are required.'});
        }

        const user = getUserByEmail(email);

        if (!user) {
            return res.status(400).json({ error: 'invalid_credentials', message: 'Invalid email or password.'});
        }

        const valid = await bcrypt.compareSync(password, user.password);

        if (!valid) {
            return res.status(400).json({ error: 'invalid_credentials', message: 'Invalid email or password.'});
        }

        req.session.userId = user.id;

        res.json({
            success: true,
            userId: user.id,
            email: user.email
        });


    } catch (error) {
    console.log('Login error: ', error);
    res.status(500).json({ error: 'server_error', message: 'An error occurred during login.'});
} 
});

router.post('/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Logout error: ', err);
            return res.status(500).json({ error: 'server_error', message: 'An error occurred during logout.'});
        }
        res.json({ success: true, message: 'Logged out successfully.'});
    });
});

router.get('/me', (req: Request, res: Response) => {
    if (!req.session.userId){
        return res.status(401).json({ error: 'user_unauthenticated', message: 'User is not authenticated in the session.'});
    }
    res.json({
        authenticated: true,
        userId: req.session.userId
    });
});

export default router;