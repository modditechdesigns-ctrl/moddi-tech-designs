// Enhanced User Management System with Privacy Controls
class UserManager {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.loadCurrentUser();
        this.blockedUsers = this.loadBlockedUsers();
        this.friends = this.loadFriends();
    }

    // ... existing loadUsers, saveUsers, loadCurrentUser, saveCurrentUser methods ...

    loadBlockedUsers() {
        try {
            const stored = localStorage.getItem('moddiBlockedUsers');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading blocked users:', error);
            return [];
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

    saveBlockedUsers() {
        try {
            localStorage.setItem('moddiBlockedUsers', JSON.stringify(this.blockedUsers));
            return true;
        } catch (error) {
            console.error('Error saving blocked users:', error);
            return false;
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

    // NEW: Block/Unblock user functionality
    blockUser(userId) {
        try {
            if (this.blockedUsers.includes(parseInt(userId))) {
                return { success: false, message: "User already blocked" };
            }

            this.blockedUsers.push(parseInt(userId));
            const saved = this.saveBlockedUsers();
            
            // Remove from friends if blocked
            this.removeFriend(userId);
            
            return saved ? 
                { success: true } : 
                { success: false, message: "Failed to block user" };
                
        } catch (error) {
            console.error('Error blocking user:', error);
            return { success: false, message: "Failed to block user due to system error" };
        }
    }

    unblockUser(userId) {
        try {
            const index = this.blockedUsers.indexOf(parseInt(userId));
            if (index === -1) {
                return { success: false, message: "User not blocked" };
            }

            this.blockedUsers.splice(index, 1);
            const saved = this.saveBlockedUsers();
            
            return saved ? 
                { success: true } : 
                { success: false, message: "Failed to unblock user" };
                
        } catch (error) {
            console.error('Error unblocking user:', error);
            return { success: false, message: "Failed to unblock user due to system error" };
        }
    }

    // NEW: Friend management
    addFriend(userId) {
        try {
            if (this.friends.includes(parseInt(userId))) {
                return { success: false, message: "Already friends" };
            }

            this.friends.push(parseInt(userId));
            const saved = this.saveFriends();
            
            return saved ? 
                { success: true } : 
                { success: false, message: "Failed to add friend" };
                
        } catch (error) {
            console.error('Error adding friend:', error);
            return { success: false, message: "Failed to add friend due to system error" };
        }
    }

    removeFriend(userId) {
        try {
            const index = this.friends.indexOf(parseInt(userId));
            if (index === -1) {
                return { success: false, message: "Not friends" };
            }

            this.friends.splice(index, 1);
            const saved = this.saveFriends();
            
            return saved ? 
                { success: true } : 
                { success: false, message: "Failed to remove friend" };
                
        } catch (error) {
            console.error('Error removing friend:', error);
            return { success: false, message: "Failed to remove friend due to system error" };
        }
    }

    // NEW: Check if user can view content
    canViewUserContent(targetUserId) {
        try {
            const currentUserId = this.currentUser?.id;
            if (!currentUserId) return false;

            const targetUser = this.getUserById(targetUserId);
            if (!targetUser) return false;

            // Check if blocked
            if (this.blockedUsers.includes(parseInt(targetUserId)) || 
                targetUser.blockedUsers?.includes(parseInt(currentUserId))) {
                return false;
            }

            // Check privacy settings
            if (targetUser.privacySettings) {
                const privacy = targetUser.privacySettings;
                
                if (privacy === 'private') {
                    return this.friends.includes(parseInt(targetUserId));
                } else if (privacy === 'friends_except') {
                    return this.friends.includes(parseInt(targetUserId)) && 
                           !targetUser.restrictedUsers?.includes(parseInt(currentUserId));
                }
            }

            return true;
        } catch (error) {
            console.error('Error checking view permissions:', error);
            return false;
        }
    }

    // NEW: Update user privacy settings
    updatePrivacySettings(settings) {
        try {
            if (!this.currentUser) {
                return { success: false, message: "Not logged in" };
            }

            const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex === -1) {
                return { success: false, message: "User not found" };
            }

            this.users[userIndex].privacySettings = settings;
            const saved = this.saveUsers();
            
            // Update current user session
            if (saved) {
                this.currentUser.privacySettings = settings;
                this.saveCurrentUser(this.currentUser);
            }
            
            return saved ? 
                { success: true } : 
                { success: false, message: "Failed to update privacy settings" };
                
        } catch (error) {
            console.error('Error updating privacy settings:', error);
            return { success: false, message: "Failed to update privacy settings due to system error" };
        }
    }

    // ... existing register, login, logout, getAvatarForRole methods ...

    getAllUsers() {
        try {
            return this.users.filter(user => 
                user.id !== this.currentUser?.id && 
                !this.blockedUsers.includes(user.id)
            );
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    }

    // ... existing getUserById method ...
}

// Enhanced News Management System with Privacy Support
class NewsManager {
    constructor() {
        this.news = this.loadNews();
    }

    // ... existing loadNews, saveNews methods ...

    createPost(userId, content, privacy = 'public') {
        try {
            if (!userId || !content?.trim()) {
                return { success: false, message: "Content is required" };
            }

            if (content.trim().length < 5) {
                return { success: false, message: "Content must be at least 5 characters" };
            }

            const post = {
                id: Date.now(),
                userId: parseInt(userId),
                content: content.trim(),
                timestamp: new Date().toISOString(),
                likes: 0,
                likedBy: [],
                privacy: privacy, // 'public', 'friends', 'private'
                visibleTo: [] // For custom privacy
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

    // NEW: Create post with image and privacy
    createPostWithImage(userId, content, imageData = null, privacy = 'public') {
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
                visibleTo: []
            };

            this.news.unshift(post);
            const saved = this.saveNews();
            
            return saved ? 
                { success: true, post } : 
                { success: false, message: "Failed to save post" };
                
        } catch (error) {
            console.error('Error creating post with image:', error);
            return { success: false, message: "Failed to create post due to system error" };
        }
    }

    // NEW: Check if post is visible to current user
    isPostVisible(post, currentUserId, userManager) {
        try {
            if (!currentUserId) return false;

            // Check if user is blocked
            if (userManager.blockedUsers.includes(post.userId) || 
                post.blockedUsers?.includes(currentUserId)) {
                return false;
            }

            // Check post privacy
            switch(post.privacy) {
                case 'public':
                    return true;
                case 'friends':
                    return userManager.friends.includes(post.userId);
                case 'private':
                    return post.userId === currentUserId;
                default:
                    return true;
            }
        } catch (error) {
            console.error('Error checking post visibility:', error);
            return false;
        }
    }

    // NEW: Get filtered news feed based on privacy
    getNewsFeed(userManager) {
        try {
            const currentUserId = userManager.currentUser?.id;
            if (!currentUserId) return [];

            return this.news
                .filter(post => this.isPostVisible(post, currentUserId, userManager))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
            console.error('Error getting news feed:', error);
            return [];
        }
    }

    // ... existing compressImage, deletePost, likePost, getUserNewsCount methods ...
}

// Enhanced AppController with Social Media Features
class AppController {
    constructor() {
        this.mobileMenu = null;
        this.userManager = null;
        this.newsManager = null;
        this.selectedImageFile = null;
        this.selectedPrivacy = 'public';
    }

    // ... existing init, setupEventListeners methods ...

    setupDashboard() {
        try {
            // ... existing setup code ...

            // Privacy selector
            const privacySelector = document.getElementById('privacySelector');
            if (privacySelector) {
                privacySelector.addEventListener('change', (e) => {
                    this.selectedPrivacy = e.target.value;
                });
            }

            // User actions (block, friend, etc.)
            this.setupUserActions();

        } catch (error) {
            console.error('Error setting up dashboard:', error);
        }
    }

    // NEW: Setup user action handlers
    setupUserActions() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('block-user-btn')) {
                const userId = e.target.getAttribute('data-user-id');
                this.handleBlockUser(userId);
            }
            if (e.target.classList.contains('friend-user-btn')) {
                const userId = e.target.getAttribute('data-user-id');
                this.handleFriendUser(userId);
            }
            if (e.target.classList.contains('view-profile-btn')) {
                const userId = e.target.getAttribute('data-user-id');
                this.handleViewProfile(userId);
            }
        });
    }

    // NEW: Handle user blocking
    async handleBlockUser(userId) {
        try {
            if (!this.userManager.currentUser) return;

            const result = this.userManager.blockUser(userId);
            if (result.success) {
                utils.showNotification('User blocked successfully', 'success');
                this.loadCommunityUsers();
                this.loadNewsFeed();
            } else {
                utils.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error blocking user:', error);
            utils.showNotification('Failed to block user', 'error');
        }
    }

    // NEW: Handle friend requests
    async handleFriendUser(userId) {
        try {
            if (!this.userManager.currentUser) return;

            const result = this.userManager.addFriend(userId);
            if (result.success) {
                utils.showNotification('Friend request sent', 'success');
                this.loadCommunityUsers();
            } else {
                utils.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error adding friend:', error);
            utils.showNotification('Failed to send friend request', 'error');
        }
    }

    // NEW: Handle profile viewing
    handleViewProfile(userId) {
        const user = this.userManager.getUserById(userId);
        if (!user) return;

        if (this.userManager.canViewUserContent(userId)) {
            // Show user profile
            this.showUserProfile(user);
        } else {
            // Show restricted view
            this.showRestrictedProfile(user);
        }
    }

    // NEW: Show restricted profile
    showRestrictedProfile(user) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔒 Restricted Profile</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="restricted-profile">
                    <div class="user-avatar-large">${user.avatar}</div>
                    <h4>${user.firstName} ${user.lastName}</h4>
                    <p class="user-role" style="color: ${utils.getRoleColor(user.role)}">${user.role}</p>
                    <div class="restricted-message">
                        <p>This profile is private. Send a friend request to see their content.</p>
                        <button class="btn-primary friend-user-btn" data-user-id="${user.id}">
                            Send Friend Request
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // NEW: Enhanced post creation with privacy
    async handlePostNews() {
        try {
            const newsContent = document.getElementById('newsContent');
            const privacySelector = document.getElementById('privacySelector');

            if (!this.userManager.currentUser) {
                utils.showNotification('Please login to post', 'error');
                return;
            }

            const content = newsContent ? newsContent.value.trim() : '';
            const privacy = privacySelector ? privacySelector.value : 'public';
            
            if (!content && !this.selectedImageFile) {
                utils.showNotification('Please enter some content or add an image', 'error');
                return;
            }

            let imageData = null;

            // Process image if selected
            if (this.selectedImageFile) {
                // ... existing image processing code ...
            }

            // Create post with privacy setting
            const result = this.selectedImageFile ? 
                this.newsManager.createPostWithImage(this.userManager.currentUser.id, content, imageData, privacy) :
                this.newsManager.createPost(this.userManager.currentUser.id, content, privacy);

            if (result.success) {
                utils.showNotification('Post published successfully!', 'success');
                this.loadNewsFeed();
                this.resetNewsForm();
            } else {
                utils.showNotification(result.message, 'error');
            }

        } catch (error) {
            console.error('Error posting news:', error);
            utils.showNotification('Failed to post update', 'error');
        }
    }

    // NEW: Enhanced news feed loading with privacy
    loadNewsFeed() {
        try {
            const newsFeed = document.getElementById('newsFeed');
            if (!newsFeed) return;

            const posts = this.newsManager.getNewsFeed(this.userManager);
            
            if (posts.length === 0) {
                newsFeed.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📝</div>
                        <h3>No posts yet</h3>
                        <p>Be the first to share something with the community!</p>
                    </div>
                `;
                return;
            }

            newsFeed.innerHTML = posts.map(post => {
                const user = this.userManager.getUserById(post.userId);
                if (!user) return '';

                const isLiked = post.likedBy.includes(this.userManager.currentUser?.id);
                const canInteract = this.userManager.canViewUserContent(post.userId);
                const privacyIcon = this.getPrivacyIcon(post.privacy);

                return `
                    <div class="news-item" data-post-id="${post.id}">
                        <div class="news-header">
                            <div class="user-info">
                                <div class="user-avatar">${user.avatar}</div>
                                <div>
                                    <div class="user-name">${user.firstName} ${user.lastName}</div>
                                    <div class="post-meta">
                                        <span class="post-time">${utils.formatTimeAgo(post.timestamp)}</span>
                                        <span class="post-privacy">${privacyIcon}</span>
                                    </div>
                                </div>
                            </div>
                            ${post.userId === this.userManager.currentUser?.id ? `
                                <button class="delete-post-btn" data-post-id="${post.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                        
                        <div class="news-content">
                            ${post.content}
                            ${post.image ? `<img src="${post.image}" class="post-image" alt="Post image">` : ''}
                        </div>
                        
                        <div class="news-actions">
                            ${canInteract ? `
                                <button class="like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
                                    <i class="fas fa-heart"></i>
                                    <span>${post.likes}</span>
                                </button>
                                <button class="comment-btn" data-post-id="${post.id}">
                                    <i class="fas fa-comment"></i>
                                    <span>Comment</span>
                                </button>
                                <button class="share-btn" data-post-id="${post.id}">
                                    <i class="fas fa-share"></i>
                                    <span>Share</span>
                                </button>
                            ` : `
                                <div class="restricted-actions">
                                    <span class="restricted-text">🔒 Interactions restricted</span>
                                </div>
                            `}
                        </div>
                    </div>
                `;
            }).join('');

            // Add event listeners for interactive elements
            this.setupNewsInteractions();

        } catch (error) {
            console.error('Error loading news feed:', error);
        }
    }

    // NEW: Enhanced community users with privacy
    loadCommunityUsers(searchTerm = '') {
        try {
            const usersList = document.getElementById('usersList');
            if (!usersList) return;

            let users = this.userManager.getAllUsers();
            
            // Filter by search term
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
                        <div class="empty-icon">👥</div>
                        <h3>No users found</h3>
                        <p>${searchTerm ? 'Try a different search term' : 'No other users in the community yet'}</p>
                    </div>
                `;
                return;
            }

            usersList.innerHTML = users.map(user => {
                const isFriend = this.userManager.friends.includes(user.id);
                const isBlocked = this.userManager.blockedUsers.includes(user.id);
                const canView = this.userManager.canViewUserContent(user.id);

                return `
                    <div class="user-card">
                        <div class="user-info">
                            <div class="user-avatar">${user.avatar}</div>
                            <div class="user-details">
                                <h4>${user.firstName} ${user.lastName}</h4>
                                <p class="user-role" style="color: ${utils.getRoleColor(user.role)}">${user.role}</p>
                                <p class="user-bio">${user.bio || 'No bio yet'}</p>
                            </div>
                        </div>
                        <div class="user-actions">
                            ${!canView ? `
                                <button class="btn-secondary view-profile-btn" data-user-id="${user.id}">
                                    🔒 View Profile
                                </button>
                            ` : `
                                <button class="btn-primary view-profile-btn" data-user-id="${user.id}">
                                    View Profile
                                </button>
                            `}
                            
                            ${!isFriend ? `
                                <button class="btn-outline friend-user-btn" data-user-id="${user.id}">
                                    Add Friend
                                </button>
                            ` : `
                                <button class="btn-outline" disabled>
                                    Friends
                                </button>
                            `}
                            
                            ${!isBlocked ? `
                                <button class="btn-danger block-user-btn" data-user-id="${user.id}">
                                    Block
                                </button>
                            ` : `
                                <button class="btn-danger" disabled>
                                    Blocked
                                </button>
                            `}
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Error loading community users:', error);
        }
    }

    // NEW: Privacy icon helper
    getPrivacyIcon(privacy) {
        const icons = {
            'public': '🌐 Public',
            'friends': '👥 Friends',
            'private': '🔒 Private'
        };
        return icons[privacy] || '🌐 Public';
    }

    // ... existing methods ...
}

// Enhanced Utility Functions
utils.getPrivacyIcon = function(privacy) {
    const icons = {
        'public': '🌐',
        'friends': '👥',
        'private': '🔒'
    };
    return icons[privacy] || '🌐';
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    const app = new AppController();
    app.init();
});