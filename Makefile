##########################
#  Most Important Rules  #
##########################

.PHONY: all build clean test test-browser watch
all: build


#######################
#  Setup Global Vars  #
#######################

# Environment vars
ENV=dev
PLATFORM := $(shell uname -s)

ifeq ($(ENV), dev)
UGLIFYFLAGS= -b
UGLY=
else
UGLIFYFLAGS=
UGLY=
endif

# The node dependancies
NPM=$(shell which npm)
ifeq ($(NPM),)
override NPM=/usr/bin/npm
endif

UGLIFYJS=$(shell which uglifyjs)
ifeq ($(UGLIFYJS),)
override UGLIFYJS=/usr/local/bin/uglifyjs
endif

################
#  Javascript  #
################

JIVEJS=jive.js
JIVEJS_DEPS=libs/lodash.js \
	libs/jPromise/jpromise.js \
	libs/util.js \
	libs/retarded_utils.js \
	libs/setImmediate.js \
	libs/set.js \
	libs/map.js \
	libs/weakmap.js \
	libs/capped.js \
	libs/state.js \
	libs/localStore.js \
	libs/dataModels.js \
	libs/linkedhashmap.js \
	libs/fabric.js
MINIFY=$(JIVEJS)

########################
#  Dependency Targets  #
########################

$(NPM):
ifeq ($(PLATFORM),Darwin)
	brew install node
else
	yum install -y npm
endif

$(UGLIFYJS): $(NPM)
	npm install -g git+https://github.com/mishoo/UglifyJS2.git
	touch $(UGLIFYJS)

##################
#  Real Targets  #
##################

$(JIVEJS): $(JIVEJS_DEPS) $(UGLIFYJS)
	uglifyjs $(UGLIFYFLAGS) -o jive.js $(JIVEJS_DEPS)

###################
#  Phony Targets  #
###################

build: $(MINIFY) $(JIVEJS)

clean: 
	rm -f jive.js jive.min.js 

test: all
	@./node_modules/.bin/jasmine-node \
		spec/

test-browser: all
	@./node_modules/.bin/serve .

watch:
	watch -n .5 $(MAKE)
