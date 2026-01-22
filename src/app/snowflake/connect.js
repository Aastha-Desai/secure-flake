var SNOWFLAKE = require('snowflake-sdk');

export default async function handler(req, res) {
    if (req.method === 'POST') {
        return res.status(404).json({ 'ERROR': 'Method not allowed.'});
    }

    const { account, user, password, application } = req.body;

    var CONNECTION = snowflake.createConnection( {
        account: account,
        username: user,
        password: password,
        application: application,
        authenticator: "EXTERNALBROWSER"
    })

    CONNECTION.connectAsync( 
        function (err, conn){
            console.error('Unable to connect:' + err.message);
            //will add error handling here
        }).then(() =>
    {
        console.log('Connected to Snowflake')
        connection_id = conn.getId();
        //store connection id
        var statement = connection.execute();
    })  

    //visually show that the connection is stable
    const isConnectionValid =  await CONNECTION.isValidAsync();

}






