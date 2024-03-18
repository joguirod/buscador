import { read_json } from "../features/buscador_features.js"
import { has_autoreference, ranker} from "../features/ranqueador_features.js"

function main(){
    const page = "..paginas/blade_runner.html"
    const hashtable = read_json("../indexed.json")

    console.log(has_autoreference(page))

    console.log(ranker(["matrix"]))
}

main()