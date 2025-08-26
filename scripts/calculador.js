document.addEventListener('DOMContentLoaded', () => {
    const calculatorContainer = document.getElementById('calculator-container');
    const navButtons = document.querySelectorAll('.nav-button');

    // Funções para carregar o HTML e JS das calculadoras
    async function loadCalculator(type) {
        let calculatorHtml = '';
        let calculatorScript = '';

        // Limpa o conteúdo atual do container
        calculatorContainer.innerHTML = '';

        if (type === 'simple') {
            calculatorHtml = `
                <div class="calculator">
                    <input type="text" id="display" disabled>
                    <div class="buttons">
                        <button onclick="clearDisplay()">C</button>
                        <button onclick="deleteLast()">DEL</button>
                        <button onclick="appendOperator('/')">/</button>
                        <button onclick="appendOperator('*')">x</button>

                        <button onclick="appendNumber('7')">7</button>
                        <button onclick="appendNumber('8')">8</button>
                        <button onclick="appendNumber('9')">9</button>
                        <button onclick="appendOperator('-')">-</button>

                        <button onclick="appendNumber('4')">4</button>
                        <button onclick="appendNumber('5')">5</button>
                        <button onclick="appendNumber('6')">6</button>
                        <button onclick="appendOperator('+')">+</button>

                        <button onclick="appendNumber('1')">1</button>
                        <button onclick="appendNumber('2')">2</button>
                        <button onclick="appendNumber('3')">3</button>
                        <button onclick="calculate()">=</button>

                        <button onclick="appendNumber('0')" class="zero">0</button>
                        <button onclick="appendDecimal()">.</button>
                    </div>
                </div>
            `;
            calculatorScript = `
                let display = document.getElementById('display');
                let currentInput = '';
                let firstOperand = null;
                let operator = null;

                window.appendNumber = function(number) {
                    currentInput += number;
                    display.value = currentInput;
                };

                window.appendOperator = function(op) {
                    if (currentInput === '') return;
                    if (firstOperand !== null) {
                        window.calculate(); // Garante que a operação anterior seja calculada
                    }
                    firstOperand = parseFloat(currentInput);
                    operator = op;
                    currentInput = '';
                };

                window.appendDecimal = function() {
                    if (currentInput.includes('.')) return;
                    currentInput += '.';
                    display.value = currentInput;
                };

                window.clearDisplay = function() {
                    currentInput = '';
                    firstOperand = null;
                    operator = null;
                    display.value = '';
                };

                window.deleteLast = function() {
                    currentInput = currentInput.slice(0, -1);
                    display.value = currentInput;
                };

                window.calculate = function() {
                    if (operator === null || firstOperand === null || currentInput === '') return;

                    let result;
                    const secondOperand = parseFloat(currentInput);

                    switch (operator) {
                        case '+':
                            result = firstOperand + secondOperand;
                            break;
                        case '-':
                            result = firstOperand - secondOperand;
                            break;
                        case '*':
                            result = firstOperand * secondOperand;
                            break;
                        case '/':
                            if (secondOperand === 0) {
                                result = 'Erro!';
                            } else {
                                result = firstOperand / secondOperand;
                            }
                            break;
                        default:
                            return;
                    }

                    result = parseFloat(result.toFixed(8));

                    currentInput = String(result);
                    operator = null;
                    firstOperand = null;
                    display.value = currentInput;
                };
            `;
        } else if (type === 'bmi') {
            calculatorHtml = `
                <div class="bmi-calculator">
                    <h2>Calculadora de IMC</h2>
                    <div>
                        <label for="weight">Peso (kg):</label>
                        <input type="number" id="weight" step="0.1" min="1" placeholder="Ex: 70.5">
                    </div>
                    <div>
                        <label for="height">Altura (m):</label>
                        <input type="number" id="height" step="0.01" min="0.1" placeholder="Ex: 1.75">
                    </div>
                    <button onclick="calculateBMI()">Calcular IMC</button>
                    <p id="bmi-result"></p>
                </div>
            `;
            calculatorScript = `
                window.calculateBMI = function() {
                    const weight = parseFloat(document.getElementById('weight').value);
                    const height = parseFloat(document.getElementById('height').value);
                    const bmiResultElement = document.getElementById('bmi-result');

                    if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
                        bmiResultElement.textContent = 'Por favor, insira valores válidos.';
                        bmiResultElement.style.color = 'red';
                        return;
                    }

                    const bmi = weight / (height * height);
                    let category = '';

                    if (bmi < 18.5) {
                        category = 'Abaixo do peso';
                        bmiResultElement.style.color = '#ffc107'; // Amarelo
                    } else if (bmi >= 18.5 && bmi < 24.9) {
                        category = 'Peso normal';
                        bmiResultElement.style.color = '#28a745'; // Verde
                    } else if (bmi >= 25 && bmi < 29.9) {
                        category = 'Sobrepeso';
                        bmiResultElement.style.color = '#fd7e14'; // Laranja
                    } else if (bmi >= 30 && bmi < 34.9) {
                        category = 'Obesidade Grau I';
                        bmiResultElement.style.color = '#dc3545'; // Vermelho
                    } else if (bmi >= 35 && bmi < 39.9) {
                        category = 'Obesidade Grau II';
                        bmiResultElement.style.color = '#dc3545'; // Vermelho
                    } else {
                        category = 'Obesidade Grau III';
                        bmiResultElement.style.color = '#dc3545'; // Vermelho mais escuro
                    }

                    bmiResultElement.textContent = \`Seu IMC é: \${bmi.toFixed(2)} (\${category})\`;
                };
            `;
        } else if (type === 'presence') {
            calculatorHtml = `
                <div class="presence-calculator">
                    <h2>Calculadora de Presença</h2>
                    <div>
                        <label for="totalClasses">Total de Encontros/Aulas:</label>
                        <input type="number" id="totalClasses" min="1" placeholder="Ex: 60">
                    </div>
                    <div>
                        <label for="currentAbsences">Faltas Atuais:</label>
                        <input type="number" id="currentAbsences" min="0" placeholder="Ex: 5">
                    </div>
                    <div>
                        <label for="minPresence">Mínimo de Presença Exigido (%):</label>
                        <input type="number" id="minPresence" min="0" max="100" value="75" placeholder="Ex: 75">
                    </div>
                    <button onclick="calculatePresence()">Calcular Presença</button>
                    <div id="presence-result"></div>
                </div>
            `;
            calculatorScript = `
                window.calculatePresence = function() {
                    const totalClasses = parseFloat(document.getElementById('totalClasses').value);
                    const currentAbsences = parseFloat(document.getElementById('currentAbsences').value);
                    const minPresencePercentage = parseFloat(document.getElementById('minPresence').value);
                    const resultDiv = document.getElementById('presence-result');

                    resultDiv.innerHTML = ''; // Limpa resultados anteriores

                    if (isNaN(totalClasses) || isNaN(currentAbsences) || isNaN(minPresencePercentage) ||
                        totalClasses <= 0 || currentAbsences < 0 || minPresencePercentage < 0 || minPresencePercentage > 100) {
                        resultDiv.innerHTML = '<p class="result-bad">Por favor, insira valores válidos e positivos para todos os campos.</p>';
                        return;
                    }

                    if (currentAbsences > totalClasses) {
                        resultDiv.innerHTML = '<p class="result-bad">O número de faltas não pode ser maior que o total de aulas.</p>';
                        return;
                    }

                    const minPresenceClasses = Math.ceil(totalClasses * (minPresencePercentage / 100));
                    const maxAbsencesAllowed = totalClasses - minPresenceClasses;
                    const classesAttended = totalClasses - currentAbsences;
                    const currentPresencePercentage = (classesAttended / totalClasses) * 100;
                    const remainingClasses = totalClasses - classesAttended; // Aulas que ainda vão acontecer

                    let message = '';
                    let statusClass = '';

                    message += \`<p>Total de aulas: <strong>\${totalClasses}</strong></p>\`;
                    message += \`<p>Faltas atuais: <strong>\${currentAbsences}</strong></p>\`;
                    message += \`<p>Presença atual: <strong class="\${currentPresencePercentage >= minPresencePercentage ? 'result-good' : 'result-bad'}">\${currentPresencePercentage.toFixed(2)}%</strong></p>\`;
                    message += \`<p>Mínimo de presença exigido: <strong>\${minPresencePercentage}%</strong></p>\`;
                    message += \`<p>Máximo de faltas permitido: <strong>\${maxAbsencesAllowed}</strong></p>\`;


                    if (currentAbsences <= maxAbsencesAllowed) {
                        const absencesRemaining = maxAbsencesAllowed - currentAbsences;
                        message += \`<p>Você ainda pode ter <strong class="result-good">\${absencesRemaining}</strong> falta(s).</p>\`;
                        statusClass = 'result-good';
                    } else {
                        const absencesOverLimit = currentAbsences - maxAbsencesAllowed;
                        message += \`<p>Você excedeu o limite de faltas em <strong class="result-bad">\${absencesOverLimit}</strong> falta(s).</p>\`;
                        message += \`<p class="result-bad">Cuidado! Você está em risco de reprovação por falta.</p>\`;
                        statusClass = 'result-bad';
                    }

                    // Cenário para quem já está acima do limite de faltas ou muito próximo
                    if (currentAbsences === maxAbsencesAllowed && currentAbsences > 0) {
                        message += \`<p class="result-warning">Esta é a sua última falta permitida. Não pode faltar mais!</p>\`;
                        statusClass = 'result-warning';
                    } else if (currentAbsences > maxAbsencesAllowed) {
                        message += \`<p class="result-bad">Você já está reprovado por falta, a menos que haja alguma regra de recuperação específica.</p>\`;
                        statusClass = 'result-bad';
                    }


                    resultDiv.innerHTML = message;
                    // Você pode adicionar uma classe geral ao resultDiv se quiser um fundo ou borda diferente dependendo do status geral
                    // resultDiv.className = \`\${statusClass}\`;
                };
            `;
        }

        // Insere o HTML da calculadora
        calculatorContainer.innerHTML = calculatorHtml;

        // Executa o script da calculadora
        const scriptElement = document.createElement('script');
        scriptElement.textContent = calculatorScript;
        calculatorContainer.appendChild(scriptElement);
    }

    // Adiciona event listeners aos botões de navegação
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const calculatorType = button.dataset.calculator;
            loadCalculator(calculatorType);
        });
    });

    // Carrega a calculadora simples por padrão ao carregar a página
    loadCalculator('simple');
});