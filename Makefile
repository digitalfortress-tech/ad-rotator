help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Install Dependencies
	@pnpm i

watch:	## Build for Dev environment and Watch files
	@pnpm watch

lint:		## Lint all files
	@pnpm lint

tests:		## Run all tests (unit + e2e)
	@make test-unit
	@make test-e2e

test-unit:		## Run unit tests (JEST)
	@pnpm test-unit

test-e2e:		## Run e2e tests (Cypress CLI)
	@pnpm run test-e2e

test-e2e-gui:		## Run e2e tests (Cypress GUI)
	@pnpm run test-e2e-gui

prod:		## Build for Production environment
	@pnpm prod
	@pnpm run copy-typescript-definitions

publish:	## Publish to NPM
	@make prod
	@make tests
	@pnpm publish
