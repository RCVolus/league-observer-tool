# league-observer-tool
The observer tool is part of our [lol-prod-toolkit](https://github.com/RCVolus/league-prod-toolkit).
The tool is used to query local client APIs (LCU, ingame) and send the data to a local or remote instance of prod-toolkit.
Once install, the observer tool automatically updates to any new versions released.

## Installation
1. Download the latest release [here](https://github.com/RCVolus/league-observer-tool/releases/latest)
2. Install and run the observer tool
3. Configure the toolkit instance:
* Open the settings file by selecting File -> Open Settings
* Configure the appropriate IP (`"server-ip": "127.0.0.1"` for locally hosted toolkit)
* Before saving, close the Observer Tool either from the tray or with File -> Quit
* Save the changed config file

## Usage
The power button at the bottom connects to the configured toolkit instance.
To connect to local League Client APIs, click Sync on the modules you need. The League Client needs to be running.
