<template>
  <div
    class="main-left"
    style="overflow-y:auto;"
    @contextmenu="showPanelContextMenu"
  >
    <tree
      ref="tree"
      v-model="nodes"
      @toggle="loadData"
      @nodeclick="emitNodeClick"
      @nodecontextmenu="showServerContextMenu"
    >
      <template slot="title" slot-scope="{ node }">
        <span class="item-icon">
          <i :class="node.icon"></i>
        </span>
        {{ node.title }}
      </template>
      <template slot="sidebar" slot-scope="{ node }">
        <!-- <span v-if="" class="badge badge-success">Success</span> -->
        <span v-if="node.data.useSSH" class="badge badge-success">SSH</span
        >&nbsp;&nbsp;

        <span v-if="node.data.host && !node.data.useSSH">{{
          node.data.host
        }}</span>
        <span v-if="node.data.useSSH">{{ node.data.sshHost }}</span>
      </template>
    </tree>
    <context-menu
      ref="serverContextMenu"
      :items="serverMenuItems"
    ></context-menu>
    <context-menu ref="dbContextMenu" :items="dbMenuItems"></context-menu>
    <context-menu
      ref="filterContextMenu"
      :items="filterMenuItems"
    ></context-menu>
    <context-menu ref="panelContextMenu" :items="panelMenuItems"></context-menu>
    <new-redis-server-modal
      @created="serverCreated"
      @updated="serverUpdated"
      ref="newRedisServerModal"
    ></new-redis-server-modal>
    <new-keys-filter-modal
      @newKeysFilter="afterNewKeysFilter"
      ref="newKeysFilterModal"
    ></new-keys-filter-modal>
    <b-modal
      ref="deleteConfirmModal"
      size="sm"
      :title="$t('deleteRedisServerConfirmModalTitle').toString()"
      @ok="deleteRedisServer"
    >
      <div class="row">
        <div class="col-3">
          <i class="fa fa-4x text-danger fa-exclamation-triangle"></i>
        </div>
        <div class="col-9">
          {{ $t("deleteRedisServerConfirmModalInfo") }}
        </div>
      </div>
    </b-modal>
    <b-modal
      ref="deleteKeysFilterConfirmModal"
      size="sm"
      :title="$t('deleteKeysFilterConfirmModalTitle').toString()"
      @ok="deleteKeysFilter"
    >
      <div class="row">
        <div class="col-3">
          <i class="fa fa-4x text-danger fa-exclamation-triangle"></i>
        </div>
        <div class="col-9">
          {{ $t("deleteKeysFilterConfirmModalInfo") }}
        </div>
      </div>
    </b-modal>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Model } from "vue-property-decorator";
import ContextMenuComponent from "@/components/ContextMenuComponent.vue";
import ContextMenuItem from "@/models/ContextMenuItem";
import RedisServer from "@/models/RedisServer";
import Tree, { ISlTreeNodeModel, ISlTreeNode } from "@/plugins/tree/tree";
import RedisStore from "@/utils/RedisStore";
import NewRedisServerModal from "@/components/NewRedisServerModal.vue";
import NewKeysFilterModal from "@/components/NewKeysFilterModal.vue";
import i18n from "../i18n";
import Store from "../utils/Store";
import KeysFilter from "../models/KeysFilter";

/**
 * This component is left panel on main container.
 * @version 2.0
 * @since 2019-10-31 22:14:48
 * @author Kehaw
 */
@Component({
  components: {
    NewRedisServerModal,
    NewKeysFilterModal
  }
})
export default class Left extends Vue {
  public $refs!: {
    serverContextMenu: ContextMenuComponent;
    panelContextMenu: ContextMenuComponent;
    dbContextMenu: ContextMenuComponent;
    filterContextMenu: ContextMenuComponent;
    tree: Tree<any>;
    newRedisServerModal: NewRedisServerModal;
    newKeysFilterModal: NewKeysFilterModal;
    deleteConfirmModal: any;
    deleteKeysFilterConfirmModal: any;
  };

  /**
   * When right click server node, show these menu items
   */
  private serverMenuItems: ContextMenuItem[] = [
    new ContextMenuItem(
      "fa fa-plus",
      i18n.t("newRedisConnection").toString(),
      this.showNewServerModal
    ),
    new ContextMenuItem(
      "fa fa-minus",
      i18n.t("deleteRedisConnection").toString(),
      this.showDeleteServerModal
    ),
    new ContextMenuItem(
      "fa fa-cog",
      i18n.t("editRedisConnection").toString(),
      this.showEditServerModal
    ),
    new ContextMenuItem(
      "fa fa-file-export",
      i18n.t("exportServerList").toString(),
      this.showExportModal
    ),
    new ContextMenuItem(
      "fa fa-file-import",
      i18n.t("importServerList").toString(),
      this.showImportModal
    )
  ];

  /**
   * When right click database node, show these menu items
   */
  private dbMenuItems: ContextMenuItem[] = [
    new ContextMenuItem(
      "fa fa-plus",
      i18n.t("newFilterPrefix").toString(),
      this.showNewFilterModal
    ),
    new ContextMenuItem(
      "fa fa-file-export",
      i18n.t("exportServerList").toString(),
      this.showExportModal
    ),
    new ContextMenuItem(
      "fa fa-file-import",
      i18n.t("importServerList").toString(),
      this.showImportModal
    )
  ];

  /**
   * When right click filter node, show these menu items
   */
  private filterMenuItems: ContextMenuItem[] = [
    new ContextMenuItem(
      "fa fa-minus",
      i18n.t("deleteFilterPrefix").toString(),
      this.showDeleteFilterConfirmModal
    ),
    new ContextMenuItem(
      "fa fa-file-export",
      i18n.t("exportServerList").toString(),
      this.showExportModal
    ),
    new ContextMenuItem(
      "fa fa-file-import",
      i18n.t("importServerList").toString(),
      this.showImportModal
    )
  ];

  /**
   * When right click left panel, show these menu items
   */
  private panelMenuItems: ContextMenuItem[] = [
    new ContextMenuItem(
      "fa fa-plus",
      i18n.t("newRedisConnection").toString(),
      this.showNewServerModal
    ),
    new ContextMenuItem(
      "fa fa-file-export",
      i18n.t("exportServerList").toString(),
      this.showExportModal
    ),
    new ContextMenuItem(
      "fa fa-file-import",
      i18n.t("importServerList").toString(),
      this.showImportModal
    )
  ];

  /**
   * All servers
   */
  private servers: RedisServer[] = [];

  /**
   * When delete or update a server info, use this variable to mark it;
   */
  private selectedServer?: RedisServer;

  /**
   * When delete a filter, use this variable to mark it;
   */
  private selectedFilterNode?: ISlTreeNode<any>;

  /**
   * All server nodes
   */
  private nodes: Array<ISlTreeNodeModel<any>> = [];

  private showNewFilterModal(data: any): void {
    this.$refs.newKeysFilterModal.show(data);
  }

  private showNewServerModal(data: any): void {
    this.$refs.newRedisServerModal.show();
  }

  private showDeleteServerModal(data: any): void {
    this.selectedServer = data.data;
    this.$refs.deleteConfirmModal.show();
  }

  private deleteRedisServer(): void {
    if (this.selectedServer && this.selectedServer.name) {
      const tempNodes: Array<ISlTreeNodeModel<any>> = [];
      const serverName = this.selectedServer.name;
      this.nodes.forEach(item => {
        if (item.title !== serverName) {
          tempNodes.push(item);
        }
      });
      this.nodes = tempNodes;
      Store.removeServer(serverName);
    }
  }

  private showDeleteFilterConfirmModal(data: any): void {
    this.$refs.deleteKeysFilterConfirmModal.show();
    this.selectedFilterNode = data;
  }

  private deleteKeysFilter(): void {
    if (this.selectedFilterNode) {
      const selectedFilterNode: ISlTreeNode<any> = this.selectedFilterNode;
      const path: any[] = this.selectedFilterNode.path;
      path.pop();
      const dbNode: ISlTreeNode<any> = this.$refs.tree.getNode(path);
      const filters: Array<ISlTreeNode<any>> = dbNode.model.children;
      const tempChildren: Array<ISlTreeNode<any>> = [];
      filters.forEach(filterNode => {
        if (filterNode.title !== selectedFilterNode.title) {
          tempChildren.push(filterNode);
        }
      });
      dbNode.model.children = tempChildren;
      Store.removeKeysFilter(
        this.selectedFilterNode.data.server.name,
        this.selectedFilterNode.data.index,
        this.selectedFilterNode.title
      );
    }
  }

  private showEditServerModal(data: ISlTreeNode<any>): void {
    // TODO
    this.$refs.newRedisServerModal.show(data);
  }

  private showExportModal(data: any): void {
    // TODO
  }

  private showImportModal(data: any): void {
    // TODO
  }

  private showServerContextMenu(
    node: ISlTreeNode<any>,
    event: MouseEvent
  ): void {
    if (node.model.type === "server") {
      this.$refs.serverContextMenu.show(node, event);
    } else if (node.model.type === "db") {
      this.$refs.dbContextMenu.show(node, event);
    } else if (node.model.type === "filter") {
      this.$refs.filterContextMenu.show(node, event);
    }

    event.stopPropagation();
  }

  private showPanelContextMenu(event: MouseEvent): void {
    this.$refs.panelContextMenu.show("", event);
  }

  private created() {
    this.servers = Store.loadServers();
    this.buildTreeNodes();
  }

  private serverCreated(server: RedisServer): void {
    this.servers.push(server);

    const node: ISlTreeNodeModel<any> = {
      title: server.name ? server.name : "",
      icon: "fa fa-home",
      type: "server",
      isExpanded: false,
      isDraggable: false,
      data: server,
      children: []
    };
    this.nodes.push(node);
  }

  private serverUpdated(node: ISlTreeNode<any>): void {
    const oldNode: ISlTreeNode<any> = this.$refs.tree.getNode(node.path);

    oldNode.model.title = node.model.title;
    oldNode.model.data = node.model.data;
    this.loadData(oldNode, true);
  }

  private buildTreeNodes(): void {
    this.servers.forEach(item => {
      const node: ISlTreeNodeModel<any> = {
        title: item.name ? item.name : "",
        icon: "fa fa-home",
        type: "server",
        isExpanded: false,
        isDraggable: false,
        data: item,
        children: []
      };
      this.nodes.push(node);
    });
  }

  private loadData(node: ISlTreeNode<any>, forceLoad?: boolean): void {
    const n: ISlTreeNode<any> = this.$refs.tree.getNode(node.path);
    if (n.model.type === "server") {
      if (n.model.children.length === 0 || forceLoad) {
        n.model.children = [];
        RedisStore.databases(node.data).then(size => {
          for (let i = 0; i < size; i++) {
            const keysFilters: KeysFilter[] = Store.getKeysFilter(
              node.data.name,
              i
            );

            const newChildren: any[] = [];

            keysFilters.forEach(item => {
              newChildren.push({
                title: item.prefix,
                type: "filter",
                icon: "fa fa-heart",
                isExpanded: false,
                isLeaf: true,
                isDraggable: false,
                data: {
                  server: node.model.data,
                  index: i
                }
              });
            });

            n.model.children.push({
              title: "DB " + i,
              type: "db",
              icon: "fa fa-database",
              isExpanded: false,
              isDraggable: false,
              data: {
                server: node.model.data,
                index: i
              },
              children: newChildren
            });
          }

        //   n.model.children.forEach((item: any) => {
        //     RedisStore.dbsize(item.data.server, item.data.index).then(
        //       dbsize => {
        //         item.title = item.title += " (" + dbsize + ")";
        //         item.data.dbsize = dbsize;
        //       }
        //     );
        //   });

          RedisStore.info(node.data).then(() => {
            this.$emit("serverChange", node);
          });
        });
      }
    }
  }

  private afterNewKeysFilter(data: ISlTreeNode<any>, prefix: string): void {
    const node: ISlTreeNode<any> = this.$refs.tree.getNode(data.path);
    node.model.children.push({
      title: prefix,
      type: "filter",
      icon: "fa fa-heart",
      isExpanded: false,
      isDraggable: false,
      isLeaf: true,
      data: {
        server: data.data.server,
        index: data.data.index
      }
    });
  }

  private emitNodeClick(node: ISlTreeNode<any>): void {
    if (node.model.type === "db") {
      this.$emit("change", node, "*");
    } else if (node.model.type === "filter") {
      this.$emit("change", node, node.title);
    } else if (node.model.type === "server") {
      if (!node.data.info.CPU) {
        RedisStore.info(node.data).then(() => {
          this.$emit("serverChange", node);
        });
      }
    }
  }
}
</script>