import { read_json } from "../features/buscador_features.js"
import { has_autoreference, ranker, rankPages} from "../features/ranqueador_features.js"

function main(){
    const page = "..paginas/blade_runner.html"
    const hashtable = read_json("../indexed.json")

    console.log(has_autoreference(page))

    const pages = ranker(["matrix"])
    console.log(rankPages(pages))
}

main()