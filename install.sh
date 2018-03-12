#!/bin/bash
# install dependencies

# install dev tools

if [[ $1 != "--override" ]];
then
    command -v yum >/dev/null 2>&1 && { #rhel-like
        echo "installing dev tools with yum"
        yum -y install python
        yum -y install "Development Tools"
        yum -y install autoconf automake libtool python-devel
    } || command -v apt >/dev/null 2>&1 && { #debian-like
        echo "installing dev tools with apt"
        apt -y install python
        apt -y install build-essential
        apt -y install autoconf automake libtool python-dev
    } || echo "neither apt nor yum found; run the steps from this script manually instead. run with --override to override this check." && cat $0 && exit 1
fi

# install pip
wget -qO- https://bootstrap.pypa.io/get-pip.py | python

# install python libraries
pip install requests configparser pyjq || pip install requests configparser pyjq --user

# pull server files
git clone https://github.com/spacerainbow000/Zendesk-SLA-Board.git
cp Zendesk-SLA-Board/* .
rm -rf Zendesk-SLA-Board/*
chmod +x startserver
chmod +x killserver

# create conf file
echo "[DEFAULT]" > board.conf
echo "credentials = a@b.c" >> board.conf
echo "token = abc123" >> board.conf
echo "target = abc.zendesk.com" >> board.conf
echo "port = 80" >> board.conf
echo "address = 127.0.0.1" >> board.conf
echo " " >> board.conf
echo "[users]" >> board.conf

echo "file board.conf created; edit it and replace the default values with the options for your instance"
echo "run"
echo "  ./startserver"
echo "or"
echo "  python srv.py"
echo "to start"