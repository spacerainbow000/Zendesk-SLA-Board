import sys
import BaseHTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler

import time, threading

import subprocess

HandlerClass = SimpleHTTPRequestHandler
ServerClass  = BaseHTTPServer.HTTPServer
Protocol     = "HTTP/1.0"

port = 65000
server_address = ('127.0.0.1', port)

HandlerClass.protocol_version = Protocol
httpd = ServerClass(server_address, HandlerClass)

sa = httpd.socket.getsockname()
print "Serving HTTP on", sa[0], "port", sa[1], "..."

def updateopentickets():
    subprocess.call("bash DOAPITOUCHES", shell=True)
    threading.Timer(120, updateopentickets).start()

updateopentickets()

print "PORT 65000 ADDR 127.0.0.1"

httpd.serve_forever()
