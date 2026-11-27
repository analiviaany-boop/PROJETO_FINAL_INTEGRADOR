
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

// [TRANSF] Banco de dados em memória - Livros
let livros = [
    { id: 1, livro: "O Pequeno Principe", autor: "Antoine de Saint-Exupery", editora: "Editora Rocco", status: "DISPONIVEL" },
    { id: 2, livro: "Harry Potter e o Calice de Fogo", autor: "J. K. Rowling", editora: "Editora Rocco", status: "EMPRESTADO" },
    { id: 3, livro: "O Fantasma da Opera", autor: "Gaston Leroux", editora: "DarkSide Books", status: "ATRASADO" }
];

// [TRANSF] Banco de dados em memória - Empréstimos
let emprestimos = [
    { id: 1, livroId: 2, nomeUsuario: "Sofia Maradini", dataEmprestimo: "2026-11-06", dataDevolucaoPrevista: "2026-11-20", dataDevolucao: null, status: "ATIVO" },
    { id: 2, livroId: 3, nomeUsuario: "Beatriz Gomes", dataEmprestimo: "2026-10-15", dataDevolucaoPrevista: "2026-10-29", dataDevolucao: null, status: "ATRASADO" },
    { id: 3, livroId: 1, nomeUsuario: "Sebastião Lacerda", dataEmprestimo: "2026-10-06", dataDevolucaoPrevista: "2026-10-20", dataDevolucao: "2026-10-09", status: "DEVOLVIDO" }
];


// 1. GET /api/v1/livros - Listar todos os livros
app.get('/api/v1/livros', (req, res) => {

    // [TRANSF] Atualiza dinamicamente o status dos livros.
    const livrosAtualizados = livros.map(l => {

        // [TRANSF] Procura empréstimos ativos relacionados ao livro.
        const emprestimoAtivo = emprestimos.find(e => e.livroId === l.id && e.status !== "DEVOLVIDO");

        let statusCalculado = l.status;

        // [TRANSF] Verifica se o empréstimo está atrasado.
        if (emprestimoAtivo) {
            const estaAtrasado = emprestimoAtivo.status === "ATRASADO" || (emprestimoAtivo.status === "ATIVO" && new Date(emprestimoAtivo.dataDevolucaoPrevista) < new Date());
            statusCalculado = estaAtrasado ? "ATRASADO" : "EMPRESTADO";
        }

        return {
            ...l,
            status: statusCalculado
        };
    });

    // [FLUXO] Recebe o parâmetro de consulta status pela URL.
    const { status } = req.query;

    // [TRANSF] Filtra os livros conforme o status informado.
    if (status) {
        const filtrados = livrosAtualizados.filter(l => l.status.toUpperCase() === status.toUpperCase());
        return res.status(200).json(filtrados);
    }

    res.status(200).json(livrosAtualizados);
});


// 2. GET /api/v1/livros/:id - Buscar livro por ID
app.get('/api/v1/livros/:id', (req, res) => {

    // [FLUXO] Recebe o ID do livro através dos parâmetros da URL.
    const id = parseInt(req.params.id);

    // [TRANSF] Procura o livro correspondente ao ID informado.
    const livro = livros.find(l => l.id === id);

    // [ERRO] Retorna 404 quando o livro não é encontrado.
    if (!livro) {
        return res.status(404).json({ erro: "Livro nao encontrado na base de dados." });
    }

    res.status(200).json(livro);
});


// 3. GET /api/v1/health - Mostrar o status da API
app.get('/api/v1/health', (req, res) => {

    // [FLUXO] Disponibiliza informações sobre o funcionamento da API.
    res.status(200).json({
        status: "ONLINE",
        application: "BIBLIOTECH API V1.0",
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});


// 4. POST /api/v1/livros - Cadastrar novo livro
app.post('/api/v1/livros', (req, res) => {

    // [FLUXO] Recebe os dados do novo livro enviados no corpo da requisição.
    const { livro, autor, editora } = req.body;

    // [ERRO] Verifica se todos os campos obrigatórios foram preenchidos.
    if (!livro || !autor || !editora) {
        return res.status(400).json({ erro: "Campos 'livro', 'autor' e 'editora' sao obrigatorios." });
    }

    // [TRANSF] Calcula o próximo ID disponível.
    const proximoId = livros.length > 0 ? Math.max(...livros.map(l => l.id)) + 1 : 1;

    // [TRANSF] Organiza os dados do novo livro.
    const novoLivro = {
        id: proximoId,
        livro,
        autor,
        editora,
        status: "DISPONIVEL"
    };

    // [TRANSF] Adiciona o novo livro ao acervo.
    livros.push(novoLivro);

    res.status(201).json(novoLivro);
});


// 5. PATCH /api/v1/livros/:id/status - Atualizar status do livro
app.patch('/api/v1/livros/:id/status', (req, res) => {

    // [FLUXO] Recebe o ID pela URL e o novo status pelo corpo da requisição.
    const id = parseInt(req.params.id);
    const { status } = req.body;

    // [TRANSF] Procura o livro que será atualizado.
    const livro = livros.find(l => l.id === id);

    // [ERRO] Verifica se o livro existe.
    if (!livro) {
        return res.status(404).json({ erro: "Livro nao encontrado." });
    }

    // [ERRO] Verifica se o campo status foi informado.
    if (!status) {
        return res.status(400).json({ erro: "O campo 'status' e obrigatorio." });
    }

    // [TRANSF] Normaliza o status para letras maiúsculas.
    livro.status = String(status).toUpperCase();

    res.status(200).json({ mensagem: "Status atualizado com sucesso!", livro });
});


// 6. DELETE /api/v1/livros/:id - Remover livro do acervo
app.delete('/api/v1/livros/:id', (req, res) => {

    // [FLUXO] Recebe o ID do livro pela URL.
    const id = parseInt(req.params.id);

    // [TRANSF] Localiza a posição do livro no acervo.
    const index = livros.findIndex(l => l.id === id);

    // [ERRO] Verifica se o livro existe antes da remoção.
    if (index === -1) {
        return res.status(404).json({ erro: "Livro nao encontrado." });
    }

    // [TRANSF] Remove o livro do array.
    livros.splice(index, 1);

    res.status(200).json({ mensagem: "Livro ID ${id} removido com sucesso." });
});


// 7. PUT /api/v1/livros/:id - Substituir todos os dados de um livro
app.put('/api/v1/livros/:id', (req, res) => {

    // [FLUXO] Recebe o ID pela URL.
    const id = parseInt(req.params.id);

    // [TRANSF] Localiza o índice do livro que será atualizado.
    const index = livros.findIndex(l => l.id === id);

    // [ERRO] Retorna 404 caso o livro não exista.
    if (index === -1) {
        return res.status(404).json({ erro: "Livro nao encontrado." });
    }

    // [FLUXO] Recebe os novos dados enviados pelo cliente.
    const { livro, autor, editora, status } = req.body;

    // [ERRO] Valida o preenchimento de todos os campos obrigatórios.
    if (!livro || !autor || !editora || !status) {
        return res.status(400).json({ erro: "Todos os campos (livro, autor, editora, status) sao obrigatorios para o PUT." });
    }

    // [TRANSF] Substitui os dados do livro e normaliza o status.
    livros[index] = {
        id,
        livro,
        autor,
        editora,
        status: String(status).toUpperCase()
    };

    res.status(200).json(livros[index]);
});


// 8. GET /api/v1/emprestimos - Listar todos os empréstimos
app.get('/api/v1/emprestimos', (req, res) => {

    // [TRANSF] Percorre os empréstimos e busca os livros relacionados.
    const resultado = emprestimos.map(e => {
        const livro = livros.find(l => l.id === e.livroId);

        // [TRANSF] Calcula se o empréstimo está atrasado.
        const status = e.status === "ATIVO" &&
            new Date(e.dataDevolucaoPrevista) < new Date()
            ? "ATRASADO"
            : e.status;

        return {
            ...e,
            status,
            livro: livro || null
        };
    });

    res.status(200).json(resultado);
});


// 9. GET /api/v1/emprestimos/:id - Buscar empréstimo por ID
app.get('/api/v1/emprestimos/:id', (req, res) => {

    // [FLUXO] Recebe o ID do empréstimo pela URL.
    const id = Number(req.params.id);

    // [TRANSF] Procura o empréstimo correspondente ao ID.
    const emprestimo = emprestimos.find(e => e.id === id);

    // [ERRO] Retorna 404 caso o empréstimo não exista.
    if (!emprestimo) {
        return res.status(404).json({
            erro: "Emprestimo nao encontrado."
        });
    }

    // [TRANSF] Busca os dados do livro associado ao empréstimo.
    const livro = livros.find(l => l.id === emprestimo.livroId);

    // [TRANSF] Verifica se a data prevista de devolução já passou.
    const status = emprestimo.status === "ATIVO" &&
        new Date(emprestimo.dataDevolucaoPrevista) < new Date()
        ? "ATRASADO"
        : emprestimo.status;

    res.status(200).json({
        ...emprestimo,
        status,
        livro: livro || null
    });
});


// 10. POST /api/v1/emprestimos - Cadastrar novo empréstimo
app.post('/api/v1/emprestimos', (req, res) => {

    // [FLUXO] Recebe os dados do empréstimo enviados pelo cliente.
    const {
        livroId,
        nomeUsuario,
        dataDevolucaoPrevista
    } = req.body;

    // [ERRO] Verifica se os campos obrigatórios foram informados.
    if (!livroId || !nomeUsuario || !dataDevolucaoPrevista) {
        return res.status(400).json({
            erro: "Informe o livroId, nomeUsuario e dataDevolucaoPrevista."
        });
    }

    // [TRANSF] Procura o livro relacionado ao empréstimo.
    const livro = livros.find(l => l.id === Number(livroId));

    // [ERRO] Verifica se o livro está disponível para empréstimo.
    if (livro.status !== "DISPONIVEL") {
        return res.status(400).json({
            erro: "Este livro nao esta disponivel para emprestimo."
        });
    }

    // [TRANSF] Converte a data recebida para o formato Date.
    const dataPrevista = new Date(dataDevolucaoPrevista);

    // [ERRO] Valida o formato e a existência da data informada.
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(dataDevolucaoPrevista) ||
        isNaN(dataPrevista.getTime()) ||
        dataPrevista.toISOString().slice(0, 10) !== dataDevolucaoPrevista
    ) {
        return res.status(400).json({
            erro: "Data de devolucao invalida. Utilize YYYY-MM-DD."
        });
    }

    // [TRANSF] Obtém a data atual para comparação.
    const hoje = new Date().toISOString().slice(0, 10);

    // [ERRO] Impede o cadastro de uma data de devolução no passado.
    if (dataDevolucaoPrevista < hoje) {
        return res.status(400).json({
            erro: "A data de devolucao nao pode estar no passado."
        });
    }

    // [TRANSF] Calcula o próximo ID disponível para o empréstimo.
    const novoId = emprestimos.length > 0
        ? Math.max(...emprestimos.map(e => e.id)) + 1
        : 1;

    // [TRANSF] Organiza os dados do novo empréstimo.
    const novoEmprestimo = {
        id: novoId,
        livroId: livro.id,
        nomeUsuario: nomeUsuario.trim(),
        dataEmprestimo: new Date(),
        dataDevolucaoPrevista,
        dataDevolucao: null,
        status: "ATIVO"
    };

    // [ERRO] Verifica se o nome do usuário não ficou vazio.
    if (!novoEmprestimo.nomeUsuario) {
        return res.status(400).json({
            erro: "O nome do usuario e obrigatorio."
        });
    }

    // [TRANSF] Registra o empréstimo e atualiza o status do livro.
    emprestimos.push(novoEmprestimo);
    livro.status = "EMPRESTADO";

    res.status(201).json({
        mensagem: "Emprestimo cadastrado com sucesso!",
        emprestimo: novoEmprestimo,
        livro
    });
});


// 11. PUT /api/v1/emprestimos/:id - Atualizar empréstimo
app.put('/api/v1/emprestimos/:id', (req, res) => {

    // [FLUXO] Recebe o ID do empréstimo pela URL.
    const id = Number(req.params.id);

    // [TRANSF] Procura o empréstimo que será atualizado.
    const emprestimo = emprestimos.find(e => e.id === id);

    // [ERRO] Verifica se o empréstimo existe.
    if (!emprestimo) {
        return res.status(404).json({
            erro: "Emprestimo nao encontrado."
        });
    }

    // [ERRO] Impede alterações em empréstimos já devolvidos.
    if (emprestimo.status === "DEVOLVIDO") {
        return res.status(400).json({
            erro: "Nao e possivel atualizar um emprestimo devolvido."
        });
    }

    // [FLUXO] Recebe os novos dados enviados pelo cliente.
    const { nomeUsuario, dataDevolucaoPrevista } = req.body;

    // [ERRO] Valida o preenchimento dos campos obrigatórios.
    if (!nomeUsuario || !dataDevolucaoPrevista) {
        return res.status(400).json({
            erro: "Informe nomeUsuario e dataDevolucaoPrevista."
        });
    }

    // [TRANSF] Converte a data informada para Date.
    const dataPrevista = new Date(dataDevolucaoPrevista);

    // [ERRO] Verifica se a data possui formato válido.
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(dataDevolucaoPrevista) ||
        isNaN(dataPrevista.getTime()) ||
        dataPrevista.toISOString().slice(0, 10) !== dataDevolucaoPrevista
    ) {
        return res.status(400).json({
            erro: "Data de devolucao invalida. Utilize YYYY-MM-DD."
        });
    }

    // [ERRO] Impede a utilização de uma data no passado.
    if (dataDevolucaoPrevista < new Date().toISOString().slice(0, 10)) {
        return res.status(400).json({
            erro: "A data de devolucao nao pode estar no passado."
        });
    }

    // [TRANSF] Normaliza o nome do usuário removendo espaços externos.
    emprestimo.nomeUsuario = nomeUsuario.trim();

    // [ERRO] Verifica se o nome informado não está vazio.
    if (!emprestimo.nomeUsuario) {
        return res.status(400).json({
            erro: "O nome do usuario e obrigatorio."
        });
    }

    // [TRANSF] Atualiza a data prevista de devolução.
    emprestimo.dataDevolucaoPrevista = dataDevolucaoPrevista;

    res.status(200).json({
        mensagem: "Emprestimo atualizado com sucesso!",
        emprestimo
    });
});


// 12. PATCH /api/v1/emprestimos/:id/devolucao - Registrar devolução
app.patch('/api/v1/emprestimos/:id/devolucao', (req, res) => {

    // [FLUXO] Recebe o ID do empréstimo pela URL.
    const id = Number(req.params.id);

    // [TRANSF] Procura o empréstimo correspondente.
    const emprestimo = emprestimos.find(e => e.id === id);

    // [ERRO] Verifica se o empréstimo existe.
    if (!emprestimo) {
        return res.status(404).json({
            erro: "Emprestimo nao encontrado."
        });
    }

    // [ERRO] Impede que uma devolução seja registrada duas vezes.
    if (emprestimo.status === "DEVOLVIDO") {
        return res.status(400).json({
            erro: "Este livro ja foi devolvido."
        });
    }

    // [TRANSF] Registra a data e altera o status do empréstimo.
    emprestimo.dataDevolucao = new Date();
    emprestimo.status = "DEVOLVIDO";

    // [TRANSF] Localiza o livro associado ao empréstimo.
    const livro = livros.find(l => l.id === emprestimo.livroId);

    // [TRANSF] Atualiza a disponibilidade do livro.
    if (livro) {
        livro.status = "DISPONIVEL";
    }

    res.status(200).json({
        mensagem: "Devolucao registrada com sucesso!",
        emprestimo,
        livro: livro || null
    });
});


// 13. PATCH /api/v1/emprestimos/:id/atraso - Registrar atraso
app.patch('/api/v1/emprestimos/:id/atraso', (req, res) => {

    // [FLUXO] Recebe o ID do empréstimo pela URL.
    const id = Number(req.params.id);

    // [TRANSF] Procura o empréstimo correspondente.
    const emprestimo = emprestimos.find(e => e.id === id);

    // [ERRO] Verifica se o empréstimo existe.
    if (!emprestimo) {
        return res.status(404).json({
            erro: "Emprestimo nao encontrado."
        });
    }

    // [ERRO] Impede registrar atraso em um empréstimo já devolvido.
    if (emprestimo.status === "DEVOLVIDO") {
        return res.status(400).json({
            erro: "Este livro ja foi devolvido."
        });
    }

    // [TRANSF] Atualiza o status do empréstimo para atrasado.
    emprestimo.status = "ATRASADO";

    // [TRANSF] Localiza o livro associado ao empréstimo.
    const livro = livros.find(l => l.id === emprestimo.livroId);

    // [TRANSF] Atualiza o status do livro quando necessário.
    if (livro) {
        if (livro.status === "EMPRESTADO") {
            livro.status = "ATRASADO";
        }
    }

    res.status(200).json({
        mensagem: "Atraso registrado com sucesso!",
        emprestimo,
        livro: livro || null
    });
});


// 14. DELETE /api/v1/emprestimos/:id - Excluir empréstimo
app.delete('/api/v1/emprestimos/:id', (req, res) => {

    // [FLUXO] Recebe o ID do empréstimo pela URL.
    const id = Number(req.params.id);

    // [TRANSF] Localiza o índice do empréstimo.
    const index = emprestimos.findIndex(e => e.id === id);

    // [ERRO] Verifica se o empréstimo existe.
    if (index === -1) {
        return res.status(404).json({
            erro: "Emprestimo nao encontrado."
        });
    }

    // [ERRO] Permite excluir somente empréstimos devolvidos.
    if (emprestimos[index].status !== "DEVOLVIDO") {
        return res.status(400).json({
            erro: "So e possivel excluir emprestimos devolvidos."
        });
    }

    // [TRANSF] Remove o empréstimo do array.
    emprestimos.splice(index, 1);

    res.status(200).json({
        mensagem: "Emprestimo excluido com sucesso!"
    });
});


// [FLUXO] Rota de dashboard com informações analíticas da biblioteca
app.get('/api/v1/dashboard', (req, res) => {

    // [TRANSF] Inicializa os contadores dos livros
    const livrosPorStatus = {};
    
    // [TRANSF] Conta a quantidade de livros por status
    livros.forEach((livro) => {
        const status = String(livro.status || 'SEM_STATUS').toUpperCase();

        livrosPorStatus[status] = (livrosPorStatus[status] || 0) + 1;
    });

    // [TRANSF] Inicializa os contadores dos empréstimos
    const emprestimosPorStatus = {};

    // [TRANSF] Conta a quantidade de empréstimos por status
    emprestimos.forEach((emprestimo) => {
        const status = String(
            emprestimo.status || 'SEM_STATUS'
        ).toUpperCase();

        emprestimosPorStatus[status] =
            (emprestimosPorStatus[status] || 0) + 1;
    });

    // [FLUXO] Monta os dados que serão enviados ao cliente
    const dashboard = {
        totalLivros: livros.length,
        livrosPorStatus: livrosPorStatus,

        totalEmprestimos: emprestimos.length,
        emprestimosPorStatus: emprestimosPorStatus
    };

    // [FLUXO] Retorna os dados em formato JSON
    res.status(200).json(dashboard);
});

// [FLUXO] Inicia o servidor e disponibiliza a API na porta configurada.
app.listen(PORT, () => {
    console.log(`[BIBLIOTECH] API de Gestão de Biblioteca rodando em http://localhost:${PORT}`);
});

