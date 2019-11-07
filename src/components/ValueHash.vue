<template>
  <div class="p-2 full">
    <key-info-panel ref="keyInfoPanel" class="mb-3">
      <div class="input-group col" slot="custom" style="width:100%;">
        <input
          type="text"
          class="form-control"
          v-model="filter"
          placeholder="Enter filter, e.g *pattern*"
        />
        <div class="input-group-append">
          <button class="btn btn-primary" type="button" @click="loadValues">
            <i class="fa fa-filter" />
          </button>
        </div>
      </div>
    </key-info-panel>
    <div style="height:calc(100% - 150px); overflow-y:auto;" class="border">
      <table class="table table-bordered table-sm thead-float no-border">
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
            <th style="width:100px;">OPT</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" v-bind:key="index">
            <td class="p-0">
              <div class="p-1" @dblclick="showInput(item, $event)">
                {{ item.key }}
              </div>
              <input
                v-model="item.key"
                @blur="updateItem($event)"
                class="form-control form-control-sm border-0 d-none"
              />
            </td>
            <td class="p-0">
              <div class="p-1" @dblclick="showInput(item, $event)">
                {{ item.value }}
              </div>
              <input
                v-model="item.value"
                @blur="updateItem($event)"
                class="form-control form-control-sm border-0 d-none"
              />
            </td>
            <td>
              <a href="javascript:;" class="text-warning" @click="deleteItem(item)">Delete</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="form-row mt-3">
      <div class="col">
        <input
          v-model="field"
          type="text"
          class="form-control"
          placeholder="Field"
        />
      </div>
      <div class="col">
        <input
          v-model="value"
          type="text"
          class="form-control"
          placeholder="Value"
        />
      </div>
      <div class="col">
        <button class="btn btn-block btn-success" @click="newItem">
          Create
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import RedisServer from "../models/RedisServer";
import RedisStore from "../utils/RedisStore";
import KeyInfoPanel from "./KeyInfoPanel.vue";

@Component({
  components: {
    KeyInfoPanel
  }
})
export default class ValueHash extends Vue {
  public $refs!: {
    keyInfoPanel: KeyInfoPanel;
  };
  private items: any[] = [];
  private item?: any;

  private server?: RedisServer;
  private dbIndex?: number;
  private key?: string;
  private oldHkey?: string;
  private filter: string = "";

  private field: string = "";
  private value: string = "";

  public showValue(server: RedisServer, dbIndex: number, key: string): void {
    this.items = [];
    this.server = server;
    this.dbIndex = dbIndex;
    this.key = key;
    this.loadValues();
  }
  private loadValues(): void {
    if (this.server && this.dbIndex !== undefined && this.key) {
      let f = "*";
      if (this.filter) {
        f = this.filter;
      }
      RedisStore.hscan(this.server, this.dbIndex, this.key, f).then(value => {
        this.items = value;
        // This code must be here, cause RedisStore is a static class, only one connection can be running.
        if (this.server && this.dbIndex !== undefined && this.key) {
          this.$refs.keyInfoPanel.showInfo(this.server, this.dbIndex, this.key);
        }
      });
    }
  }

  private toggleVisibal(flip: boolean, input: any, text: any): void {
    if (flip) {
      input.removeClass("d-block");
      text.removeClass("d-none");

      input.addClass("d-none");
      text.addClass("d-block");
    } else {
      text.removeClass("d-block");
      text.addClass("d-none");

      input.removeClass("d-none");
      input.addClass("d-block");
      input.focus();
    }
  }

  private updateItem(event: any): void {
    const input = $(event.target);
    const text = $(event.target.previousSibling);
    this.toggleVisibal(true, input, text);
    if (this.server && this.dbIndex !== undefined && this.key) {
      RedisStore.hset(
        this.server,
        this.dbIndex,
        this.key,
        this.item.key,
        this.item.value
      )
        .then(() => {
          if (this.item.key === this.oldHkey) {
            return;
          }
          if (
            this.server &&
            this.dbIndex !== undefined &&
            this.key &&
            this.oldHkey
          ) {
            RedisStore.hdel(this.server, this.dbIndex, this.key, this.oldHkey);
          }
        })
        .catch(error => {
          // TODO
        });
    }
  }

  private showInput(item: any, event: any): void {
    this.item = item;
    this.oldHkey = item.key;
    const text = $(event.target);
    const input = $(event.target.nextSibling);
    this.toggleVisibal(false, input, text);
  }

  private newItem(): void {
    if (this.server && this.dbIndex !== undefined && this.key) {
      RedisStore.hsetnx(
        this.server,
        this.dbIndex,
        this.key,
        this.field,
        this.value
      ).then(() => {
        this.items.push({
          key: this.field,
          value: this.value
        });
        this.field = "";
        this.value = "";
      });
    }
  }

  private deleteItem(item: any): void {
    if (this.server && this.dbIndex !== undefined && this.key) {
      RedisStore.hdel(this.server, this.dbIndex, this.key, item.key).then(
        () => {
          this.loadValues();
        }
      );
    }
  }
}
</script>