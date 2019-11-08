<template>
  <div id="app" style="position: relative;">
    <div style="height:calc(100% - 30px)">
      <left
        id="left"
        ref="left"
        @change="treeChangeHandler"
        @serverChange="showServerInfo"
      ></left>
      <mid
        id="mid"
        ref="mid"
        @keyClick="showKeyValue"
        @reload="keysReload"
      ></mid>
      <right id="right" ref="right"></right>
    </div>
    <foot-bar ref="footBar"></foot-bar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Left from "@/views/Left.vue";
import Right from "@/views/Right.vue";
import Mid from "@/views/Mid.vue";
import FootBar from "@/views/FooterBar.vue";
import ResizeManager from "@/utils/ResizeManager";
import { ISlTreeNode } from "./plugins/tree/tree";
import RedisServer from "./models/RedisServer";
import { app } from "electron";

@Component({
  components: {
    Left,
    Right,
    Mid,
    FootBar
  },
  mounted() {
    const manager: ResizeManager = new ResizeManager();
    manager.resize();
  },
  created() {
    let lang: string = window.process.env.LANG || "";
    if (lang === "zh_CN.UTF-8") {
      lang = "zh_CN";
    }
    this.$i18n.locale = lang;
  }
})
export default class App extends Vue {
  public $refs!: {
    left: Left;
    right: Right;
    mid: Mid;
    footBar: FootBar;
  };

  public getEnvLocale(env: any) {
    env = env || process.env;

    return env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
  }

  private treeChangeHandler(node: ISlTreeNode<any>, filter: string): void {
    this.$refs.mid.reload(node, filter);
  }

  private showServerInfo(node: ISlTreeNode<any>): void {
    this.$refs.footBar.showServerInfo(node.data);
  }

  private showKeyValue(
    server: RedisServer,
    dbIndex: number,
    key: string
  ): void {
    this.$refs.right.showValue(server, dbIndex, key);
  }

  private keysReload(): void {
    this.$refs.right.hideAll();
  }
}
</script>
