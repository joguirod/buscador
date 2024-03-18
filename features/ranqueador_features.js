import {get_html_off, get_html_title,load_html, read_json} from "./buscador_features.js"
import { NothingToShowException } from "../exceptions/NothingToShowException.js"
import chalk from 'chalk'
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
    let publication_date = ""

    const p_tags = $("p").each((index, element) => {
        if($(element).text().toLowerCase().startsWith("data")){
            let text = $(element).text().toLowerCase().split(":")
            const last = text.length - 1
            text = text[last].trim()
            publication_date = text
        }
    })

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
        const wrong_regex = new RegExp(word + "\\.html", 'gi')

        const matches = text_content.match(regex); // encontrando todas as ocorrências do termo na página
        
        word_frequency[word] = matches ? matches.length : 0 // armazenando a frequência do termo

        if(text_content.match(wrong_regex)){
            word_frequency[word] -= 1
        }
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

function calculate_points_for_words_in_tags(words, page_file){
    const page_html = get_html_off(page_file)

    const tags = ['meta', 'title', 'h1', 'h2', 'p', 'a']
    let points = 0

    for(const word of words){
        for(const tag of tags){
            points += occurrencesInTag(tag, word, page_html)
        }
    }

    return points
}

function occurrencesInTag(tag, word, page_html) {
    const $ = load_html(page_html)
    
    let points = 0
    const regex = new RegExp("\\b" + word + "\\b", "gi");
    
    $(tag).each((index, element) => {
        if(tag === "meta"){
            const content = $(element).attr('content')
            if(content){
                // Cria uma expressão regular para encontrar a palavra
                const matches = content.match(regex); // encontrando todas as ocorrências do termo na página
        
                const quantity_frequency = matches ? matches.length : 0
                points += quantity_frequency * points_table["termo_em_meta"]
            }
        } else {
            const text_content = $(element).text()
            const matches = text_content.match(regex);

            const quantity_frequency = matches ? matches.length : 0
            const key_in_points_table = `termo_em_${tag}`
            points += quantity_frequency * points_table[key_in_points_table]
        }
    })

    return points;
}

function calculate_page_points(page_file, file_name, hashtable, words){
    const file_url = get_url_by(file_name)

    const points = {}
    points["autoridade"] = calculate_page_authority(file_url, hashtable)

    points["frescor_conteudo"] = calculate_page_freshness_points(page_file)

    points["autoreferencia"] = calculate_autoreference_points(page_file)
    // adicionar o calculo das tags

    points["frequencia"] = calculate_quantity_of_especific_word_points(page_file, words)

    // se a frequência das palavras for igual a 0, não deve exibir, do contrário deve ser exibido
    // pode exibir = 1; não pode exibir = 0
    points["frequencia"] === 0 ? points["deve_exibir"] = 0 : points["deve_exibir"] = 1

    points["uso_em_tags"] = calculate_points_for_words_in_tags(words, page_file)

    points["pontos_totais"] = sum_page_points(points)

    return points
}

function get_files_from(directory){
    /*
    tenho que percorrer o diretório de páginas, acessar página por página, calcular a pontuação de cada página
    */
    const files = []
    let file_list = fs.readdirSync("../paginas")
    for(let i in file_list){
        files.push(directory + '/' + file_list[i])
    }

    return files
    
}

export function ranker(words){
    let pages = {}
    const files = get_files_from("../paginas")
    const hashtable = read_json("../indexed.json")
    
    for(const file of files){
        const file_name = get_file_name(file)
        pages[file_name] = calculate_page_points(file, file_name, hashtable, words)
    }

    return pages
}

export function sum_page_points(points) {
    let total_points = 0
    for(const key of Object.keys(points)){
        if(key !== "deve_exibir" && key !== "pontos_totais"){
            total_points += points[key]
        }
    }
    return total_points
}

export function sortPages(pages) {
    const orderedPages = Object.keys(pages).sort((a, b) => {
        return pages[b]["pontos_totais"] - pages[a]["pontos_totais"];
    });

    const sortedPages = {};
    for (const page of orderedPages) {
        sortedPages[page] = pages[page];
    }

    return sortedPages;
}

export function ranking_to_show(pages){
    const titles = get_html_titles_by_page_files_array(pages)
    let i = 0
    for(const key of Object.keys(pages)){
        console.log(`  ${chalk.underline(titles[i])}: ${key}\n`)
        for(const point of Object.keys(pages[key])){
            console.log(`\t¬ ${point}: ${pages[key][point]}\n` )
        }
        i++
    }
}

function select_pages_to_show(pages){
    const pages_to_show = []

    for(const page of Object.keys(pages)){
        if(pages[page]["deve_exibir"] === 1){
            pages_to_show[page] = pages[page]
        }
    }

    return pages_to_show
}

export function show_pages(pages){  
    const pages_to_show = select_pages_to_show(pages)

    const titles_to_show = get_html_titles_by_page_files_array(pages_to_show)

    for(let i = 0; i < titles_to_show.length; i++){
        console.log(`\n  ${chalk.underline(titles_to_show[i])}`)
    }
}

function get_html_titles_by_page_files_array(page_files){
    const titles = []
    for(const key of Object.keys(page_files)){
        const page_file = get_page_file_by(key)
        const title = get_html_title_by_page_file(page_file)
        titles.push(title)
    }
    return titles
}

function get_html_title_by_page_file(page_file){
    const page_html = get_html_off(page_file)
    let title = get_html_title(page_html)
    const first_letter_in_upper_case = title[0]
    title = first_letter_in_upper_case + title.slice(1)
    return title
}

function get_page_file_by(file_name){
    const files_path = "../paginas"
    const file = files_path + "/" + file_name
    return file    
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