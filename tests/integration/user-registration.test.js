/**
 * Integration Test: User Registration Flow
 *
 * Tests the complete user registration and username setup flow
 * Based on User Story 1 from quickstart.md
 *
 * These tests MUST FAIL initially (TDD approach)
 * Implementation will be created to make these tests pass
 */

import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

// Components to be implemented
import SignupPage from '../../pages/auth/signup.vue'
import ProfileSetupPage from '../../pages/profile/setup.vue'

// Composables to be implemented
import { useAuth } from '../../composables/useAuth.js'
import { useUsers } from '../../composables/useUsers.js'

// Mock Firebase for testing
jest.mock('firebase/auth')
jest.mock('firebase/firestore')

describe('User Registration Flow Integration Test', () => {
  let router
  let pinia
  let wrapper

  beforeEach(() => {
    // Setup router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/signup', component: SignupPage },
        { path: '/profile/setup', component: ProfileSetupPage },
        { path: '/login', component: { template: '<div>Login</div>' } }
      ]
    })

    // Setup Pinia store
    pinia = createPinia()

    // Mock implementation functions
    global.getCurrentUser = jest.fn()
    global.createTestUser = jest.fn()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Complete Registration Flow', () => {
    it('should successfully register user with unique username and redirect to profile setup', async () => {
      // Mock successful registration
      const mockUser = {
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'testuser',
        emailVerified: false,
        createdAt: new Date()
      }

      const mockAuth = useAuth()
      mockAuth.signUp = jest.fn().mockResolvedValue(mockUser)
      mockAuth.checkUsernameAvailability = jest.fn().mockResolvedValue({
        available: true,
        suggestions: [],
        message: 'Username is available'
      })

      // Mount signup page
      wrapper = mount(SignupPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Wait for component to mount
      await wrapper.vm.$nextTick()

      // Step 1: Navigate to signup page
      await router.push('/signup')
      expect(router.currentRoute.value.path).toBe('/signup')

      // Step 2: Fill registration form
      const emailInput = wrapper.find('[data-testid="email"]')
      const passwordInput = wrapper.find('[data-testid="password"]')
      const displayNameInput = wrapper.find('[data-testid="displayName"]')

      expect(emailInput.exists()).toBe(true)
      expect(passwordInput.exists()).toBe(true)
      expect(displayNameInput.exists()).toBe(true)

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('Password123!')
      await displayNameInput.setValue('testuser')

      // Step 3: Check username availability (real-time)
      await wrapper.vm.$nextTick()

      // Trigger username availability check
      await displayNameInput.trigger('input')
      await new Promise(resolve => setTimeout(resolve, 600)) // Wait for debounce

      // Verify availability check was called
      expect(mockAuth.checkUsernameAvailability).toHaveBeenCalledWith({
        displayName: 'testuser'
      })

      // Step 4: Wait for username availability confirmation
      const usernameAvailable = wrapper.find('[data-testid="username-available"]')
      expect(usernameAvailable.exists()).toBe(true)

      // Step 5: Submit registration
      const signupButton = wrapper.find('[data-testid="signup-button"]')
      expect(signupButton.exists()).toBe(true)
      expect(signupButton.element.disabled).toBe(false)

      await signupButton.trigger('click')

      // Verify signUp was called with correct credentials
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
        displayName: 'testuser'
      })

      // Step 6: Verify redirect to profile setup
      await wrapper.vm.$nextTick()
      expect(router.currentRoute.value.path).toBe('/profile/setup')

      // Step 7: Verify user in Firebase Auth
      global.getCurrentUser.mockResolvedValue(mockUser)
      const currentUser = await global.getCurrentUser()

      expect(currentUser).toBeTruthy()
      expect(currentUser.displayName).toBe('testuser')
      expect(currentUser.email).toBe('test@example.com')
      expect(currentUser.emailVerified).toBe(false)
    })

    it('should handle username already taken scenario', async () => {
      const mockAuth = useAuth()
      mockAuth.checkUsernameAvailability = jest.fn().mockResolvedValue({
        available: false,
        suggestions: ['testuser1', 'testuser2', 'testuser3'],
        message: 'Username is already taken'
      })

      wrapper = mount(SignupPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/signup')
      await wrapper.vm.$nextTick()

      // Fill form with taken username
      const displayNameInput = wrapper.find('[data-testid="displayName"]')
      await displayNameInput.setValue('takenusername')
      await displayNameInput.trigger('input')
      await new Promise(resolve => setTimeout(resolve, 600))

      // Verify availability check
      expect(mockAuth.checkUsernameAvailability).toHaveBeenCalledWith({
        displayName: 'takenusername'
      })

      // Check for username taken message
      const usernameTaken = wrapper.find('[data-testid="username-taken"]')
      expect(usernameTaken.exists()).toBe(true)

      // Check for suggestions
      const suggestions = wrapper.find('[data-testid="username-suggestions"]')
      expect(suggestions.exists()).toBe(true)

      // Signup button should be disabled
      const signupButton = wrapper.find('[data-testid="signup-button"]')
      expect(signupButton.element.disabled).toBe(true)
    })

    it('should validate email format and password strength', async () => {
      wrapper = mount(SignupPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/signup')
      await wrapper.vm.$nextTick()

      // Test invalid email
      const emailInput = wrapper.find('[data-testid="email"]')
      await emailInput.setValue('invalid-email')
      await emailInput.trigger('blur')

      const emailError = wrapper.find('[data-testid="email-error"]')
      expect(emailError.exists()).toBe(true)
      expect(emailError.text()).toContain('valid email')

      // Test weak password
      const passwordInput = wrapper.find('[data-testid="password"]')
      await passwordInput.setValue('123')
      await passwordInput.trigger('blur')

      const passwordError = wrapper.find('[data-testid="password-error"]')
      expect(passwordError.exists()).toBe(true)
      expect(passwordError.text()).toContain('password')

      // Signup button should be disabled with validation errors
      const signupButton = wrapper.find('[data-testid="signup-button"]')
      expect(signupButton.element.disabled).toBe(true)
    })

    it('should handle registration errors gracefully', async () => {
      const mockAuth = useAuth()
      mockAuth.checkUsernameAvailability = jest.fn().mockResolvedValue({
        available: true
      })
      mockAuth.signUp = jest.fn().mockRejectedValue({
        code: 'auth/email-already-in-use',
        message: 'The email address is already in use by another account.'
      })

      wrapper = mount(SignupPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/signup')
      await wrapper.vm.$nextTick()

      // Fill valid form
      await wrapper.find('[data-testid="email"]').setValue('existing@example.com')
      await wrapper.find('[data-testid="password"]').setValue('Password123!')
      await wrapper.find('[data-testid="displayName"]').setValue('validuser')

      // Wait for username check
      await new Promise(resolve => setTimeout(resolve, 600))

      // Submit form
      await wrapper.find('[data-testid="signup-button"]').trigger('click')
      await wrapper.vm.$nextTick()

      // Verify error message is displayed
      const errorMessage = wrapper.find('[data-testid="error-message"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('email address is already in use')

      // Should not redirect
      expect(router.currentRoute.value.path).toBe('/signup')
    })
  })

  describe('Real-time Username Validation', () => {
    it('should debounce username availability checks', async () => {
      const mockAuth = useAuth()
      mockAuth.checkUsernameAvailability = jest.fn().mockResolvedValue({
        available: true
      })

      wrapper = mount(SignupPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/signup')
      const displayNameInput = wrapper.find('[data-testid="displayName"]')

      // Rapid typing simulation
      await displayNameInput.setValue('t')
      await displayNameInput.setValue('te')
      await displayNameInput.setValue('tes')
      await displayNameInput.setValue('test')
      await displayNameInput.setValue('testuser')

      // Should not call API immediately
      expect(mockAuth.checkUsernameAvailability).not.toHaveBeenCalled()

      // Wait for debounce period (500ms)
      await new Promise(resolve => setTimeout(resolve, 600))

      // Should call API only once with final value
      expect(mockAuth.checkUsernameAvailability).toHaveBeenCalledTimes(1)
      expect(mockAuth.checkUsernameAvailability).toHaveBeenLastCalledWith({
        displayName: 'testuser'
      })
    })

    it('should show loading state during username check', async () => {
      const mockAuth = useAuth()
      // Simulate slow API response
      mockAuth.checkUsernameAvailability = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ available: true }), 1000))
      )

      wrapper = mount(SignupPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/signup')
      const displayNameInput = wrapper.find('[data-testid="displayName"]')

      await displayNameInput.setValue('testuser')
      await new Promise(resolve => setTimeout(resolve, 600))

      // Should show loading indicator
      const loadingIndicator = wrapper.find('[data-testid="username-checking"]')
      expect(loadingIndicator.exists()).toBe(true)

      // Wait for API response
      await new Promise(resolve => setTimeout(resolve, 1100))
      await wrapper.vm.$nextTick()

      // Loading should be gone, availability should show
      expect(wrapper.find('[data-testid="username-checking"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="username-available"]').exists()).toBe(true)
    })
  })

  describe('Profile Setup Flow', () => {
    it('should complete profile setup after registration', async () => {
      const mockUser = {
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'testuser'
      }

      const mockUsers = useUsers()
      mockUsers.updateUserProfile = jest.fn().mockResolvedValue({
        ...mockUser,
        bio: 'Test bio',
        website: 'https://example.com'
      })

      // Mock authenticated user
      const mockAuth = useAuth()
      mockAuth.getCurrentUser = jest.fn().mockResolvedValue(mockUser)

      wrapper = mount(ProfileSetupPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/profile/setup')
      await wrapper.vm.$nextTick()

      // Fill profile information
      const bioInput = wrapper.find('[data-testid="bio"]')
      const websiteInput = wrapper.find('[data-testid="website"]')

      expect(bioInput.exists()).toBe(true)
      expect(websiteInput.exists()).toBe(true)

      await bioInput.setValue('Test bio')
      await websiteInput.setValue('https://example.com')

      // Submit profile setup
      const saveButton = wrapper.find('[data-testid="save-profile"]')
      await saveButton.trigger('click')

      // Verify profile update API call
      expect(mockUsers.updateUserProfile).toHaveBeenCalledWith({
        bio: 'Test bio',
        website: 'https://example.com'
      })

      // Should redirect to main app or dashboard
      await wrapper.vm.$nextTick()
      expect(router.currentRoute.value.path).not.toBe('/profile/setup')
    })
  })

  describe('Social Provider Registration', () => {
    it('should handle Google OAuth registration', async () => {
      const mockAuth = useAuth()
      const mockSocialUser = {
        uid: 'google-user-123',
        email: 'user@gmail.com',
        displayName: 'googleuser',
        emailVerified: true,
        providerId: 'google.com'
      }

      mockAuth.signInWithProvider = jest.fn().mockResolvedValue(mockSocialUser)

      wrapper = mount(SignupPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/signup')
      const googleSignupButton = wrapper.find('[data-testid="google-signup"]')

      expect(googleSignupButton.exists()).toBe(true)
      await googleSignupButton.trigger('click')

      expect(mockAuth.signInWithProvider).toHaveBeenCalledWith({
        providerId: 'google.com'
      })

      // Should redirect to profile setup or main app
      await wrapper.vm.$nextTick()
      expect(router.currentRoute.value.path).not.toBe('/signup')
    })
  })
})