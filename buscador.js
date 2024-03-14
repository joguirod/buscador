import { question } from "readline-sync"
import { read_json, write_in_json } from "./buscador_features.js"
import { index_page } from "./indexer.js"

async function main(){
    let option = -1

    const indexed_file_path = "indexed.json" 
    let hashtable = read_json(indexed_file_path)

    do{
        try{
            clear_screen()
            console.log(menu())
            option = get_option("> Escolha uma opção: ")
            switch(option){
                case 1:
                    // index
                    clear_screen()
                    const url_base = question("> Insira a url base: \nEx: em https://www.google.com/search?q=santos a url base é https://www.google.com/\n-> ")
                    const url_inicial = question("> Agora a url inicial: \nEx: search?q=santos\n-> ")
                    await index_page(url_inicial, hashtable, url_base)
                    write_in_json(hashtable, indexed_file_path)
                    break
                case 2:
                    // buscar
                    console.log('\tInsira "R" caso queira conferir o ranqueamento das páginas')
                    break
                case 3:
                    // configurações como pontuação
                    break
            }
        } catch (error){
            console.log("Houve o seguinte erro ao executar: " + error.message())
        }
    } while (option !== 0)
}

function menu(){
    return '1 - Indexar páginas' +
    '\n2 - Buscar' +
    '\n3 - Configurações avançadas' +
    '\n0 - Sair do programa'
}

function get_option(label){
    let option = question(label)

    while (isNaN(Number(option))){
        console.log('! Valor inválido !')
        option = question(label)
    }

    return Number(option)
}

function clear_screen(){
    console.clear()
}

main()