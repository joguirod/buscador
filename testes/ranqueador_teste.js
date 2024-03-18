import { show_pages } from "../features/ranqueador_features.js"

function main(){

    const pages = {
        'blade_runner.html': {
          autoridade: 40,
          frescor_conteudo: -70,
          autoreferencia: -20,
          frequencia: 20,
          deve_exibir: 1,
          uso_em_tags: 22
        },
        'duna.html': {
          autoridade: 10,
          frescor_conteudo: 30,
          autoreferencia: 0,
          frequencia: 0,
          deve_exibir: 0,
          uso_em_tags: 0
        },
        'interestelar.html': {
          autoridade: 40,
          frescor_conteudo: -45,
          autoreferencia: 0,
          frequencia: 15,
          deve_exibir: 1,
          uso_em_tags: 17
        },
        'matrix.html': {
          autoridade: 30,
          frescor_conteudo: -60,
          autoreferencia: 0,
          frequencia: 45,
          deve_exibir: 1,
          uso_em_tags: 100
        },
        'mochileiro.html': {
          autoridade: 30,
          frescor_conteudo: -30,
          autoreferencia: 0,
          frequencia: 5,
          deve_exibir: 1,
          uso_em_tags: 2
        }
    }

    console.log(show_pages(pages))
}

function select_pages_to_show(pages){
    const pages_to_show = []

    for(const page of Object.keys(pages)){
        if(pages[page]["deve_exibir"] === 1){
            pages_to_show[page] = pages[page]
        }
    }

    return pages_to_show
}

main()