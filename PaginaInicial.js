document.addEventListener("DOMContentLoaded", async () => {
    // URL base do seu backend Python (ajuste se necessário)
    // Se você estiver rodando em um servidor diferente, mude esta URL
    const BACKEND_URL = 'http://127.0.0.1:5000';

    // Referências aos elementos DOM
    const connectionStatusDiv = document.getElementById("connection-status");
    const cards = document.querySelectorAll(".card");
    const notificationBadges = document.querySelectorAll(".notification-badge");
    const simulateButtons = document.querySelectorAll(".simulate-btn");

    // Referências DOM para o modal de mensagem
    const messageModal = document.getElementById("message-modal");
    const messageModalTitle = document.getElementById("message-modal-title");
    const messageModalText = document.getElementById("message-modal-text");
    const messageModalOkButton = document.getElementById("message-modal-ok-button");

    // Simula um ID de usuário. Em um app real, viria de um sistema de autenticação.
    const userId = "user_dashboard_123";

    // --- Funções Auxiliares de UI (para substituir alert/confirm) ---
    function showMessageBox(title, message, callback = () => {}) {
        messageModalTitle.textContent = title;
        messageModalText.textContent = message;
        messageModal.classList.add("visible");

        messageModalOkButton.onclick = null;
        messageModalOkButton.onclick = () => {
            messageModal.classList.remove("visible");
            callback();
        };
    }

    // --- Funções de Notificação (Comunicação com Backend Python) ---

    // Função para atualizar os badges na UI com base nos dados do backend
    function updateNotificationBadgesUI(notificationCounts) {
        notificationBadges.forEach(badge => {
            const cardTarget = badge.dataset.cardTarget;
            let count = notificationCounts[cardTarget] || 0;

            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.classList.add('visible');
            } else {
                badge.textContent = '0';
                badge.classList.remove('visible');
            }
        });
    }

    // Busca as notificações do backend (polling para simular tempo real)
    async function fetchNotifications() {
        connectionStatusDiv.textContent = "Buscando notificações...";
        try {
            const response = await fetch(`${BACKEND_URL}/api/notifications/${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            updateNotificationBadgesUI(data);
            connectionStatusDiv.textContent = "Conectado ao Backend.";
            console.log("Notificações atualizadas do Backend:", data);
        } catch (error) {
            console.error("Erro ao buscar notificações do Backend:", error);
            connectionStatusDiv.textContent = `Erro de conexão: ${error.message}. Verifique se o backend está rodando.`;
            showMessageBox("Erro de Conexão", `Não foi possível conectar ao backend. Verifique o console para mais detalhes.`);
        }
    }

    // Incrementa a contagem de notificação para um card específico no Backend
    async function incrementNotification(cardType) {
        try {
            const response = await fetch(`${BACKEND_URL}/api/notifications/increment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userId, cardType: cardType })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(`Notificação incrementada para ${cardType}:`, data);
            fetchNotifications();
        } catch (error) {
            console.error("Erro ao incrementar notificação:", error);
            showMessageBox("Erro", `Falha ao adicionar notificação para ${cardType}.`);
        }
    }

    // Zera a contagem de notificação para um card específico no Backend
    async function clearNotification(cardType) {
        try {
            const response = await fetch(`${BACKEND_URL}/api/notifications/clear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userId, cardType: cardType })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(`Notificações zeradas para ${cardType}:`, data);
            fetchNotifications();
        } catch (error) {
            console.error("Erro ao zerar notificação:", error);
            showMessageBox("Erro", `Falha ao zerar notificações para ${cardType}.`);
        }
    }

    // --- Configuração de Event Listeners ---

    // Configura os botões de simulação
    function setupSimulationButtons() {
        simulateButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetCardType = button.dataset.simulateTarget;
                incrementNotification(targetCardType);
            });
        });
    }

    // Referências DOM para o botão de tela cheia
    const fullscreenButton = document.getElementById("fullscreen-button");
    // Garante que o ícone de expandir já existe no HTML ou o cria
    let expandIcon = fullscreenButton.querySelector('.fa-expand');
    if (!expandIcon) {
        expandIcon = document.createElement('i');
        expandIcon.classList.add('fas', 'fa-expand');
        fullscreenButton.prepend(expandIcon); // Adiciona no início do botão
    }

    const compressIcon = document.createElement('i');
    compressIcon.classList.add('fas', 'fa-compress');
    compressIcon.style.display = 'none'; // Escondido por padrão
    fullscreenButton.appendChild(compressIcon);

    // Função para entrar em tela cheia e atualizar o botão
    function enterFullscreenMode() {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().then(() => {
                fullscreenButton.classList.add('active');
                expandIcon.style.display = 'none';
                compressIcon.style.display = 'inline-block';
                // Salva o estado de tela cheia no localStorage
                localStorage.setItem('minhavida_fullscreen_active', 'true');
            }).catch(err => {
                console.error(`Erro ao tentar entrar em tela cheia: ${err.message} (${err.name})`);
                showMessageBox("Erro de Tela Cheia", "Não foi possível entrar no modo de tela cheia. Seu navegador pode ter restrições ou a solicitação foi negada.");
            });
        }
    }

    // Função para sair da tela cheia e atualizar o botão
    function exitFullscreenMode() {
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
                fullscreenButton.classList.remove('active');
                expandIcon.style.display = 'inline-block';
                compressIcon.style.display = 'none';
                // Remove o estado de tela cheia do localStorage
                localStorage.removeItem('minhavida_fullscreen_active');
            }).catch(err => {
                console.error(`Erro ao tentar sair da tela cheia: ${err.message} (${err.name})`);
            });
        }
    }

    // Event listener para o botão de tela cheia
    fullscreenButton.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            enterFullscreenMode();
        } else {
            exitFullscreenMode();
        }
    });

    // Atualiza o botão se o usuário sair/entrar do modo de tela cheia por outro meio (ex: tecla ESC)
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            fullscreenButton.classList.remove('active');
            expandIcon.style.display = 'inline-block';
            compressIcon.style.display = 'none';
            // Remove o estado se sair por ESC, etc.
            localStorage.removeItem('minhavida_fullscreen_active');
        } else {
            fullscreenButton.classList.add('active');
            expandIcon.style.display = 'none';
            compressIcon.style.display = 'inline-block';
            // Salva o estado se entrar em tela cheia por outro meio
            localStorage.setItem('minhavida_fullscreen_active', 'true');
        }
    });

    // Event listeners para os cards
    cards.forEach(card => {
        card.addEventListener('click', (event) => {
            // Impedir a navegação padrão do <a> para controlar o redirecionamento
            event.preventDefault(); // MUITO IMPORTANTE!

            const cardType = card.dataset.cardType;
            let targetUrl = ''; // Variável para armazenar a URL de destino

            // Zera as notificações do card clicado
            clearNotification(cardType);

            if (cardType === 'gestor-tarefas') {
                targetUrl = 'index.html';
            } else if (cardType === 'music') {
                targetUrl = 'Spotify.html';
            } else if (cardType === 'news') {
                targetUrl = 'noticias.html';
            } else if (cardType === 'calendar') {
                targetUrl = 'calendario.html';
            } else if (cardType === 'pomodoro') {
                targetUrl = 'pomodoro.html';
            } else {
                showMessageBox("Navegação", `Você clicou no card: "${cardType}"`);
                return; // Impede redirecionamento para estes cards
            }

            // **NOVO:** Antes de redirecionar, verifica se está em tela cheia
            if (document.fullscreenElement) {
                // Se estiver em tela cheia, registra no localStorage
                localStorage.setItem('minhavida_fullscreen_active', 'true');
            } else {
                // Se não estiver, garante que não há lixo no localStorage
                localStorage.removeItem('minhavida_fullscreen_active');
            }

            // Redireciona para a URL de destino
            window.location.href = targetUrl;
        });
    });

    // Inicia a busca de notificações e configura os botões de simulação
    fetchNotifications();
    setInterval(fetchNotifications, 5000); // Polling para simular tempo real
    setupSimulationButtons(); // Configura os listeners dos botões de simulação

    // Referência e Event Listener para o botão de voltar (se existir)
    const backButton = document.getElementById("back-button");
    if (backButton) {
        backButton.addEventListener("click", () => {
            history.back();
        });
    }
});
