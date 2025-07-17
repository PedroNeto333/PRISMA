# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid # Para simular um ID de usuário único, se necessário

app = Flask(__name__)
# Habilita CORS para permitir requisições do seu frontend.
# Para desenvolvimento, '*' permite qualquer origem. Em produção, especifique a origem do seu frontend.
CORS(app)

# Simula um banco de dados em memória para armazenar as notificações por usuário.
# Em um ambiente real, você usaria um banco de dados persistente (SQL ou NoSQL).
# Estrutura: { 'user_id': { 'card_type_1': count, 'card_type_2': count, ... } }
user_notifications_db = {}

# Função auxiliar para inicializar as notificações de um novo usuário
def _initialize_user_notifications(user_id):
    if user_id not in user_notifications_db:
        user_notifications_db[user_id] = {
            'gestor-tarefas': 0,
            'event-calendar': 0,
            'news': 0,
            'calendar': 0,
            'emails': 0,
            'contacts': 0,
            'pomodoro': 0
        }

# Endpoint para retornar as contagens de notificação para um usuário específico
@app.route('/api/notifications/<user_id>', methods=['GET'])
def get_notifications(user_id):
    """
    Retorna as contagens de notificação para um usuário específico.
    """
    _initialize_user_notifications(user_id)
    notifications = user_notifications_db.get(user_id)
    print(f"Notificações solicitadas para {user_id}: {notifications}")
    return jsonify(notifications)

# Endpoint para incrementar a contagem de notificação para um tipo de card e usuário
@app.route('/api/notifications/increment', methods=['POST'])
def increment_notification():
    """
    Incrementa a contagem de notificação para um tipo de card e usuário.
    """
    data = request.get_json()
    user_id = data.get('userId')
    card_type = data.get('cardType')

    if not user_id or not card_type:
        return jsonify({"error": "userId e cardType são obrigatórios."}), 400

    _initialize_user_notifications(user_id)
    
    # Incrementa a contagem
    user_notifications_db[user_id][card_type] = user_notifications_db[user_id].get(card_type, 0) + 1
    
    print(f"Notificação incrementada para {user_id} - {card_type}: {user_notifications_db[user_id][card_type]}")
    return jsonify({"success": True, "newCount": user_notifications_db[user_id][card_type]})

# Endpoint para zerar a contagem de notificação para um tipo de card e usuário
@app.route('/api/notifications/clear', methods=['POST'])
def clear_notification():
    """
    Zera a contagem de notificação para um tipo de card e usuário.
    """
    data = request.get_json()
    user_id = data.get('userId')
    card_type = data.get('cardType')

    if not user_id or not card_type:
        return jsonify({"error": "userId e cardType são obrigatórios."}), 400

    _initialize_user_notifications(user_id) # Garante que o usuário existe no "DB"
    
    user_notifications_db[user_id][card_type] = 0
    
    print(f"Notificação zerada para {user_id} - {card_type}")
    return jsonify({"success": True})

# Rota de teste simples para verificar se o backend está funcionando
@app.route('/')
def home():
    return "Backend de Notificações Flask está funcionando!"

if __name__ == '__main__':
    # Para rodar este backend:
    # 1. Certifique-se de ter Python e pip instalados.
    # 2. Instale as bibliotecas necessárias: pip install Flask Flask-Cors
    # 3. No terminal, navegue até a pasta onde este arquivo está salvo.
    # 4. Execute: python app.py
    # O servidor estará rodando em http://127.0.0.1:5000/
    app.run(debug=True, host='127.0.0.1', port=5000)
