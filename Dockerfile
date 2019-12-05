FROM node

MAINTAINER Prashant Sinha <prashant@noop.pw>

RUN apt-get update -qq && apt-get install -y jq python3 python3-pip
