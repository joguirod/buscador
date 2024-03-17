import { ApplicationException } from "./ApplicationException.js"

export class HtmlEmptyException extends ApplicationException {
    constructor(mensagem) {
      super(mensagem);
      this.mensagem = mensagem;
    }
}