#!/bin/bash

# Check if the AWS profile is provided as the first parameter
if [ -z "$AWS_PROFILE_NAME" ]; then
  echo "Error: missing AWS user profile name"
  echo "Usage: $0 <aws-profile-name>"
  exit 1
fi

# Check if the AWS session is valid
if ! aws s3 ls --profile "$AWS_PROFILE_NAME" > /dev/null 2>&1; then
  echo "The AWS session is expired. Initiating AWS SSO login..."
  aws sso login --profile "$AWS_PROFILE_NAME"
else
  echo "The AWS session is still valid."
fi

cdk bootstrap --profile sitebud-admin
