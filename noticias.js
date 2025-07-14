document.addEventListener('DOMContentLoaded', () => {
    const newsGrid = document.querySelector('.latest-news .news-grid');
    const featuredTitleElement = document.getElementById('featured-title');
    const featuredDescriptionElement = document.getElementById('featured-description');
    const featuredLinkElement = document.getElementById('featured-link');

    // =====================================================================================
    // SUA CHAVE DE API FOI INSERIDA AQUI!
    // =====================================================================================
    const NEWS_API_KEY = 'b9b6a0ebfd5c4a0cb288748ea1d9df7e';

    // =====================================================================================
    // CONFIGURE AS FONTES DE NOTÍCIAS (NewsAPI.org exemplos)
    // =====================================================================================
    const NEWS_SOURCES_CONFIG = [
        { url: `https://newsapi.org/v2/everything?q=world&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}` },
        { url: `https://newsapi.org/v2/top-headlines?sources=cnn&language=en&pageSize=5&apiKey=${NEWS_API_KEY}` },
        { url: `https://newsapi.org/v2/top-headlines?sources=bbc-news&language=en&pageSize=5&apiKey=${NEWS_API_KEY}` },
        { url: `https://newsapi.org/v2/everything?q=new%20york%20times&language=en&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}` },
        { url: `https://newsapi.org/v2/everything?q=tecnologia&language=pt&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}` },
    ];

    function renderNews(newsItems) {
        newsGrid.innerHTML = '';
        if (newsItems.length === 0) {
            newsGrid.innerHTML = '<p>Nenhuma notícia encontrada.</p>';
            return;
        }

        // Exibe a primeira notícia como destaque
        const featuredNews = newsItems.shift(); // Remove e retorna o primeiro item do array
        if (featuredNews) {
            featuredTitleElement.textContent = featuredNews.title || 'Título Indisponível';
            featuredDescriptionElement.textContent = featuredNews.description || 'Nenhuma descrição disponível.';
            featuredLinkElement.href = featuredNews.link || '#';
        }

        newsItems.forEach(news => {
            const article = document.createElement('article');
            article.classList.add('news-card');
            const imageUrl = news.imageUrl && news.imageUrl.startsWith('http') ? news.imageUrl : '';
            const imageHtml = imageUrl ? `<img src="${imageUrl}" alt="${news.title}" class="news-thumbnail">` : '';
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

    async function fetchAndDisplayLatestNews() {
        console.log("Buscando notícias...");
        let allNews = [];

        for (const config of NEWS_SOURCES_CONFIG) {
            try {
                const response = await fetch(config.url);
                if (!response.ok) {
                    console.warn(`Erro ao buscar de ${config.url}: ${response.status} - ${response.statusText}`);
                    continue;
                }
                const data = await response.json();
                if (data.articles && Array.isArray(data.articles)) {
                    const formattedArticles = data.articles.map(article => ({
                        title: article.title || 'Título Indisponível',
                        description: article.description || 'Nenhuma descrição disponível.',
                        link: article.url || '#',
                        imageUrl: article.urlToImage,
                        sourceName: article.source ? article.source.name : 'Desconhecida'
                    }));
                    allNews = allNews.concat(formattedArticles);
                }
            } catch (error) {
                console.error(`Erro ao buscar notícias de ${config.url}:`, error);
            }
        }

        allNews.sort(() => Math.random() - 0.5);
        renderNews(allNews);
    }

    fetchAndDisplayLatestNews();

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

    // NOVO: Referência e Event Listener para o botão de voltar
    const backButton = document.getElementById("back-button");
    if (backButton) { // Adicione esta verificação para evitar erros se o botão não for encontrado
        backButton.addEventListener("click", () => {
            history.back(); // Esta função do navegador faz a página voltar na história
        });
    }
});