/**
 * Integration Test: Profile Management Flow
 *
 * Tests the complete profile management and customization flow
 * Based on User Story 4 from quickstart.md
 *
 * These tests MUST FAIL initially (TDD approach)
 * Implementation will be created to make these tests pass
 */

import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

// Pages and components to be implemented
import UserProfilePage from '../../pages/users/[id].vue'
import ProfileEditPage from '../../pages/profile/edit.vue'
import SettingsPage from '../../pages/settings/index.vue'
import AvatarUpload from '../../components/AvatarUpload.vue'
import ProfileForm from '../../components/ProfileForm.vue'

// Composables to be implemented
import { useUsers } from '../../composables/useUsers.js'
import { useAuth } from '../../composables/useAuth.js'
import { useArticles } from '../../composables/useArticles.js'

// Mock Firebase for testing
jest.mock('firebase/auth')
jest.mock('firebase/firestore')
jest.mock('firebase/storage')

describe('Profile Management Flow Integration Test', () => {
  let router
  let pinia
  let wrapper

  beforeEach(() => {
    // Setup router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/users/:id', component: UserProfilePage },
        { path: '/profile/edit', component: ProfileEditPage },
        { path: '/settings', component: SettingsPage },
        { path: '/login', component: { template: '<div>Login</div>' } }
      ]
    })

    // Setup Pinia store
    pinia = createPinia()

    // Mock authenticated user
    global.mockAuthenticatedUser = {
      uid: 'user-123',
      displayName: 'testuser',
      email: 'test@example.com',
      emailVerified: true
    }

    global.mockUserProfile = jest.fn()
    global.mockFileUpload = jest.fn()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Profile Viewing', () => {
    it('should display complete user profile with all information', async () => {
      const mockUserProfile = {
        uid: 'user-123',
        displayName: 'techexpert',
        email: 'tech@example.com',
        bio: 'フロントエンド開発者です。Vue.jsとReactを専門にしています。',
        website: 'https://techexpert.dev',
        twitterHandle: '@techexpert',
        githubHandle: 'techexpert',
        location: '東京, 日本',
        avatarUrl: 'https://example.com/avatar.jpg',
        joinedAt: new Date('2023-01-15'),
        isEmailVerified: true,
        articleCount: 25,
        followerCount: 150,
        followingCount: 75,
        totalLikes: 1250,
        totalViews: 45000
      }

      const mockUserArticles = [
        {
          id: 'article-1',
          title: 'Vue.js 3の新機能解説',
          excerpt: 'Vue.js 3の新しい機能について詳しく解説します。',
          publishedAt: new Date('2024-01-10'),
          likeCount: 45,
          viewCount: 1250,
          tags: ['vue', 'javascript']
        },
        {
          id: 'article-2',
          title: 'TypeScript入門',
          excerpt: 'TypeScriptの基本的な使い方を学びます。',
          publishedAt: new Date('2024-01-05'),
          likeCount: 32,
          viewCount: 890,
          tags: ['typescript', 'javascript']
        }
      ]

      const mockUsersAPI = useUsers()
      mockUsersAPI.getUserProfile = jest.fn().mockResolvedValue(mockUserProfile)

      const mockArticlesAPI = useArticles()
      mockArticlesAPI.getUserArticles = jest.fn().mockResolvedValue({
        articles: mockUserArticles,
        total: 25,
        hasNext: true
      })

      wrapper = mount(UserProfilePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/users/user-123')
      await wrapper.vm.$nextTick()

      // Step 1: Check profile header information
      const profileHeader = wrapper.find('[data-testid="profile-header"]')
      expect(profileHeader.exists()).toBe(true)

      const avatarImage = wrapper.find('[data-testid="profile-avatar"]')
      expect(avatarImage.exists()).toBe(true)
      expect(avatarImage.attributes('src')).toBe(mockUserProfile.avatarUrl)

      const displayName = wrapper.find('[data-testid="profile-name"]')
      expect(displayName.exists()).toBe(true)
      expect(displayName.text()).toBe('techexpert')

      const bio = wrapper.find('[data-testid="profile-bio"]')
      expect(bio.exists()).toBe(true)
      expect(bio.text()).toContain('フロントエンド開発者')

      // Step 2: Check social links
      const websiteLink = wrapper.find('[data-testid="profile-website"]')
      expect(websiteLink.exists()).toBe(true)
      expect(websiteLink.attributes('href')).toBe('https://techexpert.dev')

      const twitterLink = wrapper.find('[data-testid="profile-twitter"]')
      expect(twitterLink.exists()).toBe(true)
      expect(twitterLink.attributes('href')).toBe('https://twitter.com/techexpert')

      const githubLink = wrapper.find('[data-testid="profile-github"]')
      expect(githubLink.exists()).toBe(true)
      expect(githubLink.attributes('href')).toBe('https://github.com/techexpert')

      // Step 3: Check statistics
      const articleCount = wrapper.find('[data-testid="stat-articles"]')
      expect(articleCount.text()).toContain('25')

      const followerCount = wrapper.find('[data-testid="stat-followers"]')
      expect(followerCount.text()).toContain('150')

      const followingCount = wrapper.find('[data-testid="stat-following"]')
      expect(followingCount.text()).toContain('75')

      // Step 4: Check recent articles
      const articlesSection = wrapper.find('[data-testid="user-articles"]')
      expect(articlesSection.exists()).toBe(true)

      const articleCards = wrapper.findAll('[data-testid="article-card"]')
      expect(articleCards.length).toBe(2)

      // Step 5: Check join date and location
      const joinDate = wrapper.find('[data-testid="profile-joined"]')
      expect(joinDate.exists()).toBe(true)

      const location = wrapper.find('[data-testid="profile-location"]')
      expect(location.exists()).toBe(true)
      expect(location.text()).toContain('東京, 日本')
    })

    it('should show edit button only for own profile', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(global.mockAuthenticatedUser)

      const mockUsersAPI = useUsers()
      mockUsersAPI.getUserProfile = jest.fn().mockResolvedValue({
        uid: 'user-123', // Same as authenticated user
        displayName: 'testuser'
      })

      wrapper = mount(UserProfilePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/users/user-123')
      await wrapper.vm.$nextTick()

      // Should show edit button for own profile
      const editButton = wrapper.find('[data-testid="edit-profile-button"]')
      expect(editButton.exists()).toBe(true)

      await editButton.trigger('click')
      expect(router.currentRoute.value.path).toBe('/profile/edit')
    })

    it('should show follow button for other users profiles', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(global.mockAuthenticatedUser)

      const mockUsersAPI = useUsers()
      mockUsersAPI.getUserProfile = jest.fn().mockResolvedValue({
        uid: 'other-user-456', // Different from authenticated user
        displayName: 'otheruser',
        isFollowing: false
      })
      mockUsersAPI.followUser = jest.fn().mockResolvedValue()

      wrapper = mount(UserProfilePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/users/other-user-456')
      await wrapper.vm.$nextTick()

      // Should show follow button for other users
      const followButton = wrapper.find('[data-testid="follow-button"]')
      expect(followButton.exists()).toBe(true)
      expect(followButton.text()).toContain('フォロー')

      await followButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Should call follow API
      expect(mockUsersAPI.followUser).toHaveBeenCalledWith('other-user-456')

      // Button text should change to unfollow
      expect(followButton.text()).toContain('フォロー中')
    })
  })

  describe('Profile Editing', () => {
    it('should allow user to edit their complete profile information', async () => {
      const currentProfile = {
        uid: 'user-123',
        displayName: 'testuser',
        bio: '現在のバイオ',
        website: 'https://oldsite.com',
        twitterHandle: '@oldhandle',
        githubHandle: 'oldgithub',
        location: '大阪, 日本',
        avatarUrl: 'https://example.com/old-avatar.jpg'
      }

      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(global.mockAuthenticatedUser)

      const mockUsersAPI = useUsers()
      mockUsersAPI.getUserProfile = jest.fn().mockResolvedValue(currentProfile)
      mockUsersAPI.updateUserProfile = jest.fn().mockResolvedValue({
        ...currentProfile,
        bio: '更新されたバイオ',
        website: 'https://newsite.com',
        location: '東京, 日本'
      })

      wrapper = mount(ProfileEditPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/profile/edit')
      await wrapper.vm.$nextTick()

      // Step 1: Check form is pre-filled with current data
      const bioTextarea = wrapper.find('[data-testid="bio-textarea"]')
      expect(bioTextarea.exists()).toBe(true)
      expect(bioTextarea.element.value).toBe('現在のバイオ')

      const websiteInput = wrapper.find('[data-testid="website-input"]')
      expect(websiteInput.element.value).toBe('https://oldsite.com')

      const locationInput = wrapper.find('[data-testid="location-input"]')
      expect(locationInput.element.value).toBe('大阪, 日本')

      // Step 2: Update profile information
      await bioTextarea.setValue('更新されたバイオ')
      await websiteInput.setValue('https://newsite.com')
      await locationInput.setValue('東京, 日本')

      // Step 3: Save changes
      const saveButton = wrapper.find('[data-testid="save-profile"]')
      expect(saveButton.exists()).toBe(true)

      await saveButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 4: Verify update API called
      expect(mockUsersAPI.updateUserProfile).toHaveBeenCalledWith({
        bio: '更新されたバイオ',
        website: 'https://newsite.com',
        twitterHandle: '@oldhandle',
        githubHandle: 'oldgithub',
        location: '東京, 日本'
      })

      // Step 5: Should redirect back to profile
      expect(router.currentRoute.value.path).toBe('/users/user-123')
    })

    it('should validate profile form inputs', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(global.mockAuthenticatedUser)

      wrapper = mount(ProfileForm, {
        props: {
          initialData: {
            bio: '',
            website: '',
            location: ''
          }
        },
        global: {
          plugins: [router, pinia]
        }
      })

      // Step 1: Test invalid website URL
      const websiteInput = wrapper.find('[data-testid="website-input"]')
      await websiteInput.setValue('invalid-url')
      await websiteInput.trigger('blur')

      const websiteError = wrapper.find('[data-testid="website-error"]')
      expect(websiteError.exists()).toBe(true)
      expect(websiteError.text()).toContain('有効なURL')

      // Step 2: Test bio character limit
      const bioTextarea = wrapper.find('[data-testid="bio-textarea"]')
      const longBio = 'a'.repeat(501) // Exceeds 500 character limit
      await bioTextarea.setValue(longBio)
      await bioTextarea.trigger('input')

      const bioError = wrapper.find('[data-testid="bio-error"]')
      expect(bioError.exists()).toBe(true)
      expect(bioError.text()).toContain('500文字以内')

      // Step 3: Save button should be disabled with validation errors
      const saveButton = wrapper.find('[data-testid="save-profile"]')
      expect(saveButton.element.disabled).toBe(true)
    })
  })

  describe('Avatar Management', () => {
    it('should allow uploading and updating profile avatar', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(global.mockAuthenticatedUser)

      const mockUsersAPI = useUsers()
      mockUsersAPI.uploadAvatar = jest.fn().mockResolvedValue({
        avatarUrl: 'https://example.com/new-avatar.jpg'
      })
      mockUsersAPI.updateUserProfile = jest.fn().mockResolvedValue()

      wrapper = mount(AvatarUpload, {
        props: {
          currentAvatarUrl: 'https://example.com/old-avatar.jpg'
        },
        global: {
          plugins: [router, pinia]
        }
      })

      // Step 1: Check current avatar is displayed
      const currentAvatar = wrapper.find('[data-testid="current-avatar"]')
      expect(currentAvatar.exists()).toBe(true)
      expect(currentAvatar.attributes('src')).toBe('https://example.com/old-avatar.jpg')

      // Step 2: Find file input
      const fileInput = wrapper.find('[data-testid="avatar-file-input"]')
      expect(fileInput.exists()).toBe(true)

      // Step 3: Simulate file selection
      const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false
      })

      await fileInput.trigger('change')
      await wrapper.vm.$nextTick()

      // Step 4: Preview should show
      const previewImage = wrapper.find('[data-testid="avatar-preview"]')
      expect(previewImage.exists()).toBe(true)

      // Step 5: Upload button should be enabled
      const uploadButton = wrapper.find('[data-testid="upload-avatar"]')
      expect(uploadButton.exists()).toBe(true)
      expect(uploadButton.element.disabled).toBe(false)

      await uploadButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 6: Verify upload API called
      expect(mockUsersAPI.uploadAvatar).toHaveBeenCalledWith(file)

      // Step 7: Profile should be updated with new avatar URL
      expect(mockUsersAPI.updateUserProfile).toHaveBeenCalledWith({
        avatarUrl: 'https://example.com/new-avatar.jpg'
      })
    })

    it('should validate avatar file type and size', async () => {
      wrapper = mount(AvatarUpload, {
        global: {
          plugins: [router, pinia]
        }
      })

      const fileInput = wrapper.find('[data-testid="avatar-file-input"]')

      // Step 1: Test invalid file type
      const invalidFile = new File(['data'], 'document.pdf', { type: 'application/pdf' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [invalidFile],
        writable: false
      })

      await fileInput.trigger('change')
      await wrapper.vm.$nextTick()

      const typeError = wrapper.find('[data-testid="file-type-error"]')
      expect(typeError.exists()).toBe(true)
      expect(typeError.text()).toContain('画像ファイル')

      // Step 2: Test file size limit (simulate 5MB file)
      const largeFile = new File(['x'.repeat(5 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [largeFile],
        writable: false
      })

      await fileInput.trigger('change')
      await wrapper.vm.$nextTick()

      const sizeError = wrapper.find('[data-testid="file-size-error"]')
      expect(sizeError.exists()).toBe(true)
      expect(sizeError.text()).toContain('2MB以下')
    })

    it('should show upload progress during avatar upload', async () => {
      const mockUsersAPI = useUsers()
      // Simulate slow upload with progress
      mockUsersAPI.uploadAvatar = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ avatarUrl: 'new-url' }), 2000))
      )

      wrapper = mount(AvatarUpload, {
        global: {
          plugins: [router, pinia]
        }
      })

      const fileInput = wrapper.find('[data-testid="avatar-file-input"]')
      const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false
      })

      await fileInput.trigger('change')
      const uploadButton = wrapper.find('[data-testid="upload-avatar"]')
      await uploadButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Should show progress indicator
      const progressBar = wrapper.find('[data-testid="upload-progress"]')
      expect(progressBar.exists()).toBe(true)

      // Upload button should be disabled during upload
      expect(uploadButton.element.disabled).toBe(true)

      // Wait for upload completion
      await new Promise(resolve => setTimeout(resolve, 2100))
      await wrapper.vm.$nextTick()

      // Progress should be hidden
      expect(wrapper.find('[data-testid="upload-progress"]').exists()).toBe(false)
      expect(uploadButton.element.disabled).toBe(false)
    })
  })

  describe('Account Settings', () => {
    it('should allow updating email and password', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(global.mockAuthenticatedUser)
      mockAuth.updateEmail = jest.fn().mockResolvedValue()
      mockAuth.updatePassword = jest.fn().mockResolvedValue()

      wrapper = mount(SettingsPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/settings')
      await wrapper.vm.$nextTick()

      // Step 1: Check current email is displayed
      const currentEmail = wrapper.find('[data-testid="current-email"]')
      expect(currentEmail.text()).toContain('test@example.com')

      // Step 2: Update email
      const newEmailInput = wrapper.find('[data-testid="new-email-input"]')
      await newEmailInput.setValue('newemail@example.com')

      const updateEmailButton = wrapper.find('[data-testid="update-email"]')
      await updateEmailButton.trigger('click')
      await wrapper.vm.$nextTick()

      expect(mockAuth.updateEmail).toHaveBeenCalledWith('newemail@example.com')

      // Step 3: Update password
      const currentPasswordInput = wrapper.find('[data-testid="current-password"]')
      const newPasswordInput = wrapper.find('[data-testid="new-password"]')
      const confirmPasswordInput = wrapper.find('[data-testid="confirm-password"]')

      await currentPasswordInput.setValue('oldpassword')
      await newPasswordInput.setValue('newpassword123')
      await confirmPasswordInput.setValue('newpassword123')

      const updatePasswordButton = wrapper.find('[data-testid="update-password"]')
      await updatePasswordButton.trigger('click')
      await wrapper.vm.$nextTick()

      expect(mockAuth.updatePassword).toHaveBeenCalledWith('newpassword123')
    })

    it('should handle email verification flow', async () => {
      const unverifiedUser = {
        ...global.mockAuthenticatedUser,
        emailVerified: false
      }

      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(unverifiedUser)
      mockAuth.sendEmailVerification = jest.fn().mockResolvedValue()

      wrapper = mount(SettingsPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/settings')
      await wrapper.vm.$nextTick()

      // Should show email verification warning
      const verificationWarning = wrapper.find('[data-testid="email-verification-warning"]')
      expect(verificationWarning.exists()).toBe(true)

      // Should have resend verification button
      const resendButton = wrapper.find('[data-testid="resend-verification"]')
      expect(resendButton.exists()).toBe(true)

      await resendButton.trigger('click')
      await wrapper.vm.$nextTick()

      expect(mockAuth.sendEmailVerification).toHaveBeenCalled()

      // Should show success message
      const successMessage = wrapper.find('[data-testid="verification-sent"]')
      expect(successMessage.exists()).toBe(true)
    })

    it('should allow account deletion with confirmation', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(global.mockAuthenticatedUser)
      mockAuth.deleteAccount = jest.fn().mockResolvedValue()

      const mockUsersAPI = useUsers()
      mockUsersAPI.deleteUserData = jest.fn().mockResolvedValue()

      wrapper = mount(SettingsPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/settings')
      await wrapper.vm.$nextTick()

      // Step 1: Find delete account section
      const deleteSection = wrapper.find('[data-testid="delete-account-section"]')
      expect(deleteSection.exists()).toBe(true)

      const deleteButton = wrapper.find('[data-testid="delete-account-button"]')
      await deleteButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 2: Confirmation modal should appear
      const confirmModal = wrapper.find('[data-testid="delete-confirmation-modal"]')
      expect(confirmModal.exists()).toBe(true)

      // Step 3: Enter confirmation text
      const confirmationInput = wrapper.find('[data-testid="delete-confirmation-input"]')
      await confirmationInput.setValue('DELETE')

      // Step 4: Confirm deletion
      const confirmDeleteButton = wrapper.find('[data-testid="confirm-delete-button"]')
      await confirmDeleteButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 5: Verify deletion APIs called
      expect(mockUsersAPI.deleteUserData).toHaveBeenCalledWith('user-123')
      expect(mockAuth.deleteAccount).toHaveBeenCalled()

      // Should redirect to home page
      expect(router.currentRoute.value.path).toBe('/')
    })
  })

  describe('Privacy and Visibility Settings', () => {
    it('should allow managing profile visibility settings', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(global.mockAuthenticatedUser)

      const mockUsersAPI = useUsers()
      mockUsersAPI.getUserProfile = jest.fn().mockResolvedValue({
        uid: 'user-123',
        privacySettings: {
          profilePublic: true,
          showEmail: false,
          showStats: true,
          allowFollow: true
        }
      })
      mockUsersAPI.updatePrivacySettings = jest.fn().mockResolvedValue()

      wrapper = mount(SettingsPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/settings')
      await wrapper.vm.$nextTick()

      // Step 1: Check privacy settings section
      const privacySection = wrapper.find('[data-testid="privacy-settings"]')
      expect(privacySection.exists()).toBe(true)

      // Step 2: Toggle email visibility
      const showEmailToggle = wrapper.find('[data-testid="show-email-toggle"]')
      expect(showEmailToggle.element.checked).toBe(false)

      await showEmailToggle.setChecked(true)

      // Step 3: Toggle stats visibility
      const showStatsToggle = wrapper.find('[data-testid="show-stats-toggle"]')
      expect(showStatsToggle.element.checked).toBe(true)

      await showStatsToggle.setChecked(false)

      // Step 4: Save privacy settings
      const savePrivacyButton = wrapper.find('[data-testid="save-privacy-settings"]')
      await savePrivacyButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 5: Verify update API called
      expect(mockUsersAPI.updatePrivacySettings).toHaveBeenCalledWith({
        profilePublic: true,
        showEmail: true,
        showStats: false,
        allowFollow: true
      })
    })
  })

  describe('Activity and Statistics', () => {
    it('should display user activity dashboard', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(global.mockAuthenticatedUser)

      const mockUsersAPI = useUsers()
      mockUsersAPI.getUserStats = jest.fn().mockResolvedValue({
        totalArticles: 25,
        totalViews: 45000,
        totalLikes: 1250,
        totalComments: 340,
        monthlyViews: [1200, 1500, 1800, 2100],
        topArticles: [
          {
            id: 'article-1',
            title: 'Vue.js 3の新機能',
            views: 3500,
            likes: 120
          }
        ],
        recentActivity: [
          {
            type: 'article_published',
            timestamp: new Date('2024-01-15'),
            articleTitle: 'TypeScript入門'
          }
        ]
      })

      wrapper = mount(UserProfilePage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/users/user-123')
      await wrapper.vm.$nextTick()

      // Should display activity section for own profile
      const activitySection = wrapper.find('[data-testid="activity-dashboard"]')
      expect(activitySection.exists()).toBe(true)

      // Check statistics cards
      const totalViews = wrapper.find('[data-testid="total-views"]')
      expect(totalViews.text()).toContain('45,000')

      const totalLikes = wrapper.find('[data-testid="total-likes"]')
      expect(totalLikes.text()).toContain('1,250')

      // Check activity chart
      const activityChart = wrapper.find('[data-testid="activity-chart"]')
      expect(activityChart.exists()).toBe(true)

      // Check recent activity
      const recentActivity = wrapper.find('[data-testid="recent-activity"]')
      expect(recentActivity.exists()).toBe(true)
    })
  })

  describe('Export and Data Portability', () => {
    it('should allow exporting user data', async () => {
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(global.mockAuthenticatedUser)

      const mockUsersAPI = useUsers()
      mockUsersAPI.exportUserData = jest.fn().mockResolvedValue({
        downloadUrl: 'https://example.com/export/user-data.json'
      })

      wrapper = mount(SettingsPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/settings')
      await wrapper.vm.$nextTick()

      // Step 1: Find data export section
      const exportSection = wrapper.find('[data-testid="data-export-section"]')
      expect(exportSection.exists()).toBe(true)

      // Step 2: Request data export
      const exportButton = wrapper.find('[data-testid="export-data-button"]')
      await exportButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 3: Verify export API called
      expect(mockUsersAPI.exportUserData).toHaveBeenCalledWith('user-123')

      // Step 4: Download link should appear
      const downloadLink = wrapper.find('[data-testid="download-export"]')
      expect(downloadLink.exists()).toBe(true)
      expect(downloadLink.attributes('href')).toBe('https://example.com/export/user-data.json')
    })
  })
})