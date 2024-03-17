import {get_html_off, load_html, read_json} from "./buscador_features.js"
import * as fs from 'fs'

const points_table = read_json("../pontuacao.json")

function calculate_page_authority(page, hashtable){
    const points = hashtable[page].length * points_table["autoridade"]
    return points 
}

function calculate_page_freshness_points(page_file){
    const document = get_html_off(page_file)
    const $ = load_html(document)
    /*
    pega todo o texto em tags <em>, da split usando : porque Data: 12/03/2024 resulta em " 12/03/2024",
    depois trim para tirar o espaço antes do dia
    */
    const publication_date = $('em').text().split(":")[1].trim()
    const publication_year = Number(publication_date.split('/')[2])
    const current_date = new Date()
    const current_year = current_date.getFullYear()

    // se o ano atual for o mesmo da publicação, retorne a quantidade de pontos para "conteúdo fresco"
    if(current_year === publication_year){
        return points_table["frescor_conteudo"]
    }

    // se não, retorne a diferença de anos multiplicados pela quantidade de pontos a serem reduzidos
    return Math.abs(current_year - publication_year) * points_table["reducao_frescor"]
}

function calculate_quantity_of_especific_word_points(page_file, words){
    const document = get_html_off(page)
    const $ = load_html(document)
    const text_content = $('body').text().toLowerCase()

    const word_frequency = {};
    for (const word of words) {
        const regex = new RegExp(word, 'gi'); // 'g' para corresponder globalmente e 'i' para fazer a busca insensível a maiúsculas e minúsculas
        const matches = text_content.match(regex); // encontrando todas as ocorrências do termo na página

        word_frequency[word] = matches.length; // armazenando a frequência do termo
    }

    let total_points = 0
    for(let key of Object.keys(word_frequency)){
        total_points += word_frequency[key] * points_table['quantidade_termos']
    }

    return total_points
}

function calculate_autoreference_points(page_file){
    let total_points = 0
    if(has_autoreference(page_file)){
        total_points = points_table["penalizacao_autoreferencia"]
    }
    return total_points
}

/*
function has_autoreference(page_file){
    const file_name = get_file_name(page_file)
    const document = get_html_off(page_file)

    const links = get_links(document)
    for(let link of links){
        if(link === file_name){
            return true
        }
    }
    return false
}
*/

function calculate_page_points(page_html, page_file, hashtable){
    const points = points_table
    points["autoridade"] = calculate_page_authority(page_html, hashtable, points_table)
    points["frescor_do_conteudo"] = calculate_page_freshness_points(page_html, points_table)
    points["quantidade_de_termos"] = calculate_quantity_of_especific_word_points(page_html, words, points_table)
    points["autoreferencia"] = calculate_autoreference_points(page_file, points_table)
    // adicionar o calculo das tags
    return points
}

function get_files_from(directory){
    /*
    tenho que percorrer o diretório de páginas, acessar página por página, calcular a pontuação de cada página
    */
    const files = []
    let file_list = fs.readdirSync("../paginas/matrix.html")
    for(let i in file_list){
        files.push(directory + '/' + file_list[i])
    }

    return files
    
}

function ranker(files){
    let pages = {}
    
    for(let file of files){
        const file_name = get_file_name(file)
        pages[file_name] = calculate_page_points()
    }
}

function get_file_name(file){
    let file_name = file.split('/')
    const last_index = file_name.length - 1
    return file_name = file_name[last_index]
}