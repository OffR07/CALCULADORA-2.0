document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('compoundInterestForm');
    const monthlyContributionInputs = document.getElementById('monthlyContributionInputs');
    const addMonthlyContributionBtn = document.getElementById('addMonthlyContribution');
    const resultsContainer = document.getElementById('resultsContainer');
    const monthlyResultsBody = document.getElementById('monthlyResultsBody');
    const totalInvestedSpan = document.getElementById('totalInvested');
    const totalInterestSpan = document.getElementById('totalInterest');
    const finalAmountSpan = document.getElementById('finalAmount');

    // Function to add a new monthly contribution input
    function addMonthlyContributionInput(month = null) {
        const contributionDiv = document.createElement('div');
        contributionDiv.classList.add('monthly-contribution-input');
        
        const monthInput = document.createElement('input');
        monthInput.type = 'number';
        monthInput.placeholder = 'Mês';
        monthInput.min = '1';
        monthInput.required = true;
        if (month) monthInput.value = month;

        const amountInput = document.createElement('input');
        amountInput.type = 'number';
        amountInput.placeholder = 'Valor (R$)';
        amountInput.step = '0.01';
        amountInput.min = '0';
        amountInput.required = true;

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

    // Add first monthly contribution input by default
    addMonthlyContributionInput();

    // Add more monthly contribution inputs
    addMonthlyContributionBtn.addEventListener('click', () => {
        addMonthlyContributionInput();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const initialInvestment = parseFloat(document.getElementById('initialInvestment').value);
        const annualInterestRate = parseFloat(document.getElementById('interestRate').value);
        const investmentPeriod = parseInt(document.getElementById('investmentPeriod').value);
        
        // Get monthly contributions
        const monthlyContributions = {};
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
    });
});