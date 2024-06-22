FROM golang:1.22.4

RUN apt update && apt upgrade -y &&\
    apt install -y git\
    make openssh-client

WORKDIR /go/src/app

COPY . ./
WORKDIR /go/src/app/program 

RUN go build -o  /main
CMD ["/main"]