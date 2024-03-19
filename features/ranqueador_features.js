import { get_html_off } from "./buscador_features.js"
import { NothingToShowException } from "../exceptions/NothingToShowException.js"
import { get_files_from, sum_page_points, get_page_file_by, get_file_name, get_url_by, read_json, load_html, get_html_title } from "../utils/utils.js"
import chalk from 'chalk'
import * as fs from 'fs'

const points_table = read_json("../pontuacao.json")

function calculate_page_authority(file_url, hashtable){
    let points = hashtable[file_url].length * points_table["autoridade"]
    /*
    se há autoreferência, remova pontuação, uma vez que a autoridade refere-se
    a links recebidos de OUTRAS páginas
    */
    if(has_autoreference(file_url)){
        points -= points_table["autoridade"]
    }
    return points 
}

function calculate_page_freshness_points(page_file){
    const document = get_html_off(page_file)
    const $ = load_html(document)

    let publication_date = ""
    /*
    percorre todas as tags <p> e se ela começar com "data", splita por ":" e pega o resto
    nas páginas fornecidas "Data: 12/09/2012", selecionaria " 12/09/2012" e em seguida limparia o espaço em branco
    */
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
    const points_to_receive = Math.abs(current_year - publication_year) * points_table["reducao_frescor"] * -1

    // se a data da página não estiver em uma tag <p> e a pontuação calculada acabe ficando NaN, retorne 0
    return isNaN(points_to_receive) ? 0 : points_to_receive
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

function calculate_autoreference_points(file_url){
    let total_points = 0
    // verifica se há auto referência, se tiver adiciona a pontuação negativa
    if(has_autoreference(file_url)){
        total_points = points_table["penalizacao_autoreferencia"] * -1
    }
    return total_points
}

export function has_autoreference(file_url){
    const hashtable = read_json("../indexed.json")

    // percorre as urls que referenciam a url do arquivo, caso sejam iguais, true
    for(const url of hashtable[file_url]){
        if(url === file_url) return true
    }
    
    return false
}

function calculate_points_for_words_in_tags(words, page_file){
    const page_html = get_html_off(page_file)

    // tags a serem vistas
    const tags = ['meta', 'title', 'h1', 'h2', 'p', 'a']
    let points = 0

    // para cada palavras das pesquisadas
    for(const word of words){
        // para cada tag, verifica se há ocorrencia da palavra
        for(const tag of tags){
            points += occurrencesInTag(tag, word, page_html)
        }
    }

    return points
}

function occurrencesInTag(tag, word, page_html) {
    const $ = load_html(page_html)
    let points = 0

    // regex para selecionar exatamente a palavra desejada
    const regex = new RegExp("\\b" + word + "\\b", "gi");
    
    $(tag).each((index, element) => {

        // se a tag for meta, verifique o atributo content
        if(tag === "meta"){
            const content = $(element).attr('content')
            if(content){
                // Cria uma expressão regular para encontrar a palavra
                const matches = content.match(regex); // encontrando todas as ocorrências do termo na página
        
                const quantity_frequency = matches ? matches.length : 0
                points += quantity_frequency * points_table["termo_em_meta"]
            }
        // se não, apenas veja se está presente no texto da tag
        } else {
            const text_content = $(element).text()
            // adiciona em matches as aparições
            const matches = text_content.match(regex);

            // se há aparições, devolva quantas, do contrário devolva 0
            const quantity_frequency = matches ? matches.length : 0
            // vê a quantidade de pontos dada para a tag especifica
            const key_in_points_table = `termo_em_${tag}`
            // incrementa aos pontos a multiplicação da frequencia com os pontos dados para cada aparição
            points += quantity_frequency * points_table[key_in_points_table]
        }
    })

    return points;
}

function calculate_page_points(page_file, file_name, hashtable, words){
    const file_url = get_url_by(file_name)

    // a pontuação é colocada em um objeto para percorrer posteriormente
    const points = {}
    points["autoridade"] = calculate_page_authority(file_url, hashtable)

    points["frescor_conteudo"] = calculate_page_freshness_points(page_file)

    points["autoreferencia"] = calculate_autoreference_points(file_url)

    points["frequencia"] = calculate_quantity_of_especific_word_points(page_file, words)

    // se a frequência das palavras for igual a 0, não deve exibir, do contrário deve ser exibido
    // pode exibir = 1; não pode exibir = 0
    points["frequencia"] === 0 ? points["deve_exibir"] = 0 : points["deve_exibir"] = 1

    points["uso_em_tags"] = calculate_points_for_words_in_tags(words, page_file)

    points["pontos_totais"] = sum_page_points(points)

    return points
}

export function ranker(words){
    // adicionará o nome de cada página e como valor a pontuação da respectiva página
    let pages = {}
    const files = get_files_from("../paginas")
    const hashtable = read_json("../indexed.json")
    
    // para cada arquivo, calcule sua pontuação e adicione ao objeto
    for(const file of files){
        const file_name = get_file_name(file)
        pages[file_name] = calculate_page_points(file, file_name, hashtable, words)
    }

    return pages
}

export function ranking_to_show(pages){
    // pega todo o texto das tags <title> das páginas
    const titles = get_html_titles_by_page_files_table(pages)
    let i = 0
    for(const key of Object.keys(pages)){
        // imprime o title e o "link" da página
        console.log(`  ${chalk.underline(titles[i])}: ${key}\n`)
        for(const point of Object.keys(pages[key])){
            // imprime a pontuação de cada página
            console.log(`\t¬ ${point}: ${pages[key][point]}\n` )
        }
        i++
    }
}

function select_pages_to_show(pages){
    const pages_to_show = {}

    // percorre as páginas e seleciona aquelas que possuem o atributo deve_exibir = 1, deve ser exibida
    for(const page of Object.keys(pages)){
        if(pages[page]["deve_exibir"] === 1){
            pages_to_show[page] = pages[page]
        }
    }

    return pages_to_show
}

export function show_pages(pages){  
    const pages_to_show = select_pages_to_show(pages)

    const titles_to_show = get_html_titles_by_page_files_table(pages_to_show)

    let i = 0
    for(const key of Object.keys(pages_to_show)){
        console.log(`\n  ${chalk.underline(titles_to_show[i])}: ${key}`)
        i++
    }
}

// percorre todas as páginas e pega o texto do title de cada uma, adicionando em um array e retornando-o
function get_html_titles_by_page_files_table(page_files){
    const titles = []
    for(const key of Object.keys(page_files)){
        const page_file = get_page_file_by(key)
        const title = get_html_title_by_page_file(page_file)
        titles.push(title)
    }
    return titles
}

// pega o texto do title de uma página, deixando a primeira letra maiúscula, por questão estética.
function get_html_title_by_page_file(page_file){
    const page_html = get_html_off(page_file)
    let title = get_html_title(page_html)
    const first_letter_in_upper_case = title[0]
    title = first_letter_in_upper_case + title.slice(1)
    return title
}