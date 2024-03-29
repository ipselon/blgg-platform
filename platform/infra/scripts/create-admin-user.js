const {readFileSync, existsSync} = require('fs');
const {
    CognitoIdentityProviderClient,
    SignUpCommand
} = require("@aws-sdk/client-cognito-identity-provider");
const {
    PLATFORM_PREVIEW_POINT_DOMAIN_SSM_PARAM,
    PLATFORM_ENTRY_POINT_DOMAIN_SSM_PARAM,
    PLATFORM_SYS_USER_POOL_ID_SSM_PARAM,
    PLATFORM_SYS_USER_POOL_CLIENT_ID_SSM_PARAM
} = require("common-utils");

const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsSessionToken = process.env.AWS_SESSION_TOKEN; // This might be optional, depending on your setup
const awsRegion = process.env.AWS_REGION;
const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL;
const stackName = process.env.STACK_NAME;

// Proceed with the CDK deployment
const CDK_OUTPUT_FILE = 'cdk-outputs.json';
console.log('Reading output.');
// Check if the output file was created
if (!existsSync(CDK_OUTPUT_FILE)) {
    console.error('Error: CDK output file not found');
    process.exit(1);
}

// Read and parse the CDK output file
const cdkOutputs = JSON.parse(readFileSync(CDK_OUTPUT_FILE, 'utf8'));
const sysUserPoolId = cdkOutputs[stackName][PLATFORM_SYS_USER_POOL_ID_SSM_PARAM];
const sysUserPoolClientId = cdkOutputs[stackName][PLATFORM_SYS_USER_POOL_CLIENT_ID_SSM_PARAM];

const cognitoClient = new CognitoIdentityProviderClient({
    region: awsRegion,
    credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
        sessionToken: awsSessionToken
    }
});

const signUpUser = async () => {
    try {
        const response = await cognitoClient.send(new SignUpCommand({
            ClientId: sysUserPoolClientId,
            Username: defaultAdminEmail,
            Password: 'DefaultPassword1!',
            UserAttributes: [
                {
                    Name: 'email',
                    Value: defaultAdminEmail
                },
                {
                    Name: 'name',
                    Value: 'Default Admin User'
                },
            ]
        }));
        console.log("Sign up successful", response);
    } catch (error) {
        console.error("Error during sign up", error);
    }
};

signUpUser().catch(error => {
    console.error(error.message);
});
