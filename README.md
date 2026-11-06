
# 📚 Projeto Final Integrador — BiblioTech API

API REST desenvolvida em **Node.js** com **Express** para gerenciamento de uma biblioteca. O sistema permite administrar o acervo de livros e controlar os empréstimos e devoluções realizados pelos usuários.

## 🎯 Objetivo

O objetivo do projeto é desenvolver uma API para gerenciamento de biblioteca, aplicando os conceitos de desenvolvimento de software, arquitetura REST e operações CRUD.

O sistema possui duas entidades principais:

- **Livros:** gerenciamento do acervo da biblioteca.
- **Empréstimos:** controle dos empréstimos, prazos de devolução e disponibilidade dos livros.

## 🛠️ Tecnologias utilizadas

- **Node.js:** ambiente de execução JavaScript.
- **Express:** framework para criação da API REST.
- **dotenv:** gerenciamento de variáveis de ambiente.
- **Bash:** execução dos testes automatizados.
- **cURL:** realização de requisições HTTP.
- **jq:** leitura e formatação das respostas JSON.
- **Git e GitHub:** versionamento e armazenamento do projeto.

## 📋 Funcionalidades

### 📖 Gerenciamento de livros

- Cadastrar novos livros.
- Listar todos os livros.
- Consultar livros pelo ID.
- Filtrar livros pelo status.
- Atualizar informações dos livros.
- Alterar o status dos livros.
- Excluir livros do acervo.

### 📚 Gerenciamento de empréstimos

- Cadastrar novos empréstimos.
- Listar todos os empréstimos.
- Consultar empréstimos pelo ID.
- Atualizar informações dos empréstimos.
- Registrar a devolução de livros.
- Atualizar automaticamente a disponibilidade do livro após a devolução.
- Identificar empréstimos atrasados.
- Impedir empréstimos de livros indisponíveis.
- Impedir a atualização de empréstimos já devolvidos.
- Permitir a exclusão somente de empréstimos devolvidos.

### ⚙️ Monitoramento da API

- Verificar o funcionamento da aplicação.
- Consultar o tempo de atividade do servidor.
- Consultar informações de utilização da memória.

## 🚀 Como executar o projeto

### Pré-requisitos

Antes de executar o projeto, é necessário instalar:

- [Node.js e npm](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [jq](https://jqlang.github.io/jq/)
- cURL

### 1. Clonar o repositório

```bash
git clone https://github.com/analiviaany-boop/PROJETO_FINAL_INTEGRADOR.git
```

### 2. Acessar a pasta do projeto

```bash
cd PROJETO_FINAL_INTEGRADOR
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Iniciar o servidor

```bash
node server.js
```

Por padrão, a API estará disponível no endereço:

```text
http://localhost:3004
```

A porta pode ser alterada utilizando a variável de ambiente `PORT`.

Exemplo:

```bash
PORT=3005 node server.js
```

## 🔗 Endpoints disponíveis

Todas as rotas utilizam o prefixo `/api/v1`.

### 📖 Endpoints de Livros

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/v1/livros` | Lista todos os livros |
| GET | `/api/v1/livros?status=DISPONIVEL` | Filtra livros por status |
| GET | `/api/v1/livros/:id` | Consulta um livro pelo ID |
| POST | `/api/v1/livros` | Cadastra um novo livro |
| PUT | `/api/v1/livros/:id` | Atualiza todos os dados de um livro |
| PATCH | `/api/v1/livros/:id/status` | Atualiza o status de um livro |
| DELETE | `/api/v1/livros/:id` | Remove um livro |

### 📚 Endpoints de Empréstimos

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/v1/emprestimos` | Lista todos os empréstimos |
| GET | `/api/v1/emprestimos/:id` | Consulta um empréstimo pelo ID |
| POST | `/api/v1/emprestimos` | Cadastra um novo empréstimo |
| PUT | `/api/v1/emprestimos/:id` | Atualiza os dados de um empréstimo |
| PATCH | `/api/v1/emprestimos/:id/devolucao` | Registra a devolução de um livro |
| DELETE | `/api/v1/emprestimos/:id` | Exclui um empréstimo devolvido |

### ❤️ Endpoint de monitoramento

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/v1/health` | Verifica o funcionamento da API |

## 📝 Exemplos de requisições

### 1. Cadastrar um livro

**POST** `/api/v1/livros`

Corpo da requisição:

```json
{
  "livro": "Dom Casmurro",
  "autor": "Machado de Assis",
  "editora": "Livraria Garnier"
}
```

O sistema gera automaticamente um ID e define o status inicial como `DISPONIVEL`.

### 2. Cadastrar um empréstimo

**POST** `/api/v1/emprestimos`

Corpo da requisição:

```json
{
  "livroId": 1,
  "nomeUsuario": "Ana Silva",
  "dataDevolucaoPrevista": "2026-12-10"
}
```

O sistema verifica se o livro existe, se está disponível e se a data de devolução é válida.

Após o cadastro, o status do livro é alterado automaticamente para `EMPRESTADO`.

### 3. Consultar empréstimos

**GET** `/api/v1/emprestimos`

Retorna os empréstimos cadastrados, incluindo os dados do livro relacionado.

### 4. Atualizar um empréstimo

**PUT** `/api/v1/emprestimos/:id`

Corpo da requisição:

```json
{
  "nomeUsuario": "Ana Silva Atualizado",
  "dataDevolucaoPrevista": "2026-12-15"
}
```

Não é permitido atualizar empréstimos que já foram devolvidos.

### 5. Registrar devolução

**PATCH** `/api/v1/emprestimos/:id/devolucao`

Não é necessário enviar um corpo na requisição.

Ao registrar a devolução:

- A data de devolução é registrada automaticamente.
- O status do empréstimo passa para `DEVOLVIDO`.
- O status do livro relacionado volta para `DISPONIVEL`.

### 6. Atualizar o status de um livro

**PATCH** `/api/v1/livros/:id/status`

Corpo da requisição:

```json
{
  "status": "EMPRESTADO"
}
```

## 📊 Regras de negócio

O sistema possui regras para garantir o funcionamento correto do gerenciamento da biblioteca.

1. Todo livro cadastrado recebe inicialmente o status `DISPONIVEL`.
2. Somente livros disponíveis podem ser emprestados.
3. Um empréstimo deve possuir um livro, um usuário e uma data prevista de devolução.
4. A data de devolução não pode ser anterior à data atual.
5. Ao cadastrar um empréstimo, o livro passa automaticamente para `EMPRESTADO`.
6. Empréstimos com prazo ultrapassado são identificados como `ATRASADO`.
7. Ao registrar uma devolução, o empréstimo passa para `DEVOLVIDO`.
8. Após a devolução, o livro volta automaticamente para `DISPONIVEL`.
9. Não é permitido registrar uma segunda devolução para o mesmo empréstimo.
10. Não é permitido atualizar um empréstimo já devolvido.
11. Somente empréstimos com status `DEVOLVIDO` podem ser excluídos.

## 🏷️ Status utilizados

### Status dos livros

| Status | Descrição |
|---|---|
| `DISPONIVEL` | Livro disponível para empréstimo |
| `EMPRESTADO` | Livro atualmente emprestado |
| `ATRASADO` | Livro associado a uma situação de atraso |

### Status dos empréstimos

| Status | Descrição |
|---|---|
| `ATIVO` | Empréstimo em andamento |
| `ATRASADO` | Empréstimo com prazo de devolução ultrapassado |
| `DEVOLVIDO` | Livro devolvido à biblioteca |

## 🧪 Testes automatizados

O projeto possui o arquivo `testes_automacao.sh`, desenvolvido em Bash, para realizar testes automatizados nas funcionalidades da API.

Os testes utilizam cURL para enviar requisições HTTP e jq para exibir as respostas em formato JSON.

### Testes realizados

**Livros:**

1. POST — Cadastrar livro.
2. GET — Consultar livro cadastrado.
3. PUT — Atualizar informações do livro.
4. GET — Listar todos os livros.
5. PATCH — Atualizar status do livro.

**Empréstimos:**

6. GET — Listar todos os empréstimos.
7. POST — Cadastrar novo empréstimo.
8. GET — Consultar empréstimo pelo ID.
9. PUT — Atualizar informações do empréstimo.
10. GET — Verificar status do livro emprestado.
11. PATCH — Registrar devolução.
12. GET — Consultar empréstimo após devolução.
13. GET — Verificar disponibilidade do livro.
14. PATCH — Testar bloqueio de devolução duplicada.
15. DELETE — Excluir empréstimo devolvido.
16. GET — Listar empréstimos após exclusão.

**Finalização:**

17. DELETE — Excluir livro de teste.
18. GET — Listar acervo final de livros.

### Como executar os testes

Primeiramente, inicie o servidor:

```bash
node server.js
```

Abra outro terminal na pasta do projeto.

Dê permissão de execução ao arquivo:

```bash
chmod +x testes_automacao.sh
```

Execute os testes:

```bash
./testes_automacao.sh
```

Para utilizar outra porta:

```bash
./testes_automacao.sh 3005
```

O script apresenta no terminal cada operação executada e as respostas JSON retornadas pela API.

> **Observação:** os testes realizam operações diretamente na API. Como os dados são armazenados em memória, as alterações realizadas são temporárias.

## 📁 Estrutura do projeto

```text
PROJETO_FINAL_INTEGRADOR/
│
├── server.js
│   └── Servidor Express e implementação dos endpoints.
│
├── testes_automacao.sh
│   └── Script de testes automatizados.
│
├── package.json
│   └── Dependências e configurações do projeto.
│
├── package-lock.json
│   └── Registro das versões das dependências.
│
├── .gitignore
│   └── Arquivos e pastas ignorados pelo Git.
│
└── README.md
    └── Documentação do projeto.
```

## 💾 Armazenamento de dados

Nesta versão, os dados são armazenados em estruturas de arrays diretamente na memória do servidor.

Existem duas estruturas principais:

- `livros`: armazena os dados dos livros cadastrados.
- `emprestimos`: armazena os dados dos empréstimos realizados.

O relacionamento entre as entidades é realizado pelo campo `livroId`, presente nos registros de empréstimos.

Esse campo permite identificar qual livro está associado a cada empréstimo.

**Importante:** não existe integração com banco de dados persistente nesta versão. Ao reiniciar o servidor, os dados retornam aos registros iniciais definidos no código.

## 👥 Equipe

Projeto desenvolvido como parte do Projeto Final Integrador.

**Integrantes:**

- Ana Lívia Paixão
- Bruno Rodrigues Garcia

**Instituição:** SENAI

---

<p align="center">
  Desenvolvido para fins acadêmicos.
</p>

