# --- Colors -----------------------------------------------------------------
CYAN   := \033[36m
GREEN  := \033[32m
YELLOW := \033[33m
BOLD   := \033[1m
RESET  := \033[0m

# --- Docs deploy config -----------------------------------------------------
DOCS_SRC    := docs/
DOCS_REMOTE := nikslab:/srv/static/ad-rotator-docs/

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(CYAN)%-30s$(RESET) %s\n", $$1, $$2}'

deploy-docs:		## Sync docs/ to static server (rsync --delete)
	@printf "$(BOLD)$(YELLOW)→ Deploying docs$(RESET) $(CYAN)$(DOCS_SRC)$(RESET) → $(CYAN)$(DOCS_REMOTE)$(RESET)\n"
	@rsync -avz --delete $(DOCS_SRC) $(DOCS_REMOTE)
	@printf "$(BOLD)$(GREEN)✓ Docs deployed$(RESET)\n"

install: ## Install Dependencies
	@pnpm i

watch:	## Build for Dev environment and Watch files
	@pnpm watch

lint:		## Lint all files (auto-fix)
	@pnpm lint

lint-check:		## Lint without auto-fixing (CI)
	@pnpm run lint:check

tests:		## Run all tests (unit + e2e)
	@make test-unit
	@make test-e2e

test-unit:		## Run unit tests (JEST)
	@pnpm test-unit

test-e2e:		## Run e2e tests (Cypress CLI)
	@pnpm run test-e2e

test-e2e-gui:		## Run e2e tests (Cypress GUI)
	@pnpm run test-e2e-gui

prod:		## Build for Production environmen
	@make lint
	@pnpm prod
	@pnpm run copy-typescript-definitions

publish:	## Publish to NPM
	@make prod
	@make tests
	@pnpm publish
