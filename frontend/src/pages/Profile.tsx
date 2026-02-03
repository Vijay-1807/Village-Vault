import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { api } from '../services/api'
import { Edit, Save, X } from 'lucide-react'
import alertService from '../services/alertService'

const Profile = () => {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || ''
  })

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name })
    }
  }, [user])

  const handleSave = async () => {
    if (!formData.name.trim()) return

    setLoading(true)
    try {
      await api.put('/users/profile', { name: formData.name.trim() })
      alertService.success(t('profile.updateSuccess'))
      setIsEditing(false)
      // Refresh user data
      window.location.reload()
    } catch (error: any) {
      alertService.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ name: user?.name || '' })
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto max-w-2xl mx-auto space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 break-words">
            {t('profile.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your account settings</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary flex items-center justify-center w-full sm:w-auto min-h-[44px]"
          >
            <Edit className="h-4 w-4 mr-2" />
            {t('profile.edit')}
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 self-center sm:self-auto">
            <span className="text-white font-bold text-xl sm:text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 w-full min-w-0">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t('profile.name')}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field text-sm sm:text-base min-h-[44px]"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="text-base sm:text-lg text-gray-900 break-words">{user.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t('profile.phoneNumber')}
                </label>
                <p className="text-base sm:text-lg text-gray-900 break-words">{user.phoneNumber}</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t('profile.role')}
                </label>
                <p className="text-base sm:text-lg text-gray-900 capitalize break-words">{user.role.toLowerCase()}</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t('profile.village')}
                </label>
                <p className="text-base sm:text-lg text-gray-900 break-words">{user.villageName}</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t('profile.pinCode')}
                </label>
                <p className="text-base sm:text-lg text-gray-900 break-words">{user.pinCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={handleCancel}
              className="btn-secondary flex items-center justify-center w-full sm:w-auto min-h-[44px]"
            >
              <X className="h-4 w-4 mr-2" />
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !formData.name.trim()}
              className="btn-primary flex items-center justify-center w-full sm:w-auto min-h-[44px]"
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t('common.save')}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Account Information</h2>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 py-2 border-b border-gray-100">
            <span className="text-xs sm:text-sm font-medium text-gray-500">Account Status</span>
            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Verified
            </span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 py-2 border-b border-gray-100">
            <span className="text-xs sm:text-sm font-medium text-gray-500">Member Since</span>
            <span className="text-xs sm:text-sm text-gray-900">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 py-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500">Last Login</span>
            <span className="text-xs sm:text-sm text-gray-900">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-red-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-medium text-red-900 mb-3 sm:mb-4">Danger Zone</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-medium text-red-900 mb-1 break-words">Sign out of your account</h3>
            <p className="text-xs sm:text-sm text-red-600 break-words">You will need to sign in again to access your account.</p>
          </div>
          <button
            onClick={logout}
            className="btn-danger w-full sm:w-auto min-h-[44px] mt-2 sm:mt-0"
          >
            {t('auth.logout')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
