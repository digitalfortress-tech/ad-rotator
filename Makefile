install:
	@npm i

watch:
	@npm run watch

lint:
	@npm run lint

prod:
	@npm run prod

publish:
	@make prod
	@npm publish
