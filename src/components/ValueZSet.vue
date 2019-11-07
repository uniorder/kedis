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
            <th>Score</th>
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
            <td @dblclick="showError">{{ item.value }}</td>
            <td>
              <a
                href="javascript:;"
                class="text-warning"
                @click="deleteItem(item.key)"
                >Delete</a
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="form-row mt-3">
      <div class="col">
        <input
          v-model="item"
          type="text"
          class="form-control"
          placeholder="Field"
        />
      </div>
      <div class="col">
        <input
          v-model="score"
          type="text"
          class="form-control"
          placeholder="Score"
        />
      </div>

      <div class="col">
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
export default class ValueZSet extends Vue {
  public $refs!: {
    keyInfoPanel: KeyInfoPanel;
  };
  private key: string = "";
  private server?: RedisServer;
  private dbIndex?: number;
  private filter: string = "";
  private items: any[] = [];

  private item: string = "";
  private score: string = "";

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
      RedisStore.zscan(this.server, this.dbIndex, this.key, f).then(value => {
        this.items = value;
        if (this.server && this.dbIndex !== undefined && this.key) {
          this.$refs.keyInfoPanel.showInfo(this.server, this.dbIndex, this.key);
        }
      });
    }
  }

  private deleteItem(item: string): void {
    if (this.server && this.dbIndex !== undefined && this.key) {
      RedisStore.zrem(this.server, this.dbIndex, this.key, item).then(() => {
        this.loadData();
      });
    }
  }

  private newItem(): void {
    if (
      this.server &&
      this.dbIndex !== undefined &&
      this.key &&
      this.item &&
      this.score
    ) {
      RedisStore.zadd(
        this.server,
        this.dbIndex,
        this.key,
        this.item,
        this.score
      ).then(() => {
        this.items.push({
          key: this.item,
          value: this.score
        });
        this.item = "";
        this.score = "";
      });
    }
  }

  private showInput(item: any, event: any): void {
    const text = $(event.target);
    const input = $(event.target.nextSibling);
    this.oldField = item.key;
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
      this.inlineItem.key
    ) {
      RedisStore.zrename(
        this.server,
        this.dbIndex,
        this.key,
        this.oldField,
        this.inlineItem.key,
        this.inlineItem.value
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

  private showError(): void {
    this.$bvToast.toast("You can not edit zset's score.", {
      title: `Error`,
      toaster: "b-toaster-top-right",
      variant: "danger",
      appendToast: true
    });
    return;
  }
}
</script>