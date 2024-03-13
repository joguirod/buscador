export class Pilha{
    constructor(){
        this.items = []
    }

    push(elemento){
        this.items.push(elemento)
    }

    pop(){
        if(this.items.length === 0){
            throw new Error("A pilha está vazia")
        }
        this.items.pop();
    }

    top() {
        const topo = this.items[this.items.length - 1]
        if(topo){
            return topo 
        }
        return;
    }

    size(){
        return this.items.length
    }

    is_empty(){
        return this.items.length === 0
    }
}