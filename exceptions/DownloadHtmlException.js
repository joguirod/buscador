import { ApplicationException } from "./ApplicationException.js"

export class DownloadHtmlException extends ApplicationException {
    constructor(mensagem) {
      super(mensagem);
      this.mensagem = mensagem;
    }
}