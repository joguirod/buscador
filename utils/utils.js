import {LoadHtmlException} from "../exceptions/LoadHtmlException.js"

export function read_json(file_path) {
    try {
        const data = fs.readFileSync(file_path, 'utf8');
        
        // verifica se o conteudo lido não está vazio
        if(data.length > 0){
            const hashtable = JSON.parse(data);
            return hashtable;
        } else {
            // se estiver vazio, retorne uma hashtable vazia
            const hashtable = {}
            return hashtable
        }
    } catch (error) {
        throw error; // Lançar o erro para ser tratado pelo código que chamou a função
    }
}

export async function write_in_json(object, json_path){
    const jsonString = JSON.stringify(object);

    // Escrever a string JSON em um arquivo
    fs.writeFileSync(json_path, jsonString, 'utf8', (err) => {
    if (err) {
        console.error('Erro ao escrever arquivo:', err);
        return;
    }
    });
}

export function load_html(html){
    try{
        return cheerio.load(html)
    } catch(error){
        throw new LoadHtmlException("Erro ao tentar carregar o HTML para o Cheerio")
    }
}

export function get_html_title(html){
    const $ = load_html(html)
    return $('title').text()
}

// percorrer o diretório de páginas, acessar página por página, calcular a pontuação de cada página
export function get_files_from(directory){
    const files = []
    let file_list = fs.readdirSync("../paginas")
    for(let i in file_list){
        files.push(directory + '/' + file_list[i])
    }

    return files
}

// ordena as páginas primeiro por pontos totais, caso haja empate, utiliza os critérios de desempate
export function sortPages(pages) {
    const orderedPages = Object.keys(pages).sort((a, b) => {
        // Critério principal: pontos totais
        const pontosA = pages[a]["pontos_totais"];
        const pontosB = pages[b]["pontos_totais"];
        if (pontosA !== pontosB) {
            return pontosB - pontosA; // Ordena por pontos totais de forma decrescente
        }

        // Critério de desempate a: Maior quantidade de termos buscados no corpo do texto
        const termosBuscadosA = pages[a]["quantidade_termos"];
        const termosBuscadosB = pages[b]["quantidade_termos"];
        if (termosBuscadosA !== termosBuscadosB) {
            return termosBuscadosB - termosBuscadosA; // Ordena por quantidade de termos buscados de forma decrescente
        }

        // Critério de desempate b: Maior frescor do conteúdo (datas mais recentes)
        const dataA = new Date(pages[a]["frescor_conteudo"])
        const dataB = new Date(pages[b]["frescor_conteudo"]);
        if (dataA !== dataB) {
            return dataB - dataA; // Ordena por data de publicação de forma decrescente
        }

        // Critério de desempate c: Maior número de links recebidos
        const linksRecebidosA = pages[a]["autoridade"];
        const linksRecebidosB = pages[b]["autoridade"];
        return linksRecebidosB - linksRecebidosA; // Ordena por número de links recebidos de forma decrescente
    });

    const sortedPages = {};
    for (const page of orderedPages) {
        sortedPages[page] = pages[page];
    }

    return sortedPages;
}

// soma os pontos da página e retorna a pontuação total
export function sum_page_points(points) {
    let total_points = 0
    // percorre todas as chaves da tabela de pontuação da página e incrementa o valor total
    for(const key of Object.keys(points)){
        // se a chave for a que informa se a página deve ser exibida ou não, desconsidere
        if(key !== "deve_exibir" && key !== "pontos_totais"){
            total_points += points[key]
        }
    }
    return total_points
}

export function get_page_file_by(file_name){
    const files_path = "../paginas"
    const file = files_path + "/" + file_name
    return file    
}

export function get_file_name(file){
    let file_name = file.split('/')
    const last_index = file_name.length - 1
    file_name = file_name[last_index]
    return file_name
}

export function get_url_by(file_name){
    if(file_name.split("&").length > 1){
        file_name = file_name.split("$").join("/")
    }
    else if (file_name.split(".html").length > 2 ){
        return file_name.replace(/\.html(?!.*\.html)/, ''); // Remove apenas a última ocorrência de ".html" da string
    }
    return file_name
}

export function get_number(label){
    let number = question(label)

    while (isNaN(Number(number))){
        console.log('! Valor inválido !')
        number = question(label)
    }

    return Number(number)
}

export function get_option(){
    let option = get_number("> Escolha uma opção: ")
    return option
}

export function clear_screen(){
    console.clear()
}

export function press_anykey(){
    question("Press <anykey> to continue...")
}

export function get_word(){
    let word = ""
    word = question("> Insira uma palavra: ")
    while(word.trim() === ""){
        word = question("(!) Insira uma palavra válida >:(")
    }
    return word
}