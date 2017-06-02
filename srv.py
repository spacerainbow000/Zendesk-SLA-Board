import sys
import BaseHTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler

import datetime
import time, threading

import subprocess

HandlerClass = SimpleHTTPRequestHandler
ServerClass  = BaseHTTPServer.HTTPServer
Protocol     = "HTTP/1.0"

port = 65000
server_address = ('127.0.0.1', port)

class OVERRIDELOG(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        open("log", "a").write("%s - - [%s] %s\n" % (self.address_string(), self.log_date_time_string(),format%args))

httpd = ServerClass(server_address, OVERRIDELOG)

sa = httpd.socket.getsockname()
print "Serving HTTP on" + str(sa[0]) + "port" + str(sa[1]) + "..."

def updateopentickets():
    print "pulled times at " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    subprocess.call("bash DOAPITOUCHES >> log", shell=True)
    threading.Timer(120, updateopentickets).start()

updateopentickets()

print "PORT 65000 ADDR 127.0.0.1"

httpd.serve_forever()
