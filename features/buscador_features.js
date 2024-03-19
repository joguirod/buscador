import * as cheerio from 'cheerio'
import axios from 'axios'
import fs from 'fs'
import {LoadHtmlException} from "../exceptions/LoadHtmlException.js"
import {HtmlEmptyException} from "../exceptions/HtmlEmptyException.js"
import {GetRequistionException} from "../exceptions/GetRequistionException.js"
import {DownloadHtmlException} from "../exceptions/DownloadHtmlException.js"
import {load_html} from "../utils/utils.js"

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
        const document_name = set_document_name(url)
        if(document_name.endsWith(".html")){
            fs.writeFileSync(path + `${document_name}`, html)
        } else {
            fs.writeFileSync(path + `${document_name}.html`, html)
        }
    } catch(error){
        // throw new HtmlEmptyException("Erro ao fazer o download HTML");
        console.log("(!) Houve uma exceção durante o download")
    }
}

function set_document_name(url){
    // se tiver '/' no link, troque as ocorrências por $
    if(url.split("/").length > 1){
        // document_name_by(url_with_slash)
        return document_name_by(url)
    }
    // se não, nomeio com a url, exemplo: urlBase/mochileiro.html arquivo = mochileiro. html, urlBase/filmes/lista_completa arquivo = <title> tag </title>
    return document_name_by_url(url)
}

function document_name_by(url_with_slash){
    const document_name = url_with_slash.split("/").join("$")

    return document_name;
}

function document_name_by_url(url){
    return url
}
