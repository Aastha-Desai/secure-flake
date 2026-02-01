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
        const { hostAccount, givenUsername, givenPassword, testOnly } = req.body;

        if (!hostAccount || !givenUsername || !givenPassword) {
            return res.status(400).json({ 
                error: 'missing_fields', 
                message: 'All fields required.'
            });
        }

        const cleanAccount = hostAccount.replace('.snowflakecomputing.com', '').trim();

        console.log('🔄 Connecting to Snowflake...');
        console.log('   Account:', cleanAccount);
        console.log('   Username:', givenUsername);

        // Add retry logic for localhost inconsistencies
        let lastError: any = null;
        const maxRetries = 3;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`   Attempt ${attempt}/${maxRetries}...`);

                const connection = snowflake.createConnection({
                    account: cleanAccount,
                    username: givenUsername,
                    password: givenPassword,
                    timeout: 60000,
                    clientSessionKeepAlive: true,
                    clientSessionKeepAliveHeartbeatFrequency: 3600
                });

                await new Promise<void>((resolve, reject) => {
                    let callbackFired = false;
                    
                    const timeout = setTimeout(() => {
                        if (!callbackFired) {
                            callbackFired = true;
                            reject(new Error('Connection callback timeout'));
                        }
                    }, 20000); 

                    connection.connect((err, conn) => {
                        if (callbackFired) return;
                        callbackFired = true;
                        clearTimeout(timeout);
                        
                        if (err) {
                            reject(err);
                        } else {
                            console.log('Connected! ID:', conn.getId());
                            resolve();
                        }
                    });
                });

                console.log('Connection successful!');

                // Clean up
                await new Promise<void>((resolve) => {
                    connection.destroy(() => resolve());
                });

                // Success - break out of retry loop
                lastError = null;
                break;

            } catch (err: any) {
                lastError = err;
                console.log(`Attempt ${attempt} failed:`, err.message);
                
                if (attempt < maxRetries) {
                    console.log(`Retrying in 1 second...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        // If all retries failed, throw the last error
        if (lastError) {
            throw lastError;
        }

        if (testOnly) {
            console.log('Test successful - not saving credentials');
            return res.json({
                success: true,
                message: "Connection test successful."
            });
        }

        console.log('Saving credentials...');
        saveSnowflakeConnection(userId, { 
            hostAccount: cleanAccount, 
            givenUsername, 
            givenPassword 
        });

        console.log('Starting metrics collection...');
        startMetricsCollectionInterval(userId);

        res.json({
            success: true,
            message: "Snowflake connected successfully."
        });

    } catch (err: any) {
        console.error('Final error:', err.message);
        return res.status(400).json({
            error: 'failed_connection', 
            message: 'Failed to connect to Snowflake.', 
            details: err.message
        });
    }
});

router.get('/status', (req: Request, res: Response) => {
    const userId = req.session.userId!;
    const connection = getSnowflakeConnection(userId);

    if (!connection) {
        return res.json({ connected: false });
    }

    res.json({
        connected: true,
        account: connection.hostAccount,
        username: connection.givenUsername
    });
});

router.delete('/disconnect', (req: Request, res: Response) => {
    try {
        const userId = req.session.userId!;
        const { snowflakeConnections } = require('../config/config.database');

        snowflakeConnections.delete(userId);

        res.json({ 
            success: true, 
            message: 'Snowflake disconnected successfully.'
        });
    } catch (err) {
        console.error('Snowflake failed to disconnect:', err);
        res.status(500).json({ 
            error: 'failed_to_disconnect', 
            message: 'Snowflake failed to disconnect.'
        });
    }
});

export default router;








