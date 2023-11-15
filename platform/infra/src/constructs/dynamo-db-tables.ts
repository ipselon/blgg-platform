import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
// import * as ssm from 'aws-cdk-lib/aws-ssm';

export interface DynamoDbTablesConstructProps {

}

export class DynamoDbTablesConstruct extends Construct {
    public readonly table: dynamodb.Table;
    constructor(scope: Construct, id: string, props?: DynamoDbTablesConstructProps) {
        super(scope, id);

        // Create a new DynamoDB table
        this.table = new dynamodb.Table(this, 'ProbeTable', {
            tableName: 'ProbeItems',
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            // add other properties as required
        });
        // // Store the table name in AWS Systems Manager Parameter Store
        // new ssm.StringParameter(this, 'ProbeTableNameParameter', {
        //     parameterName: 'probe-table-name',
        //     stringValue: this.table.tableName,
        // });
    }
}
