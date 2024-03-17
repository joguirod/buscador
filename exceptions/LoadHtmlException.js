import { ApplicationException } from "./ApplicationException.js"

export class LoadHtmlException extends ApplicationException {
    constructor(mensagem) {
      super(mensagem);
      this.mensagem = mensagem;
    }
}