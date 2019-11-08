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
    <div style="width:400px; margin:0 auto;" v-show="this.type === 'default'">
      <div class="row mt-3">
        <div class="col-1"></div>
        <div class="col-10">
          <div class="card post-list">
            <div class="avatar">
              <img :src="repoData.owner.avatar_url" alt="Kehaw" width="126" />
              <h3>👨‍💻Ke Haw 🇨🇳👨‍👩‍👧‍👦</h3>
              <small>风吹云散去，夜色好观星</small>
            </div>
            <div class="social">
              <a
                href="javascript:;"
                @click="openBrowser('https://twitter.com/Kehaw2')"
                class="text-success"
              >
                <i class="fab fa-twitter-square"></i> &nbsp;&nbsp;
                <span>@Kehaw2</span>
              </a>
              <a
                href="javascript:;"
                @click="openBrowser('https://github.com/uniorder')"
                class="text-warning"
              >
                <i class="fab fa-github-square"></i> &nbsp;&nbsp;
                <span>Uniorder</span>
              </a>
              <a
                href="javascript:;"
                @click="openBrowser('http://www.kehaw.com')"
                class="text-info"
              >
                <i class="fa fa-home"></i> &nbsp;&nbsp;
                <span>Kehaw.com</span>
              </a>
            </div>
            <div class="description border-top">
              <div class="row">
                <div class="col-4" style="text-align:center;">
                  <img src="@/assets/redis.png" style="width:100%;" />
                  <a
                    href="javascript:;"
                    style="font-size:18px;"
                    @click="openBrowser(repoData.html_url)"
                    >{{ repoData.name }}</a
                  >
                </div>
                <div class="col-8">
                  <p>{{ repoData.description }}</p>
                  <p>{{ repoData.license.key }}</p>
                  <button
                    class="btn btn-sm btn-success"
                    @click="
                      openBrowser(
                        'https://github.com/uniorder/kedis/stargazers'
                      )
                    "
                  >
                    <i class="fa fa-star"></i>
                    {{ repoData.stargazers_count }} stars
                  </button>
                  <button
                    class="btn btn-sm btn-primary"
                    @click="openBrowser(repoData.forks_url)"
                  >
                    <i class="fa fa-code-branch"></i> {{ repoData.forks }} forks
                  </button>
                </div>
              </div>
            </div>
            <div class="description border-top">
              <h3 style="text-align:center">Donate via:</h3>
              <div class="row">
                <div class="col" style="text-align: center;">
                  <img src="@/assets/wx.png" style="width: 100%;" />
                  <p></p>
                  <h3>Wechat</h3>
                </div>
                <div class="col" style="text-align: center;">
                  <img src="@/assets/zfb.png" style="width: 100%;" />
                  <p></p>
                  <h3>Alipay</h3>
                </div>
              </div>
            </div>
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
import axios from "axios";

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
  private repoData: any = {};
  private commits: any[] = [];
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

  public created() {
    let time = new Date().getTime();
    time -= 10 * 24 * 60 * 60 * 1000;

    let since = new Date(time);
    axios
      .get("https://api.github.com/repos/uniorder/kedis")
      .then((response: any) => {
        this.repoData = response.data;
      });

    axios
      .get(
        "https://api.github.com/repos/uniorder/kedis/commits?since=" +
          since.toISOString()
      )
      .then(response => {
        this.commits = response.data;
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