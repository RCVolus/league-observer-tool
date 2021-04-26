export interface Credentials {
  /**
   * The system port the LCU API is running on
   */
  port: number;
  /**
   * The password for the LCU API
   */
  password: string;
  /**
   * The system process id for the LeagueClientUx process
   */
  pid: number;
  /**
   * Riot Games' self-signed root certificate (contents of .pem). If
   * it is `undefined` then unsafe authentication will be used.
   */
  certificate?: string;
}