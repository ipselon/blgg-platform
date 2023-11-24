import {Construct} from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import {PLATFORM_PROBE_TABLE_NAME} from 'common-utils';
// import * as ssm from 'aws-cdk-lib/aws-ssm';

export interface DynamoDbTablesConstructProps {

}

export class DynamoDbTablesConstruct extends Construct {
    public readonly tables: Array<dynamodb.Table>;

    constructor(scope: Construct, id: string, props?: DynamoDbTablesConstructProps) {
        super(scope, id);
        this.tables = [];

        // Create a new DynamoDB table
        this.tables.push(new dynamodb.Table(this, PLATFORM_PROBE_TABLE_NAME, {
                tableName: PLATFORM_PROBE_TABLE_NAME,
                partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
                // add other properties as required
            })
        );
        // // Store the table name in AWS Systems Manager Parameter Store
        // new ssm.StringParameter(this, 'ProbeTableNameParameter', {
        //     parameterName: 'probe-table-name',
        //     stringValue: this.table.tableName,
        // });
    }
}
