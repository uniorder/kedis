<template>
  <b-modal ref="modal" :title="$t('newRedisServerModalTitle')" @ok="handleOk">
    <form>
      <div class="form-group">
        <label for="newRedisServerComment">{{
          $t("newRedisServerModalInputComment")
        }}</label>
        <validation-provider name="comment" rules="required">
          <div slot-scope="{ errors }">
            <input
              v-model="server.name"
              class="form-control"
              id="newRedisServerComment"
              placeholder="Enter server name"
              aria-describedby="newRedisServerCommentHelp"
            />
            <small
              id="newRedisServerCommentHelp"
              class="form-text text-danger"
              v-show="errors[0]"
              >{{ errors[0] }}</small
            >
          </div>
        </validation-provider>
      </div>
      <div class="row">
        <div class="col-8">
          <div class="form-group">
            <label for="newRedisServerHost">{{
              $t("newRedisServerModalInputHost")
            }}</label>
            <validation-provider name="host" rules="required">
              <div slot-scope="{ errors }">
                <input
                  v-model="server.host"
                  class="form-control"
                  id="newRedisServerHost"
                  placeholder="Enter server host"
                  aria-describedby="newRedisServerHostHelp"
                />
                <small
                  id="newRedisServerHostHelp"
                  class="form-text text-danger"
                  v-show="errors[0]"
                  >{{ errors[0] }}</small
                >
              </div>
            </validation-provider>
          </div>
        </div>
        <div class="col-4">
          <div class="form-group">
            <label for="newRedisServerPort">{{
              $t("newRedisServerModalInputPort")
            }}</label>
            <validation-provider name="port" rules="required|integer">
              <div slot-scope="{ errors }">
                <input
                  v-model="server.port"
                  class="form-control"
                  id="newRedisServerPort"
                  placeholder="Enter server port"
                  aria-describedby="newRedisServerPortHelp"
                />
                <small
                  id="newRedisServerPortHelp"
                  class="form-text text-danger"
                  v-show="errors[0]"
                  >{{ errors[0] }}</small
                >
              </div>
            </validation-provider>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-8">
          <div class="form-group">
            <label for="newRedisServerPassword">{{
              $t("newRedisServerModalInputPassword")
            }}</label>
            <input
              v-model="server.password"
              type="password"
              class="form-control"
              id="newRedisServerPassword"
            />
          </div>
        </div>
        <div class="col-4">
          <div class="form-group">
            <label for="newRedisServerIpFamily">{{
              $t("newRedisServerModalInputIpFamily")
            }}</label>
            <select
              id="newRedisServerIpFamily"
              class="custom-select"
              v-model="server.family"
            >
              <option value="4">IPv4</option>
              <option value="6">IPv6</option>
            </select>
          </div>
        </div>
      </div>
      <div class="form-group form-check">
        <input
          type="checkbox"
          class="form-check-input"
          id="newRedisServerUseSSH"
          v-model="server.useSSH"
        />
        <label class="form-check-label" for="newRedisServerUseSSH"
          >Use ssh</label
        >
      </div>
      <div v-show="server.useSSH">
        <div class="row">
          <div class="col-8">
            <div class="form-group">
              <label for="newRedisServerSSHHost">{{
                $t("newRedisServerModalInputSSHHost")
              }}</label>
              <validation-provider name="sshhost" rules="required">
                <div slot-scope="{ errors }">
                  <input
                    v-model="server.sshHost"
                    class="form-control"
                    id="newRedisServerSSHHost"
                    placeholder="Enter ssh server host"
                    aria-describedby="newRedisServerSSHHostHelp"
                  />
                  <small
                    id="newRedisServerSSHHostHelp"
                    class="form-text text-danger"
                    v-show="errors[0]"
                    >{{ errors[0] }}</small
                  >
                </div>
              </validation-provider>
            </div>
          </div>
          <div class="col-4">
            <div class="form-group">
              <label for="newRedisServerSSHPort">{{
                $t("newRedisServerModalInputSSHPort")
              }}</label>
              <validation-provider name="sshport" rules="required|integer">
                <div slot-scope="{ errors }">
                  <input
                    v-model="server.sshPort"
                    class="form-control"
                    id="newRedisServerSSHPort"
                    placeholder="Enter ssh server port"
                    aria-describedby="newRedisServerSSHPortHelp"
                  />
                  <small
                    id="newRedisServerSSHPortHelp"
                    class="form-text text-danger"
                    v-show="errors[0]"
                    >{{ errors[0] }}</small
                  >
                </div>
              </validation-provider>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="form-group">
              <label for="newRedisServerSSHUsername">{{
                $t("newRedisServerModalInputSSHUsername")
              }}</label>
              <validation-provider name="sshusername" rules="required">
                <div slot-scope="{ errors }">
                  <input
                    v-model="server.sshUsername"
                    class="form-control"
                    id="newRedisServerSSHUsername"
                    placeholder="Enter ssh server username"
                    aria-describedby="newRedisServerSSHUsernameHelp"
                  />
                  <small
                    id="newRedisServerSSHUsernameHelp"
                    class="form-text text-danger"
                    v-show="errors[0]"
                    >{{ errors[0] }}</small
                  >
                </div>
              </validation-provider>
            </div>
          </div>
          <div class="col">
            <div class="form-group">
              <label for="newRedisServerSSHPassword">{{
                $t("newRedisServerModalInputSSHPassword")
              }}</label>
              <input
                v-model="server.sshPassword"
                type="password"
                class="form-control"
                id="newRedisServerSSHPassword"
                placeholder="Enter ssh server password"
              />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="form-group">
              <label for="newRedisServerSSHKeyPath">{{
                $t("newRedisServerModalInputSSHKeyPath")
              }}</label>
              <b-form-file
                v-model="file"
                placeholder="Choose a key file..."
                drop-placeholder="Drop file here..."
              ></b-form-file>
            </div>
          </div>
          <div class="col">
            <div class="form-group">
              <label for="newRedisServerSSHPassphrase">{{
                $t("newRedisServerModalInputSSHPassphrase")
              }}</label>
              <input
                v-model="server.sshPassphrase"
                type="password"
                class="form-control"
                id="newRedisServerSSHPassphrase"
                placeholder="Enter ssh private key passphrase"
              />
            </div>
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
import { integer } from "vee-validate/dist/rules";
import RedisServer from "@/models/RedisServer";
import Store from "@/utils/Store";
import { ISlTreeNode } from "@/plugins/tree/tree";

extend("required", {
  ...required,
  message: "This field is required"
});

extend("integer", {
  ...integer,
  message: "This field must be integer"
});

@Component({
  components: {
    ValidationProvider
  }
})
export default class NewRedisServerModal extends Vue {
  public $refs!: {
    modal: any;
  };

  private server: RedisServer = new RedisServer();

  private node?: ISlTreeNode<any>;

  private modalType: string = "new";

  private modalTitle: string = "";

  private file: any = [];

  private useSSH: boolean = false;

  public show(node?: ISlTreeNode<any>): void {
    if (node) {
      this.node = node;
      this.modalType = "edit";
      this.modalTitle = this.$t("editRedisServerModalTitle").toString();
      this.server = node.data;
    } else {
      this.modalType = this.$t("newRedisServerModalTitle").toString();
    }
    this.$refs.modal.show();
  }

  public handleOk(): void {
    if (this.server) {
      if (this.file.path) {
        this.server.sshKeyPath = this.file.path;
      }
      if (this.modalType === "new") {
        Store.newServer(this.server);
        this.$emit("created", this.server);
      } else {
        if (this.node) {
          Store.updateServer(this.node.title, this.server);
          this.node.model.title = this.server.name;
          this.node.model.data = this.server;

          this.$emit("updated", this.node);
        }
      }
      this.server = new RedisServer();
    }
  }
}
</script>