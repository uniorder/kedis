/**
 * Redis server model
 */
export default class RedisServer {
  public name?: string
  public host?: string
  public port?: number = 6379
  public password?: string
  public family?: number = 4

  public useSSH?: boolean
  public sshHost?: string
  public sshPort?: number = 22
  public sshUsername?: string
  public sshPassword?: string
  public sshKeyPath?: string
  public sshPassphrase?: string

  public info: any = {}

  constructor()

  constructor(name: string, host: string, port: number, password: string, family: number)
  /**
   *
   * @param name Redis server comments
   * @param host Redis server host name or IP address
   * @param port Redis server port
   * @param password Redis server password
   * @param family You can force using IPv6 if you set the family to 'IPv6'. See Node.js net or dns modules on how to use the family type.
   */
  constructor(name?: string, host?: string, port?: number, password?: string, family?: number) {
    this.name = name
    this.host = host
    this.port = port || 6379
    this.password = password
    this.family = family ? family : 4
  }
}
