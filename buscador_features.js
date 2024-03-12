import * as cheerio from 'cheerio'
import axios from 'axios'
import fs from 'fs'
import {Pilha} from "./pilha.js"

let pilha = new Pilha([])

function load_html(html){
    return cheerio.load(html)
}

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
    const $ = load_html(html)
    const title = $('title').text().toLowerCase()
    let document_name = title.split(" ")
    if(document_name.length > 1){
        document_name = document_name.join("_")
    }
    return document_name
}

export async function index_page(url, hashtable, urlBase){
    if(verify_already_indexed(url, hashtable)){
        hashtable[url].push(pilha.top())
        return;
    }
    hashtable[url] = []
    if(pilha.size() > 0){
        hashtable[url].push(pilha.top())
    }
    pilha.push(url)
    const document = await get_html(urlBase + url)
    const links = get_links(document)
    for(let link of links){
        await index_page(link, hashtable, urlBase)
    }
    pilha.pop()

}

function verify_already_indexed(url, ht){
    return ht.hasOwnProperty(url)
}

function get_links(document){
    const $ = load_html(document)
    const links = []
        
    $('a').each((index, element) => {
        const href = $(element).attr('href');
        // desconsiderando link vazio e anchor link(link que deve apontar para parte superior da página)
        if (href && href.trim() !== '' && href !== '#') {
            links.push(href);
        }
    });

    return links    
}

export function has_autoreference(link, hashtable){
    for(const url of hashtable[link]){
        if(url === link) return true;
    }
    return false
}

export function quantity_of_especific_word(html_document, words){
    const $ = load_html(html_document)
    const text_content = $('body').text().toLowerCase()

    const word_frequency = {};
    for (const word of words) {
        const regex = new RegExp(word, 'gi'); // 'g' para corresponder globalmente e 'i' para fazer a busca insensível a maiúsculas e minúsculas
        const matches = text_content.match(regex); // encontrando todas as ocorrências do termo na página

        word_frequency[word] = matches.length; // armazenando a frequência do termo
    }

    return word_frequency
}

