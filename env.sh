#!/bin/bash

export AWS_REGION=eu-west-1
export AWS_PROFILE_NAME=sitebud-admin

# Check if the AWS session is valid
if ! aws s3 ls --profile "$AWS_PROFILE_NAME" > /dev/null 2>&1; then
  echo "The AWS session is expired. Initiating AWS SSO login..."
  aws sso login --profile "$AWS_PROFILE_NAME"
else
  echo "The AWS session is still valid."
fi

eval $(aws configure export-credentials --profile ${AWS_PROFILE_NAME} --format env)
