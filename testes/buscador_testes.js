import { write_in_json, read_json } 
from "../features/buscador_features.js"
import { index_page } from "../indexer.js"
import { question } from 'readline-sync'

async function main(){
    const indexed_path = "C:\\Users\\José Guilherme\\Desktop\\buscador\\indexed.json"
    const url_inicial = "/series/"
    const urlBase = "https://www.adorocinema.com"
    // pego os dados da persistência e jogo numa hashtable
    let hashtable = read_json(indexed_path)
    try{
        await index_page(url_inicial, hashtable, urlBase)
    } catch(error)
    {
        console.log(error)
    } finally {
        write_in_json(hashtable, indexed_path)
    }

    question("<Enter>")
    console.log(hashtable)

    // console.log(has_autoreference("matrix.html", hashtable))
    // verify_self_reference(html) ? console.log("true") : console.log("false")
    // const words = ['blade', 'runner']
    // console.log(quantity_of_especific_word(html, words))  
}

main()