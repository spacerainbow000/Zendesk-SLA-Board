import sys
import requests
import urllib3
import configparser
import pyjq
import json
import os
import threading
from threading import Thread
import BaseHTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler
import datetime
import time
import subprocess
from operator import attrgetter

###daemonization
def createDaemon(): # http://code.activestate.com/recipes/278731-creating-a-daemon-the-python-way/
    UMASK = 0
    WORKDIR = "."
    try:
        pid = os.fork()
    except OSError, e:
        raise Exception, "%s [%d]" % (e.strerror, e.errno)
    if (pid == 0):
        os.setsid()
        try:
            pid = os.fork()
        except OSError, e:
            raise Exception, "%s [%d]" % (e.strerror, e.errno)
        if (pid == 0):
            os.chdir(WORKDIR)
            os.umask(UMASK)
        else:
            os._exit(0)
    else:
        os._exit(0)
createDaemon()

#disable tls warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

#get configs
parser = configparser.RawConfigParser()
config_path = os.path.dirname(os.path.realpath(__file__)) + '/board.conf'
parser.read(config_path)
token = parser.get('DEFAULT', 'token')
credentials = parser.get('DEFAULT', 'credentials')
target = parser.get('DEFAULT', 'target')

#request config
session = requests.Session()
session.auth = (credentials + "/token", token)

#tickets with breachtime
tickets_to_write = list()

### api
def get_tickets():
    opentickets = pyjq.all('.results[].id', json.loads(session.get('https://' + target + '/api/v2/search.json?include=&query=type%3Aticket%20status%3Anew').content))
    opentickets += pyjq.all('.results[].id', json.loads(session.get('https://' + target + '/api/v2/search.json?include=&query=type%3Aticket%20status%3Aopen').content))
    opentickets += pyjq.all('.results[].id', json.loads(session.get('https://' + target + '/api/v2/search.json?include=&query=type%3Aticket%20status%3Ahold').content))
    opentickets += pyjq.all('.results[].id', json.loads(session.get('https://' + target + '/api/v2/search.json?include=&query=type%3Aticket%20status%3Apending').content))
    return opentickets

def get_sla(ticket):
    ticketdata = json.loads(session.get('https://' + target + '/api/v2/tickets/' + str(ticket) + '.json?include=slas,users,groups').content)
    ## breachtime
    p = pyjq.all('.ticket.slas.policy_metrics[].breach_at', ticketdata)
    breachtime = str(p)
    if str(breachtime) != "[None]" and str(breachtime) != "[]":
        b = str(p[0]) #actual breachtime string
        ## assignee
        assignee = get_assignee(ticketdata)
        ## write
        l_breachable = breachable(ticket = ticket, breachtime = b, assignee = assignee)
        tickets_to_write.append(l_breachable)


def get_assignee(ticketdata):
    group = str(pyjq.all('.groups[].name', ticketdata)[0])
    try:
        assignee_id = int(pyjq.all('.ticket.assignee_id', ticketdata)[0])
        assignee = pyjq.all('[ .users | .[] | select (.id==($uid | tonumber)) | [ .id, .name ] ] | .[]', ticketdata, vars={"uid": assignee_id}) #converted type as per https://stackoverflow.com/questions/41772776/numeric-argument-passed-with-jq-arg-not-matching-data-with
        assignee_str = str(assignee[0][1])
        return assignee_str
    except TypeError:
        #no assignee user - return group instead
        return group

### control
def allocate_threads(tickets):
    threadlist_1 = list()
    threadlist_2 = list()
    threadlist_3 = list()
    threadlist_4 = list()
    thread_alloc = list()
    thread_alloc.append(threadlist_1)
    thread_alloc.append(threadlist_2)
    thread_alloc.append(threadlist_3)
    thread_alloc.append(threadlist_4)
    for f in xrange(0, len(tickets)):
        thread_alloc[f % 4].append(tickets[f])
    return thread_alloc

def spawn_threads(thread_alloc):
    queue1 = Thread(target = test_tickets, name = "queue1", args = (thread_alloc[0], ))
    queue2 = Thread(target = test_tickets, name = "queue2", args = (thread_alloc[1], ))
    queue3 = Thread(target = test_tickets, name = "queue3", args = (thread_alloc[2], ))
    queue4 = Thread(target = test_tickets, name = "queue4", args = (thread_alloc[3], ))
    queue1.start()
    queue2.start()
    queue3.start()
    queue4.start()
    queue1.join()
    queue2.join()
    queue3.join()
    queue4.join()

def test_tickets(tlist):
    for f in tlist:
        generate_breachable(f)

def generate_breachable(ticket):
    #wrapper for get_slas
    get_sla(ticket)

def write_results():
    #sort results
    sorted_tickets = sorted(tickets_to_write, key=attrgetter('breachtime'))
    fhandle = open('./SLAtimes.html', 'w') #blank out file
    fhandle.close()
    fhandle = open('./SLAtimes.html', "a")
    for f in sorted_tickets:
        fhandle.write(str(f.ticket) + " " + str(f.breachtime) + "<br>\n")
    fhandle.close()
    fhandle = open('./assignees.html', 'w') #blank out file
    fhandle.close()
    fhandle = open('./assignees.html', "a")
    for f in sorted_tickets:
        fhandle.write(str(f.ticket) + " " + str(f.assignee) + "<br>\n")
    fhandle.close()

class breachable:
    def __init__(self, ticket, breachtime, assignee):
        self.ticket = ticket
        self.breachtime = breachtime
        self.assignee = assignee

def main():
    del tickets_to_write[:]
    tickets = get_tickets()
    thread_alloc = allocate_threads(tickets)
    spawn_threads(thread_alloc)
    write_results()

### server
HandlerClass = SimpleHTTPRequestHandler
ServerClass  = BaseHTTPServer.HTTPServer
Protocol     = "HTTP/1.0"

port = int(parser.get('DEFAULT', 'port'))
server_address = (parser.get('DEFAULT', 'address'), port)

class OVERRIDELOG(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        open("log", "a").write("%s - - [%s] %s\n" % (self.address_string(), self.log_date_time_string(),format%args))

httpd = ServerClass(server_address, OVERRIDELOG)

sa = httpd.socket.getsockname()

def updateopentickets():
    main()
    threading.Timer(120, updateopentickets).start()

updateopentickets()

httpd.serve_forever()
