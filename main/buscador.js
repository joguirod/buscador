import { question } from "readline-sync"
import { index_page } from "../indexer.js"
import { ApplicationException } from "../exceptions/ApplicationException.js"
import { ranker, show_pages, ranking_to_show } from "../features/ranqueador_features.js"
import { sortPages, get_number, get_option, clear_screen,
press_anykey, get_word, write_in_json, read_json } from "../utils/utils.js"

async function main(){
    let option = -1

    const indexed_file_path = "../indexed.json" 
    let hashtable = read_json(indexed_file_path)
    const points_file_path = "../pontuacao.json"
    let points_table = read_json(points_file_path)

    do{
        try{
            clear_screen()
            console.log(menu())
            option = get_option()
            clear_screen()
            switch(option){
                case 1:
                    // index
                    clear_screen()
                    const url_base = question("> Insira a url base: \nEx: em https://www.google.com/search?q=santos a url base é https://www.google.com/\n-> ").trim()
                    const url_inicial = question("> Agora a url inicial: \nEx: search?q=santos\n-> ").trim()
                    try{
                        await index_page(url_inicial, hashtable, url_base)
                    } catch(error){
                        console.log("(!) Ocorreu um erro durante a indexação, mesmo assim algumas páginas poderam ser indexadas.")
                    }
                    await write_in_json(hashtable, indexed_file_path)
                    console.log("°_° Indexação concluída!")
                    press_anykey()
                    break
                case 2:
                    // buscar
                    const words = []
                    console.log("> Nesta seção você escreve as palavras que deseja buscar xD\n")
    
                    let word = get_word()
                    while(word !== 'N'){
                        words.push(word)
                        console.log('\tInsira "N" caso NÃO queira mais escrever palavras')
                        word = get_word()
                    }
    
                    const pages_rank = ranker(words)
                    const sorted_pages = sortPages(pages_rank)  

                    print_pages_must_show(sorted_pages)
    
                    // P de pular
                    const print_ranking_option = question('\nInsira "P" caso queira conferir o ranqueamento das páginas, do contrário aperte <Enter>\n=> ')
                    if(print_ranking_option === "P"){
                        show_ranking(sorted_pages)
                        press_anykey()
                    }
                    break
                case 3:
                    const config_options = "|===============================|\n" +
                        "| 1 - Ver como está a pontuação |\n" +
                        "| 2 - Alterar a pontuação       |\n" +
                        "|===============================|\n"
    
                    console.log(config_options)
                    const config_choosen_option = get_option()
    
                    clear_screen()
                    if(config_choosen_option === 1){
                        show_points_to_customize(points_table)
                        press_anykey()
                    } else if (config_choosen_option === 2){
                        console.log("> Nesta seção você poderá customizar a pontuação do ranqueamento :D\n")
                        press_anykey()
                        clear_screen()
                        show_points_to_customize(points_table)
                        let continue_q = ""
                        do {
                            let choosen = get_number("> Agora escolha qual deseja alterar (Ex: para autoridade, digite 1)\n-> ")
                            let value = get_number("> Qual o novo valor?\n-> ")
                            points_customization(points_table, choosen, value)
                            console.log("> Pontuação alterada com sucesso :D")
                            continue_q = question('> Caso NÃO queira continuar alterando escreva "N"...\n-> ').toUpperCase().trim()
                            
                        } while(continue_q !== 'N')    
                    } else {
                        console.log("> Opção inválida! Tente novamente...")
                    }
                    write_in_json(points_table, points_file_path)
                    break
                default:
                    if(option !== 0){
                        console.log("> Opção inválida")
                        press_anykey()
                    }
                    break
            }
        } catch(ApplicationException){
            console.log(ApplicationException)
            press_anykey()
        }
    } while (option !== 0)
    console.log("Tchau coração gelado...")
}

function menu(){
    return "|==================================================|\n"
    + "| 1 - Indexar páginas         3 - Configurações    |\n"
    + "| 2 - Buscar                  0 - Sair do programa |\n"
    + "|==================================================|\n"
}

function print_pages_must_show(pages){
    show_pages(pages)
}

function show_ranking(pages_rank){
    ranking_to_show(pages_rank)
}

function points_customization(points_table, choosen, value){
    switch(choosen){
        case 1:
            points_table["autoridade"] = value
            break
        case 2:
            points_table["quantidade_termos"] = value
            break
        case 3:
            points_table["termo_em_title"] = value
            break
        case 4:
            points_table["termo_em_meta"] = value
            break
        case 5:
            points_table["termo_em_h1"] = value
            break
        case 6:
            points_table["termo_em_h2"] = value
            break
        case 7:
            points_table["termo_em_p"] = value
            break
        case 8:
            points_table["termo_em_a"] = value
            break
        case 9:
            points_table["penalizacao_autoreferencia"] = value
            break
        case 10:
            points_table["frescor_conteudo"] = value
            break
        case 11:
            points_table["reducao_frescor"] = value
            break
        default:
            console.log("> Opção inválida")
            break
    }
}

function show_points_to_customize(points_table){
    let i = 1
    for(let key of Object.keys(points_table)){
        const points = points_table[key]

        key = key.split("_")
        if(key.length > 1){
            key = key.join(" ")
        }

        let exit_string = `<${i}> ${key}`
        exit_string += ": " + points + "\n"
        console.log(exit_string)
        i++
    }
}

main()