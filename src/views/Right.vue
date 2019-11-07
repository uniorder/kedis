<template>
  <div class="main-right">
    <value-string
      v-show="this.type === 'string'"
      ref="valueString"
    ></value-string>
    <value-hash v-show="this.type === 'hash'" ref="valueHash"></value-hash>
    <value-set v-show="this.type === 'set'" ref="valueSet"></value-set>
    <value-z-set v-show="this.type === 'zset'" ref="valueZSet"></value-z-set>
    <value-list v-show="this.type === 'list'" ref="valueList"></value-list>
    <div class="container-fluid" v-show="this.type === 'default'">
      <div class="row mt-3">
        <div class="col-1"></div>
        <div class="col-10">
          <div style="text-align: center"></div>
          <hr />
          <h4 style="text-align:center;">
            Kedis is free for everyone, but if you could pay me a little money
            for a cup of coffe, I would be very happy.
          </h4>
          <div class="row">
            <div class="col-sm-3"></div>
            <div class="col-sm-3" style="text-align: center;">
              <h3>Wechat</h3>
              <img src="@/assets/wx.png" style="width: 100%;" />
            </div>
            <div class="col-sm-3" style="text-align: center;">
              <h3>Alipay</h3>
              <img src="@/assets/zfb.png" style="width: 100%;" />
            </div>
            <div class="col-sm-3"></div>
          </div>
        </div>
        <div class="col-1"></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import RedisServer from "@/models/RedisServer";
import RedisStore from "@/utils/RedisStore";
import ValueString from "@/components/ValueString.vue";
import ValueHash from "@/components/ValueHash.vue";
import ValueSet from "@/components/ValueSet.vue";
import ValueZSet from "@/components/ValueZSet.vue";
import ValueList from "@/components/ValueList.vue";

import electron from "electron";

/**
 * @since 2019-10-31 22:15:40
 * @version 2.0
 * @author Kehaw
 */
@Component({
  components: {
    ValueString,
    ValueHash,
    ValueSet,
    ValueZSet,
    ValueList
  }
})
export default class Right extends Vue {
  public $refs!: {
    valueString: ValueString;
    valueHash: ValueHash;
    valueSet: ValueSet;
    valueZSet: ValueZSet;
    valueList: ValueList;
  };
  private type: string = "default";
  public showValue(server: RedisServer, dbIndex: number, key: string): void {
    RedisStore.type(server, dbIndex, key).then(type => {
      this.type = type;
      switch (this.type) {
        case "string":
          this.$refs.valueString.showValue(server, dbIndex, key);
          break;
        case "hash":
          this.$refs.valueHash.showValue(server, dbIndex, key);
          break;
        case "set":
          this.$refs.valueSet.showValue(server, dbIndex, key);
          break;
        case "zset":
          this.$refs.valueZSet.showValue(server, dbIndex, key);
          break;
        case "list":
          this.$refs.valueList.showValue(server, dbIndex, key);
          break;
      }
    });
  }

  public hideAll(): void {
    this.type = "default";
  }
  public openBrowser(url: string): void {
    electron.shell.openExternal(url);
  }
}
</script>