import {load_html, get_html, download_html} from "./buscador_features.js"
import {Pilha} from "./pilha.js"

let pilha = new Pilha([])

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
    download_html(document)
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