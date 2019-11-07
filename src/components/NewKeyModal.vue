<template>
  <b-modal ref="modal" :title="title" @ok="handleOk">
    <form>
      <div class="form-group">
        <label>Key</label>
        <input
          v-model="key"
          class="form-control"
          placeholder="Enter key name"
        />
      </div>
      <div
        class="form-group"
        v-show="
          type === 'string' ||
            type === 'set' ||
            type === 'list' ||
            type === 'zset'
        "
      >
        <label>Value</label>
        <textarea
          v-model="value"
          class="form-control"
          rows="5"
          :placeholder="placeholderTxt"
          style="resize:none;"
          aria-describedby="newKeyModalAreaHelp"
        />
        <small id="newKeyModalAreaHelp" class="form-text"
          >You can add more items for set,list,zset after created, zset default
          score is 1</small
        >
      </div>
      <div class="row" v-show="type === 'hash'">
        <div class="col-8">
          <div class="form-group">
            <label>Field</label>
            <input
              v-model="hash.field"
              class="form-control"
              placeholder="Enter hash field"
            />
          </div>
        </div>
        <div class="col-4">
          <div class="form-group">
            <label for="newRedisServerPort">Value</label>
            <input
              v-model="hash.value"
              class="form-control"
              placeholder="Enter hash value"
            />
          </div>
        </div>
      </div>
    </form>
  </b-modal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ValidationProvider } from "vee-validate";
import { extend } from "vee-validate";
import { required } from "vee-validate/dist/rules";
import RedisStore from "@/utils/RedisStore";
import RedisServer from "../models/RedisServer";
import jsyaml from "js-yaml";

extend("required", {
  ...required,
  message: "This field is required"
});

@Component({
  components: {
    ValidationProvider
  }
})
export default class NewStringModal extends Vue {
  public $refs!: {
    modal: any;
  };

  private server?: RedisServer;

  private key: string = "";
  private value: string = "";

  private dbIndex?: number;
  private type: string = "string";

  private title: string = "New key";

  private placeholderTxt: string = "Enter key value";

  private hash: any = {
    field: "",
    value: ""
  };

  public show(server: RedisServer, dbIndex: number, type: string): void {
    this.server = server;
    this.dbIndex = dbIndex;
    this.$refs.modal.show();
    this.type = type;
  }

  private handleOk(): void {
    // TODO
    if (this.server && this.dbIndex !== undefined && this.key) {
      RedisStore.exists(this.server, this.dbIndex, this.key).then(result => {
        if (result) {
          this.$bvToast.toast(
            "You can not overwite an exists key, please delete first.",
            {
              title: `Error`,
              toaster: "b-toaster-top-right",
              variant: "danger",
              appendToast: true
            }
          );
          return;
        }
        if (this.server && this.dbIndex !== undefined && this.key) {
          if (this.type === "string") {
            this.placeholderTxt = "Enter value, e.g: foo";
            RedisStore.set(
              this.server,
              this.dbIndex,
              this.key,
              this.value
            ).then(() => {
              this.$refs.modal.hide();
              this.key = "";
              this.value = "";
              this.$emit("keyCreated");
            });
          } else if (this.type === "hash") {
            RedisStore.hset(
              this.server,
              this.dbIndex,
              this.key,
              this.hash.field,
              this.hash.value
            ).then(() => {
              this.$refs.modal.hide();
              this.$emit("keyCreated");
            });
          } else if (this.type === "set") {
            RedisStore.sadd(
              this.server,
              this.dbIndex,
              this.key,
              this.value
            ).then(() => {
              this.$refs.modal.hide();
              this.key = "";
              this.value = "";
              this.$emit("keyCreated");
            });
          } else if (this.type === "zset") {
            RedisStore.zadd(
              this.server,
              this.dbIndex,
              this.key,
              this.value,
              "1"
            ).then(() => {
              this.$refs.modal.hide();
              this.key = "";
              this.value = "";
              this.$emit("keyCreated");
            });
          } else if (this.type === "list") {
            RedisStore.lpush(
              this.server,
              this.dbIndex,
              this.key,
              this.value
            ).then(() => {
              this.$refs.modal.hide();
              this.key = "";
              this.value = "";
              this.$emit("keyCreated");
            });
          }
        }
      });
    }
  }
}
</script>