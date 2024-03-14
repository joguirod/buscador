import { read_json } from "../features/buscador_features.js"
import { calculate_page_freshness, quantity_of_especific_word } from "../features/ranqueador_features.js"

function main(){
    const page = "paginas/matrix.html"

    const points_table = read_json("pontuacao.json")

    console.log(calculate_page_freshness(page, points_table))
    console.log(quantity_of_especific_word(page, ['ficção'], points_table))
}

main()