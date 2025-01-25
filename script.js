document.addEventListener('DOMContentLoaded', () => {
    // Declare ultimaSimulacaoCalculada outside of event handlers to make it globally accessible
    let ultimaSimulacaoCalculada = null;

    const form = document.getElementById('compoundInterestForm');
    const monthlyContributionInputs = document.getElementById('monthlyContributionInputs');
    const addMonthlyContributionBtn = document.getElementById('addMonthlyContribution');
    const resultsContainer = document.getElementById('resultsContainer');
    const monthlyResultsBody = document.getElementById('monthlyResultsBody');
    const totalInvestedSpan = document.getElementById('totalInvested');
    const totalInterestSpan = document.getElementById('totalInterest');
    const finalAmountSpan = document.getElementById('finalAmount');

    // Contribution type toggle
    const contributionTypeRadios = document.querySelectorAll('input[name="contributionType"]');
    const fixedContributionSection = document.getElementById('fixedContributionSection');
    const variableContributionSection = document.getElementById('variableContributionSection');

    contributionTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'fixed') {
                fixedContributionSection.classList.remove('hidden');
                variableContributionSection.classList.add('hidden');
            } else {
                fixedContributionSection.classList.add('hidden');
                variableContributionSection.classList.remove('hidden');
            }
        });
    });

    // Function to add a new monthly contribution input
    function addMonthlyContributionInput(month = null, amount = null) {
        const contributionDiv = document.createElement('div');
        contributionDiv.classList.add('monthly-contribution-input');
        
        const monthInput = document.createElement('input');
        monthInput.type = 'number';
        monthInput.placeholder = 'Mês';
        monthInput.min = '1';
        monthInput.max = document.getElementById('investmentPeriod').value;
        monthInput.required = true;
        if (month) monthInput.value = month;

        const amountInput = document.createElement('input');
        amountInput.type = 'number';
        amountInput.placeholder = 'Valor (R$)';
        amountInput.step = '0.01';
        amountInput.min = '0';
        amountInput.required = true;
        if (amount) amountInput.value = amount;

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.textContent = 'x';
        removeButton.addEventListener('click', () => {
            contributionDiv.remove();
        });

        contributionDiv.appendChild(monthInput);
        contributionDiv.appendChild(amountInput);
        contributionDiv.appendChild(removeButton);

        monthlyContributionInputs.appendChild(contributionDiv);
    }

    // Add more monthly contribution inputs
    addMonthlyContributionBtn.addEventListener('click', () => {
        addMonthlyContributionInput();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const initialInvestment = parseFloat(document.getElementById('initialInvestment').value || 0);
        const annualInterestRate = parseFloat(document.getElementById('interestRate').value);
        const investmentPeriod = parseInt(document.getElementById('investmentPeriod').value);
        
        // Determine contribution type and get monthly contributions
        let monthlyContributions = {};
        const contributionType = document.querySelector('input[name="contributionType"]:checked').value;
        
        if (contributionType === 'fixed') {
            const fixedContribution = parseFloat(document.getElementById('fixedMonthlyContribution').value || 0);
            for (let i = 1; i <= investmentPeriod; i++) {
                monthlyContributions[i] = fixedContribution;
            }
        } else {
            // Get variable monthly contributions
            const contributionInputs = document.querySelectorAll('.monthly-contribution-input');
            contributionInputs.forEach(input => {
                const monthInput = input.querySelector('input[placeholder="Mês"]');
                const amountInput = input.querySelector('input[placeholder="Valor (R$)"]');
                
                const month = parseInt(monthInput.value);
                const amount = parseFloat(amountInput.value);
                
                if (month && amount) {
                    monthlyContributions[month] = amount;
                }
            });
        }
        
        // Calcular juros mensais
        const monthlyInterestRate = annualInterestRate / 100 / 12;
        
        // Limpar resultados anteriores
        monthlyResultsBody.innerHTML = '';
        
        let currentBalance = initialInvestment;
        let totalContributions = initialInvestment;
        let totalInterest = 0;
        
        // Calcular e mostrar resultados mês a mês
        for (let month = 1; month <= investmentPeriod; month++) {
            // Adicionar contribuição mensal
            const monthlyContribution = monthlyContributions[month] || 0;
            currentBalance += monthlyContribution;
            totalContributions += monthlyContribution;
            
            // Calcular juros
            const monthlyInterest = currentBalance * monthlyInterestRate;
            currentBalance += monthlyInterest;
            totalInterest += monthlyInterest;
            
            // Criar linha na tabela
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${month}</td>
                <td>R$ ${monthlyContribution.toFixed(2)}</td>
                <td>R$ ${currentBalance.toFixed(2)}</td>
                <td>R$ ${monthlyInterest.toFixed(2)}</td>
            `;
            monthlyResultsBody.appendChild(row);
        }
        
        // Atualizar resumo
        totalInvestedSpan.textContent = `R$ ${totalContributions.toFixed(2)}`;
        totalInterestSpan.textContent = `R$ ${totalInterest.toFixed(2)}`;
        finalAmountSpan.textContent = `R$ ${currentBalance.toFixed(2)}`;
        
        // Mostrar resultados
        resultsContainer.classList.remove('hidden');
        
        // Store the last calculated simulation data
        ultimaSimulacaoCalculada = {
            initialInvestment: initialInvestment,
            contributionType: contributionType,
            fixedMonthlyContribution: contributionType === 'fixed' ? 
                parseFloat(document.getElementById('fixedMonthlyContribution').value || 0) : null,
            monthlyContributions: contributionType === 'variable' ? monthlyContributions : null,
            annualInterestRate: annualInterestRate,
            investmentPeriod: investmentPeriod,
            totalContributions: totalContributions,
            totalInterest: totalInterest,
            finalAmount: currentBalance
        };

        // Show save simulation button if logged in
        const salvarSimulacaoSection = document.getElementById('salvarSimulacaoSection');
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        if (usuarioLogado) {
            salvarSimulacaoSection.classList.remove('hidden');
        }
    });

    // New function to save simulation
    function salvarSimulacao(simulacaoData) {
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        if (!usuarioLogado) {
            alert('Faça login para salvar a simulação');
            return;
        }

        const simulacoesSalvas = JSON.parse(localStorage.getItem(`simulacoes_${usuarioLogado}`) || '[]');
        simulacoesSalvas.push(simulacaoData);
        localStorage.setItem(`simulacoes_${usuarioLogado}`, JSON.stringify(simulacoesSalvas));
    }

    // Save Simulation Modal
    const salvarSimulacaoBtn = document.getElementById('salvarSimulacaoBtn');
    const salvarSimulacaoModal = document.getElementById('salvarSimulacaoModal');
    const salvarSimulacaoForm = document.getElementById('salvarSimulacaoForm');
    const salvarSimulacaoClose = salvarSimulacaoModal.querySelector('.close');

    // Save Simulation Button
    salvarSimulacaoBtn.addEventListener('click', () => {
        if (ultimaSimulacaoCalculada) {
            salvarSimulacaoModal.style.display = 'block';
        }
    });

    salvarSimulacaoClose.addEventListener('click', () => {
        salvarSimulacaoModal.style.display = 'none';
    });

    salvarSimulacaoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nomeSimulacao = document.getElementById('nomeSimulacao').value;
        
        if (ultimaSimulacaoCalculada) {
            const simulacaoComNome = {
                ...ultimaSimulacaoCalculada,
                nome: nomeSimulacao
            };
            
            salvarSimulacao(simulacaoComNome);
            alert('Simulação salva com sucesso!');
            salvarSimulacaoModal.style.display = 'none';
            salvarSimulacaoForm.reset();
        }
    });

    // Modal functionality for Criar Conta
    const criarContaBtn = document.getElementById('criarContaBtn');
    const criarContaModal = document.getElementById('criarContaModal');
    const criarContaForm = document.getElementById('criarContaForm');
    const criarContaClose = criarContaModal.querySelector('.close');

    criarContaBtn.addEventListener('click', () => {
        criarContaModal.style.display = 'block';
    });

    criarContaClose.addEventListener('click', () => {
        criarContaModal.style.display = 'none';
    });

    criarContaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usuario = document.getElementById('novoUsuario').value;
        const senha = document.getElementById('novaSenha').value;
        const confirmaSenha = document.getElementById('confirmaSenha').value;

        if (senha !== confirmaSenha) {
            alert('As senhas não coincidem');
            return;
        }

        // Save user data to localStorage
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        
        // Check if user already exists
        if (usuarios.some(u => u.usuario === usuario)) {
            alert('Usuário já existe');
            return;
        }

        usuarios.push({ usuario, senha });
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        alert('Conta criada com sucesso!');
        criarContaModal.style.display = 'none';
        criarContaForm.reset();
    });

    // Modal functionality for Entrar
    const entrarBtn = document.getElementById('entrarBtn');
    const entrarModal = document.getElementById('entrarModal');
    const entrarForm = document.getElementById('entrarForm');
    const entrarClose = entrarModal.querySelector('.close');

    entrarBtn.addEventListener('click', () => {
        entrarModal.style.display = 'block';
    });

    entrarClose.addEventListener('click', () => {
        entrarModal.style.display = 'none';
    });

    const usuarioLogadoSpan = document.getElementById('usuarioLogado');
    const sairBtn = document.getElementById('sairBtn');

    // Function to update authentication UI
    function updateAuthUI() {
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        
        if (usuarioLogado) {
            usuarioLogadoSpan.textContent = `Olá, ${usuarioLogado}`;
            usuarioLogadoSpan.classList.remove('hidden');
            sairBtn.classList.remove('hidden');
            criarContaBtn.classList.add('hidden');
            entrarBtn.classList.add('hidden');
        } else {
            usuarioLogadoSpan.textContent = '';
            usuarioLogadoSpan.classList.add('hidden');
            sairBtn.classList.add('hidden');
            criarContaBtn.classList.remove('hidden');
            entrarBtn.classList.remove('hidden');
        }

        const minhasSimulacoesBtn = document.getElementById('minhasSimulacoesBtn');
        
        if (usuarioLogado) {
            minhasSimulacoesBtn.classList.remove('hidden');
        } else {
            minhasSimulacoesBtn.classList.add('hidden');
        }
    }

    // Call updateAuthUI on page load
    updateAuthUI();

    entrarForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usuario = document.getElementById('usuario').value;
        const senha = document.getElementById('senha').value;

        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        
        const usuarioEncontrado = usuarios.find(u => u.usuario === usuario && u.senha === senha);

        if (usuarioEncontrado) {
            // Set logged-in user in localStorage
            localStorage.setItem('usuarioLogado', usuario);
            
            alert('Login bem-sucedido!');
            entrarModal.style.display = 'none';
            entrarForm.reset();
            
            // Update UI
            updateAuthUI();
        } else {
            alert('Usuário ou senha incorretos');
        }
    });

    // Add logout functionality
    sairBtn.addEventListener('click', () => {
        // Remove logged-in user from localStorage
        localStorage.removeItem('usuarioLogado');
        
        // Update UI
        updateAuthUI();
    });

    // Minhas Simulações functionality
    const minhasSimulacoesBtn = document.getElementById('minhasSimulacoesBtn');
    const minhasSimulacoesModal = document.getElementById('minhasSimulacoesModal');
    const minhasSimulacoesLista = document.getElementById('minhasSimulacoesLista');
    const minhasSimulacoesClose = minhasSimulacoesModal.querySelector('.close');

    minhasSimulacoesBtn.addEventListener('click', () => {
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        if (!usuarioLogado) {
            alert('Faça login para ver suas simulações');
            return;
        }

        const simulacoesSalvas = JSON.parse(localStorage.getItem(`simulacoes_${usuarioLogado}`) || '[]');
        
        // Clear previous list
        minhasSimulacoesLista.innerHTML = '';

        // Populate list
        simulacoesSalvas.forEach((simulacao, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('simulacao-item');
            
            itemDiv.innerHTML = `
                <span>${simulacao.nome}</span>
                <button data-index="${index}">Carregar</button>
            `;

            itemDiv.querySelector('button').addEventListener('click', () => {
                // Load simulation data
                document.getElementById('initialInvestment').value = simulacao.initialInvestment;
                document.getElementById('interestRate').value = simulacao.annualInterestRate;
                document.getElementById('investmentPeriod').value = simulacao.investmentPeriod;

                // Set contribution type
                const contributionTypeRadios = document.querySelectorAll('input[name="contributionType"]');
                contributionTypeRadios.forEach(radio => {
                    if (radio.value === simulacao.contributionType) {
                        radio.checked = true;
                        radio.dispatchEvent(new Event('change'));
                    }
                });

                // Set contributions
                if (simulacao.contributionType === 'fixed') {
                    document.getElementById('fixedMonthlyContribution').value = 
                        simulacao.fixedMonthlyContribution || 0;
                } else {
                    // Clear existing variable contribution inputs
                    monthlyContributionInputs.innerHTML = '';
                    
                    // Add variable contribution inputs
                    if (simulacao.monthlyContributions) {
                        Object.entries(simulacao.monthlyContributions).forEach(([month, amount]) => {
                            addMonthlyContributionInput(month, amount);
                        });
                    }
                }

                // Close modal and submit form
                minhasSimulacoesModal.style.display = 'none';
                form.dispatchEvent(new Event('submit'));
            });

            minhasSimulacoesLista.appendChild(itemDiv);
        });

        minhasSimulacoesModal.style.display = 'block';
    });

    minhasSimulacoesClose.addEventListener('click', () => {
        minhasSimulacoesModal.style.display = 'none';
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === criarContaModal) {
            criarContaModal.style.display = 'none';
        }
        if (e.target === entrarModal) {
            entrarModal.style.display = 'none';
        }
        if (e.target === salvarSimulacaoModal) {
            salvarSimulacaoModal.style.display = 'none';
        }
        if (e.target === minhasSimulacoesModal) {
            minhasSimulacoesModal.style.display = 'none';
        }
    });
});