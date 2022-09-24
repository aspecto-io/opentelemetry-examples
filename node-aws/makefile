environment:=dev

install:
	cd src && npm install

build:
	cd src && npm run build

run-service:
	cd ./src/dist && SERVICE_NAME=node-service node --require ./tracing.js sqs-listener.js

deploy:
	terraform -chdir=environment/${environment} apply --auto-approve --var ASPECTO_API_KEY=${ASPECTO_API_KEY}

build-deploy:
	make build && make deploy
