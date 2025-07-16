# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
# Habilita CORS para permitir requisições do seu frontend.
# Para desenvolvimento, '*' permite qualquer origem. Em produção, especifique a origem do seu frontend.
CORS(app)

# --- Configuração do Banco de Dados SQLite ---
DATABASE_FILE = 'notifications.db' # Nome do arquivo do banco de dados SQLite

def get_db_connection():
    """
    Retorna uma conexão com o banco de dados SQLite.
    Configura row_factory para acessar colunas por nome.
    """
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row # Permite acessar colunas por nome (ex: row['user_id'])
    return conn

def init_db():
    """
    Inicializa o banco de dados, criando a tabela 'user_notifications' se ela não existir.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_notifications (
            user_id TEXT NOT NULL,
            card_type TEXT NOT NULL,
            count INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, card_type) -- Garante unicidade por usuário e tipo de card
        )
    ''')
    conn.commit()
    conn.close()
    print(f"Banco de dados SQLite inicializado: {DATABASE_FILE}")

# Inicializa o banco de dados ao iniciar o aplicativo Flask
with app.app_context():
    init_db()

# --- Endpoints da API ---

# Endpoint para retornar as contagens de notificação para um usuário específico
@app.route('/api/notifications/<user_id>', methods=['GET'])
def get_notifications(user_id):
    """
    Retorna as contagens de notificação para um usuário específico do SQLite.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Busca todas as notificações para o user_id
    cursor.execute('SELECT card_type, count FROM user_notifications WHERE user_id = ?', (user_id,))
    rows = cursor.fetchall()
    
    notifications = {
        'gestor-tarefas': 0,
        'event-calendar': 0,
        'news': 0,
        'calendar': 0,
        'emails': 0,
        'contacts': 0,
        'pomodoro': 0
    }
    
    # Preenche o dicionário com os dados do banco de dados
    for row in rows:
        notifications[row['card_type']] = row['count']
        
    conn.close()
    print(f"Notificações buscadas para {user_id} do DB: {notifications}")
    return jsonify(notifications)

# Endpoint para incrementar a contagem de notificação para um tipo de card e usuário
@app.route('/api/notifications/increment', methods=['POST'])
def increment_notification():
    """
    Incrementa a contagem de notificação para um tipo de card e usuário no SQLite.
    Cria a entrada se não existir, ou atualiza se existir.
    """
    data = request.get_json()
    user_id = data.get('userId')
    card_type = data.get('cardType')

    if not user_id or not card_type:
        return jsonify({"error": "userId e cardType são obrigatórios."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Tenta buscar a contagem atual
    cursor.execute('SELECT count FROM user_notifications WHERE user_id = ? AND card_type = ?', (user_id, card_type))
    row = cursor.fetchone()

    if row:
        # Se a entrada existir, incrementa
        new_count = row['count'] + 1
        cursor.execute(
            'UPDATE user_notifications SET count = ? WHERE user_id = ? AND card_type = ?',
            (new_count, user_id, card_type)
        )
    else:
        # Se a entrada não existir, insere com contagem 1
        new_count = 1
        cursor.execute(
            'INSERT INTO user_notifications (user_id, card_type, count) VALUES (?, ?, ?)',
            (user_id, card_type, new_count)
        )
    
    conn.commit()
    conn.close()
    
    print(f"Notificação incrementada para {user_id} - {card_type}: {new_count}")
    return jsonify({"success": True, "newCount": new_count})

# Endpoint para zerar a contagem de notificação para um tipo de card e usuário
@app.route('/api/notifications/clear', methods=['POST'])
def clear_notification():
    """
    Zera a contagem de notificação para um tipo de card e usuário no SQLite.
    """
    data = request.get_json()
    user_id = data.get('userId')
    card_type = data.get('cardType')

    if not user_id or not card_type:
        return jsonify({"error": "userId e cardType são obrigatórios."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Atualiza a contagem para 0
    cursor.execute(
        'UPDATE user_notifications SET count = 0 WHERE user_id = ? AND card_type = ?',
        (user_id, card_type)
    )
    conn.commit()
    conn.close()
    
    print(f"Notificação zerada para {user_id} - {card_type}")
    return jsonify({"success": True})

# Rota de teste simples para verificar se o backend está funcionando
@app.route('/')
def home():
    return "Backend de Notificações Flask com SQLite está funcionando!"

if __name__ == '__main__':
    # Para rodar este backend:
    # 1. Certifique-se de ter Python e pip instalados.
    # 2. Instale as bibliotecas necessárias: pip install Flask Flask-Cors
    #    (sqlite3 já vem com o Python)
    # 3. No terminal, navegue até a pasta onde este arquivo está salvo.
    # 4. Execute: python app.py
    # O servidor estará rodando em http://127.0.0.1:5000/
    app.run(debug=True, host='127.0.0.1', port=5000)
