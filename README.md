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

## Setting up LiveEvents API
For ingame Events (e.g., Dragon or Baron kills), the LiveEvents API needs to be configured locally:
1. Add the following to `game.cfg` (located in `[install path]\Riot Games\League of Legends\Config`):
```ini
[LiveEvents]
Enable=1
Port=34243
```
Make sure the port is the same as configured in the observer tool settings under `live-events-port`.
2. Create a file called `LiveEvents.ini` in the same config directory
3. Paste the following in the `LiveEvents.ini` file:
```ini
OnKillDragon_Spectator
OnKillRiftHerald_Spectator
OnKillWorm_Spectator
OnTurretPlateDestroyed
OnDragonSoulGiven
```

## Usage
The power button at the bottom connects to the configured toolkit instance.
To connect to local League Client APIs, click Sync on the modules you need. The League Client needs to be running.

## Legal Disclaimer
league-prod-toolkit was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.
