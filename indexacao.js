import {Pilha} from "./pilha.js"
import * as cheerio from 'cheerio'
import { get_html } from "./buscador_features.js";
let pilha = new Pilha([])

async function main(){
    const pag_inicial = "matrix.html"
    const urlBase = "https://kernel32dev.github.io/hosp-pi/"
    let ht = {}
    await indexar(pag_inicial, ht, urlBase)

    console.log(ht)
}


async function indexar(pag, ht, urlBase){
    if(verify_already_indexed(pag, ht)){
        ht[pag].push(pilha.top())
        return;
    }
    ht[pag] = []
    if(pilha.size() > 0){
        ht[pag].push(pilha.top())
    }
    pilha.push(pag)
    const document = await get_html(urlBase + pag)
    const links = get_links(document, urlBase)
    for(let link of links){
        await indexar(link, ht, urlBase)
    }
    pilha.pop()

}

function verify_already_indexed(pag, ht){
    return ht.hasOwnProperty(pag)
}

function get_links(document){
    const $ = cheerio.load(document)
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

main()
