document.addEventListener('DOMContentLoaded', () => {
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

        // Show define goal section if logged in
        const definirMetaSection = document.getElementById('definirMetaSection');
        if (usuarioLogado) {
            definirMetaSection.classList.remove('hidden');
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
            const minhasSimulacoesBtn = document.getElementById('minhasSimulacoesBtn');
            minhasSimulacoesBtn.classList.remove('hidden');
            const minhasMetasBtn = document.getElementById('minhasMetasBtn');
            minhasMetasBtn.classList.remove('hidden');
        } else {
            usuarioLogadoSpan.textContent = '';
            usuarioLogadoSpan.classList.add('hidden');
            sairBtn.classList.add('hidden');
            criarContaBtn.classList.remove('hidden');
            entrarBtn.classList.remove('hidden');
            const minhasSimulacoesBtn = document.getElementById('minhasSimulacoesBtn');
            minhasSimulacoesBtn.classList.add('hidden');
            const minhasMetasBtn = document.getElementById('minhasMetasBtn');
            minhasMetasBtn.classList.add('hidden');
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
                <div class="simulacao-info">
                    <span>${simulacao.nome}</span>
                    <div class="simulacao-actions">
                        <button class="load-simulation" data-index="${index}">Carregar</button>
                        <button class="delete-simulation" data-index="${index}">Excluir</button>
                    </div>
                </div>
            `;

            // Load simulation button
            itemDiv.querySelector('.load-simulation').addEventListener('click', () => {
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

            // Delete simulation button
            itemDiv.querySelector('.delete-simulation').addEventListener('click', () => {
                const confirmDelete = confirm('Tem certeza que deseja excluir esta simulação?');
                
                if (confirmDelete) {
                    const simulacoesSalvas = JSON.parse(localStorage.getItem(`simulacoes_${usuarioLogado}`) || '[]');
                    simulacoesSalvas.splice(index, 1);
                    localStorage.setItem(`simulacoes_${usuarioLogado}`, JSON.stringify(simulacoesSalvas));
                    
                    // Refresh the list
                    minhasSimulacoesBtn.click();
                }
            });

            minhasSimulacoesLista.appendChild(itemDiv);
        });

        minhasSimulacoesModal.style.display = 'block';
    });

    minhasSimulacoesClose.addEventListener('click', () => {
        minhasSimulacoesModal.style.display = 'none';
    });

    // Meta functionality
    let ultimaSimulacaoSelecionada = null;

    const definirMetaBtn = document.getElementById('definirMetaBtn');
    const definirMetaModal = document.getElementById('definirMetaModal');
    const definirMetaForm = document.getElementById('definirMetaForm');
    const definirMetaClose = definirMetaModal.querySelector('.close');
    const minhasMetasBtn = document.getElementById('minhasMetasBtn');
    const minhasMetasModal = document.getElementById('minhasMetasModal');
    const minhasMetasLista = document.getElementById('minhasMetasLista');
    const minhasMetasClose = minhasMetasModal.querySelector('.close');

    definirMetaBtn.addEventListener('click', () => {
        if (ultimaSimulacaoCalculada) {
            definirMetaModal.style.display = 'block';
        }
    });

    definirMetaClose.addEventListener('click', () => {
        definirMetaModal.style.display = 'none';
    });

    definirMetaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        
        if (!usuarioLogado) {
            alert('Faça login para salvar metas');
            return;
        }

        const nomeMeta = document.getElementById('nomeMeta').value;

        // Add robust error checking
        if (!ultimaSimulacaoCalculada) {
            console.error('Nenhuma simulação calculada encontrada');
            alert('Por favor, realize uma simulação antes de definir uma meta');
            return;
        }

        // Safely get monthly results, avoiding null/undefined errors
        const monthlyResults = Array.from(
            document.querySelectorAll('#monthlyResultsBody tr') || []
        ).map(row => {
            const cells = row.querySelectorAll('td');
            return {
                mes: cells[0] ? cells[0].textContent : 'N/A',
                contribuicao: cells[1] ? cells[1].textContent : 'R$ 0,00',
                investimentoAcumulado: cells[2] ? cells[2].textContent : 'R$ 0,00',
                rendimento: cells[3] ? cells[3].textContent : 'R$ 0,00'
            };
        });

        const metaData = {
            ...ultimaSimulacaoCalculada,
            nome: nomeMeta,
            detalhamentoMensal: monthlyResults
        };

        const metasSalvas = JSON.parse(localStorage.getItem(`metas_${usuarioLogado}`) || '[]');
        metasSalvas.push(metaData);
        localStorage.setItem(`metas_${usuarioLogado}`, JSON.stringify(metasSalvas));

        alert('Meta salva com sucesso!');
        definirMetaModal.style.display = 'none';
        definirMetaForm.reset();
    });

    minhasMetasBtn.addEventListener('click', () => {
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        if (!usuarioLogado) {
            alert('Faça login para ver suas metas');
            return;
        }

        const metasSalvas = JSON.parse(localStorage.getItem(`metas_${usuarioLogado}`) || '[]');
        
        minhasMetasLista.innerHTML = '';

        metasSalvas.forEach((meta, index) => {
            const metaItem = document.createElement('div');
            metaItem.classList.add('meta-item');
            
            metaItem.innerHTML = `
                <div class="meta-info">
                    <h3>${meta.nome || 'Meta sem nome'}</h3>
                    <button class="delete-meta-btn" data-index="${index}">Excluir Meta</button>
                </div>
                <div class="meta-detalhamento">
                    <h4>Detalhamento Mensal</h4>
                    ${(meta.detalhamentoMensal || []).map(resultado => `
                        <div class="resultado-mensal">
                            <label class="meta-month-checkbox">
                                <input type="checkbox" class="month-checkbox" data-month="${resultado.mes}">
                                <strong>Mês ${resultado.mes}:</strong>
                            </label>
                            <p>Contribuição: ${resultado.contribuicao}</p>
                            <p>Investimento Acumulado: ${resultado.investimentoAcumulado}</p>
                            <p>Rendimento: ${resultado.rendimento}</p>
                        </div>
                    `).join('') || '<p>Sem detalhes disponíveis</p>'}
                </div>
            `;

            // Add event listener for delete button
            const deleteButton = metaItem.querySelector('.delete-meta-btn');
            deleteButton.addEventListener('click', () => {
                const usuarioLogado = localStorage.getItem('usuarioLogado');
                const confirmDelete = confirm('Tem certeza que deseja excluir esta meta?');
                
                if (confirmDelete) {
                    const metasSalvas = JSON.parse(localStorage.getItem(`metas_${usuarioLogado}`) || '[]');
                    metasSalvas.splice(index, 1);
                    localStorage.setItem(`metas_${usuarioLogado}`, JSON.stringify(metasSalvas));
                    
                    // Refresh the list
                    minhasMetasBtn.click();
                }
            });

            // Add event listeners for checkboxes
            const monthCheckboxes = metaItem.querySelectorAll('.month-checkbox');

            function updateMetaTotal() {
                const monthCheckboxes = metaItem.querySelectorAll('.month-checkbox');
                if (monthCheckboxes.length === 0) return;

                const monthCheckboxesArray = Array.from(monthCheckboxes);
                const checkedCheckboxes = monthCheckboxesArray.filter(checkbox => checkbox.checked);

                let totalValue = 0;
                checkedCheckboxes.forEach(checkbox => {
                    const monthRow = checkbox.closest('.resultado-mensal');
                    const accumulatedValue = monthRow.querySelector('p:nth-child(3)');
                    
                    if (accumulatedValue) {
                        const numericValue = parseFloat(
                            accumulatedValue.textContent
                                .replace('Investimento Acumulado: R$ ', '')
                                .replace(/\./g, '')
                                .replace(',', '.')
                        );
                        
                        if (!isNaN(numericValue)) {
                            totalValue += numericValue;
                        }
                    }
                });

                // Save meta state to localStorage
                const metaState = monthCheckboxesArray.map(checkbox => ({
                    month: checkbox.getAttribute('data-month'),
                    checked: checkbox.checked
                }));
                
                const usuarioLogado = localStorage.getItem('usuarioLogado');
                const metasSalvas = JSON.parse(localStorage.getItem(`metas_${usuarioLogado}`) || '[]');
                
                if (metasSalvas[index]) {
                    metasSalvas[index].metaState = metaState;
                    localStorage.setItem(`metas_${usuarioLogado}`, JSON.stringify(metasSalvas));
                }
            }

            monthCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateMetaTotal);
            });

            // Restore previously saved meta state if exists
            if (meta.metaState) {
                meta.metaState.forEach(state => {
                    const checkbox = metaItem.querySelector(`.month-checkbox[data-month="${state.month}"]`);
                    if (checkbox) {
                        checkbox.checked = state.checked;
                    }
                });
            }

            // Initial calculation
            updateMetaTotal();

            minhasMetasLista.appendChild(metaItem);
        });

        minhasMetasModal.style.display = 'block';
    });

    minhasMetasClose.addEventListener('click', () => {
        minhasMetasModal.style.display = 'none';
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
        if (e.target === definirMetaModal) {
            definirMetaModal.style.display = 'none';
        }
        if (e.target === minhasMetasModal) {
            minhasMetasModal.style.display = 'none';
        }
    });
});