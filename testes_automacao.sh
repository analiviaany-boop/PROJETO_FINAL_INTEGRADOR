#!/bin/bash

# Configuração dinâmica de Porta via parâmetros de linha de comando (padrão: 3004)
PORT=${1:-3004}

API_URL="http://localhost:${PORT}/api/v1/livros"

echo "========================================="
echo "Iniciando testes CRUD (Livros) - $(date)"
echo "API URL: $API_URL"
echo "========================================="

# 1. CREATE: Cadastrando o primeiro livro
echo -e "\n[1] Executando POST para cadastrar Livro 1 (Dom Casmurro)..."
RESP_1=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"livro": "Dom Casmurro", "autor": "Machado de Assis", "editora": "Livraria Garnier"}')

# Exibe a resposta na hora
echo "$RESP_1" | jq . 2>/dev/null || echo "$RESP_1"
echo ""

# Extrai o ID gerado
ID_1=$(echo "$RESP_1" | jq -r '.id // empty' 2>/dev/null)

if [ -z "$ID_1" ]; then
  echo "Erro: Não foi possível obter o ID do Livro 1. Resposta da API:"
  echo "$RESP_1"
  exit 1
fi

# 2. CREATE: Cadastrando o segundo livro
echo -e "\n[2] Executando POST para cadastrar Livro 2 (O Cortiço)..."
RESP_2=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"livro": "O Cortiço", "autor": "Aluísio Azevedo", "editora": "B. L. Garnier"}')

# Exibe a resposta na hora
echo "$RESP_2" | jq . 2>/dev/null || echo "$RESP_2"
echo ""

# Extrai o ID gerado
ID_2=$(echo "$RESP_2" | jq -r '.id // empty' 2>/dev/null)

if [ -z "$ID_2" ]; then
  echo "Erro: Não foi possível obter o ID do Livro 2. Resposta da API:"
  echo "$RESP_2"
  exit 1
fi

# 3. UPDATE: Atualizando o livro criado no passo 1 ($ID_1)
echo -e "\n[3] Executando PUT para atualizar todos os dados do Livro ID ${ID_1}..."
curl -s -X PUT "$API_URL/${ID_1}" \
  -H "Content-Type: application/json" \
  -d '{"livro": "Dom Casmurro - Edição Especial", "autor": "Machado de Assis", "editora": "Livraria Garnier", "status": "EMPRESTADO"}' | jq . 2>/dev/null || echo ""
echo ""

# 4. DELETE: Deletando o livro criado no passo 2 ($ID_2)
echo -e "\n[4] Executando DELETE para remover o Livro ID ${ID_2}..."
curl -s -X DELETE "$API_URL/${ID_2}" | jq . 2>/dev/null || echo ""
echo ""

# 5. GET: Listando o acervo final
echo -e "\n[5] Executando GET para listar o acervo final de livros..."
curl -s -X GET "$API_URL" | jq . 2>/dev/null || echo ""
echo ""

echo "========================================="
echo "Testes finalizados com sucesso!"
