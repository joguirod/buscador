import { ApplicationException } from "./ApplicationException.js"

export class NothingToShowException extends ApplicationException {
    constructor(mensagem) {
      super(mensagem);
      this.mensagem = mensagem;
    }
}