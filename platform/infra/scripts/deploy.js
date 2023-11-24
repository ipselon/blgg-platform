const {execSync} = require('child_process');
const {readFileSync, existsSync, openSync, closeSync} = require('fs');
const {SSMClient, PutParameterCommand} = require('@aws-sdk/client-ssm');

const AWS_PROFILE_NAME = process.env.AWS_PROFILE_NAME; // Get AWS profile name from environment variable
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsSessionToken = process.env.AWS_SESSION_TOKEN; // This might be optional, depending on your setup
const stackName = process.env.STACK_NAME;

console.log('Please wait. Deploying resources...');
// Proceed with the CDK deployment
const CDK_OUTPUT_FILE = 'cdk-outputs.json';
// const log = openSync('cdk-deploy-log.txt', 'a');
// execSync(`cdk deploy --require-approval never --auto-approve --outputs-file ${CDK_OUTPUT_FILE} --profile ${AWS_PROFILE_NAME}`, {stdio: ['ignore', log, log]});
// closeSync(log);
execSync(`cdk deploy --require-approval never --auto-approve --outputs-file ${CDK_OUTPUT_FILE} --profile ${AWS_PROFILE_NAME}`, {stdio: 'inherit'});

console.log('Reading output.');
// Check if the output file was created
if (!existsSync(CDK_OUTPUT_FILE)) {
    console.error('Error: CDK output file not found');
    process.exit(1);
}

// Read and parse the CDK output file
const cdkOutputs = JSON.parse(readFileSync(CDK_OUTPUT_FILE, 'utf8'));
const entryPointDomainName = cdkOutputs[stackName].EntryPointDomainName;
const previewPointDomainName = cdkOutputs[stackName].PreviewPointDomainName;

// Create SSM service object
// Initialize SSM client with explicit credentials
const ssmClient = new SSMClient({
    credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
        sessionToken: awsSessionToken // Omit this if you don't use session tokens
    }
});

// Function to store parameters in SSM
const putParameter = async (name, value) => {
    const params = {
        Name: name,
        Type: 'String',
        Value: value,
        Overwrite: true
    };

    try {
        const command = new PutParameterCommand(params);
        const response = await ssmClient.send(command);
        console.log(`Parameter stored: ${name}, Version: ${response.Version}`);
    } catch (err) {
        console.error(`Error storing parameter ${name}:`, err);
    }
};

putParameter('EntryPointDomainName', entryPointDomainName);
putParameter('PreviewPointDomainName', previewPointDomainName);
