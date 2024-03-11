import * as cheerio from 'cheerio'
import axios from 'axios'
import fs from 'fs'

export async function get_html(url){
    try {
        const response = await axios.get(url);
        const data = response.data
        const document_name = set_document_name(data)
        fs.writeFileSync(`./paginas/${document_name}.html`, data)

        return data;
    }
    catch(error){
        console.log(error)
    }
}

function set_document_name(html){
    const $ = cheerio.load(html)
    const title = $('title').text().toLowerCase()
    let document_name = title.split(" ")
    if(document_name.length > 1){
        document_name = document_name.join("_")
    }
    return document_name
}


export function verify_self_reference(html_document){
    const $ = html_document
    const title = $('title').text().trim()

    const links = $('ul li a');

    const has_self_reference = links.filter((index, link) => {
        const linkText = $(link).text().trim();
        const titleRegex = new RegExp(title, 'i');
        return titleRegex.test(linkText);
    }).length > 0;

    return has_self_reference
}

export function quantity_of_especific_word(html_document, words){
    const $ = html_document
    const text_content = $('body').text().toLowerCase()

    const word_frequency = {};
    for (const word of words) {
        const regex = new RegExp(word, 'gi'); // 'g' para corresponder globalmente e 'i' para fazer a busca insensível a maiúsculas e minúsculas
        const matches = text_content.match(regex); // Encontrando todas as ocorrências do termo na página

        word_frequency[word] = matches ? matches.length : 0; // Armazenando a frequência do termo
    }

    return word_frequency
}