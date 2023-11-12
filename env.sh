#!/bin/bash

export AWS_REGION=eu-west-1
export AWS_PROFILE_NAME=sitebud-admin

eval $(aws configure export-credentials --profile ${AWS_PROFILE_NAME} --format env)
