<template>
  <div class="main-mid" @contextmenu="showPanelContextMenu($event)">
    <div class="input-group" style="width:100%;">
      <div class="input-group-prepend" v-show="filter !== '*'">
        <span class="input-group-text">{{ filter }}</span>
      </div>
      <input
        type="text"
        class="form-control"
        v-model="appendFilter"
        @keypress="keypress($event)"
        placeholder="Enter filter"
      />
      <div class="input-group-append">
        <button class="btn btn-primary" type="button" @click="doFilter">
          <i class="fa fa-filter" />
        </button>
      </div>
    </div>
    <div style="height:calc(100% - 34px); overflow-y:auto;">
      <table class="table table-sm table-bordered no-border">
        <tr
          v-for="key in keys"
          v-bind:key="key.key"
          @contextmenu="showKeyContextMenu(key.key, $event)"
        >
          <td
            @click="emitKeyClick(key)"
            v-bind:class="{ active: key.selected }"
          >
            {{ key.key }}
          </td>
        </tr>
      </table>
    </div>
    <b-toast
      id="midLargeKeyWarningToast"
      variant="warning"
      :title="$t('midLargeKeyWarningModalTitle')"
      no-auto-hide
    >
      <p>{{ $t("midLargeKeyWarningModalInfo") }}</p>
      <button
        @click="disableMidLargeKeyWarningToast"
        class="btn btn-sm btn-primary"
      >
        <i class="fa fa-check"></i> Don't show this again
      </button>
    </b-toast>
    <new-key-modal @keyCreated="reload" ref="newKeyModal"></new-key-modal>
    <context-menu ref="panelContextMenu" :items="panelMenuItems"></context-menu>
    <context-menu ref="keyContextMenu" :items="keyMenuItems"></context-menu>
    <b-modal ref="deleteConfirmModal" size="sm" title="Confirm" @ok="deleteKey">
      <div class="row">
        <div class="col-3">
          <i class="fa fa-4x text-danger fa-exclamation-triangle"></i>
        </div>
        <div class="col-9">
          You will delete [{{ keyStr }}], please confirm first.
        </div>
      </div>
    </b-modal>
  </div>
</template>
<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import RedisStore from "@/utils/RedisStore";
import ContextMenuComponent from "@/components/ContextMenuComponent.vue";
import ContextMenuItem from "@/models/ContextMenuItem";
import i18n from "@/i18n";
import RedisServer from "@/models/RedisServer";
import { ISlTreeNode } from "@/plugins/tree/tree";
import NewKeyModal from "@/components/NewKeyModal.vue";
import eventBus from "@/utils/EventBus";

/**
 * @version 2.0
 * @since 2019-10-31 22:15:20
 * @author Kehaw
 */
@Component({
  components: {
    NewKeyModal
  }
})
export default class Mid extends Vue {
  public $refs!: {
    panelContextMenu: ContextMenuComponent;
    keyContextMenu: ContextMenuComponent;
    newKeyModal: NewKeyModal;
    deleteConfirmModal: any;
  };

  private keys: any[] = [];

  private keyStr: string = "";

  private lastSelectedKey: any;

  private server?: RedisServer;

  private dbIndex?: number;

  private filter: string = "*";

  private appendFilter: string = "";

  private panelMenuItems: ContextMenuItem[] = [
    new ContextMenuItem(
      "fa fa-plus",
      i18n.t("midNewStringKey").toString(),
      this.showNewKeyModal,
      "string"
    ),
    new ContextMenuItem(
      "fa fa-plus",
      i18n.t("midNewHashKey").toString(),
      this.showNewKeyModal,
      "hash"
    ),
    new ContextMenuItem(
      "fa fa-plus",
      i18n.t("midNewSetKey").toString(),
      this.showNewKeyModal,
      "set"
    ),
    new ContextMenuItem(
      "fa fa-plus",
      i18n.t("midNewZSetKey").toString(),
      this.showNewKeyModal,
      "zset"
    ),
    new ContextMenuItem(
      "fa fa-plus",
      i18n.t("midNewListKey").toString(),
      this.showNewKeyModal,
      "list"
    ),
    new ContextMenuItem(
      "fa fa-sync-alt",
      i18n.t("midRefresh").toString(),
      this.reload
    )
  ];

  private keyMenuItems: ContextMenuItem[] = [
    new ContextMenuItem(
      "fa fa-plus",
      i18n.t("midNewStringKey").toString(),
      this.showNewKeyModal,
      "string"
    ),
    new ContextMenuItem(
      "fa fa-plus",
      i18n.t("midNewHashKey").toString(),
      this.showNewKeyModal,
      "hash"
    ),
    new ContextMenuItem(
      "fa fa-plus",
      i18n.t("midNewSetKey").toString(),
      this.showNewKeyModal,
      "set"
    ),
    new ContextMenuItem(
      "fa fa-plus",
      i18n.t("midNewZSetKey").toString(),
      this.showNewKeyModal,
      "zset"
    ),
    new ContextMenuItem(
      "fa fa-plus",
      i18n.t("midNewListKey").toString(),
      this.showNewKeyModal,
      "list"
    ),
    new ContextMenuItem(
      "fa fa-minus",
      i18n.t("midDeleteKey").toString(),
      this.showDeleteKeyModal
    ),
    new ContextMenuItem(
      "fa fa-sync-alt",
      i18n.t("midRefresh").toString(),
      this.reload
    )
  ];

  public mounted(): void {
    eventBus.$on("deleteKey", () => {
      this.reload();
    });
  }

  public reload(node?: ISlTreeNode<any>, filter?: string) {
    if (filter) {
      this.filter = filter;
    }
    if (node) {
      this.server = node.data.server;
      this.dbIndex = node.data.index;
      if (this.server && this.dbIndex) {
        RedisStore.dbsize(this.server, this.dbIndex).then(dbsize => {
          if (dbsize > 1000) {
            //   this.$refs.largeKeyWarningModal.show();
            const disabled = localStorage.getItem(
              "disable_toast_midLargeKeyWarningToast"
            );
            if (!disabled) {
              this.$bvToast.show("midLargeKeyWarningToast");
            }
          }
        });
      }
    }

    if (this.server && this.dbIndex !== undefined) {
      RedisStore.scanKeys(this.server, this.dbIndex, 0, this.filter).then(
        (result: string[]) => {
          this.buildKeys(result);
          this.$emit("reload");
        }
      );
    }
  }

  private showPanelContextMenu(event: MouseEvent) {
    this.$refs.panelContextMenu.show("", event);
  }

  private showKeyContextMenu(key: string, event: MouseEvent) {
    this.$refs.keyContextMenu.show(key, event);
    event.stopPropagation();
  }

  private doFilter(): void {
    let tempFilter: string = "";
    if (this.filter === "*") {
      tempFilter = this.appendFilter;
    } else {
      tempFilter = this.filter + this.appendFilter;
    }
    if (this.server && this.dbIndex !== undefined) {
      RedisStore.keys(this.server, this.dbIndex, tempFilter).then(
        (result: string[]) => {
          this.buildKeys(result);
          this.$emit("reload");
        }
      );
    }
  }

  private buildKeys(result: string[]): void {
    this.keys = [];
    for (const k of result) {
      this.keys.push({
        selected: false,
        key: k
      });
    }
  }

  private showDeleteKeyModal(data: any): void {
    this.keyStr = data;
    this.$refs.deleteConfirmModal.show();
  }

  private deleteKey(): void {
    if (this.server && this.dbIndex !== undefined) {
      RedisStore.del(this.server, this.dbIndex, this.keyStr).then(() => {
        this.reload();
      });
    }
  }

  private disableMidLargeKeyWarningToast(): void {
    localStorage.setItem("disable_toast_midLargeKeyWarningToast", "true");
    this.$bvToast.hide("midLargeKeyWarningToast");
  }

  private emitKeyClick(key: any): void {
    if (this.lastSelectedKey) {
      this.lastSelectedKey.selected = false;
    }
    key.selected = true;
    this.lastSelectedKey = key;
    this.$emit("keyClick", this.server, this.dbIndex, key.key);
  }

  private keypress(event: KeyboardEvent): void {
    if (event.code === "Enter") {
      this.doFilter();
    }
  }

  private showNewKeyModal(data: any, type: string): void {
    if (this.server && this.dbIndex !== undefined) {
      this.$refs.newKeyModal.show(this.server, this.dbIndex, type);
    }
  }
}
</script>