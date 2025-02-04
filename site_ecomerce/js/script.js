// Função para carregar produtos da API e exibir na página inicial
async function carregarProdutos() {
  try {
    const resposta = await fetch('https://dummyjson.com/products');
    const dados = await resposta.json();
    const produtos = dados.products;

    // Armazena todos os produtos para filtragem
    window.produtosOriginais = produtos;

    // Chama a função para exibir produtos na página inicial
    exibirProdutos(produtos);

    // Adiciona o evento de filtragem por nome
    document.getElementById('busca').addEventListener('input', (e) => {
      const termoFiltro = e.target.value.toLowerCase();
      filtrarProdutos(termoFiltro, getCategoriaFiltro(), getMarcaFiltro());
    });

    // Adiciona eventos para filtros de categoria e marca
    document.getElementById('filtro-categoria').addEventListener('change', (e) => {
      filtrarProdutos(getBuscaFiltro(), e.target.value, getMarcaFiltro());
    });

    document.getElementById('filtro-marca').addEventListener('change', (e) => {
      filtrarProdutos(getBuscaFiltro(), getCategoriaFiltro(), e.target.value);
    });

  } catch (error) {
    console.error('Erro ao carregar os produtos:', error);
  }
}

// Função para filtrar produtos com base nos critérios
function filtrarProdutos(termoFiltro, categoria, marca) {
  const produtosFiltrados = window.produtosOriginais.filter(produto => {
    const atendeFiltroNome = produto.title.toLowerCase().includes(termoFiltro);
    const atendeFiltroCategoria = categoria ? produto.category.toLowerCase() === categoria.toLowerCase() : true;
    const atendeFiltroMarca = marca ? produto.brand.toLowerCase() === marca.toLowerCase() : true;
    return atendeFiltroNome && atendeFiltroCategoria && atendeFiltroMarca;
  });

  exibirProdutos(produtosFiltrados);
}

// Funções auxiliares para obter filtros
function getBuscaFiltro() {
  return document.getElementById('busca').value.toLowerCase();
}

function getCategoriaFiltro() {
  return document.getElementById('filtro-categoria').value;
}

function getMarcaFiltro() {
  return document.getElementById('filtro-marca').value;
}

// Função para exibir produtos na página
function exibirProdutos(produtos) {
  const listaProdutos = document.getElementById('lista-produtos');
  listaProdutos.innerHTML = ''; // Limpa a lista antes de adicionar produtos

  if (produtos.length === 0) {
    listaProdutos.innerHTML = '<p>Nenhum produto encontrado.</p>';
    return;
  }

  produtos.forEach(produto => {
    const produtoDiv = document.createElement('div');
    produtoDiv.innerHTML = `
      <img src="${produto.thumbnail}" alt="${produto.title}">
      <h3>${produto.title}</h3>
      <p>${produto.description}</p>
      <span>R$${produto.price}</span>
      <button onclick="adicionarAoCarrinho(${produto.id})">Adicionar ao Carrinho</button>
      <button onclick="window.location.href='produto.html?id=${produto.id}'" class="btn-ver-detalhes">Ver detalhes</button>
    `;
    listaProdutos.appendChild(produtoDiv);
  });
}

// Função para adicionar produto ao carrinho
function adicionarAoCarrinho(idProduto) {
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  carrinho.push(idProduto);
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  alert('Produto adicionado ao carrinho!');
}

// Função para carregar os produtos no carrinho
async function carregarCarrinho() {
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  const itensCarrinho = document.getElementById('itens-carrinho');
  itensCarrinho.innerHTML = '';

  try {
    const resposta = await fetch('https://dummyjson.com/products');
    const dados = await resposta.json();
    const produtos = dados.products;

    carrinho.forEach(idProduto => {
      const produto = produtos.find(p => p.id === idProduto);
      if (produto) {
        const itemDiv = document.createElement('li');
        itemDiv.innerHTML = `
          <span>${produto.title} - R$${produto.price}</span>
          <button onclick="removerDoCarrinho(${produto.id})">Remover</button>
        `;
        itensCarrinho.appendChild(itemDiv);
      }
    });

    atualizarTotalCarrinho(produtos, carrinho);
  } catch (error) {
    console.error('Erro ao carregar o carrinho:', error);
  }
}

// Função para remover produto do carrinho
function removerDoCarrinho(idProduto) {
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  carrinho = carrinho.filter(id => id !== idProduto);
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  carregarCarrinho();
}

// Função para atualizar o total do carrinho
function atualizarTotalCarrinho(produtos, carrinho) {
  let total = 0;
  carrinho.forEach(idProduto => {
    const produto = produtos.find(p => p.id === idProduto);
    if (produto) {
      total += produto.price;
    }
  });
  document.getElementById('total-carrinho').textContent = `Total: R$${total.toFixed(2)}`;
}

// Função para carregar detalhes do produto individual
async function carregarDetalhesProduto() {
  const params = new URLSearchParams(window.location.search);
  const idProduto = params.get('id');
  
  try {
    const resposta = await fetch(`https://dummyjson.com/products/${idProduto}`);
    const produto = await resposta.json();

    document.getElementById('nome-produto').textContent = produto.title;
    document.getElementById('descricao-produto').textContent = produto.description;
    document.getElementById('preco-produto').textContent = `R$${produto.price}`;
    document.querySelector('#detalhes-produto img').src = produto.thumbnail;
    document.getElementById('adicionar-carrinho').onclick = () => adicionarAoCarrinho(produto.id);
  } catch (error) {
    console.error('Erro ao carregar os produtos:', error);
    const listaProdutos = document.getElementById('lista-produtos');
    listaProdutos.innerHTML = '<p>Não foi possível carregar os produtos. Verifique sua conexão e tente novamente.</p>';
  }
}

// Inicializar página inicial
if (window.location.pathname.endsWith('/html/index.html')) {
  carregarProdutos();
}

// Inicializar página do carrinho
if (window.location.pathname.endsWith('/html/carrinho.html')) {
  carregarCarrinho();
}

// Inicializar página de detalhes do produto
if (window.location.pathname.endsWith('/html/produto.html')) {
  carregarDetalhesProduto();
}
