// User database management
class UserDatabase {
    constructor() {
        this.USERS_KEY = 'user_database_v1';
    }

    // Initialize database if not exists
    initDatabase() {
        if (!localStorage.getItem(this.USERS_KEY)) {
            localStorage.setItem(this.USERS_KEY, JSON.stringify([]));
        }
    }

    // Get all users
    getUsers() {
        return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    }

    // Check if user exists
    userExists(username) {
        const users = this.getUsers();
        return users.some(user => user.username === username);
    }

    // Add new user with stricter validation
    addUser(username, password, email = '') {
        // Trim username and convert to lowercase for consistent comparison
        username = username.trim().toLowerCase();

        // Additional checks
        if (!username) {
            throw new Error('Nome de usuário não pode ser vazio');
        }

        if (username.length < 3) {
            throw new Error('Nome de usuário deve ter pelo menos 3 caracteres');
        }

        // Check if user exists (case-insensitive)
        const users = this.getUsers();
        if (users.some(user => user.username.toLowerCase() === username)) {
            throw new Error('Usuário já existe');
        }

        const newUser = {
            id: this.generateUniqueId(),
            username,
            password: this.hashPassword(password),
            email,
            createdAt: new Date().toISOString(),
            simulations: [],
            goals: []
        };

        users.push(newUser);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        return newUser;
    }

    // Validate login with case-insensitive username
    validateLogin(username, password) {
        // Trim and convert to lowercase
        username = username.trim().toLowerCase();

        const users = this.getUsers();
        const user = users.find(u => u.username.toLowerCase() === username);

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        if (this.hashPassword(password) !== user.password) {
            throw new Error('Senha incorreta');
        }

        return user;
    }

    // Update user data
    updateUser(username, updates) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.username === username);

        if (userIndex === -1) {
            throw new Error('Usuário não encontrado');
        }

        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    // Add simulation to user
    addSimulation(username, simulation) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.username === username);

        if (userIndex === -1) {
            throw new Error('Usuário não encontrado');
        }

        if (!users[userIndex].simulations) {
            users[userIndex].simulations = [];
        }

        users[userIndex].simulations.push({
            ...simulation,
            id: this.generateUniqueId(),
            createdAt: new Date().toISOString()
        });

        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    // Add goal to user
    addGoal(username, goal) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.username === username);

        if (userIndex === -1) {
            throw new Error('Usuário não encontrado');
        }

        if (!users[userIndex].goals) {
            users[userIndex].goals = [];
        }

        users[userIndex].goals.push({
            ...goal,
            id: this.generateUniqueId(),
            createdAt: new Date().toISOString()
        });

        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    // Remove simulation from user
    removeSimulation(username, simulationId) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.username === username);

        if (userIndex === -1) {
            throw new Error('Usuário não encontrado');
        }

        users[userIndex].simulations = users[userIndex].simulations.filter(
            sim => sim.id !== simulationId
        );

        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    // Remove goal from user
    removeGoal(username, goalId) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.username === username);

        if (userIndex === -1) {
            throw new Error('Usuário não encontrado');
        }

        users[userIndex].goals = users[userIndex].goals.filter(
            goal => goal.id !== goalId
        );

        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    // Utility methods
    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    hashPassword(password) {
        // Simple hash function (not secure for production!)
        return btoa(password);
    }

    getCurrentUser() {
        return localStorage.getItem('currentUser');
    }

    setCurrentUser(username) {
        localStorage.setItem('currentUser', username);
    }

    logout() {
        localStorage.removeItem('currentUser');
    }
}

// Initialize database on page load
const userDB = new UserDatabase();
userDB.initDatabase();