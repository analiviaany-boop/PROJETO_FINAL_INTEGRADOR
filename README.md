# 📚 Projeto Final Integrador — API de Gestão de Biblioteca

API REST desenvolvida em **Node.js** com **Express** para gerenciar o acervo de uma biblioteca. O projeto permite cadastrar, consultar, atualizar e remover livros, além de disponibilizar uma rota para verificar o estado de funcionamento da API.

## 🎯 Objetivo

O objetivo do projeto é disponibilizar uma API simples para operações de gerenciamento de livros, utilizando os principais métodos HTTP e o padrão CRUD:

- **Create:** cadastrar livros;
- **Read:** consultar livros e listar o acervo;
- **Update:** atualizar os dados ou o status de um livro;
- **Delete:** remover livros do acervo.

## 🛠️ Tecnologias utilizadas

- [Node.js](https://nodejs.org/) — ambiente de execução JavaScript;
- [Express](https://expressjs.com/) — framework para criação das rotas HTTP;
- [dotenv](https://www.npmjs.com/package/dotenv) — carregamento de variáveis de ambiente;
- [Bash](https://www.gnu.org/software/bash/) — execução do script de testes automatizados;
- [cURL](https://curl.se/) — envio de requisições HTTP durante os testes;
- [jq](https://jqlang.github.io/jq/) — formatação e leitura das respostas JSON nos testes.

## 📋 Funcionalidades

- Listar todos os livros cadastrados;
- Filtrar livros pelo status;
- Buscar um livro específico pelo ID;
- Cadastrar novos livros;
- Atualizar integralmente os dados de um livro;
- Alterar o status de um livro;
- Remover livros do acervo;
- Consultar o estado de funcionamento da API.

A API inicia com três livros de exemplo cadastrados.

## 🚀 Como executar o projeto

### Pré-requisitos

Antes de começar, instale:

- [Node.js e npm](https://nodejs.org/);
- [Git](https://git-scm.com/) (opcional, para clonar o repositório).

### 1. Clone o repositório

```bash
git clone https://github.com/analiviaany-boop/PROJETO_FINAL_INTEGRADOR.git
```

### 2. Acesse a pasta do projeto

```bash
cd PROJETO_FINAL_INTEGRADOR
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Inicie a API

```bash
node server.js
```

Por padrão, a API ficará disponível em:

```text
http://localhost:3004
```

A porta pode ser alterada por meio da variável de ambiente `PORT`. O projeto também carrega configurações de um arquivo `.env`, caso ele seja utilizado.

## 🔗 Endpoints disponíveis

Todas as rotas da API utilizam o prefixo `/api/v1`.

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/v1/livros` | Lista todos os livros |
| `GET` | `/api/v1/livros?status=DISPONIVEL` | Filtra livros pelo status |
| `GET` | `/api/v1/livros/:id` | Busca um livro pelo ID |
| `POST` | `/api/v1/livros` | Cadastra um novo livro |
| `PUT` | `/api/v1/livros/:id` | Substitui todos os dados de um livro |
| `PATCH` | `/api/v1/livros/:id/status` | Atualiza o status de um livro |
| `DELETE` | `/api/v1/livros/:id` | Remove um livro |
| `GET` | `/api/v1/health` | Verifica o funcionamento da API |

### 📖 Estrutura de um livro

Os registros possuem os seguintes campos:

```json
{
  "id": 1,
  "livro": "O Pequeno Principe",
  "autor": "Antoine de Saint-Exupery",
  "editora": "Editora Rocco",
  "status": "DISPONIVEL"
}
```

Os status utilizados nos registros iniciais são `DISPONIVEL`, `EMPRESTADO` e `ATRASADO`.

### Exemplos de requisições

**Cadastrar um livro — POST `/api/v1/livros`**

Envie um JSON com os campos `livro`, `autor` e `editora`:

```json
{
  "livro": "Dom Casmurro",
  "autor": "Machado de Assis",
  "editora": "Livraria Garnier"
}
```

O status inicial do novo livro será definido automaticamente como `DISPONIVEL`.

**Atualizar o status — PATCH `/api/v1/livros/:id/status`**

```json
{
  "status": "EMPRESTADO"
}
```

**Atualizar todos os dados — PUT `/api/v1/livros/:id`**

```json
{
  "livro": "Dom Casmurro - Edição Especial",
  "autor": "Machado de Assis",
  "editora": "Livraria Garnier",
  "status": "EMPRESTADO"
}
```

## 🧪 Testes automatizados

O repositório contém o script `testes_automacao.sh`, que executa uma sequência de operações para testar o CRUD da API:

1. Cadastra dois livros;
2. Atualiza os dados de um dos livros;
3. Remove o outro livro;
4. Lista o acervo ao final dos testes.

Para executar os testes, mantenha a API em funcionamento e abra outro terminal na pasta do projeto. O ambiente precisa ter **Bash**, **cURL** e **jq** instalados.

```bash
chmod +x testes_automacao.sh
./testes_automacao.sh
```

Para utilizar outra porta, informe o número como argumento:

```bash
./testes_automacao.sh 3005
```

Nesse caso, inicie a API com a mesma porta, por exemplo:

```bash
PORT=3005 node server.js
```

> **Observação:** o script realiza operações diretamente na API em execução. Como os dados são armazenados em memória, as alterações são temporárias e são perdidas quando o servidor é reiniciado.

## 📁 Estrutura do projeto

```text
PROJETO_FINAL_INTEGRADOR/
├── server.js              # Servidor Express e implementação das rotas
├── testes_automacao.sh    # Script de testes das operações CRUD
├── package.json           # Metadados, dependências e configurações do projeto
├── package-lock.json      # Registro das versões instaladas das dependências
├── .gitignore             # Arquivos e pastas ignorados pelo Git
└── README.md              # Documentação do projeto
```

## ⚠️ Observações

- Os dados dos livros são armazenados em um array na memória do servidor; não há integração com banco de dados persistente nesta versão.
- Ao reiniciar a aplicação, o acervo volta aos três registros iniciais.
- A rota de cadastro exige os campos `livro`, `autor` e `editora`.
- A atualização via `PUT` exige os campos `livro`, `autor`, `editora` e `status`.
- A rota de saúde informa o status da aplicação, o tempo de atividade e dados de uso de memória.

## 👥 Equipe

Projeto desenvolvido como parte do **Projeto Final Integrador**.

> Ana Lívia Paixão | Bruno Rodrigues Garcia
> ana.l.paixao@edu.senai.br | b.garcia@edu.senai.br

---

<p align="center">
  Desenvolvido para fins acadêmicos.
</p>
