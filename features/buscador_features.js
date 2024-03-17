import * as cheerio from 'cheerio'
import axios from 'axios'
import fs from 'fs'
import {LoadHtmlException} from "../exceptions/LoadHtmlException.js"
import {HtmlEmptyException} from "../exceptions/HtmlEmptyException.js"
import {GetRequistionException} from "../exceptions/GetRequistionException.js"
import {DownloadHtmlException} from "../exceptions/DownloadHtmlException.js"

export function load_html(html){
    try{
        return cheerio.load(html)
    } catch(error){
        throw new LoadHtmlException("Erro ao tentar carregar o HTML para o Cheerio")
    }
}

export async function get_html_on(url){
    try {
        const response = await axios.get(url);
        const data = response.data
        return data;
    }
    catch(error){
        throw new GetRequistionException("Erro ao fazer a requisição GET")
    }
}

// implementar um get_html mas nos arquivos e não na url, para as funções de pontuação
export function get_html_off(file_path){
    const document =  fs.readFileSync(file_path)
    return document
}

export async function download_html(html, url, path){
    if (!html || html.trim() === '') {
        throw new HtmlEmptyException("HTML está vazio ou inválido");
    }

    try{
        const document_name = set_document_name(url, html)
        fs.writeFileSync(path + `${document_name}.html`, html)
    } catch(error){
        throw new DownloadHtmlException("Erro ao fazer o download do html")
    }
}

function set_document_name(url, html){
    // se tiver '/' no link, nomeie o arquivo de acordo com o <title> do html
    if(url.split("/").length > 1){
        return document_name_by_title(html)
    }
    // se não, nomeio com a url, exemplo: urlBase/mochileiro.html arquivo = mochileiro. html, urlBase/filmes/lista_completa arquivo = <title> tag </title>
    return document_name_by_url(url)
}

function document_name_by_title(html) {
    const title = get_html_title(html).toLowerCase();
    
    // Remover espaços extras e substituir acentos por caracteres sem acento
    const cleanedTitle = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
    
    // Remover caracteres especiais, exceto letras, números e o sublinhado
    const cleanedTitleSpecialChars = cleanedTitle.replace(/[^\w\s]/gi, '');

    // Limitar o comprimento do nome do documento, se necessário
    const maxLength = 255; // Exemplo de limite de comprimento
    const truncatedTitle = cleanedTitleSpecialChars.substring(0, maxLength);

    return truncatedTitle;
}

function document_name_by_url(url){
    return url.split(".html")[0]
}

function get_html_title(html){
    const $ = load_html(html)
    return $('title').text()
}

export async function write_in_json(object, json_path){
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