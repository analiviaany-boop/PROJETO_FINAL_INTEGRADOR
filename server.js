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
	res.status(200).json({ status: "ONLINE", application: "BINARIO TECH API V1.1", uptime: process.uptime(), memory: process.memoryUsage() });
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

app.listen(PORT, () => {
	console.log(`API de Gestão de Biblioteca rodando em http://localhost:${PORT}`);
});
