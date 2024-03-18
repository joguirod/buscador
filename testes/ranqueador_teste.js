import { ranker, show_pages, ranking_to_show, sortPages } from "../features/ranqueador_features.js"

function main(){
    const pages = ranker(["matrix"])
    show_pages((pages))
}

main()