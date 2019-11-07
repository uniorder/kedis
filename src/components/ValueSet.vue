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
          <button class="btn btn-primary" type="button" @click="loadData">
            <i class="fa fa-filter" />
          </button>
        </div>
      </div>
    </key-info-panel>
    <div style="height:calc(100% - 150px); overflow-y:auto;" class="border">
      <table class="table table-bordered table-sm thead-float no-border">
        <thead>
          <tr>
            <th>Item</th>
            <th style="width:100px;">OPT</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" v-bind:key="index">
            <td class="p-0">
              <div class="p-1" @dblclick="showInput(item, $event)">
                {{ item.field }}
              </div>
              <input
                v-model="item.field"
                @blur="updateItem($event)"
                class="form-control form-control-sm border-0 d-none"
              />
            </td>
            <td>
              <a
                href="javascript:;"
                class="text-warning"
                @click="deleteItem(item)"
                >Delete</a
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="form-row mt-3">
      <div class="col-8">
        <input
          v-model="item.field"
          type="text"
          class="form-control"
          placeholder="Field"
        />
      </div>

      <div class="col-4">
        <button class="btn btn-block btn-success" @click="newItem">
          Add
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
export default class ValueSet extends Vue {
  public $refs!: {
    keyInfoPanel: KeyInfoPanel;
  };
  private key: string = "";
  private server?: RedisServer;
  private dbIndex?: number;
  private filter: string = "";
  private items: any[] = [];

  private item: any = {};

  private inlineItem: any = {};
  private oldField: string = "";

  public showValue(server: RedisServer, dbIndex: number, key: string): void {
    this.key = key;
    this.server = server;
    this.dbIndex = dbIndex;
    this.loadData();
  }

  private loadData(): void {
    if (this.server && this.dbIndex !== undefined && this.key) {
      let f = "*";
      if (this.filter) {
        f = this.filter;
      }
      RedisStore.sscan(this.server, this.dbIndex, this.key, f).then(value => {
        this.items = [];
        for (const v of value) {
          this.items.push({
            field: v
          });
        }
        if (this.server && this.dbIndex !== undefined && this.key) {
          this.$refs.keyInfoPanel.showInfo(this.server, this.dbIndex, this.key);
        }
      });
    }
  }

  private deleteItem(item: any): void {
    if (this.server && this.dbIndex !== undefined && this.key) {
      RedisStore.srem(this.server, this.dbIndex, this.key, item.field).then(
        () => {
          this.loadData();
        }
      );
    }
  }

  private newItem(): void {
    if (this.server && this.dbIndex !== undefined && this.key && this.item) {
      RedisStore.sadd(
        this.server,
        this.dbIndex,
        this.key,
        this.item.field
      ).then(() => {
        this.items.push({
          field: this.item.field
        });
        this.item.field = "";
      });
    }
  }

  private showInput(item: any, event: any): void {
    const text = $(event.target);
    const input = $(event.target.nextSibling);
    this.oldField = item.field;
    this.inlineItem = item;
    this.toggleVisibal(false, input, text);
  }

  private updateItem(event: any): void {
    const input = $(event.target);
    const text = $(event.target.previousSibling);

    if (
      this.server &&
      this.dbIndex !== undefined &&
      this.key &&
      this.inlineItem.field
    ) {
      RedisStore.srename(
        this.server,
        this.dbIndex,
        this.key,
        this.oldField,
        this.inlineItem.field
      ).then(() => {
        this.loadData();
      });
    }
    this.toggleVisibal(true, input, text);
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
}
</script>