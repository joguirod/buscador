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

function sumPagePoints(pages) {
    const pageSum = {};

    // Calculando a soma dos pontos para cada página, excluindo a chave "deve_exibir"
    for (const page in pages) {
        const points = Object.entries(pages[page]).reduce((acc, [key, value]) => {
            if (key !== 'deve_exibir') {
                return acc + value;
            }
            return acc;
        }, 0);
        pageSum[page] = points;
    }

    return pageSum;
}

export function rankPages(pages) {
    const pageSum = sumPagePoints(pages);

    // Ordenando as páginas com base na soma dos pontos
    const sortedPages = Object.keys(pageSum).sort((a, b) => pageSum[b] - pageSum[a]);

    // Criando um objeto ordenado com as páginas e a soma dos pontos
    const rankedPages = {};
    for (const page of sortedPages) {
        rankedPages[page] = pageSum[page];
    }

    return rankedPages;
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