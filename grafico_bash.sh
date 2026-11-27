
#!/bin/bash

# [FLUXO] Arquivo CSV gerado pelo exportar_dataset.sh
CSV="dataset_analitico.csv"

# [ERRO] Verifica se o arquivo existe
if [ ! -f "$CSV" ]; then
    echo "[ERRO] Arquivo $CSV não encontrado!"
    echo "Execute primeiro: ./exportar_dataset.sh"
    exit 1
fi

# [TRANSF] Inicializa os contadores
DISPONIVEL=0
EMPRESTADO=0
ATRASADO=0

# [FLUXO] Percorre o CSV ignorando o cabeçalho
while IFS= read -r LINHA || [ -n "$LINHA" ]; do

    # [TRANSF] Extrai o último campo da linha, que representa o status
    STATUS="${LINHA##*,}"

    # [TRANSF] Remove aspas e caracteres de quebra de linha
    STATUS="${STATUS//\"/}"
    STATUS="${STATUS//$'\r'/}"

    # [TRANSF] Conta os livros de acordo com o status
    case "$STATUS" in
        DISPONIVEL)
            ((DISPONIVEL++))
            ;;
        EMPRESTADO)
            ((EMPRESTADO++))
            ;;
        ATRASADO)
            ((ATRASADO++))
            ;;
    esac

done < <(tail -n +2 "$CSV")

# [TRANSF] Calcula o total de livros
TOTAL=$((DISPONIVEL + EMPRESTADO + ATRASADO))

# [FLUXO] Exibe o dashboard
echo ""
echo "======================================"
echo "       BIBLIOTECH - DASHBOARD"
echo "======================================"
echo "Total de livros: $TOTAL"
echo ""

# [TRANSF] Descobre o maior valor para dimensionar as barras
MAIOR=$DISPONIVEL

if [ "$EMPRESTADO" -gt "$MAIOR" ]; then
    MAIOR=$EMPRESTADO
fi

if [ "$ATRASADO" -gt "$MAIOR" ]; then
    MAIOR=$ATRASADO
fi

# [FLUXO] Função para desenhar as barras
desenhar_barra() {
    NOME="$1"
    QUANTIDADE="$2"
    BLOCOS=0

    if [ "$MAIOR" -gt 0 ]; then
        BLOCOS=$((QUANTIDADE * 40 / MAIOR))
    fi

    if [ "$QUANTIDADE" -gt 0 ] && [ "$BLOCOS" -eq 0 ]; then
        BLOCOS=1
    fi

    BARRA=""

    # [TRANSF] Monta a barra proporcional à quantidade
    for ((i=0; i<BLOCOS; i++)); do
        BARRA="${BARRA}█"
    done

    echo "$NOME: $BARRA ($QUANTIDADE)"
}

# [FLUXO] Apresenta os resultados
desenhar_barra "DISPONIVEL" "$DISPONIVEL"
desenhar_barra "EMPRESTADO" "$EMPRESTADO"
desenhar_barra "ATRASADO" "$ATRASADO"

echo ""
echo "======================================"

