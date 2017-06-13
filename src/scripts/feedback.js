import { BEM } from './dom';

export default class Feedback extends BEM {
  constructor(node) {
    super('feedback', node);

    this.$name = this.elem('name');
    this.$message = this.elem('message');
    this.$mailTo = this.elem('mailto');

    node.onsubmit = (e) => {
      e.preventDefault();

      this.$mailTo.href = `mailto:info@nszu.gov.ua?subject=Зворотній зв’язок від ${this.$name.value}&body=${this.$message.value}`;
      this.$mailTo.click();
      return false;
    }
  }
}