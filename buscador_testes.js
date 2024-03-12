import {get_html, index_page, has_autoreference, quantity_of_especific_word} 
from "./buscador_features.js"
import {question} from 'readline-sync'

async function main(){
    // test get_html
    const html = await get_html("https://kernel32dev.github.io/hosp-pi/blade_runner.html")
    // console.log(html)

    // test page indexer
    // const url_inicial = "matrix.html"
    // const urlBase = "https://kernel32dev.github.io/hosp-pi/"

    // pego os dados da persistência e jogo numa hashtable
    // let hashtable = {}
    // await index_page(url_inicial, hashtable, urlBase)
    // console.log(hashtable)
    // console.log(has_autoreference("matrix.html", hashtable))
    // verify_self_reference(html) ? console.log("true") : console.log("false")
    const words = ['blade', 'runner']
    console.log(quantity_of_especific_word(html, words))  
}

main()