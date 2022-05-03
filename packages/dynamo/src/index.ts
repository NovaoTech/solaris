import express from 'express';
import * as solaris from 'solaris-types';

const app: express.Application = express();
 
let determinedPort: number;
if (process.env['DYNAMO_PORT']) {
    determinedPort = Number (process.env['DYNAMO_PORT']);
} else {
    determinedPort = 3000;
}

const port: number = determinedPort;

app.get('/', (_req, _res) => {
    _res.send("{ status: '200' }");
});

// Define for errors
app.use(function (req,res,next) {
    res.status(404).send("{ status: '404' }");
    res.status(500).send("{ status: '500' }");
});

app.listen(port);