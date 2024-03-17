export class ApplicationException extends Error {
    constructor(mensagem) {
      super(mensagem);
      this.mensagem = mensagem;
    }
}