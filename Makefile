TESTS = tests/suite/*.js

all: test

test:
	@./node_modules/nodeunit/bin/nodeunit \
		$(TESTS)

.PHONY: test
