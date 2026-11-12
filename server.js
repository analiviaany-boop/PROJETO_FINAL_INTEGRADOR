require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

// Banco de dados em memória - Livros
let livros = [
	{ id: 1, livro: "O Pequeno Principe", autor: "Antoine de Saint-Exupery", editora: "Editora Rocco", status: "DISPONIVEL" },
	{ id: 2, livro: "Harry Potter e o Calice de Fogo", autor: "J. K. Rowling", editora: "Editora Rocco", status: "EMPRESTADO" },
	{ id: 3, livro: "O Fantasma da Opera", autor: "Gaston Leroux", editora: "DarkSide Books", status: "ATRASADO" }
];

// Banco de dados em memória - Empréstimos
let emprestimos = [
	{ id: 1, livroId: 2, nomeUsuario: "Sofia Maradini", dataEmprestimo: "2026-11-06", dataDevolucaoPrevista: "2026-11-20", dataDevolucao: null, status: "ATIVO" },
	{ id: 2, livroId: 3, nomeUsuario: "Beatriz Gomes", dataEmprestimo: "2026-10-15", dataDevolucaoPrevista: "2026-10-29", dataDevolucao: null, status: "ATRASADO" },
	{ id: 3, livroId: 1, nomeUsuario: "Sebastião Lacerda", dataEmprestimo: "2026-10-06", dataDevolucaoPrevista: "2026-10-20", dataDevolucao: "2026-10-09", status: "DEVOLVIDO" }
];

// 1. GET /api/v1/livros - Listar todos os livros (Suporta filtro por status query param)
app.get('/api/v1/livros', (req, res) => {
	const { status } = req.query;
	if (status) {
		const filtrados = livros.filter(l => l.status.toUpperCase() === status.toUpperCase());
		return res.status(200).json(filtrados);
	}
	res.status(200).json(livros);
});

// 2. GET /api/v1/livros/:id - Buscar livro por ID
app.get('/api/v1/livros/:id', (req, res) => {
	const id = parseInt(req.params.id);
	const livro = livros.find(l => l.id === id);
	if (!livro) {
		return res.status(404).json({ erro: "Livro nao encontrado na base de dados." });
	}
	res.status(200).json(livro);
});

// 3. GET /api/v1/health - Mostrar o status da API
app.get('/api/v1/health', (req, res) => {
	res.status(200).json({ status: "ONLINE", application: "BIBLIOTECH API V1.0", uptime: process.uptime(), memory: process.memoryUsage() });
});

// 4. POST /api/v1/livros - Cadastrar novo livro (Criacao)
app.post('/api/v1/livros', (req, res) => {
	const { livro, autor, editora } = req.body;
	if (!livro || !autor || !editora) {
		return res.status(400).json({ erro: "Campos 'livro', 'autor' e 'editora' sao obrigatorios." });
	}

	const proximoId = livros.length > 0 ? Math.max(...livros.map(l => l.id)) + 1 : 1;

	const novoLivro = {
		id: proximoId,
		livro,
		autor,
		editora,
		status: "DISPONIVEL"
	};
	livros.push(novoLivro);
	res.status(201).json(novoLivro);
});

// 5. PATCH /api/v1/livros/:id/status - Atualizar status do livro
app.patch('/api/v1/livros/:id/status', (req, res) => {
	const id = parseInt(req.params.id);
	const { status } = req.body;
	const livro = livros.find(l => l.id === id);

	if (!livro) {
		return res.status(404).json({ erro: "Livro nao encontrado." });
	}
	if (!status) {
		return res.status(400).json({ erro: "O campo 'status' e obrigatorio." });
	}

	livro.status = String(status).toUpperCase();
	res.status(200).json({ mensagem: "Status atualizado com sucesso!", livro });
});

// 6. DELETE /api/v1/livros/:id - Remover livro do acervo
app.delete('/api/v1/livros/:id', (req, res) => {
	const id = parseInt(req.params.id);
	const index = livros.findIndex(l => l.id === id);
	if (index === -1) {
		return res.status(404).json({ erro: "Livro nao encontrado." });
	}
	livros.splice(index, 1);
	res.status(200).json({ mensagem: `Livro ID ${id} removido com sucesso.` });
});

// 7. PUT /api/v1/livros/:id - Substituir todos os dados de um livro
app.put('/api/v1/livros/:id', (req, res) => {
	const id = parseInt(req.params.id);
	const index = livros.findIndex(l => l.id === id);

	if (index === -1) {
		return res.status(404).json({ erro: "Livro nao encontrado." });
	}
	const { livro, autor, editora, status } = req.body;

	if (!livro || !autor || !editora || !status) {
		return res.status(400).json({ erro: "Todos os campos (livro, autor, editora, status) sao obrigatorios para o PUT." });
	}
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
	const resultado = emprestimos.map( e => {
		const livro = livros.find(l => l.id === e.livroId);

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
	const id = Number(req.params.id);

	const emprestimo = emprestimos.find(e => e.id === id);

	if (!emprestimo) {
		return res.status(404).json({
			erro: "Emprestimo nao encontrado."
		});
	}

	const livro = livros.find(l => l.id === emprestimo.livroId);

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
	const {
		livroId,
		nomeUsuario,
		dataDevolucaoPrevista
	} = req.body;

	if (!livroId || !nomeUsuario || !dataDevolucaoPrevista) {
		return res.status(400).json({
			erro: "Informe o livroId, nomeUsuario e dataDevolucaoPrevista."
		});
	}

	// Procura o livro pelo ID informado
	const livro = livros.find(l => l.id === Number(livroId));

	// Verifica se o livro existe
	if (livro.status !== "DISPONIVEL") {
		return res.status(400).json({
			erro: "Este livro nao esta disponivel para emprestimo."
		});
	}
	// Valida a data de devolução
    const dataPrevista = new Date(dataDevolucaoPrevista);

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(dataDevolucaoPrevista) ||
        isNaN(dataPrevista.getTime()) ||
        dataPrevista.toISOString().slice(0, 10) !== dataDevolucaoPrevista
    ) {
        return res.status(400).json({
            erro: "Data de devolucao invalida. Utilize YYYY-MM-DD."
        });
    }

    const hoje = new Date().toISOString().slice(0, 10);

    if (dataDevolucaoPrevista < hoje) {
        return res.status(400).json({
            erro: "A data de devolucao nao pode estar no passado."
        });
    }

    // Gera o próximo ID
    const novoId = emprestimos.length > 0
        ? Math.max(...emprestimos.map(e => e.id)) + 1
        : 1;

    // Cria o empréstimo
    const novoEmprestimo = {
        id: novoId,
        livroId: livro.id,
        nomeUsuario: nomeUsuario.trim(),
        dataEmprestimo: new Date(),
        dataDevolucaoPrevista,
        dataDevolucao: null,
        status: "ATIVO"
    };

    if (!novoEmprestimo.nomeUsuario) {
        return res.status(400).json({
            erro: "O nome do usuario e obrigatorio."
        });
    }

    emprestimos.push(novoEmprestimo);

    // Atualiza a disponibilidade do livro
    livro.status = "EMPRESTADO";

    res.status(201).json({
        mensagem: "Emprestimo cadastrado com sucesso!",
        emprestimo: novoEmprestimo,
        livro
    });
});


// 11. PUT /api/v1/emprestimos/:id - Atualizar empréstimo
app.put('/api/v1/emprestimos/:id', (req, res) => {
    const id = Number(req.params.id);

    const emprestimo = emprestimos.find(e => e.id === id);

    if (!emprestimo) {
        return res.status(404).json({
            erro: "Emprestimo nao encontrado."
        });
    }

    if (emprestimo.status === "DEVOLVIDO") {
        return res.status(400).json({
            erro: "Nao e possivel atualizar um emprestimo devolvido."
        });
    }

    const { nomeUsuario, dataDevolucaoPrevista } = req.body;

    if (!nomeUsuario || !dataDevolucaoPrevista) {
        return res.status(400).json({
            erro: "Informe nomeUsuario e dataDevolucaoPrevista."
        });
    }

    const dataPrevista = new Date(dataDevolucaoPrevista);

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(dataDevolucaoPrevista) ||
        isNaN(dataPrevista.getTime()) ||
        dataPrevista.toISOString().slice(0, 10) !== dataDevolucaoPrevista
    ) {
        return res.status(400).json({
            erro: "Data de devolucao invalida. Utilize YYYY-MM-DD."
        });
    }

    if (dataDevolucaoPrevista < new Date().toISOString().slice(0, 10)) {
        return res.status(400).json({
            erro: "A data de devolucao nao pode estar no passado."
        });
    }

    emprestimo.nomeUsuario = nomeUsuario.trim();

    if (!emprestimo.nomeUsuario) {
        return res.status(400).json({
            erro: "O nome do usuario e obrigatorio."
        });
    }

    emprestimo.dataDevolucaoPrevista = dataDevolucaoPrevista;

    res.status(200).json({
        mensagem: "Emprestimo atualizado com sucesso!",
        emprestimo
    });
});


// 12. PATCH /api/v1/emprestimos/:id/devolucao - Registrar devolução
app.patch('/api/v1/emprestimos/:id/devolucao', (req, res) => {
    const id = Number(req.params.id);

    const emprestimo = emprestimos.find(e => e.id === id);

    if (!emprestimo) {
        return res.status(404).json({
            erro: "Emprestimo nao encontrado."
        });
    }

    if (emprestimo.status === "DEVOLVIDO") {
        return res.status(400).json({
            erro: "Este livro ja foi devolvido."
        });
    }

    // Registra a data da devolução
    emprestimo.dataDevolucao = new Date();

    emprestimo.status = "DEVOLVIDO";

    // Procura o livro relacionado pelo livroId
    const livro = livros.find(l => l.id === emprestimo.livroId);

    if (livro) {
        livro.status = "DISPONIVEL";
    }

    res.status(200).json({
        mensagem: "Devolucao registrada com sucesso!",
        emprestimo,
        livro: livro || null
    });
});

// 13. PATCH /api/v1/emprestimos/:id/atraso - Registrar atraso do empréstimo
app.patch('/api/v1/emprestimos/:id/atraso', (req, res) => {
    const id = Number(req.params.id);

    const emprestimo = emprestimos.find(e => e.id === id);

    if (!emprestimo) {
        return res.status(404).json({
            erro: "Emprestimo nao encontrado."
        });
    }

    if (emprestimo.status === "DEVOLVIDO") {
        return res.status(400).json({
            erro: "Este livro ja foi devolvido."
        });
    }

    // Atualiza o status do empréstimo para ATRASADO
    emprestimo.status = "ATRASADO";

    // Procura o livro relacionado pelo livroId e atualiza o status automaticamente
    const livro = livros.find(l => l.id === emprestimo.livroId);

    if (livro) {
        livro.status = "ATRASADO";
    }

    res.status(200).json({
        mensagem: "Atraso registrado com sucesso!",
        emprestimo,
        livro: livro || null
    });
});

// 14. DELETE /api/v1/emprestimos/:id - Excluir empréstimo
app.delete('/api/v1/emprestimos/:id', (req, res) => {
    const id = Number(req.params.id);

    const index = emprestimos.findIndex(e => e.id === id);

    if (index === -1) {
        return res.status(404).json({
            erro: "Emprestimo nao encontrado."
        });
    }

    if (emprestimos[index].status !== "DEVOLVIDO") {
        return res.status(400).json({
            erro: "So e possivel excluir emprestimos devolvidos."
        });
    }

    emprestimos.splice(index, 1);

    res.status(200).json({
        mensagem: "Emprestimo excluido com sucesso!"
    });
});

app.listen(PORT, () => {
	console.log(`[BIBLIOTECH] API de Gestão de Biblioteca rodando em http://localhost:${PORT}`);
});
