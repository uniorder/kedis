/**
 * Context menu item model
 * @version 2.0
 * @since 2019-11-01 00:18:57
 * @author Kehaw
 */
export default class ContextMenuItem {
  private _icon: string
  private _name: string
  private _handler: (data: any, arg?: any) => void
  private _arg: any

  /**
   * Constructor for ContextMenuItem
   * @param icon Menu item icon
   * @param name Menu item text
   * @param handler Menu item callback handler
   */
  constructor(icon: string, name: string, handler: (data: any, arg?: any) => void, arg?: any) {
    this._icon = icon
    this._name = name
    this._handler = handler
    if (arg) {
      this._arg = arg
    }
  }

  get icon(): string {
    return this._icon
  }

  get name(): string {
    return this._name
  }

  get arg(): any {
    return this._arg
  }

  get handler(): (data: any) => void {
    return this._handler
  }

  public doHandler(data: any): void {
    this._handler(data, this.arg)
  }
}
