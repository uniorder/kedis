<template>
  <div class="p-2 full">
    <key-info-panel ref="keyInfoPanel" class="mb-3"> </key-info-panel>
    <div style="height:calc(100% - 250px); overflow-y:auto;" class="border">
      <table class="table table-bordered table-sm thead-float no-border">
        <thead>
          <tr>
            <th style="width:50px;">Index</th>
            <th>Item</th>
            <th style="width:100px;">OPT</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" v-bind:key="item.index">
            <td>{{ item.index }}</td>
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
                @click="deleteItem(item.index)"
                >Delete</a
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="form-row mt-3">
      <div class="col">
        <button
          :disabled="page == 1"
          class="btn btn-block btn-outline-primary"
          @click="pageLoadPre"
        >
          Pre
        </button>
      </div>
      <div class="col" style="text-align:center;">
        <span style="line-height:30px;"
          >Page {{ page }} of {{ totalPage }}</span
        >
      </div>
      <div class="col">
        <button
          :disabled="page == totalPage"
          class="btn btn-block btn-outline-primary"
          @click="pageLoadNext"
        >
          Next
        </button>
      </div>
    </div>
    <div class="form-row mt-3">
      <div class="col-12 mb-3">
        <input
          v-model="field"
          type="text"
          class="form-control"
          placeholder="Field"
        />
      </div>

      <div class="col-4">
        <button class="btn btn-block btn-success" @click="save(true)">
          Push to left
        </button>
      </div>
      <div class="col-4">
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text">Push to</span>
          </div>
          <input
            v-model="index"
            type="text"
            class="form-control"
            placeholder="Index"
          />
          <div class="input-group-append">
            <button class="btn btn-success" type="button" @click="pushTo">
              Push
            </button>
          </div>
        </div>
      </div>
      <div class="col-4">
        <button class="btn btn-block btn-success" @click="save(false)">
          Push to Right
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
  private page: number = 1;
  private totalPage: number = 1;
  private range: number = 100;
  private field: string = "";
  private items: any[] = [];
  private index: number = 0;
  private totalItem: number = 0;

  private oldIndex: number = -1;
  private oldItem: any = {};

  public showValue(server: RedisServer, dbIndex: number, key: string): void {
    this.key = key;
    this.server = server;
    this.dbIndex = dbIndex;
    this.loadData();
  }

  private pageLoadPre(): void {
    this.page--;
    this.loadData();
  }
  private pageLoadNext(): void {
    this.page++;
    this.loadData();
  }

  private loadData(): void {
    if (this.server && this.dbIndex !== undefined && this.key) {
      const start: number = (this.page - 1) * this.range;
      const end: number = start + this.range - 1;
      RedisStore.lrange(this.server, this.dbIndex, this.key, start, end).then(
        value => {
          this.items = [];
          let i = start;
          for (const it of value) {
            this.items.push({
              field: it,
              index: i++
            });
          }
          if (this.server && this.dbIndex !== undefined && this.key) {
            RedisStore.llen(this.server, this.dbIndex, this.key).then(
              result => {
                this.totalPage = Math.ceil(result / this.range);
                this.totalItem = result;
                if (this.server && this.dbIndex !== undefined && this.key) {
                  this.$refs.keyInfoPanel.showInfo(
                    this.server,
                    this.dbIndex,
                    this.key
                  );
                }
              }
            );
          }
        }
      );
    }
  }

  private deleteItem(index: number): void {
    if (this.server && this.dbIndex !== undefined && this.key) {
      RedisStore.lrem(this.server, this.dbIndex, this.key, index).then(() => {
        this.page = 1;
        this.loadData();
      });
    }
  }

  private pushTo(index?: number, field?: string): void {
    if (this.server && this.dbIndex !== undefined && this.key) {
      if (this.index > this.totalItem) {
        this.$bvToast.toast(
          "Can not push this item to index " +
            this.index +
            " because the last index is " +
            this.totalItem,
          {
            title: `Error`,
            toaster: "b-toaster-top-right",
            variant: "danger",
            appendToast: true
          }
        );
        return;
      }
      RedisStore.lset(
        this.server,
        this.dbIndex,
        this.key,
        field ? field : this.field,
        index ? index : this.index
      ).then(() => {
        this.page = 1;
        this.field = "";
        this.index = 0;
        this.loadData();
      });
    }
  }

  private save(lp: boolean): void {
    if (this.server && this.dbIndex !== undefined && this.key) {
      if (lp) {
        RedisStore.lpush(this.server, this.dbIndex, this.key, this.field).then(
          () => {
            this.page = 1;
            this.field = "";
            this.loadData();
          }
        );
      } else {
        RedisStore.rpush(this.server, this.dbIndex, this.key, this.field).then(
          () => {
            this.page = 1;
            this.field = "";
            this.loadData();
          }
        );
      }
    }
  }

  private showInput(item: any, event: any): void {
    const text = $(event.target);
    const input = $(event.target.nextSibling);
    this.oldItem = item;
    this.toggleVisibal(false, input, text);
  }

  private updateItem(event: any): void {
    const input = $(event.target);
    const text = $(event.target.previousSibling);
    this.pushTo(this.oldItem.index, this.oldItem.field);
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