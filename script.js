// Enhanced User Management System
class UserManager {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.loadCurrentUser();
        this.blockedUsers = this.loadBlockedUsers();
        this.friends = this.loadFriends();
        this.friendRequests = this.loadFriendRequests();
    }

    loadUsers() {
        try {
            const stored = localStorage.getItem('moddiUsers');
            if (stored) {
                return JSON.parse(stored);
            }
            // Default admin user
            return [{
                id: 1,
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@modditech.com',
                password: 'admin123',
                role: 'admin',
                avatar: '👑',
                joinDate: new Date().toISOString(),
                bio: 'Moddi Tech Design Administrator'
            }];
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }

    saveUsers() {
        try {
            localStorage.setItem('moddiUsers', JSON.stringify(this.users));
            return true;
        } catch (error) {
            console.error('Error saving users:', error);
            return false;
        }
    }

    loadCurrentUser() {
        try {
            const stored = localStorage.getItem('moddiCurrentUser');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error loading current user:', error);
            return null;
        }
    }

    saveCurrentUser(user) {
        try {
            localStorage.setItem('moddiCurrentUser', JSON.stringify(user));
            this.currentUser = user;
            return true;
        } catch (error) {
            console.error('Error saving current user:', error);
            return false;
        }
    }

    loadBlockedUsers() {
        try {
            const stored = localStorage.getItem('moddiBlockedUsers');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading blocked users:', error);
            return [];
        }
    }

    saveBlockedUsers() {
        try {
            localStorage.setItem('moddiBlockedUsers', JSON.stringify(this.blockedUsers));
            return true;
        } catch (error) {
            console.error('Error saving blocked users:', error);
            return false;
        }
    }

    loadFriends() {
        try {
            const stored = localStorage.getItem('moddiFriends');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading friends:', error);
            return [];
        }
    }

    saveFriends() {
        try {
            localStorage.setItem('moddiFriends', JSON.stringify(this.friends));
            return true;
        } catch (error) {
            console.error('Error saving friends:', error);
            return false;
        }
    }

    loadFriendRequests() {
        try {
            const stored = localStorage.getItem('moddiFriendRequests');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading friend requests:', error);
            return [];
        }
    }

    saveFriendRequests() {
        try {
            localStorage.setItem('moddiFriendRequests', JSON.stringify(this.friendRequests));
            return true;
        } catch (error) {
            console.error('Error saving friend requests:', error);
            return false;
        }
    }

    register(userData) {
        try {
            // Check if user already exists
            const existingUser = this.users.find(user => user.email === userData.email);
            if (existingUser) {
                return { success: false, message: "User already exists with this email" };
            }

            // Create new user
            const newUser = {
                id: Date.now(),
                ...userData,
                avatar: this.getAvatarForRole(userData.role),
                joinDate: new Date().toISOString(),
                bio: '',
                website: '',
                location: ''
            };

            this.users.push(newUser);
            const saved = this.saveUsers();

            if (saved) {
                // Auto-login after registration
                this.saveCurrentUser(newUser);
                return { success: true, user: newUser };
            } else {
                return { success: false, message: "Failed to create account" };
            }
        } catch (error) {
            console.error('Error registering user:', error);
            return { success: false, message: "Failed to create account due to system error" };
        }
    }

    login(email, password) {
        try {
            const user = this.users.find(u => u.email === email && u.password === password);
            if (user) {
                this.saveCurrentUser(user);
                return { success: true, user };
            }
            return { success: false, message: "Incorrect email or password" };
        } catch (error) {
            console.error('Error during login:', error);
            return { success: false, message: "Login failed due to system error" };
        }
    }

    logout() {
        this.saveCurrentUser(null);
        return { success: true };
    }

    getAvatarForRole(role) {
        const avatars = {
            'client': '💼',
            'designer': '🎨',
            'partner': '🤝',
            'admin': '👑'
        };
        return avatars[role] || '👤';
    }

    getUserById(id) {
        return this.users.find(user => user.id === parseInt(id));
    }

    getAllUsers() {
        return this.users.filter(user => 
            user.id !== this.currentUser?.id && 
            !this.blockedUsers.includes(user.id)
        );
    }

    updateUser(userId, updates) {
        try {
            const userIndex = this.users.findIndex(u => u.id === parseInt(userId));
            if (userIndex === -1) {
                return { success: false, message: "User not found" };
            }

            this.users[userIndex] = { ...this.users[userIndex], ...updates };
            const saved = this.saveUsers();

            // Update current user if it's the same user
            if (this.currentUser && this.currentUser.id === parseInt(userId)) {
                this.saveCurrentUser(this.users[userIndex]);
            }

            return saved ? 
                { success: true, user: this.users[userIndex] } : 
                { success: false, message: "Failed to update user" };
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, message: "Failed to update user due to system error" };
        }
    }

    sendFriendRequest(fromUserId, toUserId) {
        try {
            if (this.friendRequests.find(req => 
                req.fromUserId === fromUserId && req.toUserId === toUserId)) {
                return { success: false, message: "Friend request already sent" };
            }

            this.friendRequests.push({
                id: Date.now(),
                fromUserId: parseInt(fromUserId),
                toUserId: parseInt(toUserId),
                status: 'pending',
                timestamp: new Date().toISOString()
            });

            const saved = this.saveFriendRequests();
            return saved ? 
                { success: true } : 
                { success: false, message: "Failed to send friend request" };
        } catch (error) {
            console.error('Error sending friend request:', error);
            return { success: false, message: "Failed to send friend request due to system error" };
        }
    }

    acceptFriendRequest(requestId) {
        try {
            const request = this.friendRequests.find(req => req.id === parseInt(requestId));
            if (!request) {
                return { success: false, message: "Friend request not found" };
            }

            request.status = 'accepted';
            this.friends.push(request.fromUserId);
            this.friends.push(request.toUserId);

            const savedFriends = this.saveFriends();
            const savedRequests = this.saveFriendRequests();

            return savedFriends && savedRequests ? 
                { success: true } : 
                { success: false, message: "Failed to accept friend request" };
        } catch (error) {
            console.error('Error accepting friend request:', error);
            return { success: false, message: "Failed to accept friend request due to system error" };
        }
    }

    getPendingFriendRequests(userId) {
        return this.friendRequests.filter(req => 
            req.toUserId === parseInt(userId) && req.status === 'pending'
        );
    }

    getTotalUsers() {
        return this.users.length;
    }
}

// Enhanced News Management System with Comments
class NewsManager {
    constructor() {
        this.news = this.loadNews();
        this.comments = this.loadComments();
    }

    loadNews() {
        try {
            const stored = localStorage.getItem('moddiNews');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading news:', error);
            return [];
        }
    }

    saveNews() {
        try {
            localStorage.setItem('moddiNews', JSON.stringify(this.news));
            return true;
        } catch (error) {
            console.error('Error saving news:', error);
            return false;
        }
    }

    loadComments() {
        try {
            const stored = localStorage.getItem('moddiComments');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading comments:', error);
            return [];
        }
    }

    saveComments() {
        try {
            localStorage.setItem('moddiComments', JSON.stringify(this.comments));
            return true;
        } catch (error) {
            console.error('Error saving comments:', error);
            return false;
        }
    }

    createPost(userId, content, imageData = null, privacy = 'public') {
        try {
            if (!userId || (!content?.trim() && !imageData)) {
                return { success: false, message: "Content or image is required" };
            }

            const post = {
                id: Date.now(),
                userId: parseInt(userId),
                content: content?.trim() || '',
                image: imageData,
                timestamp: new Date().toISOString(),
                likes: 0,
                likedBy: [],
                privacy: privacy,
                comments: 0
            };

            this.news.unshift(post);
            const saved = this.saveNews();
            
            return saved ? 
                { success: true, post } : 
                { success: false, message: "Failed to save post" };
        } catch (error) {
            console.error('Error creating post:', error);
            return { success: false, message: "Failed to create post due to system error" };
        }
    }

    likePost(postId, userId) {
        try {
            const post = this.news.find(p => p.id === parseInt(postId));
            if (!post) {
                return { success: false, message: "Post not found" };
            }

            const likeIndex = post.likedBy.indexOf(parseInt(userId));
            if (likeIndex === -1) {
                // Like the post
                post.likedBy.push(parseInt(userId));
                post.likes++;
            } else {
                // Unlike the post
                post.likedBy.splice(likeIndex, 1);
                post.likes--;
            }

            const saved = this.saveNews();
            return saved ? 
                { success: true, likes: post.likes, isLiked: likeIndex === -1 } : 
                { success: false, message: "Failed to update like" };
        } catch (error) {
            console.error('Error liking post:', error);
            return { success: false, message: "Failed to like post due to system error" };
        }
    }

    addComment(postId, userId, content) {
        try {
            if (!content?.trim()) {
                return { success: false, message: "Comment content is required" };
            }

            const comment = {
                id: Date.now(),
                postId: parseInt(postId),
                userId: parseInt(userId),
                content: content.trim(),
                timestamp: new Date().toISOString(),
                likes: 0,
                likedBy: []
            };

            this.comments.unshift(comment);
            
            // Update post comment count
            const post = this.news.find(p => p.id === parseInt(postId));
            if (post) {
                post.comments = (post.comments || 0) + 1;
            }

            const savedComments = this.saveComments();
            const savedNews = this.saveNews();

            return savedComments && savedNews ? 
                { success: true, comment } : 
                { success: false, message: "Failed to add comment" };
        } catch (error) {
            console.error('Error adding comment:', error);
            return { success: false, message: "Failed to add comment due to system error" };
        }
    }

    likeComment(commentId, userId) {
        try {
            const comment = this.comments.find(c => c.id === parseInt(commentId));
            if (!comment) {
                return { success: false, message: "Comment not found" };
            }

            const likeIndex = comment.likedBy.indexOf(parseInt(userId));
            if (likeIndex === -1) {
                comment.likedBy.push(parseInt(userId));
                comment.likes++;
            } else {
                comment.likedBy.splice(likeIndex, 1);
                comment.likes--;
            }

            const saved = this.saveComments();
            return saved ? 
                { success: true, likes: comment.likes, isLiked: likeIndex === -1 } : 
                { success: false, message: "Failed to update comment like" };
        } catch (error) {
            console.error('Error liking comment:', error);
            return { success: false, message: "Failed to like comment due to system error" };
        }
    }

    getCommentsForPost(postId) {
        return this.comments
            .filter(comment => comment.postId === parseInt(postId))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    deletePost(postId, userId) {
        try {
            const postIndex = this.news.findIndex(p => p.id === parseInt(postId));
            if (postIndex === -1) {
                return { success: false, message: "Post not found" };
            }

            const post = this.news[postIndex];
            if (post.userId !== parseInt(userId)) {
                return { success: false, message: "Unauthorized to delete this post" };
            }

            // Remove post comments
            this.comments = this.comments.filter(comment => comment.postId !== parseInt(postId));
            
            // Remove the post
            this.news.splice(postIndex, 1);

            const savedNews = this.saveNews();
            const savedComments = this.saveComments();

            return savedNews && savedComments ? 
                { success: true } : 
                { success: false, message: "Failed to delete post" };
        } catch (error) {
            console.error('Error deleting post:', error);
            return { success: false, message: "Failed to delete post due to system error" };
        }
    }

    getUserNewsCount(userId) {
        return this.news.filter(post => post.userId === parseInt(userId)).length;
    }

    getTotalLikesForUser(userId) {
        return this.news
            .filter(post => post.userId === parseInt(userId))
            .reduce((total, post) => total + post.likes, 0);
    }

    getTotalPosts() {
        return this.news.length;
    }

    getTotalComments() {
        return this.comments.length;
    }
}

// Utility Functions
const utils = {
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    },

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return time.toLocaleDateString();
    },

    getRoleColor(role) {
        const colors = {
            'admin': '#10B981',
            'designer': '#6366F1',
            'client': '#F59E0B',
            'partner': '#00B8D9'
        };
        return colors[role] || '#94A3B8';
    },

    compressImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    try {
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                        resolve(compressedDataUrl);
                    } catch (error) {
                        reject(error);
                    }
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    setupPasswordPreview() {
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            const wrapper = document.createElement('div');
            wrapper.className = 'password-input-group';
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);

            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'password-toggle';
            toggle.innerHTML = '<i class="fas fa-eye"></i>';
            wrapper.appendChild(toggle);

            toggle.addEventListener('click', function() {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                this.querySelector('i').classList.toggle('fa-eye');
                this.querySelector('i').classList.toggle('fa-eye-slash');
            });
        });
    },

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
};

// Quick Wins - Enhanced User Experience
class QuickWins {
    static addConfetti() {
        // Add celebration effect for successful actions
        const confettiCanvas = document.createElement('canvas');
        confettiCanvas.style.position = 'fixed';
        confettiCanvas.style.top = '0';
        confettiCanvas.style.left = '0';
        confettiCanvas.style.width = '100%';
        confettiCanvas.style.height = '100%';
        confettiCanvas.style.pointerEvents = 'none';
        confettiCanvas.style.zIndex = '9999';
        document.body.appendChild(confettiCanvas);
        
        // Simple confetti implementation
        const ctx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        
        const particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * confettiCanvas.width,
                y: -20,
                size: Math.random() * 10 + 5,
                speed: Math.random() * 3 + 2,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                rotation: Math.random() * 360
            });
        }
        
        function animate() {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            let activeParticles = 0;
            
            particles.forEach(particle => {
                particle.y += particle.speed;
                particle.rotation += 2;
                
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.rotation * Math.PI / 180);
                ctx.fillStyle = particle.color;
                ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
                ctx.restore();
                
                if (particle.y < confettiCanvas.height) {
                    activeParticles++;
                }
            });
            
            if (activeParticles > 0) {
                requestAnimationFrame(animate);
            } else {
                document.body.removeChild(confettiCanvas);
            }
        }
        
        animate();
    }
    
    static init() {
        // Add confetti to successful actions
        const originalShowNotification = utils.showNotification;
        utils.showNotification = function(message, type) {
            originalShowNotification.call(this, message, type);
            if (type === 'success' && message.includes('successfully')) {
                setTimeout(() => QuickWins.addConfetti(), 500);
            }
        };
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        document.querySelector('.search-box input')?.focus();
                        break;
                    case '/':
                        e.preventDefault();
                        if (typeof app !== 'undefined') {
                            app.showDashboard();
                        }
                        break;
                }
            }
        });
        
        // Add progress bar for page loads
        const progressBar = document.createElement('div');
        progressBar.style.position = 'fixed';
        progressBar.style.top = '0';
        progressBar.style.left = '0';
        progressBar.style.height = '3px';
        progressBar.style.background = 'linear-gradient(90deg, var(--primary), var(--secondary))';
        progressBar.style.width = '0%';
        progressBar.style.transition = 'width 0.4s ease';
        progressBar.style.zIndex = '10000';
        document.body.appendChild(progressBar);
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            progressBar.style.width = `${progress}%`;
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    progressBar.style.opacity = '0';
                    setTimeout(() => progressBar.remove(), 300);
                }, 200);
            }
        }, 100);
    }
}

// Main App Controller
class AppController {
    constructor() {
        this.userManager = new UserManager();
        this.newsManager = new NewsManager();
        this.selectedImageFile = null;
        this.selectedPrivacy = 'public';
        this.currentPostComments = null;
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordPreview();
        this.updateUI();
        QuickWins.init();
        
        // Show dashboard if user is already logged in
        if (this.userManager.currentUser) {
            this.updateLoginButton();
        }
    }

    setupEventListeners() {
        // Mobile menu
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const navLinks = document.getElementById('mobileMenu');
        
        if (hamburgerBtn && navLinks) {
            hamburgerBtn.addEventListener('click', () => {
                hamburgerBtn.classList.toggle('active');
                navLinks.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });
        }

        // Modal handling
        this.setupModals();
        
        // Forms
        this.setupForms();
        
        // Waitlist form
        const waitlistForm = document.getElementById('waitlist-form');
        if (waitlistForm) {
            waitlistForm.addEventListener('submit', (e) => this.handleWaitlist(e));
        }

        // Navbar scroll effect
        window.addEventListener('scroll', () => this.handleNavbarScroll());
    }

    setupPasswordPreview() {
        utils.setupPasswordPreview();
    }

    setupModals() {
        // Login modal
        const loginBtn = document.getElementById('loginBtn');
        const loginModal = document.getElementById('loginModal');
        const closeLogin = document.getElementById('closeLogin');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showModal('loginModal'));
        }
        if (closeLogin) {
            closeLogin.addEventListener('click', () => this.closeModal('loginModal'));
        }

        // Dashboard modal
        const closeDashboard = document.getElementById('closeDashboard');
        if (closeDashboard) {
            closeDashboard.addEventListener('click', () => this.closeModal('dashboardModal'));
        }

        // Auth tabs
        const authTabs = document.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchAuthTab(e.target));
        });

        // Auth switch links
        const switchToSignup = document.querySelector('.switch-to-signup');
        const switchToLogin = document.querySelector('.switch-to-login');
        
        if (switchToSignup) {
            switchToSignup.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchAuthTab(document.querySelector('[data-tab="signup"]'));
            });
        }
        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchAuthTab(document.querySelector('[data-tab="login"]'));
            });
        }

        // Close modals on backdrop click
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    setupForms() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    switchAuthTab(clickedTab) {
        const tabs = document.querySelectorAll('.auth-tab');
        const forms = document.querySelectorAll('.auth-form');

        tabs.forEach(tab => tab.classList.remove('active'));
        forms.forEach(form => form.classList.remove('active'));

        clickedTab.classList.add('active');
        const tabName = clickedTab.getAttribute('data-tab');
        document.getElementById(`${tabName}Form`).classList.add('active');
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('login-email');
        const password = formData.get('login-password');

        if (!email || !password) {
            utils.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (!utils.validateEmail(email)) {
            utils.showNotification('Please enter a valid email address', 'error');
            return;
        }

        const result = this.userManager.login(email, password);
        
        if (result.success) {
            utils.showNotification('Login successful!', 'success');
            this.closeModal('loginModal');
            this.updateUI();
            this.showDashboard();
        } else {
            utils.showNotification(result.message, 'error');
            e.target.classList.add('shake');
            setTimeout(() => e.target.classList.remove('shake'), 500);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const userData = {
            firstName: utils.sanitizeInput(formData.get('first-name')),
            lastName: utils.sanitizeInput(formData.get('last-name') || ''),
            email: formData.get('signup-email'),
            password: formData.get('signup-password'),
            role: formData.get('user-role')
        };

        if (!userData.firstName || !userData.email || !userData.password || !userData.role) {
            utils.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (!utils.validateEmail(userData.email)) {
            utils.showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (userData.password.length < 6) {
            utils.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        const result = this.userManager.register(userData);
        
        if (result.success) {
            utils.showNotification('Account created successfully!', 'success');
            this.closeModal('loginModal');
            this.updateUI();
            this.showDashboard();
        } else {
            utils.showNotification(result.message, 'error');
        }
    }

    handleWaitlist(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const message = document.getElementById('message');

        if (email && utils.validateEmail(email)) {
            message.textContent = 'Thank you for joining our waitlist!';
            message.style.color = 'var(--accent)';
            e.target.reset();
            
            // Save to localStorage
            const waitlist = JSON.parse(localStorage.getItem('moddiWaitlist') || '[]');
            waitlist.push({ email, timestamp: new Date().toISOString() });
            localStorage.setItem('moddiWaitlist', JSON.stringify(waitlist));
        } else {
            message.textContent = 'Please enter a valid email address.';
            message.style.color = 'var(--danger)';
        }
    }

    handleNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    updateUI() {
        this.updateLoginButton();
    }

    updateLoginButton() {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn && this.userManager.currentUser) {
            loginBtn.innerHTML = `
                <div class="user-avatar-small">${this.userManager.currentUser.avatar}</div>
                ${this.userManager.currentUser.firstName}
            `;
            loginBtn.classList.add('logged-in');
        }
    }

    showDashboard() {
        this.setupDashboard();
        this.showModal('dashboardModal');
    }

    setupDashboard() {
        this.loadDashboardStats();
        this.loadNewsFeed();
        this.loadCommunityUsers();
        this.loadProfile();
        this.setupDashboardTabs();
        this.setupNewsCreation();
        this.setupImageUpload();
    }

    loadDashboardStats() {
        if (!this.userManager.currentUser) return;

        const newsCount = this.newsManager.getUserNewsCount(this.userManager.currentUser.id);
        const communityCount = this.userManager.getTotalUsers() - 1; // Exclude current user
        const likesCount = this.newsManager.getTotalLikesForUser(this.userManager.currentUser.id);

        document.getElementById('newsCount').textContent = newsCount;
        document.getElementById('communityCount').textContent = communityCount;
        document.getElementById('likesCount').textContent = likesCount;

        // Update user info
        document.getElementById('userName').textContent = 
            `${this.userManager.currentUser.firstName} ${this.userManager.currentUser.lastName}`;
        document.getElementById('userAvatar').textContent = this.userManager.currentUser.avatar;
        document.getElementById('userRoleBadge').textContent = this.userManager.currentUser.role;
    }

    setupDashboardTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all tabs
                tabBtns.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

                // Add active class to clicked tab
                btn.classList.add('active');
                const tabName = btn.getAttribute('data-tab');
                document.getElementById(`${tabName}Tab`).classList.add('active');
            });
        });
    }

    setupNewsCreation() {
        const createNewsBtn = document.getElementById('createNewsBtn');
        const createNewsForm = document.getElementById('createNewsForm');
        const postNewsBtn = document.getElementById('postNewsBtn');
        const cancelNewsBtn = document.getElementById('cancelNewsBtn');

        if (createNewsBtn && createNewsForm) {
            createNewsBtn.addEventListener('click', () => {
                createNewsForm.style.display = 'block';
                createNewsBtn.style.display = 'none';
            });
        }

        if (cancelNewsBtn && createNewsForm) {
            cancelNewsBtn.addEventListener('click', () => {
                createNewsForm.style.display = 'none';
                createNewsBtn.style.display = 'flex';
                this.resetNewsForm();
            });
        }

        if (postNewsBtn) {
            postNewsBtn.addEventListener('click', () => this.handlePostNews());
        }

        // Privacy selector
        const privacySelector = document.getElementById('privacySelector');
        if (privacySelector) {
            privacySelector.addEventListener('change', (e) => {
                this.selectedPrivacy = e.target.value;
            });
        }
    }

    setupImageUpload() {
        const imageUpload = document.getElementById('imageUpload');
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        const removeImageBtn = document.getElementById('removeImageBtn');

        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                        utils.showNotification('Image must be less than 2MB', 'error');
                        return;
                    }

                    this.selectedImageFile = file;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        previewImg.src = e.target.result;
                        imagePreview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => {
                this.selectedImageFile = null;
                imagePreview.style.display = 'none';
                if (imageUpload) imageUpload.value = '';
            });
        }
    }

    async handlePostNews() {
        if (!this.userManager.currentUser) {
            utils.showNotification('Please login to post', 'error');
            return;
        }

        const newsContent = document.getElementById('newsContent');
        const content = newsContent ? newsContent.value.trim() : '';
        
        if (!content && !this.selectedImageFile) {
            utils.showNotification('Please enter some content or add an image', 'error');
            return;
        }

        let imageData = null;

        // Process image if selected
        if (this.selectedImageFile) {
            try {
                const uploadProgress = document.getElementById('uploadProgress');
                const progressFill = uploadProgress?.querySelector('.progress-fill');
                
                if (uploadProgress) uploadProgress.style.display = 'block';
                if (progressFill) progressFill.style.width = '30%';

                imageData = await utils.compressImage(this.selectedImageFile);
                
                if (progressFill) progressFill.style.width = '100%';
                setTimeout(() => {
                    if (uploadProgress) uploadProgress.style.display = 'none';
                }, 500);

            } catch (error) {
                console.error('Error processing image:', error);
                utils.showNotification('Failed to process image', 'error');
                return;
            }
        }

        const result = this.newsManager.createPost(
            this.userManager.currentUser.id, 
            content, 
            imageData, 
            this.selectedPrivacy
        );

        if (result.success) {
            utils.showNotification('Post published successfully!', 'success');
            this.loadNewsFeed();
            this.resetNewsForm();
            this.loadDashboardStats();
            
            // Hide create form and show button
            const createNewsForm = document.getElementById('createNewsForm');
            const createNewsBtn = document.getElementById('createNewsBtn');
            if (createNewsForm) createNewsForm.style.display = 'none';
            if (createNewsBtn) createNewsBtn.style.display = 'flex';
        } else {
            utils.showNotification(result.message, 'error');
        }
    }

    resetNewsForm() {
        const newsContent = document.getElementById('newsContent');
        const imagePreview = document.getElementById('imagePreview');
        const imageUpload = document.getElementById('imageUpload');
        const uploadProgress = document.getElementById('uploadProgress');

        if (newsContent) newsContent.value = '';
        if (imagePreview) imagePreview.style.display = 'none';
        if (imageUpload) imageUpload.value = '';
        if (uploadProgress) uploadProgress.style.display = 'none';
        
        this.selectedImageFile = null;
        this.selectedPrivacy = 'public';
        
        const privacySelector = document.getElementById('privacySelector');
        if (privacySelector) privacySelector.value = 'public';
    }

    loadNewsFeed() {
        const newsFeed = document.getElementById('newsFeed');
        if (!newsFeed) return;

        const posts = this.newsManager.news;

        if (posts.length === 0) {
            newsFeed.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <h4>No Posts Yet</h4>
                    <p>Be the first to share an update!</p>
                </div>
            `;
            return;
        }

        newsFeed.innerHTML = posts.map(post => {
            const user = this.userManager.getUserById(post.userId);
            if (!user) return '';

            const isLiked = post.likedBy.includes(this.userManager.currentUser?.id);
            const isOwnPost = post.userId === this.userManager.currentUser?.id;

            return `
                <div class="news-item" data-post-id="${post.id}">
                    <div class="news-header">
                        <div class="news-author">
                            <div class="author-avatar">${user.avatar}</div>
                            <div class="author-info">
                                <h4>${user.firstName} ${user.lastName}</h4>
                                <div class="author-role">${user.role}</div>
                            </div>
                        </div>
                        <div class="news-meta">
                            <span class="news-time">${utils.formatTimeAgo(post.timestamp)}</span>
                            ${isOwnPost ? `
                                <button class="action-btn delete" onclick="app.deletePost(${post.id})" aria-label="Delete post">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="news-content">
                        ${post.content}
                        ${post.image ? `
                            <div class="news-image">
                                <img src="${post.image}" alt="Post image" onclick="app.enlargeImage('${post.image}')">
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="news-stats">
                        <span class="stat">${post.likes} likes</span>
                        <span class="stat">${post.comments || 0} comments</span>
                    </div>
                    
                    <div class="news-actions">
                        <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="app.likePost(${post.id})" aria-label="${isLiked ? 'Unlike' : 'Like'} post">
                            <i class="fas fa-heart"></i>
                            <span>Like</span>
                        </button>
                        <button class="action-btn" onclick="app.showComments(${post.id})" aria-label="Comment on post">
                            <i class="fas fa-comment"></i>
                            <span>Comment</span>
                        </button>
                        <button class="action-btn" onclick="app.sharePost(${post.id})" aria-label="Share post">
                            <i class="fas fa-share"></i>
                            <span>Share</span>
                        </button>
                    </div>

                    <div class="comments-section" id="comments-${post.id}" style="display: none;">
                        <div class="add-comment">
                            <input type="text" placeholder="Write a comment..." id="comment-input-${post.id}" aria-label="Write a comment">
                            <button onclick="app.addComment(${post.id})">Post</button>
                        </div>
                        <div class="comments-list" id="comments-list-${post.id}"></div>
                    </div>
                </div>
            `;
        }).join('');

        this.loadAllComments();
    }

    loadAllComments() {
        const posts = this.newsManager.news;
        posts.forEach(post => {
            this.loadCommentsForPost(post.id);
        });
    }

    loadCommentsForPost(postId) {
        const commentsList = document.getElementById(`comments-list-${postId}`);
        if (!commentsList) return;

        const comments = this.newsManager.getCommentsForPost(postId);
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
            return;
        }

        commentsList.innerHTML = comments.map(comment => {
            const user = this.userManager.getUserById(comment.userId);
            if (!user) return '';

            const isLiked = comment.likedBy.includes(this.userManager.currentUser?.id);

            return `
                <div class="comment-item">
                    <div class="comment-avatar">${user.avatar}</div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <strong>${user.firstName} ${user.lastName}</strong>
                            <span class="comment-time">${utils.formatTimeAgo(comment.timestamp)}</span>
                        </div>
                        <p>${comment.content}</p>
                        <div class="comment-actions">
                            <button class="comment-action ${isLiked ? 'liked' : ''}" onclick="app.likeComment(${comment.id})" aria-label="${isLiked ? 'Unlike' : 'Like'} comment">
                                <i class="fas fa-heart"></i> ${comment.likes}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    likePost(postId) {
        if (!this.userManager.currentUser) {
            utils.showNotification('Please login to like posts', 'error');
            return;
        }

        const result = this.newsManager.likePost(postId, this.userManager.currentUser.id);
        if (result.success) {
            this.loadNewsFeed();
        } else {
            utils.showNotification(result.message, 'error');
        }
    }

    likeComment(commentId) {
        if (!this.userManager.currentUser) {
            utils.showNotification('Please login to like comments', 'error');
            return;
        }

        const result = this.newsManager.likeComment(commentId, this.userManager.currentUser.id);
        if (result.success) {
            this.loadAllComments();
        } else {
            utils.showNotification(result.message, 'error');
        }
    }

    showComments(postId) {
        const commentsSection = document.getElementById(`comments-${postId}`);
        if (commentsSection) {
            const isVisible = commentsSection.style.display !== 'none';
            commentsSection.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                this.loadCommentsForPost(postId);
            }
        }
    }

    addComment(postId) {
        if (!this.userManager.currentUser) {
            utils.showNotification('Please login to comment', 'error');
            return;
        }

        const commentInput = document.getElementById(`comment-input-${postId}`);
        if (!commentInput || !commentInput.value.trim()) {
            utils.showNotification('Please enter a comment', 'error');
            return;
        }

        const result = this.newsManager.addComment(
            postId, 
            this.userManager.currentUser.id, 
            commentInput.value
        );

        if (result.success) {
            commentInput.value = '';
            this.loadCommentsForPost(postId);
            this.loadNewsFeed(); // Refresh to update comment count
            utils.showNotification('Comment added!', 'success');
        } else {
            utils.showNotification(result.message, 'error');
        }
    }

    deletePost(postId) {
        if (!this.userManager.currentUser) return;

        if (confirm('Are you sure you want to delete this post?')) {
            const result = this.newsManager.deletePost(postId, this.userManager.currentUser.id);
            if (result.success) {
                this.loadNewsFeed();
                this.loadDashboardStats();
                utils.showNotification('Post deleted', 'success');
            } else {
                utils.showNotification(result.message, 'error');
            }
        }
    }

    sharePost(postId) {
        const post = this.newsManager.news.find(p => p.id === postId);
        if (post) {
            if (navigator.share) {
                navigator.share({
                    title: 'Check out this post from Moddi Tech',
                    text: post.content,
                    url: window.location.href
                });
            } else {
                utils.showNotification('Post link copied to clipboard!', 'success');
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(window.location.href);
            }
        }
    }

    enlargeImage(imageSrc) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content image-modal">
                <button class="close-modal" aria-label="Close image">&times;</button>
                <img src="${imageSrc}" alt="Enlarged post image" class="enlarged-image">
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    loadCommunityUsers(searchTerm = '') {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        let users = this.userManager.getAllUsers();
        
        if (searchTerm) {
            users = users.filter(user => 
                user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.role.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (users.length === 0) {
            usersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h4>No users found</h4>
                    <p>${searchTerm ? 'Try a different search term' : 'No other users in the community yet'}</p>
                </div>
            `;
            return;
        }

        usersList.innerHTML = users.map(user => {
            return `
                <div class="user-card">
                    <div class="user-avatar-card">${user.avatar}</div>
                    <h4>${user.firstName} ${user.lastName}</h4>
                    <p>${user.role}</p>
                    <div class="user-role-tag" style="background: ${utils.getRoleColor(user.role)}">
                        ${user.role}
                    </div>
                </div>
            `;
        }).join('');

        // Setup search functionality
        const userSearch = document.getElementById('userSearch');
        if (userSearch) {
            userSearch.addEventListener('input', (e) => {
                this.loadCommunityUsers(e.target.value);
            });
        }
    }

    loadProfile() {
        if (!this.userManager.currentUser) return;

        const user = this.userManager.currentUser;
        
        document.getElementById('profileName').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profileRole').textContent = user.role;
        document.getElementById('profileAvatar').textContent = user.avatar;
        document.getElementById('joinDate').textContent = new Date(user.joinDate).getFullYear();

        // Setup logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    handleLogout() {
        this.userManager.logout();
        this.closeModal('dashboardModal');
        this.updateUI();
        utils.showNotification('Logged out successfully', 'success');
        
        // Reset login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.innerHTML = 'Login';
            loginBtn.classList.remove('logged-in');
        }
    }
}

// Initialize the app
const app = new AppController();
document.addEventListener('DOMContentLoaded', function() {
    app.init();
});
