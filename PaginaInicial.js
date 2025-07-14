document.addEventListener("DOMContentLoaded", async () => {
    // URL base do seu backend Python (ajuste se necessário)
    // Se você estiver rodando em um servidor diferente, mude esta URL
    const BACKEND_URL = 'http://127.0.0.1:5000'; 

    // Referências aos elementos DOM
    const connectionStatusDiv = document.getElementById("connection-status");
    const cards = document.querySelectorAll(".card");
    const notificationBadges = document.querySelectorAll(".notification-badge");
    const simulateButtons = document.querySelectorAll(".simulate-btn");

    // Referências DOM para o modal de mensagem (mantido do Firebase)
    const messageModal = document.getElementById("message-modal");
    const messageModalTitle = document.getElementById("message-modal-title");
    const messageModalText = document.getElementById("message-modal-text");
    const messageModalOkButton = document.getElementById("message-modal-ok-button");

    // Simula um ID de usuário. Em um app real, viria de um sistema de autenticação.
    // Para testes, um ID fixo ou gerado aleatoriamente simples serve.
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
            // Re-fetch para atualizar a UI, ou você pode atualizar diretamente se o backend retornar o estado completo
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
            // Re-fetch para atualizar a UI
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

    // Event listeners para os cards
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const cardType = card.dataset.cardType;
            let message = `Você clicou no card: "${cardType}"`;

            // Zera as notificações do card clicado
            clearNotification(cardType);

            if (cardType === 'gestor-tarefas') {
                message += '\nRedirecionando para o Gestor de Tarefas...';
                window.location.href = 'index.html'; // Redireciona para o gestor de tarefas
            } else if (cardType === 'pomodoro') {
                message = 'Você clicou no card Pomodoro!';
                window.location.href = 'pomodoro.html'; // Redireciona para a página do Pomodoro
            } else if (cardType === 'calendar') {
                message = 'Você clicou no card Calendário!';
                window.location.href = 'calendario.html'; // Redireciona para a página do Calendário
            } else {
                showMessageBox("Navegação", message);
            }
        });
    });

    // Inicia a busca de notificações e configura os botões de simulação
    // Chamada inicial para carregar as notificações
    fetchNotifications(); 
    // Polling para simular tempo real (a cada 5 segundos)
    setInterval(fetchNotifications, 5000); 

    setupSimulationButtons(); // Configura os listeners dos botões de simulação
});
