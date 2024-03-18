import { ApplicationException } from "./ApplicationException.js"

export class IndexPageException extends ApplicationException {
    constructor(mensagem) {
      super(mensagem);
      this.mensagem = mensagem;
    }
}