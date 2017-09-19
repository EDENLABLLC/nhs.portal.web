import { BEM } from './dom';

export default class Feedback extends BEM {
  constructor(node) {
    super('feedback', node);

    this.$name = this.elem('name');
    this.$message = this.elem('message');
    this.$mailTo = this.elem('mailto');
    this.$theme = this.elem('theme');

    node.onsubmit = (e) => {
      e.preventDefault();

      this.$mailTo.href = `mailto:info@ehealth-ukraine.org?subject=Зворотній зв’язок: ${this.$theme.value}: ${this.$name.value}&body=${this.$message.value}`;
      this.$mailTo.click();
      return false;
    }
  }
}