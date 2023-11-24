import express from 'express';
import {handler} from './functions/probe.ts';
import {APIGatewayProxyEventV2} from 'aws-lambda';

const app = express();

// Middleware to parse JSON body
app.use(express.json());

app.get('/api/probe', async (req, res) => {
    try {
        // Constructing the event object
        const event: APIGatewayProxyEventV2 = {
            version: '2.0',
            routeKey: req.route.path,
            rawPath: req.path,
            rawQueryString: req.originalUrl.split('?')[1] || '',
            headers: req.headers as { [name: string]: string },
            queryStringParameters: req.query as { [name: string]: string },
            requestContext: {
                accountId: '123456789012',
                apiId: '1234567890',
                domainName: 'example.com',
                domainPrefix: 'example',
                http: {
                    method: req.method,
                    path: req.path,
                    protocol: req.protocol,
                    sourceIp: req.ip || '',
                    userAgent: req.headers['user-agent'] || ''
                },
                requestId: `req-${new Date().getTime()}`,
                routeKey: req.route.path,
                stage: 'dev',
                time: new Date().toISOString(),
                timeEpoch: new Date().getTime(),
            },
            body: req.body ? JSON.stringify(req.body) : undefined,
            pathParameters: req.params as { [name: string]: string },
            isBase64Encoded: false,
            cookies: req.headers.cookie ? req.headers.cookie.split('; ') : undefined
        };

        const lambdaResponse: any = await handler(event);

        // Handling the Lambda response
        res.status(lambdaResponse.statusCode).send(lambdaResponse.body);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error while processing request');
    }
});

export const viteNodeApp = app;
