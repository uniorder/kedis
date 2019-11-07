import RedisServer from "../models/RedisServer"
import KeysFilter from "../models/KeysFilter"

export default class Store {
  /**
   *
   */
  public static loadServers(): RedisServer[] {
    let servers: RedisServer[]
    const str = localStorage.getItem("servers")
    if (str) {
      servers = JSON.parse(str)
      return servers
    } else {
      return []
    }
  }

  public static newServer(server: RedisServer): void {
    let serverListStr = localStorage.getItem("servers")
    let servers: RedisServer[] = []
    if (!serverListStr && server) {
      servers.push(server)
      serverListStr = JSON.stringify(servers)
      localStorage.setItem("servers", serverListStr)
    } else if (serverListStr && server) {
      servers = JSON.parse(serverListStr)
      const name = server.name
      // If find a server name exists, return and do nothing.
      let has: boolean = false
      servers.forEach(item => {
        if (item.name === name) {
          has = true
          return
        }
      })
      if (has) {
        return
      }
      servers.push(server)
      localStorage.setItem("servers", JSON.stringify(servers))
    }
  }

  public static updateServer(name: string, server: RedisServer): void {
    const serverListStr = localStorage.getItem("servers")
    let servers: RedisServer[] = []
    const tempArr: RedisServer[] = []
    if (serverListStr) {
      servers = JSON.parse(serverListStr)
      // If find a server name exists, return and do nothing.
      servers.forEach(item => {
        if (item.name === name) {
          item = server
        }
        tempArr.push(item)
      })
      localStorage.setItem("servers", JSON.stringify(tempArr))
    }
  }

  public static removeServer(serverName: string): void {
    const serverListStr = localStorage.getItem("servers")
    if (serverListStr) {
      let servers: RedisServer[] = []
      servers = JSON.parse(serverListStr)
      const newServers: RedisServer[] = []
      servers.forEach(item => {
        if (item.name !== serverName) {
          newServers.push(item)
        }
      })
      const str: string = JSON.stringify(newServers)
      localStorage.setItem("servers", str)

      // clear all db filters
      const tempArr: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const keyName: any = localStorage.key(i)
        if (keyName) {
          const infos: string[] = keyName.split("_")
          if (infos[0] === "filter") {
            if (infos[1] === serverName && infos[2] === "db") {
              tempArr.push(keyName)
            }
          }
        }
      }
      tempArr.forEach(keyName => {
        localStorage.removeItem(keyName)
      })
    }
  }

  public static newKeysFilter(serverName: string, dbIndex: number, filter: string): void {
    const keysFilter: KeysFilter = new KeysFilter(serverName, dbIndex, filter)
    let str: any = localStorage.getItem("filter_" + serverName + "_db_" + dbIndex)

    let keysFilters: KeysFilter[]
    if (str) {
      keysFilters = JSON.parse(str)
    } else {
      keysFilters = []
    }

    keysFilters.forEach(item => {
      if (item.prefix === filter) {
        return
      }
    })

    keysFilters.push(keysFilter)
    str = JSON.stringify(keysFilters)
    localStorage.setItem("filter_" + serverName + "_db_" + dbIndex, str)
  }

  public static getKeysFilter(serverName: string, dbIndex: number): KeysFilter[] {
    const str: any = localStorage.getItem("filter_" + serverName + "_db_" + dbIndex)

    if (str) {
      return JSON.parse(str)
    } else {
      return []
    }
  }

  public static removeKeysFilter(serverName: string, dbIndex: number, prefix: string): void {
    const keysFilters: KeysFilter[] = this.getKeysFilter(serverName, dbIndex)
    const newArr: KeysFilter[] = []

    keysFilters.forEach(item => {
      if (item.prefix !== prefix) {
        newArr.push(item)
      }
    })

    const str: string = JSON.stringify(newArr)
    localStorage.setItem("filter_" + serverName + "_db_" + dbIndex, str)
  }
}
