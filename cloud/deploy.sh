#!/bin/bash

###############################################################
# Package and deploy cloudformation SAM
# @arg --bucket "Bucket Name"
# @arg --stack "Stack Name" 
# 
# Usage:
#  ./deploy.sh --stack my-stack-name --bucket my-bucket-name
###############################################################

# Default Template to use if none is specified
TEMPLATE_FILE="api.yaml"
TEMPLATE_DEPLOY_FILE="api-deploy.yaml"

while test $# -gt 0
do
    case "$1" in
        --stack) 
			echo "[i] Using Stack: ${2}"
			STACK=$2
            ;;
        --bucket) 
			echo "[i] Using Bucket: ${2}"
			BUCKET=$2
            ;;
        --template) 
			echo "[i] Using Template: ${2}"
			TEMPLATE_FILE=$2
			TEMPLATE_DEPLOY_FILE="${TEMPLATE_FILE}-deploy.yaml"
            ;;
        --*) 
			echo "[!] Unknown option $1"
			echo "Usage: deploy.sh --stack my-stack-name --template api.yaml --bucket my-bucket-name"
			exit 1
            ;;
    esac
    shift
done

if [ -z $BUCKET ]; then
	echo "[!] Please specifiy a deployment bucket argument with --bucket my-bucket-name"
	echo "    Usage: deploy.sh --stack my-stack-name --bucket my-bucket-name"
	echo
	exit 1
fi

if [ -z $STACK ]; then
	echo "[!] Please specify a deployment stack name with --stack my-stack"
	echo "    Usage: deploy.sh --stack my-stack-name --bucket my-bucket-name"
	echo
	exit 1
fi

if [ -z $TEMPLATE_FILE ]; then
	echo "[!] Please specify a template file with --template template.yaml"
	echo "    Usage: deploy.sh --stack my-stack-name --template my-template.yaml --bucket my-bucket-name"
	echo
	exit 1
fi

echo "[i] Packaging template ${TEMPLATE_FILE}..."
aws cloudformation package --template-file ${TEMPLATE_FILE} --output-template-file ${TEMPLATE_DEPLOY_FILE} --s3-bucket ${BUCKET}
echo
echo "[i] Deploying template ${TEMPLATE_DEPLOY_FILE}..."
aws cloudformation deploy --template-file ${TEMPLATE_DEPLOY_FILE} --stack-name ${STACK} --capabilities CAPABILITY_IAM
echo

exit 0