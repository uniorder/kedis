import $ from "jquery"
import "jqueryui"

export default class ResizeManager {
  private body: JQuery<HTMLElement> = $("body")
  private left: JQuery<HTMLElement> = $("#left")
  private mid: JQuery<HTMLElement> = $("#mid")
  private right: JQuery<HTMLElement> = $("#right")

  public resize(): void {
    const bw = this.body.width()
    const lw = this.left.width()
    const rw = this.right.width()
    const me = this
    if (this.body && this.left && this.right && this.mid) {
      if (bw && lw && rw) {
        this.mid.width(bw - lw - rw - 2)
        $(window).resize(() => {
          me.mid.width(bw - lw - rw - 2)
        })
      }

      this.left.resizable({
        handles: "e",
        minWidth: 150,
        resize: (event, ui) => {
          const bodyWidth = this.body.width()
          const rightWidth = this.right.width()
          if (bodyWidth && rightWidth) {
            me.mid.width(bodyWidth - ui.size.width - rightWidth - 2)
          }
        }
      })

      this.right.resizable({
        handles: "w",
        minWidth: 150,
        resize: (event, ui) => {
          const bodyWidth = this.body.width()
          const leftWidth = this.left.width()
          if (bodyWidth && leftWidth) {
            me.mid.width(bodyWidth - ui.size.width - leftWidth - 2)
          }
        }
      })

      this.body.bind("resize", () => {
        return false
      })
    }
  }
}
