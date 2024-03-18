import {get_html_off, load_html, read_json} from "./buscador_features.js"
import * as fs from 'fs'

const points_table = read_json("C:\\Users\\José Guilherme\\Desktop\\buscador\\pontuacao.json")

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
    const p_tags = $("p")
    let publication_date = ""

    for(const p of p_tags){
        if(p.text().toUpperCase.startsWith("DATA")){
            publication_date = p.split(":")[1].trim()
            break
        }
    }

    const publication_year = Number(publication_date.split('/')[2])
    const current_date = new Date()
    const current_year = current_date.getFullYear()

    // se o ano atual for o mesmo da publicação, retorne a quantidade de pontos para "conteúdo fresco"
    if(current_year === publication_year){
        return points_table["frescor_conteudo"]
    }

    // se não, retorne a diferença de anos multiplicados pela quantidade de pontos a serem reduzidos (valor negativo)
    return Math.abs(current_year - publication_year) * points_table["reducao_frescor"] * -1
}

function calculate_quantity_of_especific_word_points(page_file, words){
    const document = get_html_off(page_file)
    const $ = load_html(document)
    const text_content = $.html()

    const word_frequency = {};
    for (const word of words) {
        const regex = new RegExp(word, 'gi'); // 'g' para corresponder globalmente e 'i' para fazer a busca insensível a maiúsculas e minúsculas
        const matches = text_content.match(regex); // encontrando todas as ocorrências do termo na página

        word_frequency[word] = matches ? matches.length : 0 // armazenando a frequência do termo
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
        total_points = points_table["penalizacao_autoreferencia"] * -1
    }
    return total_points
}


export function has_autoreference(page_file){
    const hashtable = read_json("../indexed.json")

    const file_name = get_file_name(page_file)

    const file_url = get_url_by(file_name)

    for(const url of hashtable[file_url]){
        if(url === file_url) return true
    }
    
    return false
}


function calculate_page_points(page_file, file_name, hashtable, words){
    const file_url = get_url_by(file_name)

    const points = {}
    points["autoridade"] = calculate_page_authority(file_url, hashtable)

    // points["frescor_conteudo"] = calculate_page_freshness_points(page_file)

    // points["quantidade_de_termos"] = calculate_quantity_of_especific_word_points(page_html, words)
    points["autoreferencia"] = calculate_autoreference_points(page_file)
    // adicionar o calculo das tags

    points["frequencia"] = calculate_quantity_of_especific_word_points(page_file, words)

    return points
}

function get_files_from(directory){
    /*
    tenho que percorrer o diretório de páginas, acessar página por página, calcular a pontuação de cada página
    */
    const files = []
    let file_list = fs.readdirSync("C:\\Users\\José Guilherme\\Desktop\\buscador\\paginas")
    for(let i in file_list){
        files.push(directory + '/' + file_list[i])
    }

    return files
    
}

export function ranker(words){
    let pages = {}
    const files = get_files_from("C:\\Users\\José Guilherme\\Desktop\\buscador\\paginas")
    const hashtable = read_json("C:\\Users\\José Guilherme\\Desktop\\buscador\\indexed.json")
    
    for(const file of files){
        const file_name = get_file_name(file)
        pages[file_name] = calculate_page_points(file, file_name, hashtable, words)
    }

    return pages
}

function get_file_name(file){
    let file_name = file.split('/')
    const last_index = file_name.length - 1
    file_name = file_name[last_index]
    return file_name
}

function get_url_by(file_name){
    if(file_name.split("&").length > 1){
        file_name = file_name.split("$").join("/")
    }
    return file_name
}