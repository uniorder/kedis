import $ from "jquery"
import "jqueryui"

export default class ResizeManager {
  private body: JQuery<HTMLElement> = $("body")
  private left: JQuery<HTMLElement> = $("#left")
  private mid: JQuery<HTMLElement> = $("#mid")
  private right: JQuery<HTMLElement> = $("#right")

  private top: JQuery<HTMLElement> = $("#top")
  private bottom: JQuery<HTMLElement> = $("#bottom")

  public resize(): void {
    const bw = this.body.width() || 0
    const lw = this.left.width() || 0
    const rw = this.right.width() || 0

    const bodyHeight = this.body.height() || 0
    const bottomHeight = this.bottom.height() || 0

    const me = this
    if (this.body && this.left && this.right && this.mid && this.top && this.bottom) {
      this.mid.width(bw - lw - rw - 2)
      this.top.height(bodyHeight - bottomHeight - 30)

      $(window).resize(() => {
        const bh = this.body.height() || 0
        const bbh = this.bottom.height() || 0
        me.mid.width(bw - lw - rw - 2)
        me.top.height(bh - bbh - 30)
        this.top.resizable({
          maxHeight: bh - 30
        })
      })

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

      this.top.resizable({
        handles: "s",
        minHeight: 50,
        maxHeight: bodyHeight - 30,
        resize: (event, ui) => {
          const bh = this.body.height()
          if (bh) {
            me.bottom.height(bh - ui.size.height - 30)
          }
        }
      })

      this.body.bind("resize", () => {
        return false
      })
    }
  }
}
