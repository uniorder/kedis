<template>
  <b-modal ref="modal" :title="$t('newRedisFilterModalTitle')" @ok="handleOk">
    <form>
      <div class="form-group">
        <label for="newRedisFilterPrefix">{{
          $t("newRedisFilterModalInput")
        }}</label>
        <validation-provider name="comment" rules="required">
          <div slot-scope="{ errors }">
            <input
              v-model="prefix"
              class="form-control"
              id="newRedisFilterPrefix"
              placeholder="Enter keys prefix"
              aria-describedby="newRedisFilterPrefixHelp"
            />
            <small
              id="newRedisFilterPrefixHelp"
              class="form-text text-danger"
              v-show="errors[0]"
              >{{ errors[0] }}</small
            >
          </div>
        </validation-provider>
      </div>
    </form>
  </b-modal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ValidationProvider } from "vee-validate";
import { extend } from "vee-validate";
import { required } from "vee-validate/dist/rules";
import Store from "../utils/Store";

extend("required", {
  ...required,
  message: "This field is required"
});

@Component({
  components: {
    ValidationProvider
  }
})
export default class NewKeysFilterModal extends Vue {
  public $refs!: {
    modal: any;
  };
  private data?: any;
  private serverName: string = "";
  private dbIndex: number = -1;
  private prefix: string = "";

  public show(data: any): void {
    this.data = data;
    this.serverName = data.model.data.server.name;
    this.dbIndex = data.model.data.index;
    this.$refs.modal.show();
  }

  public handleOk(): void {
    Store.newKeysFilter(this.serverName, this.dbIndex, this.prefix);
    this.$emit("newKeysFilter", this.data, this.prefix);
    this.prefix = "";
    this.dbIndex = -1;
    this.serverName = "";
  }
}
</script>