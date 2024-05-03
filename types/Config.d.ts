export default interface Config {
  'server-ip': string
  'server-port': number
  'server-api-key': string
  'live-events-port': number
  'replay-send-information': boolean
  'window-bounds': Electron.Rectangle
  'league-install-path': string
  'enable-farsight': boolean
}