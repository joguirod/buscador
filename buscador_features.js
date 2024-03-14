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

export function write_in_json(object, json_path){
    const jsonString = JSON.stringify(object);

    // Escrever a string JSON em um arquivo
    fs.writeFileSync(json_path, jsonString, 'utf8', (err) => {
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