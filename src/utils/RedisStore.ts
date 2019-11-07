import RedisServer from "@/models/RedisServer"
import IORedis, { RedisOptions, Redis } from "ioredis"
import SSH2 from "ssh2"
import Net, { Socket, Server, AddressInfo } from "net"
import KeyInfo from "@/models/KeyInfo"

export default class RedisStore {
  public static async createKey(server: RedisServer, dbIndex: number, key: string, value: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex) // result 0
          .set(key, value) // result 1
          .exec()
          .then(result => {
            resolve(result)
          })
          .catch(err => {
            reject(err)
          })
      })
    })
  }

  public static async exists(server: RedisServer, dbIndex: number, key: string): Promise<any> {
    return new Promise<string>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex) // result 0
          .exists(key) // result 1
          .exec()
          .then(result => {
            resolve(result[1][1])
          })
          .catch(err => {
            reject(err)
          })
      })
    })
  }

  public static async move(server: RedisServer, dbIndex: number, key: string, toIndex: number): Promise<any> {
    return new Promise<string>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex) // result 0
          .move(key, toIndex + "")
          .exec()
          .then(result => {
            resolve(result[1][1])
          })
          .catch(err => {
            reject(err)
          })
      })
    })
  }

  public static async del(server: RedisServer, dbIndex: number, key: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex) // result 0
          .del(key) // result 1
          .exec()
          .then(result => {
            resolve(result)
          })
          .catch(err => {
            reject(err)
          })
      })
    })
  }

  public static async rename(server: RedisServer, dbIndex: number, oldKey: string, newKey: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex) // result 0
          .rename(oldKey, newKey) // result 1
          .exec()
          .then(result => {
            resolve(result)
          })
          .catch(err => {
            reject(err)
          })
      })
    })
  }

  public static async expire(server: RedisServer, dbIndex: number, key: string, seconds: number): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex) // result 0
          .expire(key, seconds) // result 1
          .exec()
          .then(result => {
            resolve(result)
          })
          .catch(err => {
            reject(err)
          })
      })
    })
  }

  public static async persist(server: RedisServer, dbIndex: number, key: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex) // result 0
          .persist(key) // result 1
          .exec()
          .then(result => {
            resolve(result)
          })
          .catch(err => {
            reject(err)
          })
      })
    })
  }

  public static async dbsize(server: RedisServer, dbIndex: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.create(server)
        .then(() => {
          this.redis
            .multi()
            .select(dbIndex) // result 0
            .dbsize() // result 1
            .exec()
            .then(result => {
              if (result[1][0]) {
                reject(result[1][0])
              } else {
                resolve(result[1][1])
              }
            })
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  public static async databases(server: RedisServer): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.create(server)
        .then(() => {
          this.redis.config("get", "databases").then((result: string[]) => {
            const databaseCount: number = (result[1] as unknown) as number
            resolve(databaseCount)
          })
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  public static async keys(server: RedisServer, dbIndex: number, filter: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.create(server)
        .then(() => {
          if (filter !== "*") {
            filter = "*" + filter + "*"
          }
          this.redis
            .multi()
            .select(dbIndex) // result 0
            .keys(filter) // result 1
            .exec()
            .then(result => {
              if (result[1][0]) {
                reject(result[1][0])
              } else {
                resolve(result[1][1])
              }
            })
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  public static async scanKeys(server: RedisServer, dbIndex: number, cursor: number, filter: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.create(server)
        .then(() => {
          if (filter !== "*") {
            filter = "*" + filter + "*"
          }
          this.redis
            .multi()
            .select(dbIndex)
            .scan(cursor, "count", 1000, "match", filter)
            .exec()
            .then(result => {
              if (result[0][0]) {
                reject(result[0][0])
              } else if (result[1][0]) {
                reject(result[1][0])
              } else {
                resolve(result[1][1][1])
              }
            })
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  public static async info(server: RedisServer): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (server.info.CPU) {
        resolve()
      } else {
        this.create(server).then(() => {
          this.redis.info((err, result) => {
            if (err) {
              reject(err)
              return
            }

            const infors = result.split("# ")
            out: for (const str of infors) {
              if (str === "") {
                continue out
              }

              const info = str.split("\r\n")
              server.info[info[0]] = {}
              inner: for (let j = 1; j < info.length; j++) {
                if (info[j] === "") {
                  continue inner
                }
                const detail = info[j].split(":")
                server.info[info[0]][detail[0]] = detail[1]
              }
            }

            resolve()
          })
        })
      }
    })
  }

  public static async keyInfo(server: RedisServer, dbIndex: number, key: string): Promise<KeyInfo> {
    return new Promise<KeyInfo>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .type(key)
          .ttl(key)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[1][0])
            } else if (result[2][0]) {
              reject(result[2][0])
            } else {
              const keyInfo: KeyInfo = new KeyInfo()
              keyInfo.type = result[1][1]
              keyInfo.ttl = result[2][1]
              resolve(keyInfo)
            }
          })
      })
    })
  }

  public static async type(server: RedisServer, dbIndex: number, key: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .type(key)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[1][0])
            } else {
              resolve(result[1][1])
            }
          })
      })
    })
  }

  public static async get(server: RedisServer, dbIndex: number, key: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .get(key)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve(result[1][1])
            }
          })
      })
    })
  }
  public static async set(server: RedisServer, dbIndex: number, key: string, value: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .set(key, value)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve()
            }
          })
      })
    })
  }

  public static async hscan(server: RedisServer, dbIndex: number, key: string, filter: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .hscan(key, 0, "count", 1000, "match", filter)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              const arr: any[] = []
              for (let i = 0; i < result[1][1][1].length; i += 2) {
                arr.push({
                  key: result[1][1][1][i],
                  value: result[1][1][1][i + 1]
                })
              }
              resolve(arr)
            }
          })
      })
    })
  }

  public static async hset(server: RedisServer, dbIndex: number, key: string, hk: string, hv: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .hset(key, hk, hv)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve()
            }
          })
      })
    })
  }

  public static async hsetnx(server: RedisServer, dbIndex: number, key: string, hk: string, hv: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .hsetnx(key, hk, hv)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve()
            }
          })
      })
    })
  }

  public static async hdel(server: RedisServer, dbIndex: number, key: string, hk: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .hdel(key, hk)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve()
            }
          })
      })
    })
  }

  public static async sscan(server: RedisServer, dbIndex: number, key: string, filter: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .sscan(key, 0, "count", 1000, "match", filter)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve(result[1][1][1])
            }
          })
      })
    })
  }

  public static async srem(server: RedisServer, dbIndex: number, key: string, item: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .srem(key, item)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve()
            }
          })
      })
    })
  }

  public static async sadd(server: RedisServer, dbIndex: number, key: string, item: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .sadd(key, item)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve()
            }
          })
      })
    })
  }

  public static async srename(server: RedisServer, dbIndex: number, key: string, oldField: string, newField: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .srem(key, oldField)
          .sadd(key, newField)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve()
            }
          })
      })
    })
  }

  public static async zrename(server: RedisServer, dbIndex: number, key: string, oldField: string, newField: string, score: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .zrem(key, oldField)
          .zadd(key, score, newField)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve()
            }
          })
      })
    })
  }

  public static async zscan(server: RedisServer, dbIndex: number, key: string, filter: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .zscan(key, 0, "count", 1000, "match", filter)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              const arr: any[] = []
              for (let i = 0; i < result[1][1][1].length; i += 2) {
                arr.push({
                  key: result[1][1][1][i],
                  value: result[1][1][1][i + 1]
                })
              }
              resolve(arr)
            }
          })
      })
    })
  }

  public static async zadd(server: RedisServer, dbIndex: number, key: string, item: string, score: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .zadd(key, score, item)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve()
            }
          })
      })
    })
  }

  public static async zrem(server: RedisServer, dbIndex: number, key: string, item: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .zrem(key, item)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve()
            }
          })
      })
    })
  }

  public static async lrange(server: RedisServer, dbIndex: number, key: string, start: number, end: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .lrange(key, start, end)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve(result[1][1])
            }
          })
      })
    })
  }

  public static async lrem(server: RedisServer, dbIndex: number, key: string, index: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .lset(key, index, "__การลบแท็ก__") // make list item a unique world
          .lrem(key, 1, "__การลบแท็ก__") // then delete it;
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve()
            }
          })
      })
    })
  }

  public static async lpush(server: RedisServer, dbIndex: number, key: string, item: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .lpush(key, item)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve()
            }
          })
      })
    })
  }

  public static async rpush(server: RedisServer, dbIndex: number, key: string, item: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .rpush(key, item)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve()
            }
          })
      })
    })
  }

  public static async llen(server: RedisServer, dbIndex: number, key: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .llen(key)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve(result[1][1])
            }
          })
      })
    })
  }

  public static async lset(server: RedisServer, dbIndex: number, key: string, item: string, index: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(server).then(() => {
        this.redis
          .multi()
          .select(dbIndex)
          .lset(key, index, item)
          .exec()
          .then(result => {
            if (result[0][0]) {
              reject(result[0][0])
            } else if (result[1][0]) {
              reject(result[0][0])
            } else {
              resolve()
            }
          })
      })
    })
  }

  private static redis: IORedis.Redis

  private static server?: RedisServer

  private static sshClient?: SSH2.Client

  private static async create(server: RedisServer): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (this.server && this.server.name === server.name) {
        resolve()
        return
      } else {
        this.server = server
        if (this.redis) {
          this.redis.disconnect()
        }
      }

      const me = this

      const options: RedisOptions = {
        port: server.port,
        host: server.host,
        family: server.family,
        password: server.password
      }
      if (server.useSSH) {
        this.sshClient = new SSH2.Client()
        let netServer: Server
        this.sshClient
          .on("ready", () => {
            netServer = Net.createServer((socket: Socket) => {
              if (socket.remoteAddress && socket.remotePort && server.host && server.port) {
                if (me.sshClient) {
                  me.sshClient.forwardOut(socket.remoteAddress, socket.remotePort, server.host, server.port, (err, stream) => {
                    if (err) {
                      socket.end()
                      reject(err)
                    } else {
                      socket.pipe(stream).pipe(socket)
                    }
                  })
                }
              }
            }).listen(0, () => {
              if (netServer != null) {
                const address: any = netServer.address()
                if (address) {
                  me.redis = new IORedis(
                    Object.assign(
                      {},
                      options,
                      {
                        host: "127.0.0.1",
                        port: address.port
                      },
                      {
                        retryStrategy: () => {
                          return false
                        }
                      }
                    )
                  )
                  me.redis.on("error", error => {
                    reject(error)
                  })
                  this.info(server).then(() => {
                    resolve()
                  })
                }
              }
            })
          })
          .on("error", (err: any) => {
            reject(err)
          })
          .connect({
            host: server.sshHost,
            port: server.sshPort,
            username: server.sshUsername,
            privateKey: server.sshKeyPath ? require("fs").readFileSync(server.sshKeyPath) : "",
            password: server.sshPassword,
            passphrase: server.sshPassphrase
          })
      } else {
        this.redis = new IORedis(options)
        this.info(server).then(() => {
          resolve()
        })
      }
    })
  }
}
