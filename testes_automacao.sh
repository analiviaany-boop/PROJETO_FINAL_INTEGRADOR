
#!/bin/bash

# [FLUXO] Configura dinamicamente a porta utilizada pela API.
PORT=${1:-3004}

# [FLUXO] Define os endereços das rotas de livros e empréstimos.
LIVROS_URL="http://localhost:${PORT}/api/v1/livros"
EMPRESTIMOS_URL="http://localhost:${PORT}/api/v1/emprestimos"

# [TRANSF] Calcula as datas utilizadas nos testes de empréstimos.
DATA_DEVOLUCAO=$(date -d "+30 days" +%Y-%m-%d)
DATA_ATUALIZADA=$(date -d "+45 days" +%Y-%m-%d)

echo "========================================="
echo " INICIANDO TESTES DE AUTOMACAO"
echo " BIBLIOTECH API - $(date)"
echo "========================================="

# =========================================
# TESTES DE LIVROS
# =========================================

echo -e "\n========== TESTES DE LIVROS =========="

# 1. POST - Cadastrar livro
echo -e "\n[1] POST - Cadastrando Livro de Teste..."

# [FLUXO] Envia os dados do livro para a API.
RESP=$(curl -s -X POST "$LIVROS_URL" \
  -H "Content-Type: application/json" \
  -d '{"livro":"Livro de Teste","autor":"Autor Teste","editora":"Editora Teste"}')

# [TRANSF] Formata a resposta JSON para facilitar a visualização.
echo "$RESP" | jq . 2>/dev/null || echo "$RESP"

# [TRANSF] Extrai o ID do livro cadastrado.
LIVRO_ID=$(echo "$RESP" | jq -r '.id // empty')

# [ERRO] Interrompe os testes caso o cadastro não tenha retornado um ID.
if [ -z "$LIVRO_ID" ]; then
  echo "Erro ao cadastrar livro!"
  exit 1
fi

# 2. GET - Consultar livro
echo -e "\n[2] GET - Consultando livro cadastrado..."

# [FLUXO] Consulta o livro cadastrado utilizando seu ID.
curl -s "$LIVROS_URL/$LIVRO_ID" | jq .

# 3. PUT - Atualizar livro
echo -e "\n[3] PUT - Atualizando livro..."

# [FLUXO] Envia os novos dados do livro para atualização.
curl -s -X PUT "$LIVROS_URL/$LIVRO_ID" \
  -H "Content-Type: application/json" \
  -d '{"livro":"Livro de Teste Atualizado","autor":"Autor Teste","editora":"Editora Teste","status":"DISPONIVEL"}' | jq .

# 4. GET - Listar livros
echo -e "\n[4] GET - Listando todos os livros..."

# [FLUXO] Solicita a listagem completa do acervo.
curl -s "$LIVROS_URL" | jq .

# 5. PATCH - Atualizar status
echo -e "\n[5] PATCH - Atualizando status do livro..."

# [FLUXO] Envia uma requisição para atualizar o status do livro.
curl -s -X PATCH "$LIVROS_URL/$LIVRO_ID/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"DISPONIVEL"}' | jq .

# =========================================
# TESTES DE EMPRESTIMOS
# =========================================

echo -e "\n========== TESTES DE EMPRESTIMOS =========="

# 6. GET - Listar empréstimos
echo -e "\n[6] GET - Listando todos os empréstimos..."

# [FLUXO] Consulta todos os empréstimos cadastrados.
curl -s "$EMPRESTIMOS_URL" | jq .

# 7. POST - Cadastrar empréstimo
echo -e "\n[7] POST - Cadastrando novo empréstimo..."

# [FLUXO] Envia os dados necessários para cadastrar um empréstimo.
RESP=$(curl -s -X POST "$EMPRESTIMOS_URL" \
  -H "Content-Type: application/json" \
  -d "{\"livroId\":$LIVRO_ID,\"nomeUsuario\":\"Usuario Teste\",\"dataDevolucaoPrevista\":\"$DATA_DEVOLUCAO\"}")

# [TRANSF] Formata a resposta recebida da API.
echo "$RESP" | jq . 2>/dev/null || echo "$RESP"

# [TRANSF] Extrai o ID do empréstimo criado.
EMPRESTIMO_ID=$(echo "$RESP" | jq -r '.emprestimo.id // empty')

# [ERRO] Interrompe a execução caso o empréstimo não tenha sido cadastrado.
if [ -z "$EMPRESTIMO_ID" ]; then
  echo "Erro ao cadastrar empréstimo!"
  exit 1
fi

# 8. GET - Consultar empréstimo
echo -e "\n[8] GET - Consultando empréstimo por ID..."

# [FLUXO] Consulta os dados do empréstimo pelo ID.
curl -s "$EMPRESTIMOS_URL/$EMPRESTIMO_ID" | jq .

# 9. PUT - Atualizar empréstimo
echo -e "\n[9] PUT - Atualizando dados do empréstimo..."

# [FLUXO] Envia os novos dados para atualizar o empréstimo.
curl -s -X PUT "$EMPRESTIMOS_URL/$EMPRESTIMO_ID" \
  -H "Content-Type: application/json" \
  -d "{\"nomeUsuario\":\"Usuario Atualizado\",\"dataDevolucaoPrevista\":\"$DATA_ATUALIZADA\"}" | jq .

# 10. GET - Verificar status do livro
echo -e "\n[10] GET - Verificando se o livro está emprestado..."

# [FLUXO] Consulta o livro para verificar seu status atualizado.
curl -s "$LIVROS_URL/$LIVRO_ID" | jq .

# 11. PATCH - Registrar devolução
echo -e "\n[11] PATCH - Registrando devolução do livro..."

# [FLUXO] Envia a requisição para registrar a devolução.
curl -s -X PATCH "$EMPRESTIMOS_URL/$EMPRESTIMO_ID/devolucao" | jq .

# 12. GET - Verificar empréstimo devolvido
echo -e "\n[12] GET - Consultando empréstimo após devolução..."

# [FLUXO] Consulta novamente o empréstimo para verificar a devolução.
curl -s "$EMPRESTIMOS_URL/$EMPRESTIMO_ID" | jq .

# 13. GET - Verificar livro disponível
echo -e "\n[13] GET - Verificando se o livro voltou a ficar disponível..."

# [FLUXO] Consulta o livro após o registro da devolução.
curl -s "$LIVROS_URL/$LIVRO_ID" | jq .

# 14. PATCH - Tentar devolver novamente
echo -e "\n[14] PATCH - Tentando registrar uma segunda devolução..."

# [ERRO] Verifica a resposta da API ao tentar realizar uma devolução duplicada.
curl -s -X PATCH "$EMPRESTIMOS_URL/$EMPRESTIMO_ID/devolucao" | jq .

# 15. DELETE - Excluir empréstimo
echo -e "\n[15] DELETE - Excluindo empréstimo devolvido..."

# [FLUXO] Envia a requisição para excluir o empréstimo devolvido.
curl -s -X DELETE "$EMPRESTIMOS_URL/$EMPRESTIMO_ID" | jq .

# 16. GET - Listar empréstimos novamente
echo -e "\n[16] GET - Listando empréstimos após exclusão..."

# [FLUXO] Consulta a lista de empréstimos após a exclusão.
curl -s "$EMPRESTIMOS_URL" | jq .

# =========================================
# FINALIZACAO
# =========================================

# 17. DELETE - Excluir livro de teste
echo -e "\n[17] DELETE - Removendo livro de teste..."

# [FLUXO] Envia a requisição para remover o livro utilizado nos testes.
curl -s -X DELETE "$LIVROS_URL/$LIVRO_ID" | jq .

# 18. GET - Listar acervo final
echo -e "\n[18] GET - Listando acervo final de livros..."

# [FLUXO] Consulta o acervo após a finalização dos testes.
curl -s "$LIVROS_URL" | jq .

echo -e "\n========================================="
echo " TESTES DE AUTOMACAO FINALIZADOS!"
echo "========================================="

