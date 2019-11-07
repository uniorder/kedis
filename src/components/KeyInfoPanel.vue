<template>
  <div>
    <form>
      <div class="form-row mb-3">
        <div class="col">
          <div class="input-group">
            <input
              v-model="key"
              type="text"
              class="form-control"
              placeholder="Key name"
              @keypress="renamePress($event)"
              aria-describedby="keyInfoRenameButton"
            />
            <div class="input-group-append">
              <button
                class="btn btn-outline-warning"
                type="button"
                id="keyInfoRenameButton"
                @click="rename"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="input-group">
            <input
              v-model="toIndex"
              type="text"
              class="form-control"
              placeholder="Database index"
              aria-describedby="keyInfoMoveButton"
            />
            <div class="input-group-append">
              <button
                class="btn btn-outline-warning"
                type="button"
                id="keyInfoMoveButton"
                @click="move"
              >
                Move
              </button>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="input-group">
            <input
              v-model="keyInfo.ttl"
              type="number"
              class="form-control"
              placeholder="TTL(seconds)"
              @keypress="ttlPress($event)"
              aria-describedby="keyInfoReTTLButton"
            />
            <div class="input-group-append">
              <button
                class="btn btn-outline-warning"
                type="button"
                id="keyInfoReTTLButton"
                @click="exp"
              >
                Set TTL
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="col">
          <button
            class="btn btn-success btn-block"
            type="button"
            @click="persist"
          >
            Persist
          </button>
        </div>
        <div class="col">
          <button
            class="btn btn-block btn-danger"
            type="button"
            @click="showDeleteKeyModal"
          >
            Delete
          </button>
        </div>

        <slot name="custom"> </slot>
      </div>
    </form>
    <b-modal ref="deleteConfirmModal" size="sm" title="Confirm" @ok="deleteKey">
      <div class="row">
        <div class="col-3">
          <i class="fa fa-4x text-danger fa-exclamation-triangle"></i>
        </div>
        <div class="col-9">
          You will delete [{{ key }}], please confirm first.
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import RedisServer from "../models/RedisServer";
import RedisStore from "../utils/RedisStore";
import KeyInfo from "../models/KeyInfo";

import eventBus from "@/utils/EventBus";

@Component
export default class KeyInfoPanel extends Vue {
  public $refs!: {
    deleteConfirmModal: any;
  };
  private keyInfo: KeyInfo = new KeyInfo();

  private key: string = "";
  private oldKey: string = "";
  private server?: RedisServer;
  private dbIndex?: number;
  private toIndex: number = 0;

  public showInfo(server: RedisServer, dbIndex: number, key: string): void {
    this.key = key;
    this.oldKey = key;
    this.server = server;
    this.dbIndex = dbIndex;
    this.toIndex = dbIndex;
    RedisStore.keyInfo(server, dbIndex, key).then(value => {
      this.keyInfo = value;
    });
  }

  private showDeleteKeyModal(): void {
    this.$refs.deleteConfirmModal.show();
  }

  private deleteKey(): void {
    if (this.server && this.dbIndex !== undefined && this.oldKey && this.key) {
      RedisStore.del(this.server, this.dbIndex, this.key).then(() => {
        eventBus.$emit("deleteKey");
      });
    }
  }

  private move(): void {
    if (this.server && this.dbIndex !== undefined) {
      RedisStore.move(this.server, this.dbIndex, this.key, this.toIndex).then(
        () => {
          eventBus.$emit("deleteKey");
        }
      );
    }
  }

  private rename(): void {
    if (this.server && this.dbIndex !== undefined && this.oldKey && this.key) {
      RedisStore.rename(this.server, this.dbIndex, this.oldKey, this.key);
    }
  }

  private renamePress(event: KeyboardEvent): void {
    if (event.code === "Enter") {
      this.rename();
    }
  }

  private ttlPress(event: KeyboardEvent): void {
    if (event.code === "Enter") {
      this.exp();
    }
  }

  private exp(): void {
    if (
      this.server &&
      this.dbIndex !== undefined &&
      this.key &&
      this.keyInfo &&
      this.keyInfo.ttl
    ) {
      if (this.keyInfo.ttl <= 0) {
        this.$bvToast.toast(
          "If you want to set key's ttl less than 1, please use delete instead.",
          {
            title: `Warning`,
            toaster: "b-toaster-top-right",
            variant: "warning",
            appendToast: true
          }
        );
        return;
      }
      RedisStore.expire(this.server, this.dbIndex, this.key, this.keyInfo
        .ttl as number);
    }
  }

  private persist(): void {
    if (this.server && this.dbIndex !== undefined && this.key) {
      RedisStore.persist(this.server, this.dbIndex, this.key).then(() => {
        this.keyInfo.ttl = -1;
      });
    }
  }
}
</script>