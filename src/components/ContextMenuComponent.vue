<template>
  <ul ref="menu" class="list-group context-menu">
    <li
      v-for="item in items"
      :key="item.name"
      class="list-group-item"
      @click.stop="handler(item)"
    >
      <!-- <font-awesome-icon style="margin-right:7px;" :icon="item.icon"></font-awesome-icon> -->
      <i style="margin-right:7px;" :class="item.icon"></i>
      {{ item.name }}
    </li>
  </ul>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import ContextMenuItem from "@/models/ContextMenuItem";
import $ from "jquery";
@Component
export default class ContextMenuComponent extends Vue {
  public $refs!: {
    menu: HTMLFormElement;
  };

  @Prop({ type: Array, required: true })
  public items!: ContextMenuItem[];

  private data: any;

  public mounted() {
    const me = this;
    $("body").on("mouseup", event => {
      if (event.button === 0 && me.$refs.menu) {
        me.$refs.menu.style.display = "none";
      }
    });
  }

  public show(data: any, event: MouseEvent): void {
    const menuDom: JQuery<HTMLElement> = $(".context-menu");
    menuDom.hide();
    this.data = data;
    const x = event.clientX;
    const y = event.clientY;
    const menu = this.$refs.menu;

    menu.style.display = "block";
    menu.style.left = x + "px";
    menu.style.top = y + "px";

    // 判断menu距离浏览器可视窗口底部距离,以免距离底部太近的时候，会导致menu被遮挡
    const menuHeight = this.items.length * 32; // 不能用scrollHeight,获取到的menu是上一次的menu宽高
    const menuWidth = 150; // 不能用scrollWidth,同理
    const distanceToBottm =
      document.body.clientHeight - menu.offsetTop - menuHeight;
    // 同理判断距离右侧距离
    const distanceToRight =
      document.body.clientWidth - menu.offsetLeft - menuWidth;
    if (distanceToBottm < menuHeight) {
      menu.style.top = y - menuHeight + "px";
    }
    if (distanceToRight < menuWidth) {
      menu.style.top = x - menuWidth + "px";
    }
  }

  public handler(item: ContextMenuItem): void {
    item.doHandler(this.data);
  }

  get itemData(): any {
    return this.data;
  }
}
</script>