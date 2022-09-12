environment:=dev

install:
	cd src && npm install

build:
	cd src && npm run build

run-service:
	cd ./src/dist && SERVICE_NAME=node-service node --require ./tracing.js sqs-listner.js

deploy:
	terraform -chdir=environment/${environment} apply --auto-approve

build-deploy:
	make build && make deploy
