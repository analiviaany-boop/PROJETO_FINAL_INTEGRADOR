
#!/bin/bash

# [FLUXO] Define os arquivos utilizados
CSV="dataset_analitico.csv"
DADOS_GRAFICO="dados_grafico.dat"

# [ERRO] Verifica se o CSV existe
if [ ! -f "$CSV" ]; then
    echo "[ERRO] Arquivo $CSV não encontrado!"
    echo "Execute primeiro: ./exportar_dataset.sh"
    exit 1
fi

# [ERRO] Verifica se o Termgraph está instalado
if ! command -v termgraph >/dev/null 2>&1; then
    echo "[ERRO] Termgraph não encontrado!"
    echo "Instale com: python -m pip install termgraph"
    exit 1
fi

echo "[FLUXO] Preparando dados para o gráfico..."

# [TRANSF] Conta os livros de acordo com o status
awk -F',' '
NR > 1 {
    gsub(/"/, "", $NF)
    gsub(/\r/, "", $NF)
    contagem[$NF]++
}
END {
    printf "DISPONIVEL,%d\n", contagem["DISPONIVEL"] + 0
    printf "EMPRESTADO,%d\n", contagem["EMPRESTADO"] + 0
    printf "ATRASADO,%d\n", contagem["ATRASADO"] + 0
}
' "$CSV" > "$DADOS_GRAFICO"

# [FLUXO] Exibe o gráfico no terminal
echo "[FLUXO] Gerando gráfico de barras..."

termgraph "$DADOS_GRAFICO" \
    --title "BiblioTech - Livros por Status" \
    --width 40

# [FLUXO] Finaliza a execução
echo ""
echo "[FLUXO] Gráfico gerado com sucesso!"

