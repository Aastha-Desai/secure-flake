import { Request, Response, Router } from 'express';
import snowflake from 'snowflake-sdk';
import { requireAuth } from '../middleware/middleware.auth';
import { SnowflakeConnection } from '../types/types.index';
import { getSnowflakeConnection, saveSnowflakeConnection } from '../config/config.database';
import { startMetricsCollectionInterval } from '../services/services.monitoring';

const router = Router();

router.use(requireAuth);

router.post("/connect", async (req: Request, res: Response) => {
    try {
        const userId = req.session.userId!;
        const { hostAccount, givenUsername, givenPassword } = req.body as SnowflakeConnection;

        if (!hostAccount || !givenUsername || !givenPassword) {
            return res.status(400).json({ error: 'missing_fields', message: 'All fields required.'});
        }

        const connection = snowflake.createConnection({
            account: hostAccount,
            username: givenUsername,
            password: givenPassword
        });

        try {
    const conn = await new Promise<any>((resolve, reject) => {
        connection.connect((err, conn) => {
            if (err || !conn) reject(err);
            else resolve(conn);
        });
    });

    res.json({
        success: true,
        message: "Snowflake connected. Connection ID: " + conn.getId()
    });

} catch (err: any) {
    res.json({
        success: false,
        message: "Snowflake connected unsuccessfully."
    });
    console.log("Did not connect: " + (err?.message || err));
}


        //connection.destroy((err) => {
            //if (err) console.log('Trouble disconnecting: ' + err);
        //});

        saveSnowflakeConnection(userId, { hostAccount, givenUsername, givenPassword});

        startMetricsCollectionInterval(userId);

    } catch (err) {
        console.error('Snowflake connection error ' + err);
        res.status(400).json({
            error: 'failed_connection', message: 'Failed to connect to Snowflake.', details: (err as Error).message
        });

    }
});

router.get('/status', (req: Request, res: Response) => {
    const userId = req.session.userId!;
    const connection = getSnowflakeConnection(userId);

    if(!connection){
        return res.json({ connected: false});
    }

    res.json({
        connected: true,
        account: connection.hostAccount,
        username: connection.givenUsername
    });
});

router.delete('/disconnect', (req: Request, res: Response) => {
    try{
    const userId = req.session.userId!;
    const { snowflakeConnections } = require('../config/config.database');

    snowflakeConnections.delete(userId);

    res.json({ success: true, message: 'Snowflake disconnected successfully.'})
    } catch (err) {
        console.log('Snowflake failed to disconnect ' + err);
        res.json({ error: 'failed_to_disconnect', message: 'Snowflake failed to disconnect.'});
    }
});

export default router;









