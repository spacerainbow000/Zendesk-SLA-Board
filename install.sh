#!/bin/bash
#don't run stuff from people you don't trust ;}

# install dependencies
# install dev tools
if [[ $1 != "override" ]];
then
    command -v yum >/dev/null 2>&1 && { #rhel-like
        echo "installing dev tools with yum"
        sudo yum -y install python
        sudo yum -y install "Development Tools"
        sudo yum -y install autoconf automake libtool python-devel
    } || command -v apt >/dev/null 2>&1 && { #debian-like
        echo "installing dev tools with apt"
        apt -y install python
        apt -y install build-essential
        apt -y install autoconf automake libtool python-dev
    } || echo "initial dev tool installation failed; run the steps from this script manually instead. run with 'curl ... | bash -s override' to override this check." ; cat $0 ; exit 1
fi

# install pip
wget -qO- https://bootstrap.pypa.io/get-pip.py | python

# install python libraries
pip install requests configparser pyjq || pip install requests configparser pyjq --user

# pull server files
git clone https://github.com/spacerainbow000/Zendesk-SLA-Board.git
cp -f Zendesk-SLA-Board/* .
rm -rf Zendesk-SLA-Board/
chmod +x startserver
chmod +x killserver

# create conf file
echo "[DEFAULT]" > board.conf
echo "credentials = a@b.c" >> board.conf
echo "token = abc123" >> board.conf
echo "target = abc.zendesk.com" >> board.conf
echo "port = 80" >> board.conf
echo "address = 127.0.0.1" >> board.conf
echo "loglevel = info" >> board.conf
echo " " >> board.conf
echo "[users]" >> board.conf

echo "file board.conf created; edit it and replace the default values with the options for your instance"
echo "run"
echo "  ./startserver"
echo "or"
echo "  python srv.py"
echo "to start"
