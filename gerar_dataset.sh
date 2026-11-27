
#!/bin/bash

# [FLUXO] Define o endereço da API que será consultada.
API_URL="http://localhost:3004/api/v1/livros"

# [TRANSF] Define o nome do arquivo CSV que receberá os dados.
ARQUIVO="dataset_analitico.csv"

set -euo pipefail

echo "Iniciando a extração dos dados..."

# [FLUXO] Extrai os dados dos livros da API utilizando curl.
# [TRANSF] Converte o JSON recebido em CSV utilizando jq.
# [FLUXO] Salva os dados convertidos no arquivo dataset_analitico.csv.
curl -fsS "$API_URL" | jq -r '
    (["ID", "TITULO", "AUTOR", "EDITORA", "STATUS"] | @csv),
    (.[] | [.id, .livro, .autor, .editora, .status] | @csv)
' > "$ARQUIVO"

# [ERRO] Verifica se o arquivo CSV foi criado e contém dados.
if [ -s "$ARQUIVO" ]; then

    # [FLUXO] Exibe a confirmação da geração do dataset.
    echo "Dataset gerado com sucesso!"
    echo "Arquivo: $ARQUIVO"

else

    # [ERRO] Informa que a geração do arquivo falhou.
    echo "Erro: não foi possível gerar o dataset."
    exit 1

fi

