import { useLanguage } from '../contexts/LanguageContext'

const LoadingSpinner = () => {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">{t('common.loading')}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
