document.addEventListener('DOMContentLoaded', () => {
    const newsGrid = document.querySelector('.latest-news .news-grid');

    // =====================================================================================
    // SUA CHAVE DE API FOI INSERIDA AQUI!
    // =====================================================================================
    const NEWS_API_KEY = 'b9b6a0ebfd5c4a0cb288748ea1d9df7e';

    // =====================================================================================
    // CONFIGURE AS FONTES DE NOTÍCIAS (NewsAPI.org exemplos)
    // =====================================================================================
    // Adapte estes URLs dependendo da API que você está usando (NewsAPI, GNews, etc.)
    // e dos tipos de notícias que você quer.
    // Lembre-se dos limites da camada gratuita (Ex: NewsAPI para contas gratuitas só mostra últimas 24h para /everything)
    const NEWS_SOURCES_CONFIG = [
        // Exemplo NewsAPI: Notícias gerais do mundo (em inglês)
        { url: `https://newsapi.org/v2/everything?q=world&language=en&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}` },
        // Exemplo NewsAPI: Notícias da CNN (em inglês)
        { url: `https://newsapi.org/v2/top-headlines?sources=cnn&language=en&pageSize=3&apiKey=${NEWS_API_KEY}` },
        // Exemplo NewsAPI: Notícias da BBC News (em inglês)
        { url: `https://newsapi.org/v2/top-headlines?sources=bbc-news&language=en&pageSize=3&apiKey=${NEWS_API_KEY}` },
        // Exemplo NewsAPI: Notícias do New York Times (buscando por termo, pode vir de várias fontes)
        { url: `https://newsapi.org/v2/everything?q=new%20york%20times&language=en&sortBy=publishedAt&pageSize=3&apiKey=${NEWS_API_KEY}` },
        // Exemplo NewsAPI: Notícias de tecnologia (em português)
        { url: `https://newsapi.org/v2/everything?q=tecnologia&language=pt&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}` },
    ];

    // Função para renderizar as notícias no DOM
    function renderNews(newsItems) {
        newsGrid.innerHTML = ''; // Limpa o conteúdo atual

        if (newsItems.length === 0) {
            newsGrid.innerHTML = '<p>Nenhuma notícia encontrada no momento. Verifique sua chave de API, as fontes configuradas, ou os limites da API.</p>';
            return;
        }

        newsItems.forEach(news => {
            const article = document.createElement('article');
            article.classList.add('news-card');

            // Verifica se a URL da imagem existe e não é um placeholder problemático
            const imageUrl = news.imageUrl && news.imageUrl.startsWith('http') && !news.imageUrl.includes('placeholder.jpg') ? news.imageUrl : '';
            const imageHtml = imageUrl ? `<img src="${imageUrl}" alt="${news.title}" class="news-thumbnail">` : '';

            // Limita a descrição para um tamanho razoável
            const shortDescription = news.description ? news.description.substring(0, 180) + (news.description.length > 180 ? '...' : '') : 'Nenhuma descrição disponível.';

            article.innerHTML = `
                ${imageHtml}
                <h3>${news.title}</h3>
                <p>${shortDescription}</p>
                <a href="${news.link}" class="read-more" target="_blank" rel="noopener noreferrer">Leia Mais na ${news.sourceName || 'Fonte'}</a>
            `;
            newsGrid.appendChild(article);
        });
    }

    // Função para buscar e exibir as últimas notícias de múltiplas fontes
    async function fetchAndDisplayLatestNews() {
        console.log("Buscando notícias das fontes especificadas...");
        let allNews = [];

        for (const config of NEWS_SOURCES_CONFIG) {
            try {
                const response = await fetch(config.url);

                // =====================================================================================
                // VERIFIQUE A RESPOSTA HTTP NO CONSOLE (F12) PARA DIAGNÓSTICOS
                // =====================================================================================
                // Se response.ok for false, houve um erro HTTP (401, 403, 429, 500, etc.)
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({})); // Tenta ler a mensagem de erro da API
                    console.warn(`Erro ao buscar de ${config.url}: Status ${response.status} - ${response.statusText}. API Mensagem: ${errorData.message || 'Nenhuma mensagem específica da API.'}`);
                    continue; // Pular para a próxima URL se houver erro
                }
                const data = await response.json();

                // =====================================================================================
                // VERIFIQUE A ESTRUTURA DOS DADOS RETORNADOS PELA API
                // =====================================================================================
                // NewsAPI retorna 'data.articles'. Se estiver usando outra API, pode ser 'data.news', 'data.results', etc.
                if (data.articles && Array.isArray(data.articles)) {
                    const formattedArticles = data.articles.map(article => ({
                        title: article.title || 'Título Indisponível',
                        description: article.description || 'Nenhuma descrição disponível.',
                        link: article.url || '#', // URL para a notícia completa
                        imageUrl: article.urlToImage, // NewsAPI usa 'urlToImage'. GNews usa 'image'.
                        sourceName: article.source ? article.source.name : 'Desconhecida' // NewsAPI usa 'article.source.name'. GNews usa 'article.source.title'.
                    }));
                    allNews = allNews.concat(formattedArticles);
                } else {
                    console.warn(`Resposta da API para ${config.url} não contém 'articles' ou 'articles' não é um array. Dados recebidos:`, data);
                }
            } catch (error) {
                // Erros de rede (CORS, internet offline, etc.)
                console.error(`Erro de rede ou processamento ao buscar notícias de ${config.url}:`, error);
                if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                     console.error("Possível erro de CORS. Verifique se está rodando em um servidor local (ex: http-server) ou configure exceções se for para teste local.");
                }
            }
        }

        // Embaralha as notícias para não exibir sempre as mesmas primeiro de cada API
        allNews.sort(() => 0.5 - Math.random());

        // Limita a quantidade de notícias exibidas para não sobrecarregar a página
        const maxNewsToShow = 12; // Exibe no máximo 12 notícias
        renderNews(allNews.slice(0, maxNewsToShow));
    }

    // Chama a função para carregar as notícias quando a página carrega
    fetchAndDisplayLatestNews();

    // =====================================================================================
    // Opcional: Atualizar as notícias a cada X minutos para simular "tempo real"
    // =====================================================================================
    // **AVISO:** Use isso com EXTREMA CAUTELA devido aos limites de requisição das APIs gratuitas.
    // Se você exceder os limites, sua chave de API pode ser bloqueada temporariamente.
    // setInterval(fetchAndDisplayLatestNews, 300000); // 5 minutos (300000 ms)

    // Código do botão "Voltar ao Topo" (mantido do exemplo anterior)
    const backToTopButton = document.createElement('button');
    backToTopButton.textContent = '↑ Voltar ao Topo';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--accent-green);
        color: var(--background-dark);
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        display: none;
        z-index: 1000;
    `;
    document.body.appendChild(backToTopButton);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});