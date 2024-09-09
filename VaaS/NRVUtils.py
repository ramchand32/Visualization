import struct
import subprocess
from gstoolspvnapi.settings.dev import DATA_EXTRACTOR_APP_PATH

class NRVUtils:
    f = None
    def openPipe(self): 
        while self.f is None:
            try:
                self.f = open(r'\\.\pipe\NRVPipe', 'r+b', 0)
            except: 
                print("Wait for NRVData extractor init")
    def closePipe(self):
        self.f.close()

    def readItem(self):
        n = struct.unpack('I', self.f.read(4))[0]    # Read str length
        s = self.f.read(n).decode('ascii')           # Read str
        self.f.seek(0)                               # Important!!!
        return s
    def extractData(self, pvaConfig, config):
        subprocess.Popen([DATA_EXTRACTOR_APP_PATH, pvaConfig, config])
        self.openPipe()
        
        eventLog = self.readItem()
        codecSets = self.readItem()
        locations = self.readItem()
        networkRegions = self.readItem()
        connections = self.readItem()
        interveningRegions = self.readItem()

        data = {'Event Log' : eventLog , 
                'Codec Sets' : codecSets, 
                'Locations' : locations, 
                'Network Regions' : networkRegions, 
                'Connections' : connections, 
                'Intervening Regions' : interveningRegions
                }
        self.closePipe()
        return(data)


  