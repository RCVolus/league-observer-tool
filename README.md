# league-observer-tool
The observer tool is part of our [lol-prod-toolkit](https://github.com/RCVolus/league-prod-toolkit).
The tool is used to query local client APIs (LCU, ingame) and send the data to a local or remote instance of prod-toolkit.
Once install, the observer tool automatically updates to any new versions released.

## Installation
1. Download the latest release [here](https://github.com/RCVolus/league-observer-tool/releases/latest)
2. Install and run the observer tool
3. Configure the toolkit instance:
* Open the settings tab
* Configure the appropriate IP (`127.0.0.1` for locally hosted toolkit, otherwise the IP the toolkit is reachable on)
* Configure the appropriate port (default is `3003`)
* If the toolkit has authentication enabled, set a key (`RCVPT-...`), otherwise leave it blank
* Set the Port the LiveEvents API is running on (default is `34243`)

Your config should end up looking like this for a locally running toolkit without authentication:

<img src="https://github.com/RCVolus/league-observer-tool/assets/84572334/1b51d382-b1ef-4bec-b243-da0470d48dc7" width="230px">

## A Note on Memory Reading
Since version 5.0.0, the Observer tool implements passive memory reading based on [Farsight](https://github.com/floh22/native-farsight-module). Riot has previously stated passive memory reading is allowed, although this policy might change at any time without warning. Currently, memory reading while spectating should not cause you issues. Make sure you turn off the observer tool when playing games. Use at your own risk.

Since memory offsets change with every patch and need to be updated, memory reading will not work immediately after game updates. Farsight has a [guide](https://github.com/floh22/native-farsight-module) on updating offsets yourself.

## Setting up game configs
The observer tool can set up the game configs automatically. Note that this **will overwrite your keybinds/configs** with default values!
If you want to set up the config yourself, refer to the steps below.

If your config settings do not match, there will be a popup asking you about setting up the configs everytime the observer tool is launched. You can safely ignore this if you are setting up your configs manually with different settings.

### Compatibility with LeagueBroadcast
LeagueBroadcast uses more LiveEvents than the observer tool, so the conflicting configs set by LB / the obs tool will cause the settings popup to show. You should be fine completely skipping these setup steps and ignore the popup if you use LeagueBroadcast; the settings made there should cover everything the observer tool needs.

### Setting up Replay API
For time controls, the Replay API is used (similar to what LeagueDirector does) and needs to be configured locally:
In `game.cfg` (located in `[install path]\Riot Games\League of Legends\Config`), add this value under `[General]`:
```ini
EnableReplayApi=1
```
If there is already a value present, make sure its set to 1; if not just add it to the bottom of the list under `[General]`

### Setting up LiveEvents API
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
