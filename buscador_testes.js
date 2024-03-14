import { get_html_on, quantity_of_especific_word, write_in_json, read_json} 
from "./buscador_features.js"
import { index_page } from "./indexer.js"
import { question } from 'readline-sync'

async function main(){
    const url_inicial = "matrix.html"
    const urlBase = "https://kernel32dev.github.io/hosp-pi/"
    // pego os dados da persistência e jogo numa hashtable
    let hashtable = read_json("indexed.json")
    await index_page(url_inicial, hashtable, urlBase)
    write_in_json(hashtable, "indexed.json")

    question("<Enter>")
    console.log(hashtable)

    // console.log(has_autoreference("matrix.html", hashtable))
    // verify_self_reference(html) ? console.log("true") : console.log("false")
    // const words = ['blade', 'runner']
    // console.log(quantity_of_especific_word(html, words))  
}

main()