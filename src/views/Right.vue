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
    <div class="container mt-4" v-show="this.type === 'default'">
      <div class="row">
        <div class="col-1"></div>
        <div class="col-10">
          <div class="card">
            <div class="row">
              <div class="col-6">
                <div class="avatar">
                  <img src="@/assets/avatar.jpeg" alt="Kehaw" width="126" />
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
                  <p>
                    <a
                      href="javascript:;"
                      style="font-size:18px;"
                      @click="openBrowser(repoData.html_url)"
                      >{{ repoData.name }}: </a
                    >{{ repoData.description }}
                  </p>
                  <p>{{ repoData.license ? repoData.license.key : "" }}</p>
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
                    <i class="fa fa-code-branch"></i>
                    {{ repoData.forks }} forks
                  </button>
                </div>
              </div>
              <div class="col-6 bl">
                <div class="description">
                  <h3 style="text-align:center">Donate via:</h3>
                  <div class="row">
                    <div class="col-sm-12 col-md-6" style="text-align: center;">
                      <img src="@/assets/wx.png" style="width: 100%;" />
                      <p></p>
                      <h4>Wechat</h4>
                    </div>
                    <div class="col-sm-12 col-md-6" style="text-align: center;">
                      <img src="@/assets/zfb.png" style="width: 100%;" />
                      <p></p>
                      <h4>Alipay</h4>
                    </div>
                    <div class="col-12" style="text-align:center;">
                      <a
                        href="javascript:;"
                        @click="
                          openBrowser(
                            'https://www.paypal.me/kehaw9818?utm_source=unp&utm_medium=email&utm_campaign=PPC000654&utm_unptid=75d157a2-01c2-11ea-ba33-b875c0e5d5b1&ppid=PPC000654&cnac=C2&rsta=zh_C2&cust=5XY36QD32GNQJ&unptid=75d157a2-01c2-11ea-ba33-b875c0e5d5b1&calc=13d9420a54f49&unp_tpcid=ppme-social-business-profile-created&page=main:email:PPC000654:::&pgrp=main:email&e=cl&mchn=em&s=ci&mail=sys'
                          )
                        "
                      >
                        <img src="@/assets/paypal.png" style="width:100%;" />
                      </a>
                      <p></p>
                      <h4>Paypal</h4>
                    </div>
                  </div>
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
  private avatar?: string;
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
        this.avatar = this.repoData.owner.avatar_url;
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