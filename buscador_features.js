import * as cheerio from 'cheerio'
import axios from 'axios'
import fs from 'fs'

export function load_html(html){
    return cheerio.load(html)
}

export async function get_html_on(url){
    try {
        const response = await axios.get(url);
        const data = response.data
        return data;
    }
    catch(error){
        console.log(error)
    }
}

// implementar um get_html mas nos arquivos e não na url, para as funções de pontuação
export function get_html_off(file_path){
    const document =  fs.readFileSync(file_path)
    return load_html(document)
}

export async function download_html(html){
    const document_name = set_document_name(html)
    const path = './paginas/'
    fs.writeFileSync(path + `${document_name}.html`, html)
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

export function write_in_json(object, json_path){
    const jsonString = JSON.stringify(object);

    // Escrever a string JSON em um arquivo
    fs.writeFile(json_path, jsonString, 'utf8', (err) => {
    if (err) {
        console.error('Erro ao escrever arquivo:', err);
        return;
    }
    });
}

export function read_json(file_path) {
    try {
        const data = fs.readFileSync(file_path, 'utf8');
        
        // verifica se o conteudo lido não está vazio
        if(data.length > 0){
            const hashtable = JSON.parse(data);
            return hashtable;
        } else {
            // se estiver vazio, retorne uma hashtable vazia
            const hashtable = {}
            return hashtable
        }
    } catch (error) {
        throw error; // Lançar o erro para ser tratado pelo código que chamou a função
    }
}