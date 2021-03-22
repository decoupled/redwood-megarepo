import { memoize, repeat } from "lodash"
import { computed, observable } from "mobx"
export class SpinnerUtil {
  @observable num = 0
  private constructor() {
    setInterval(() => {
      this.num++
      //if (this.num > 3) this.num = 0
    }, 300)
  }
  @computed get dots() {
    const n = this.num % 4
    return repeat(".", n) + repeat(" ", 3 - n) + n
  }
  private spinner_text = "◐◓◑◒"
  private spinner_text_ = "▖▘▝▗"
  @computed get spinner() {
    const n = this.num % this.spinner_text.length
    return this.spinner_text[n]
  }
  private static instance = memoize(() => new SpinnerUtil())
  static dots() {
    return this.instance().dots
  }
  static spinner() {
    return this.instance().spinner
  }
  static num() {
    return this.instance().num
  }
}
