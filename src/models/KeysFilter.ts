export default class KeysFilter {
  public serverName?: string
  public dbIndex?: number
  public prefix?: string

  constructor(serverName: string, dbIndex: number, prefix: string)

  /**
   *
   * @param serverName Redis server name
   * @param dbIndex Redis database index
   * @param prefix Redis keys filter prefix
   */
  constructor(serverName?: string, dbIndex?: number, prefix?: string) {
    this.serverName = serverName
    this.dbIndex = dbIndex
    this.prefix = prefix
  }
}
