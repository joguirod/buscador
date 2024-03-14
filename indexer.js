import {load_html, get_html_on, download_html, write_in_json} from "./features/buscador_features.js"
import {Pilha} from "./pilha.js"

let stack = new Pilha([])

export async function index_page(url, hashtable, urlBase){
    try{
        if(verify_already_indexed(url, hashtable)){
            // verifica se a pilha não está vazia, para não acabar adicionando undefined na hashtable
            if(!stack.is_empty()){
                hashtable[url].push(stack.top())
            }
            return;
        }
        hashtable[url] = []
        // verifica se a pilha não está vazia, para não acabar adicionando undefined na hashtable1
        if(!stack.is_empty()){
            hashtable[url].push(stack.top())
        }
        stack.push(url)
        const document = await get_html_on(urlBase + url)
        download_html(document)
        const links = get_links(document)
        for(let link of links){
            await index_page(link, hashtable, urlBase)
        }
        stack.pop()
    } catch(error){
        console.log(error)
    }
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