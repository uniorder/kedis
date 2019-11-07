<template>
  <div class="p-2 full">
    <key-info-panel ref="keyInfoPanel" class="mb-3">
      <div class="col" slot="custom">
        <button
          slot="custom"
          @click="setValue"
          type="button"
          class="btn btn-block btn-success"
        >
          <i class="fa fa-save"></i> Set value
        </button>
      </div>
    </key-info-panel>

    <textarea
      class="form-control"
      v-model="value"
      style="resize: none; height:calc(100% - 100px)"
    ></textarea>
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
export default class ValueString extends Vue {
  public $refs!: {
    keyInfoPanel: KeyInfoPanel;
  };
  private key: string = "";
  private value: string = "";
  private server?: RedisServer;
  private dbIndex?: number;
  public showValue(server: RedisServer, dbIndex: number, key: string): void {
    this.key = key;
    this.server = server;
    this.dbIndex = dbIndex;
    RedisStore.get(server, dbIndex, key).then(value => {
      this.value = value;

      // This code must be here, cause RedisStore is a static class, only one connection can be running.
      this.$refs.keyInfoPanel.showInfo(server, dbIndex, key);
    });
  }

  private setValue(): void {
    if (this.server && this.dbIndex !== undefined && this.key && this.value) {
      RedisStore.set(this.server, this.dbIndex, this.key, this.value);
    }
  }
}
</script>