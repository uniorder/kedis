<template>
  <div id="bottom" class="bt" style="height:150px;">
    <b-card no-body style="height:100%">
      <b-tabs card v-model="tabIndex" style="height:100%;">
        <!-- Render Tabs, supply a unique `key` to each tab -->
        <b-tab v-for="server in tabs" class="p-0" :key="server.name">
          <template v-slot:title>
            {{ server.name }} database {{ server.selectedIndex || 0 }} <a href="javascript:;" @click="closeTab(server)" style="margin-left:10px;"><i class="fa fa-times text-danger"/></a
          ></template>
          <div class="console-panel" :id="'server-console-' + server.name" @click="focus(server)">
            <div style="overflow:hidden;" v-for="(commandLine, index) in server.commandLines" v-bind:Key="index">
              <div class="pull-left console-panel-info">
                <span v-if="commandLine.type === 'command'">{{ server.host }}:{{ server.port }} &gt;</span>
                <span v-if="commandLine.type === 'result' || commandLine.type === 'resultText' || commandLine.type === 'error'">&lt;</span>
              </div>
              <div class="pull-left console-panel-result" :class="getClass(commandLine)">
                <span v-if="commandLine.type === 'command'" class="text-success">{{ commandLine.text }}</span>
                <span v-if="commandLine.type === 'error'" class="text-danger">{{ commandLine.text }}</span>
                <span v-if="commandLine.type === 'result'" class="text-warning">{{ commandLine.text }}</span>
                <span v-if="commandLine.type === 'resultText'"
                  ><pre class="text-warning">{{ commandLine.text }}</pre></span
                >
              </div>
            </div>
            <div>
              <div class="pull-left console-panel-info">{{ server.host }}:{{ server.port }} - {{ server.selectedIndex || 0 }} &gt;</div>
              <div class="pull-left console-panel-result bl-bold-primary">
                <input :id="'server-console-input-' + server.name" v-model="command" type="text" class="console-input text-primary" @keyup="sendCommand(server, $event)" />
              </div>
            </div>
          </div>
        </b-tab>

        <!-- New Tab Button (Using tabs-end slot) -->
        <!-- <template v-slot:tabs-end>
          <b-nav-item @click.prevent="newTab" href="#"><b>+</b></b-nav-item>
        </template> -->

        <!-- Render this if no tabs -->
        <template v-slot:empty>
          <div class="text-center text-muted">
            There are no open consoles<br />
            Click a redis server to open a new console.
          </div>
        </template>
      </b-tabs>
    </b-card>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"
import RedisServer from "../models/RedisServer"
import RedisStore from "@/utils/RedisStore"
import $ from "jquery"

/**
 * @since 2019-11-16 14:36:35
 * @version 2.0
 * @author Kehaw
 */
@Component
export default class Console extends Vue {
  public $refs!: {
    command: any
  }
  private tabs: any[] = []

  private tabIndex: number = 1

  private command: string = ""

  private currentServer: any

  public active(server: RedisServer): void {
    this.currentServer = server

    for (let i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i].name === server.name) {
        this.tabIndex = i
        return
      }
    }
    this.tabs.push(server)
    this.tabIndex = this.tabs.length
  }

  public updated() {
    if (this.currentServer) {
      const scrollTarget = $("#server-console-" + this.currentServer.name)
      if (scrollTarget) {
        scrollTarget.animate(
          {
            scrollTop: scrollTarget.prop("scrollHeight")
          },
          "fast"
        )
      }

      this.focus(this.currentServer)
    }
  }

  public changeIndex(data: any): void {
    for (const tab of this.tabs) {
      if (tab.name === data.server.name) {
        Vue.set(tab, "selectedIndex", data.index)
        break
      }
    }
  }

  private closeTab(tab: any) {
    for (let i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i].name === tab.name) {
        this.tabs.splice(i, 1)
      }
    }
  }

  private sendCommand(server: any, event: KeyboardEvent): void {
    if (event.code === "Enter") {
      if (this.command.trim() === "clear") {
        server.commandLines = []
        this.command = ""
        return
      }
      const args: any[] = this.command.match(/\S+/g) || []
      const command = args[0]
      args.splice(0, 1)
      this.pushToCommandLine(server, {
        type: "command",
        text: this.command
      })
      RedisStore.runCommand(server, command, args, server.selectedIndex || 0)
        .then(result => {
          if (result instanceof Array) {
            for (const item of result) {
              this.pushToCommandLine(server, {
                type: "result",
                text: item
              })
            }
          } else if (result instanceof Object) {
            for (const prop in result) {
              if (prop) {
                this.pushToCommandLine(server, {
                  type: "result",
                  text: prop + ":" + result[prop]
                })
              }
            }
          } else {
            this.pushToCommandLine(server, {
              type: "resultText",
              text: result
            })
          }
          this.currentServer = server
          this.command = ""
        })
        .catch(error => {
          this.pushToCommandLine(server, {
            type: "error",
            text: error.toString().split("\r\n")[0]
          })
          this.command = ""
        })
    }
  }

  private pushToCommandLine(server: any, commandLine: any): void {
    if (!server.commandLines) {
      server.commandLines = []
    }
    if (server.commandLines.length > 1000) {
      server.commandLines.pop()
    }
    server.commandLines.push(commandLine)
  }

  private focus(server: any): void {
    $("#server-console-input-" + server.name).focus()
  }

  private getClass(commandLine: any) {
    if (commandLine.type === "command") {
      return "bl-bold-success"
    } else if (commandLine.type === "result" || commandLine.type === "resultText") {
      return "bl-bold-warning"
    } else if (commandLine.type === "error") {
      return "bl-bold-danger"
    }
  }
}
</script>

<style>
.tab-content {
  height: calc(100% - 21px) !important;
}
.tab-pane {
  height: 100%;
}
</style>
