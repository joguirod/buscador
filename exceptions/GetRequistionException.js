import { ApplicationException } from "./ApplicationException.js"

export class GetRequistionException extends ApplicationException {
    constructor(mensagem) {
      super(mensagem);
      this.mensagem = mensagem;
    }
}