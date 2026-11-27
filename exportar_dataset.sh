
#!/bin/bash

# [FLUXO] Definindo endpoint de origem e arquivo CSV de destino.
API_URL="http://localhost:3004/api/v1/livros"
CSV_OUT="dataset_analitico.csv"

echo "[FLUXO] Extraindo dados brutos da API..."

# [FLUXO] Busca os dados da API utilizando curl.
DADOS_JSON=$(curl -s "$API_URL")

# [ERRO] Verificando se a API respondeu com conteúdo válido.
if [ -z "$DADOS_JSON" ] || [ "$DADOS_JSON" = "[]" ]; then
    echo "[ERRO] Falha na extração: API offline ou sem registros."
    exit 1
fi

# [TRANSF] Convertendo JSON para formato tabular CSV usando jq.
echo "[TRANSF] Transformando JSON em CSV..."

# [TRANSF] Organiza os campos dos livros em colunas e gera o arquivo CSV.
echo "$DADOS_JSON" | jq -r '
    (["ID", "TITULO", "AUTOR", "EDITORA", "STATUS"] | @csv),
    (.[] | [.id, .livro, .autor, .editora, .status] | @csv)
' > "$CSV_OUT"

# [FLUXO] Exibe o resultado da exportação.
echo "[SUCESSO] Dataset gerado em $CSV_OUT:"
cat "$CSV_OUT"

