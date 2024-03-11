import {get_html} 
from "./buscador_features.js"
import {question} from 'readline-sync'

async function main(){
    const html = await get_html("https://kernel32dev.github.io/hosp-pi/mochileiro.html")
    console.log(html)
    // verify_self_reference(html) ? console.log("true") : console.log("false")
    // const words = ['blade', 'runner']
    // console.log(quantity_of_especific_word(html, words))  
}

main()