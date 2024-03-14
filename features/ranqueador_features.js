import {get_html_off} from "./buscador_features.js"

function calculate_page_authority(page, hashtable, points_table){
    const points = hashtable[page].length * points_table["autoridade"]
    return points 
}

export function calculate_page_freshness(page, points_table){
    const $ = get_html_off(page)
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

export function quantity_of_especific_word(page, words, points_table){
    const $ = get_html_off(page)
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

export function has_autoreference(link, hashtable){
    for(const url of hashtable[link]){
        if(url === link) return true;
    }
    return false
}